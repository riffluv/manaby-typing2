// 改善した複数パターン対応の日本語変換テスト用スクリプト

// ESモジュールを使用するための設定
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// ESM環境で__dirnameを再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// japaneseUtils.tsの内容を直接読み込むことができないので
// ここでモックの関数とクラスを定義してテストを実行します
// 実際の環境では型定義なしでJavaScriptとして動作する簡易版

/**
 * ひらがなとローマ字の変換テーブル
 */
const japaneseToRomajiMap = {
  'こ': ['ko', 'co'],
  'ん': ['nn', 'xn', 'n'],
  'に': ['ni'],
  'ち': ['ti', 'chi'],
  'は': ['ha'],
  'し': ['si', 'shi', 'ci'],
  'ゃ': ['xya', 'lya'],
  'べ': ['be'],
  'る': ['ru'],
  'き': ['ki'],
  'っ': ['xtu', 'xtsu', 'ltu'],
  'ぷ': ['pu'],
  'ぱ': ['pa'],
  'ん': ['nn', 'xn', 'n'],
  'あ': ['a'],
  'い': ['i'],
  'じ': ['zi', 'ji'],
  'ほ': ['ho'],
  'か': ['ka', 'ca'],
  'い': ['i'],
  'ど': ['do'],
  'う': ['u']
};

/**
 * ひらがなをローマ字に変換する関数
 */
function convertHiraganaToRomaji(hiragana) {
  let result = [];
  let position = 0;
  
  while (position < hiragana.length) {
    // 1文字ずつ処理
    const oneChar = hiragana[position];
    if (japaneseToRomajiMap[oneChar]) {
      result.push({
        kana: oneChar,
        romaji: japaneseToRomajiMap[oneChar][0],
        alternatives: japaneseToRomajiMap[oneChar]
      });
    } else {
      // マッピングがない場合はそのままの文字を使用
      result.push({
        kana: oneChar,
        romaji: oneChar,
        alternatives: [oneChar]
      });
    }
    position++;
  }
  
  // 促音（っ）の特殊処理
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].kana === 'っ') {
      const nextRomaji = result[i + 1].romaji;
      if (nextRomaji && nextRomaji.length > 0) {
        const firstChar = nextRomaji[0];
        if ('bcdfghjklmnpqrstvwxyz'.includes(firstChar)) {
          result[i].romaji = firstChar;
          if (!result[i].alternatives.includes(firstChar)) {
            result[i].alternatives.push(firstChar);
          }
        }
      }
    }
  }
  
  // 「ん」の特殊処理
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].kana === 'ん') {
      const nextRomaji = result[i + 1].romaji;
      if (nextRomaji && nextRomaji.length > 0) {
        const firstChar = nextRomaji[0];
        if ('aeiouyn'.includes(firstChar)) {
          if (!result[i].alternatives.includes("n'")) {
            result[i].alternatives.push("n'");
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * タイピング用のかな文字クラス
 */
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

// テスト用の単語
const testWords = [
  'こんにちは',
  'しゃべる',
  'きっぷ',
  'はっぱ',
  'しんあい',
  'しじん',
  'ほっかいどう'
];

// 単語をローマ字変換して結果を表示
console.log('==== 単語のローマ字変換 ====');
testWords.forEach(word => {
  const result = convertHiraganaToRomaji(word);
  console.log(`${word}: `, result.map(r => `${r.kana}=[${r.alternatives.join(', ')}]`).join(' + '));
});

// TypingCharクラスのテスト
console.log('\n==== TypingCharクラスのテスト ====');

// 「し」の複数パターン入力テスト
console.log('\n「し」の入力テスト (si/shi/ci):');
const shiChar = new TypingChar('し', ['si', 'shi', 'ci']);
console.log('初期状態:', shiChar.getDisplayInfo());
console.log('s の入力:', shiChar.canAccept('s')); // true
shiChar.accept('s');
console.log('s入力後:', shiChar.getDisplayInfo());
console.log('h の入力:', shiChar.canAccept('h')); // true
shiChar.accept('h');
console.log('sh入力後:', shiChar.getDisplayInfo());
console.log('i の入力:', shiChar.canAccept('i')); // true
shiChar.accept('i');
console.log('shi入力後:', shiChar.getDisplayInfo());

// 「っ」の特殊処理テスト
console.log('\n「きっぷ」の入力テスト:');
const kippuChars = testWords[2].split('').map(k => {
  const patterns = japaneseToRomajiMap[k] || [k];
  return new TypingChar(k, patterns);
});

const romaji = convertHiraganaToRomaji(testWords[2]);
console.log('変換結果:', romaji);
console.log('「っ」の代替パターン:', romaji[1].alternatives);

// テスト: 複数パターン切り替え
console.log('\n複数パターン切り替えテスト:');

// 「じ」のパターン（zi/ji）
const jiChar = new TypingChar('じ', ['zi', 'ji']);
console.log('「じ」の入力パターン:', jiChar.patterns);
console.log('z の入力:', jiChar.canAccept('z')); // true
jiChar.accept('z');
console.log('z入力後の有効パターン:', jiChar.getActivePatterns());
console.log('j の入力:', jiChar.canAccept('j')); // false（zを入力した後はjiパターンは無効）

// 新しくインスタンスを作成して「j」から始める場合
const jiChar2 = new TypingChar('じ', ['zi', 'ji']);
console.log('j の入力:', jiChar2.canAccept('j')); // true
jiChar2.accept('j');
console.log('j入力後の有効パターン:', jiChar2.getActivePatterns());
