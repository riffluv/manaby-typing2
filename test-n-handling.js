// 「ん」の処理を正確にテストするためのスクリプト

// japaneseToRomajiMap の定義（実際のアプリと同じもののサブセット）
const japaneseToRomajiMap = {
  'た': ['ta'],
  'い': ['i'],
  'ぴ': ['pi'],
  'ん': ['n', 'nn', 'xn'], // 重要: 'n'が最初に来るようにする
  'ぐ': ['gu'],
  'か': ['ka'],
  'じ': ['zi', 'ji'],
  'あ': ['a'],
  'な': ['na'],
};

// ひらがなをローマ字に変換する関数
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
      
      // 単語の最後の「ん」の場合
      if (!nextItem) {
        // nを使えないようにする
        const nIndex = result[i].alternatives.indexOf('n');
        if (nIndex !== -1 && result[i].alternatives.length > 1) {
          result[i].alternatives.splice(nIndex, 1);
          // 表示用のromajiもnnに
          result[i].romaji = 'nn';
        }
      } 
      // 次の文字が母音またはy,nで始まる場合
      else if (nextRomaji && nextRomaji.length > 0) {
        const firstChar = nextRomaji[0];
        if ('aiueony'.includes(firstChar)) {
          // nを使えないようにする
          const nIndex = result[i].alternatives.indexOf('n');
          if (nIndex !== -1 && result[i].alternatives.length > 1) {
            result[i].alternatives.splice(nIndex, 1);
            // 表示用のromajiもnnに
            result[i].romaji = 'nn';
          }
          
          // n'も代替入力として追加
          if (!result[i].alternatives.includes("n'")) {
            result[i].alternatives.push("n'");
          }
        }
        // それ以外の場合は「n」を許可（何もしない）
      }
    }
  }
  
  return result;
}

// タイピング文字クラス
class TypingChar {
  constructor(kana, patterns) {
    this.kana = kana;
    this.patterns = patterns;
    this.acceptedInput = '';
    this.remainingText = '';
    this.completed = false;
    this.activePatternIndices = Array.from({ length: patterns.length }, (_, i) => i);
    this.calculateRemainingText();
  }
  
  canAccept(character) {
    const char = character.toLowerCase();
    const newInput = this.acceptedInput + char;
    
    for (const patternIndex of this.activePatternIndices) {
      const pattern = this.patterns[patternIndex];
      if (newInput.length <= pattern.length && newInput === pattern.substring(0, newInput.length)) {
        return true;
      }
    }
    
    return false;
  }
  
  accept(character) {
    const char = character.toLowerCase();
    
    if (this.canAccept(char)) {
      this.acceptedInput += char;
      this.updateActivePatterns();
      this.calculateRemainingText();
      return true;
    }
    
    return false;
  }
  
  updateActivePatterns() {
    const validPatternIndices = [];
    
    for (let i = 0; i < this.patterns.length; i++) {
      const pattern = this.patterns[i];
      if (this.acceptedInput.length <= pattern.length && 
          this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
        validPatternIndices.push(i);
      }
    }
    
    this.activePatternIndices = validPatternIndices;
  }
  
  calculateRemainingText() {
    if (this.completed) {
      this.remainingText = '';
      return;
    }
    
    let shortestRemaining = '';
    let shortestLength = Infinity;
    
    for (const patternIndex of this.activePatternIndices) {
      const pattern = this.patterns[patternIndex];
      if (this.acceptedInput.length <= pattern.length) {
        const remaining = pattern.substring(this.acceptedInput.length);
        if (remaining.length < shortestLength) {
          shortestRemaining = remaining;
          shortestLength = remaining.length;
        }
      }
    }
    
    this.remainingText = shortestRemaining;
    
    if (this.activePatternIndices.length === 0 || this.remainingText === '') {
      this.completed = true;
      this.remainingText = '';
    }
  }
  
  getDisplayInfo() {
    return {
      displayText: this.patterns[0],
      acceptedText: this.acceptedInput,
      remainingText: this.remainingText,
      isCompleted: this.completed
    };
  }
  
  getActivePatterns() {
    return this.activePatternIndices.map(i => this.patterns[i]);
  }
}

// テストケース
console.log("==== 「ん」の特殊ケーステスト（正確版） ====");

// 1. 単語末の「ん」のテスト
const test1 = convertHiraganaToRomaji("かん");
console.log("かん(単語末の「ん」):", test1.map(r => `${r.kana}=[${r.alternatives.join(', ')}]`).join(' + '));

// 2. 子音の前の「ん」のテスト - nが使える
const test2 = convertHiraganaToRomaji("かんじ");
console.log("かんじ(子音の前の「ん」):", test2.map(r => `${r.kana}=[${r.alternatives.join(', ')}]`).join(' + '));

// 3. 母音の前の「ん」のテスト - nが使えない
const test3 = convertHiraganaToRomaji("かんあ");
console.log("かんあ(母音の前の「ん」):", test3.map(r => `${r.kana}=[${r.alternatives.join(', ')}]`).join(' + '));

// 4. たいぴんぐのテスト - nが使える
const test4 = convertHiraganaToRomaji("たいぴんぐ");
console.log("たいぴんぐ:", test4.map(r => `${r.kana}=[${r.alternatives.join(', ')}]`).join(' + '));

// 5. TypingCharクラスでのテスト
console.log("\n==== TypingCharクラスでの「ん」のテスト ====");

// たいぴんぐのローマ字パターンを取得
const taipinguRomaji = convertHiraganaToRomaji("たいぴんぐ");

// TypingCharのインスタンスを作成
const taipinguChars = taipinguRomaji.map(item => new TypingChar(item.kana, item.alternatives));

// 「ん」に対応するTypingCharのインデックス
const nIndex = 3; // たいぴんぐの「ん」は4文字目
const nChar = taipinguChars[nIndex];

console.log(`「ん」(たいぴんぐの${nIndex+1}文字目)の入力テスト:`);
console.log("入力パターン:", nChar.patterns);

// nで入力のテスト
console.log("'n'の入力:", nChar.canAccept('n')); // trueになるはず
nChar.accept('n');
console.log("n入力後:", nChar.getDisplayInfo());
console.log("入力完了:", nChar.completed); // trueになるはず（1文字で完了）

// 別のPatternも試す
const nChar2 = new TypingChar('ん', taipinguRomaji[nIndex].alternatives);
console.log("\n別パターンでの「ん」の入力テスト:");
console.log("'n'の代わりに'nn'の入力:");
console.log("'n'の入力(1文字目):", nChar2.canAccept('n')); // true
nChar2.accept('n');
console.log("n入力後:", nChar2.getDisplayInfo());
console.log("'n'の入力(2文字目):", nChar2.canAccept('n')); // true
nChar2.accept('n');
console.log("nn入力後:", nChar2.getDisplayInfo());
console.log("入力完了:", nChar2.completed); // trueになるはず（2文字で完了）
