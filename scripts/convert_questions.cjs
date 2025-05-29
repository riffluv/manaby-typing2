// スクリプト for processing questions data
const fs = require('fs');
const path = require('path');

// ファイルを読み込む
const rawData = fs.readFileSync(path.join(__dirname, '../temp_questions.txt'), 'utf-8');

// カテゴリー別にデータを格納する配列
const sonkeigo = [];
const kenjougo = [];
const business = [];

let currentCategory = null;
let currentQuestion = {};
let questionCount = 0;

// 行ごとに処理
const lines = rawData.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // カテゴリー検出
  if (line.includes('尊敬語モード')) {
    currentCategory = 'sonkeigo';
    continue;
  } else if (line.includes('謙譲語モード')) {
    currentCategory = 'kenjougo';
    continue;
  } else if (line.includes('ビジネスマナーモード')) {
    currentCategory = 'business';
    continue;
  }
  
  // 区切り線は無視
  if (line === '----------------------------------------' || line === '--------------------') {
    continue;
  }
  
  // 日本語の行を処理
  if (line.startsWith('日本語：')) {
    // 前の問題があれば追加
    if (currentQuestion.kanji && currentQuestion.hiragana) {
      if (currentCategory === 'sonkeigo') {
        sonkeigo.push({ ...currentQuestion });
      } else if (currentCategory === 'kenjougo') {
        kenjougo.push({ ...currentQuestion });
      } else if (currentCategory === 'business') {
        business.push({ ...currentQuestion });
      }
      questionCount++;
    }
    
    // 新しい問題を開始
    currentQuestion = {
      kanji: line.replace('日本語：', '').trim(),
      hiragana: '',
      explanation: ''
    };
  }
  // ひらがなの行を処理
  else if (line.startsWith('ひらがな：')) {
    currentQuestion.hiragana = line.replace('ひらがな：', '').trim();
  }
  // 解説の行を処理
  else if (line.startsWith('マナビーくんの解説：')) {
    currentQuestion.explanation = '';
  }
  // 解説の内容を処理
  else if (currentQuestion.explanation !== undefined && line !== '') {
    if (currentQuestion.explanation) {
      currentQuestion.explanation += ' ';
    }
    currentQuestion.explanation += line;
  }
}

// 最後の問題を追加
if (currentQuestion.kanji && currentQuestion.hiragana) {
  if (currentCategory === 'sonkeigo') {
    sonkeigo.push({ ...currentQuestion });
  } else if (currentCategory === 'kenjougo') {
    kenjougo.push({ ...currentQuestion });
  } else if (currentCategory === 'business') {
    business.push({ ...currentQuestion });
  }
  questionCount++;
}

// TypeScriptファイルとして出力
function writeToTsFile(data, filename) {
  const tsContent = `// ${filename} 用の問題データ
// 構造: kanji - 表示用の日本語テキスト
//       hiragana - タイピング用のひらがなテキスト
//       explanation - マナビーくんの解説（将来的に使用）

export const ${filename} = ${JSON.stringify(data, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, `../src/data/${filename}.ts`), tsContent);
  console.log(`${filename}.ts ファイルが作成されました。問題数: ${data.length}`);
}

// ファイルに出力
writeToTsFile(sonkeigo, 'sonkeigoQuestions');
writeToTsFile(kenjougo, 'kenjougoQuestions');
writeToTsFile(business, 'businessQuestions');

console.log(`合計処理した問題数: ${questionCount}`);

// 一時ファイルを削除
fs.unlinkSync(path.join(__dirname, '../temp_questions.txt'));
