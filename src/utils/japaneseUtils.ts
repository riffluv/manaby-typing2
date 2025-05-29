/**
 * ひらがなとローマ字の変換テーブル
 * etypping-refの実装を参考に拡充
 */
export const japaneseToRomajiMap: { [key: string]: string[] } = {
  // 基本的なひらがな
  'あ': ['a'],
  'い': ['i', 'yi'],
  'う': ['u', 'wu'],
  'え': ['e'],
  'お': ['o'],
  'か': ['ka', 'ca'],
  'き': ['ki'],
  'く': ['ku', 'cu', 'qu'],
  'け': ['ke'],
  'こ': ['ko', 'co'],
  'さ': ['sa'],
  'し': ['si', 'shi', 'ci'],
  'す': ['su'],
  'せ': ['se', 'ce'],
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
  'ん': ['nn', 'xn', 'n'],
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
  'きぃ': ['kyi'],
  'きゅ': ['kyu'],
  'きぇ': ['kye'],
  'きょ': ['kyo'],
  'しゃ': ['sya', 'sha'],
  'しぃ': ['syi'],
  'しゅ': ['syu', 'shu'],
  'しぇ': ['sye', 'she'],
  'しょ': ['syo', 'sho'],
  'ちゃ': ['tya', 'cha'],
  'ちぃ': ['tyi'],
  'ちゅ': ['tyu', 'chu'],
  'ちぇ': ['tye', 'che'],
  'ちょ': ['tyo', 'cho'],
  'にゃ': ['nya'],
  'にぃ': ['nyi'],
  'にゅ': ['nyu'],
  'にぇ': ['nye'],
  'にょ': ['nyo'],
  'ひゃ': ['hya'],
  'ひぃ': ['hyi'],
  'ひゅ': ['hyu'],
  'ひぇ': ['hye'],
  'ひょ': ['hyo'],
  'みゃ': ['mya'],
  'みぃ': ['myi'],
  'みゅ': ['myu'],
  'みぇ': ['mye'],
  'みょ': ['myo'],
  'りゃ': ['rya'],
  'りぃ': ['ryi'],
  'りゅ': ['ryu'],
  'りぇ': ['rye'],
  'りょ': ['ryo'],
  'ぎゃ': ['gya'],
  'ぎぃ': ['gyi'],
  'ぎゅ': ['gyu'],
  'ぎぇ': ['gye'],
  'ぎょ': ['gyo'],
  'じゃ': ['ja', 'zya'],
  'じぃ': ['jyi', 'zyi'],
  'じゅ': ['ju', 'zyu'],
  'じぇ': ['je', 'zye'],
  'じょ': ['jo', 'zyo'],
  'びゃ': ['bya'],
  'びぃ': ['byi'],
  'びゅ': ['byu'],
  'びぇ': ['bye'],
  'びょ': ['byo'],
  'ぴゃ': ['pya'],
  'ぴぃ': ['pyi'],
  'ぴゅ': ['pyu'],
  'ぴぇ': ['pye'],
  'ぴょ': ['pyo'],
  
  // 促音 (小さいつ)
  'っ': ['xtu', 'xtsu', 'ltu'],
  
  // 小さい文字
  'ぁ': ['xa', 'la'],
  'ぃ': ['xi', 'li'],
  'ぅ': ['xu', 'lu'],
  'ぇ': ['xe', 'le'],
  'ぉ': ['xo', 'lo'],
  'ゃ': ['xya', 'lya'],
  'ゅ': ['xyu', 'lyu'],
  'ょ': ['xyo', 'lyo'],
  
  // 特殊なケース
  'ふぁ': ['fa'],
  'ふぃ': ['fi'],
  'ふぇ': ['fe'],
  'ふぉ': ['fo'],
  'うぁ': ['wha', 'wa'],
  'うぃ': ['whi', 'wi'],
  'うぇ': ['whe', 'we'],
  'うぉ': ['who', 'wo'],
  'ゔぁ': ['va'],
  'ゔぃ': ['vi'],
  'ゔぇ': ['ve'],
  'ゔぉ': ['vo'],
  'ゔ': ['vu'],
  
  // 拡張パターン (etypping-refより)
  'くぁ': ['qa', 'qwa'],
  'くぃ': ['qi', 'qwi'],
  'くぇ': ['qe', 'qwe'],
  'くぉ': ['qo', 'qwo'],
  'くゃ': ['qya'],
  'くゅ': ['qyu'],
  'くょ': ['qyo'],
  'つぁ': ['tsa'],
  'つぃ': ['tsi'],
  'つぇ': ['tse'],
  'つぉ': ['tso'],
  'てゃ': ['tha'],
  'てぃ': ['thi'],
  'てゅ': ['thu'],
  'てぇ': ['the'],
  'てょ': ['tho'],
  'とぁ': ['twa'],
  'とぃ': ['twi'],
  'とぅ': ['twu'],
  'とぇ': ['twe'],
  'とぉ': ['two'],
  'でゃ': ['dha'],
  'でぃ': ['dhi'],
  'でゅ': ['dhu'],
  'でぇ': ['dhe'],
  'でょ': ['dho'],
  'ぢゃ': ['dya'],
  'ぢぃ': ['dyi'],
  'ぢゅ': ['dyu'],
  'ぢぇ': ['dye'],
  'ぢょ': ['dyo'],
  'ぐぁ': ['gwa'],
  'ぐぃ': ['gwi'],
  'ぐぅ': ['gwu'],
  'ぐぇ': ['gwe'],
  'ぐぉ': ['gwo'],
  
  // 長音
  'ー': ['-'],
  
  // 空白と記号
  '　': [' '],
  ' ': [' '],
  ',': [','],
  '.': ['.'],
  '、': [','],
  '。': ['.'],
  '・': ['/'],
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
      const nextRomaji = result[i + 1].romaji;
      const nextKana = result[i + 1].kana;
      
      // 次の文字が存在しない場合やカンマ、ピリオドの場合は通常の処理
      if (!nextRomaji || nextRomaji.match(/[,.]/) || 
          nextRomaji[0].match(/^[aiueon]/)) {
        // デフォルトのままでOK
      } else {
        // 次の文字の最初の子音を重ねる
        const firstChar = nextRomaji[0];
        if ('bcdfghjklmnpqrstvwxyz'.includes(firstChar)) {
          const doubledCons = Array.from(result[i + 1].alternatives).map(alt => 
            alt.length > 0 ? firstChar + alt : alt
          );
          
          result[i].romaji = firstChar;
          result[i].alternatives = [...new Set([firstChar, ...result[i].alternatives])];
          
          // 次の文字の代替入力も更新
          result[i + 1].alternatives = doubledCons;
        }
      }
    }
  }
  
  // 「ん」の特殊処理 (IMEと同じ自然な判定)
  for (let i = 0; i < result.length; i++) {
    if (result[i].kana === 'ん') {
      const isLast = i === result.length - 1;
      let nextKana = '';
      let nextRomaji = '';
      if (!isLast) {
        nextKana = result[i + 1].kana;
        nextRomaji = result[i + 1].romaji;
      }
      // 文末 or 次があ行・な行・や行・ん の場合は n 単独不可
      const isAgyo = nextRomaji && 'aiueo'.includes(nextRomaji[0]);
      const isN = nextRomaji && nextRomaji[0] === 'n';
      const isY = nextRomaji && nextRomaji[0] === 'y';
      const isNa = nextKana && ['な','に','ぬ','ね','の'].includes(nextKana);
      const isYa = nextKana && ['や','ゆ','よ'].includes(nextKana);
      const isNn = nextKana && nextKana === 'ん';
      if (isLast || isAgyo || isN || isY || isNa || isYa || isNn) {
        // n単独を除外（nn/xnのみ許可）
        result[i].alternatives = result[i].alternatives.filter(a => a !== 'n');
      }
      // n'は従来通り追加
      if (!isLast && (isAgyo || isN || isY)) {
        if (!result[i].alternatives.includes("n'")) {
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
 * タイピング用のかな文字クラス（typingmania-ref流高速化版）
 * 複数の入力パターンをサポートします
 */
export class TypingChar {
  kana: string;
  patterns: string[];
  acceptedInput: string = '';
  remainingText: string = '';
  completed: boolean = false;
  // 複数パターンのうち現在有効なパターンのインデックス
  activePatternIndices: number[] = [];
  
  constructor(kana: string, patterns: string[]) {
    this.kana = kana;
    this.patterns = patterns;
    // 最初はすべてのパターンが有効
    this.activePatternIndices = Array.from({ length: patterns.length }, (_, i) => i);
    this.calculateRemainingText();
  }
  
  /**
   * 特定の文字列を受け入れ可能かどうかをチェック（高速化版）
   */
  canAccept(character: string): boolean {
    const char = character.toLowerCase();
    const newInput = this.acceptedInput + char;
    
    // 高速化：最初の有効パターンでチェック
    if (this.activePatternIndices.length > 0) {
      const firstActivePattern = this.patterns[this.activePatternIndices[0]];
      if (newInput.length <= firstActivePattern.length && 
          newInput === firstActivePattern.substring(0, newInput.length)) {
        return true;
      }
    }
    
    // フォールバック：全パターンチェック
    for (const patternIndex of this.activePatternIndices) {
      const pattern = this.patterns[patternIndex];
      if (newInput.length <= pattern.length && newInput === pattern.substring(0, newInput.length)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 入力を受け入れて、完了したかどうかを返す（高速化版）
   */
  accept(character: string): boolean {
    const char = character.toLowerCase();
    
    if (this.canAccept(char)) {
      this.acceptedInput += char;
      
      // 入力後に有効なパターンを更新（高速化）
      this.updateActivePatterns();
      this.calculateRemainingText();
      return true;
    }
    
    return false;
  }
  
  /**
   * 現在の入力に基づいて有効なパターンを更新（最適化版）
   */
  updateActivePatterns(): void {
    // 高速化：フィルタ処理を最小限に
    const newActiveIndices: number[] = [];
    
    for (const i of this.activePatternIndices) {
      const pattern = this.patterns[i];
      if (this.acceptedInput.length <= pattern.length && 
          this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
        newActiveIndices.push(i);
      }
    }
    
    this.activePatternIndices = newActiveIndices;
  }
  
  /**
   * 残りのテキストを計算（高速化版）
   */
  calculateRemainingText(): void {
    if (this.completed) {
      this.remainingText = '';
      return;
    }
    
    // 高速化：最短パターンを素早く見つける
    let shortestRemaining = '';
    let shortestLength = Infinity;
    
    for (const patternIndex of this.activePatternIndices) {
      const pattern = this.patterns[patternIndex];
      if (this.acceptedInput.length <= pattern.length) {
        const remaining = pattern.substring(this.acceptedInput.length);
        if (remaining.length < shortestLength) {
          shortestRemaining = remaining;
          shortestLength = remaining.length;
          
          // 最短が見つかったら早期終了（高速化）
          if (shortestLength === 0) break;
        }
      }
    }
    
    this.remainingText = shortestRemaining;
    
    // どのパターンも完了した場合は完了フラグをセット
    if (this.activePatternIndices.length === 0 || this.remainingText === '') {
      this.completed = true;
      this.remainingText = '';
    }
  }
  
  /**
   * 文字の表示用の情報を取得（キャッシュ最適化）
   */
  getDisplayInfo(): {
    displayText: string;
    acceptedText: string;
    remainingText: string;
    isCompleted: boolean;
  } {
    return {
      displayText: this.patterns[0], // 表示用テキスト（最初のパターン）
      acceptedText: this.acceptedInput,
      remainingText: this.remainingText,
      isCompleted: this.completed
    };
  }
  
  /**
   * 活性なパターンを取得
   */
  getActivePatterns(): string[] {
    return this.activePatternIndices.map(i => this.patterns[i]);
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
