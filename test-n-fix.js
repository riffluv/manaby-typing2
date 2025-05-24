// 「ん」の処理の修正をテストするスクリプト

// japaneseToRomajiMapの簡略版
const japaneseToRomajiMap = {
  'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],
  'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'],
  'さ': ['sa'], 'し': ['si', 'shi'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'],
  'た': ['ta'], 'ち': ['ti', 'chi'], 'つ': ['tu', 'tsu'], 'て': ['te'], 'と': ['to'],
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu'], 'へ': ['he'], 'ほ': ['ho'],
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
  'わ': ['wa'], 'を': ['wo'],
  'ん': ['nn', 'xn', 'n'], // 「n」が最後にあることに注意
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po']
};

// ひらがなをローマ字に変換する関数（修正版）
function convertHiraganaToRomaji(hiragana) {
  const result = [];
  
  // 単純化のため、1文字ずつ処理
  for (let i = 0; i < hiragana.length; i++) {
    const char = hiragana[i];
    if (japaneseToRomajiMap[char]) {
      result.push({
        kana: char,
        romaji: japaneseToRomajiMap[char][0],
        alternatives: [...japaneseToRomajiMap[char]]
      });
    } else {
      result.push({
        kana: char,
        romaji: char,
        alternatives: [char]
      });
    }
  }
  
  // 「ん」の特殊処理
  for (let i = 0; i < result.length; i++) {
    if (result[i].kana === 'ん') {
      const nextItem = i < result.length - 1 ? result[i + 1] : null;
      const nextRomaji = nextItem ? nextItem.romaji : null;
      
      // 単語の最後の「ん」の場合 または 次の文字が母音またはn,yで始まる場合
      if (!nextItem || (nextRomaji && nextRomaji.length > 0 && 'aiueonyn'.includes(nextRomaji[0]))) {
        // nを使えないようにする
        const nIndex = result[i].alternatives.indexOf('n');
        if (nIndex !== -1 && result[i].alternatives.length > 1) {
          result[i].alternatives.splice(nIndex, 1);
          // 表示用のromajiもnnに
          result[i].romaji = result[i].alternatives[0]; // nn or xn
        }
        
        // n'も代替入力として追加（「ん」の後に母音やyが続く場合のみ）
        if (nextRomaji && 'aiueoy'.includes(nextRomaji[0])) {
          if (!result[i].alternatives.includes("n'")) {
            result[i].alternatives.push("n'");
          }
        }
      }
    }
  }
  
  return result;
}

// テスト関数
function testWord(word) {
  const result = convertHiraganaToRomaji(word);
  console.log(`${word}: `, result.map(r => `${r.kana}=[${r.alternatives.join(', ')}]`).join(' + '));
}

// テストケース
console.log("==== 「ん」の特殊ケーステスト（修正版） ====");

// 1. 単語末の「ん」のテスト - nは使えない
testWord("かん");

// 2. 子音の前の「ん」のテスト - nが使える
testWord("かんき");

// 3. 母音の前の「ん」のテスト - nは使えない
testWord("かんあ");

// 4. 「n」の前の「ん」のテスト - nは使えない
testWord("かんな");

// 5. 「y」の前の「ん」のテスト - nは使えない
testWord("かんや");

// 6. たいぴんぐのテスト - nが使える（gの前なので）
testWord("たいぴんぐ");

// 7. たいぴんのテスト - 末尾の「ん」なのでnは使えない
testWord("たいぴん");

// 8. プログラミング（ぷろぐらみんぐ）のテスト - nが使える
testWord("ぷろぐらみんぐ");
