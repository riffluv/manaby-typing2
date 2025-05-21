/**
 * ひらがなとローマ字の変換テーブル
 * typingmania-refの実装を参考にした
 */
export const japaneseToRomajiMap: { [key: string]: string[] } = {
  // 基本的なひらがな
  'あ': ['a'],
  'い': ['i'],
  'う': ['u'],
  'え': ['e'],
  'お': ['o'],
  'か': ['ka'],
  'き': ['ki'],
  'く': ['ku'],
  'け': ['ke'],
  'こ': ['ko'],
  'さ': ['sa'],
  'し': ['si', 'shi'],
  'す': ['su'],
  'せ': ['se'],
  'そ': ['so'],
  'た': ['ta'],
  'ち': ['ti', 'chi'],
  'つ': ['tu', 'tsu'],
  'て': ['te'],
  'と': ['to'],
  'な': ['na'],
  'に': ['ni'],
  'ぬ': ['nu'],
  'ね': ['ne'],
  'の': ['no'],
  'は': ['ha'],
  'ひ': ['hi'],
  'ふ': ['fu', 'hu'],
  'へ': ['he'],
  'ほ': ['ho'],
  'ま': ['ma'],
  'み': ['mi'],
  'む': ['mu'],
  'め': ['me'],
  'も': ['mo'],
  'や': ['ya'],
  'ゆ': ['yu'],
  'よ': ['yo'],
  'ら': ['ra'],
  'り': ['ri'],
  'る': ['ru'],
  'れ': ['re'],
  'ろ': ['ro'],
  'わ': ['wa'],
  'を': ['wo'],
  'ん': ['n', 'nn'],
  'が': ['ga'],
  'ぎ': ['gi'],
  'ぐ': ['gu'],
  'げ': ['ge'],
  'ご': ['go'],
  'ざ': ['za'],
  'じ': ['zi', 'ji'],
  'ず': ['zu'],
  'ぜ': ['ze'],
  'ぞ': ['zo'],
  'だ': ['da'],
  'ぢ': ['di', 'ji'],
  'づ': ['du', 'zu'],
  'で': ['de'],
  'ど': ['do'],
  'ば': ['ba'],
  'び': ['bi'],
  'ぶ': ['bu'],
  'べ': ['be'],
  'ぼ': ['bo'],
  'ぱ': ['pa'],
  'ぴ': ['pi'],
  'ぷ': ['pu'],
  'ぺ': ['pe'],
  'ぽ': ['po'],
  
  // 拗音
  'きゃ': ['kya'],
  'きゅ': ['kyu'],
  'きょ': ['kyo'],
  'しゃ': ['sya', 'sha'],
  'しゅ': ['syu', 'shu'],
  'しょ': ['syo', 'sho'],
  'ちゃ': ['tya', 'cha'],
  'ちゅ': ['tyu', 'chu'],
  'ちょ': ['tyo', 'cho'],
  'にゃ': ['nya'],
  'にゅ': ['nyu'],
  'にょ': ['nyo'],
  'ひゃ': ['hya'],
  'ひゅ': ['hyu'],
  'ひょ': ['hyo'],
  'みゃ': ['mya'],
  'みゅ': ['myu'],
  'みょ': ['myo'],
  'りゃ': ['rya'],
  'りゅ': ['ryu'],
  'りょ': ['ryo'],
  'ぎゃ': ['gya'],
  'ぎゅ': ['gyu'],
  'ぎょ': ['gyo'],
  'じゃ': ['ja', 'zya'],
  'じゅ': ['ju', 'zyu'],
  'じょ': ['jo', 'zyo'],
  'びゃ': ['bya'],
  'びゅ': ['byu'],
  'びょ': ['byo'],
  'ぴゃ': ['pya'],
  'ぴゅ': ['pyu'],
  'ぴょ': ['pyo'],
  
  // 促音 (小さいつ)
  'っ': ['xtu', 'xtsu', 'ltu'],
  
  // 小さい文字
  'ぁ': ['xa'],
  'ぃ': ['xi'],
  'ぅ': ['xu'],
  'ぇ': ['xe'],
  'ぉ': ['xo'],
  'ゃ': ['xya'],
  'ゅ': ['xyu'],
  'ょ': ['xyo'],
  
  // 特殊なケース
  'ふぁ': ['fa'],
  'ふぃ': ['fi'],
  'ふぇ': ['fe'],
  'ふぉ': ['fo'],
  'うぁ': ['wa'],
  'うぃ': ['wi'],
  'うぇ': ['we'],
  'うぉ': ['wo'],
  'ゔぁ': ['va'],
  'ゔぃ': ['vi'],
  'ゔぇ': ['ve'],
  'ゔぉ': ['vo'],
  'ゔ': ['vu'],
  
  // 長音
  'ー': ['-'],
  
  // 空白
  '　': [' '],
  ' ': [' '],
};

/**
 * ひらがなをローマ字に変換する関数
 * 複数の入力パターンをサポート
 */
export const convertHiraganaToRomaji = (hiragana: string) => {
  let result: Array<{
    kana: string;
    romaji: string;
    alternatives: string[];
  }> = [];
  let position = 0;
  
  while (position < hiragana.length) {
    // 3文字の組み合わせをチェック
    if (position + 2 < hiragana.length) {
      const threeChars = hiragana.substring(position, position + 3);
      if (japaneseToRomajiMap[threeChars]) {
        result.push({
          kana: threeChars,
          romaji: japaneseToRomajiMap[threeChars][0],
          alternatives: japaneseToRomajiMap[threeChars]
        });
        position += 3;
        continue;
      }
    }
    
    // 2文字の組み合わせをチェック
    if (position + 1 < hiragana.length) {
      const twoChars = hiragana.substring(position, position + 2);
      if (japaneseToRomajiMap[twoChars]) {
        result.push({
          kana: twoChars,
          romaji: japaneseToRomajiMap[twoChars][0],
          alternatives: japaneseToRomajiMap[twoChars]
        });
        position += 2;
        continue;
      }
    }
    
    // 1文字をチェック
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
      // 次の文字の最初の子音を重ねる一般的なパターン
      const nextRomaji = result[i + 1].romaji;
      if (nextRomaji && nextRomaji.length > 0) {
        const firstChar = nextRomaji[0];
        if ('bcdfghjklmnpqrstvwxyz'.includes(firstChar)) {
          result[i].romaji = firstChar;
          result[i].alternatives.push(firstChar);
        }
      }
    }
  }
  
  // 「ん」の特殊処理 (n + 母音 or n + y の場合は "n'" にする)
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].kana === 'ん') {
      const nextRomaji = result[i + 1].romaji;
      if (nextRomaji && nextRomaji.length > 0) {
        const firstChar = nextRomaji[0];
        if ('aeiouyn'.includes(firstChar)) {
          result[i].alternatives.push("n'");
        }
      }
    }
  }
  
  return result;
};

/**
 * ローマ字の文字列のみを取得
 */
export const getRomajiString = (hiragana: string): string => {
  return convertHiraganaToRomaji(hiragana)
    .map(item => item.romaji)
    .join('');
};

/**
 * すべての代替入力パターンを含むオブジェクトを取得
 */
export const getAllRomajiPatterns = (hiragana: string): Array<{
  kana: string;
  romaji: string;
  alternatives: string[];
}> => {
  return convertHiraganaToRomaji(hiragana);
};

/**
 * タイピング用のかな文字クラス
 * 複数の入力パターンをサポートします
 */
export class TypingChar {
  kana: string;
  patterns: string[];
  acceptedInput: string = '';
  remainingText: string = '';
  completed: boolean = false;
  
  constructor(kana: string, patterns: string[]) {
    this.kana = kana;
    this.patterns = patterns;
    this.calculateRemainingText();
  }
  
  /**
   * 特定の文字列を受け入れ可能かどうかをチェック
   */
  canAccept(character: string): boolean {
    const newInput = this.acceptedInput + character.toLowerCase();
    
    for (const pattern of this.patterns) {
      if (newInput.length <= pattern.length && newInput === pattern.substring(0, newInput.length)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 入力を受け入れて、完了したかどうかを返す
   */
  accept(character: string): boolean {
    character = character.toLowerCase();
    
    if (this.canAccept(character)) {
      this.acceptedInput += character;
      this.calculateRemainingText();
      return true;
    }
    
    return false;
  }
  
  /**
   * 残りのテキストを計算
   */
  calculateRemainingText(): void {
    if (this.completed) {
      this.remainingText = '';
      return;
    }
    
    // 最短の残りの表現を検索
    this.remainingText = this.patterns[this.patterns.length - 1];
    
    for (const pattern of this.patterns) {
      if (this.acceptedInput.length <= pattern.length && 
          this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
        const remaining = pattern.substring(this.acceptedInput.length);
        if (remaining.length < this.remainingText.length) {
          this.remainingText = remaining;
        }
      }
    }
    
    if (this.remainingText === '') {
      this.completed = true;
    }
  }
  
  /**
   * 文字の表示用の情報を取得
   */
  getDisplayInfo(): {
    displayText: string;
    acceptedText: string;
    remainingText: string;
    isCompleted: boolean;
  } {
    return {
      displayText: this.patterns[0], // 表示用テキスト
      acceptedText: this.acceptedInput,
      remainingText: this.remainingText,
      isCompleted: this.completed
    };
  }
}

/**
 * ひらがなをタイピング用の文字オブジェクトの配列に変換
 */
export const createTypingChars = (hiragana: string): TypingChar[] => {
  const kanaPatterns = convertHiraganaToRomaji(hiragana);
  return kanaPatterns.map(item => new TypingChar(item.kana, item.alternatives));
};

/**
 * ローマ字を1文字ずつに分解して返す
 * 注意: この関数は単純な表示用であり、実際の入力処理にはTypingCharクラスを使用してください
 */
export const getRomajiCharacters = (hiragana: string): Array<{
  char: string;
  kana: string;
  possibleInputs: string[];
  expectedInput: string;
}> => {
  const patterns = convertHiraganaToRomaji(hiragana);
  const result: Array<{
    char: string;
    kana: string;
    possibleInputs: string[];
    expectedInput: string;
  }> = [];
  
  // 各かなのローマ字表現を1文字ずつ分解
  patterns.forEach(pattern => {
    // 選択されたローマ字パターン（優先パターン）を取得
    const romajiChars = pattern.romaji.split('');
    
    // 各ローマ字に対して、可能な入力パターンを計算
    romajiChars.forEach(char => {
      result.push({
        char: char,
        kana: pattern.kana,
        possibleInputs: pattern.alternatives,
        expectedInput: char
      });
    });
  });
  
  return result;
};
