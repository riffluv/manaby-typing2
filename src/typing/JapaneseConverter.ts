/**
 * JapaneseConverter - typingmania-ref流の日本語変換クラス
 * 
 * japaneseUtils.tsとbasicJapaneseUtils.tsを統合し、
 * typingmania-refのromanizer.jsに相当する機能を提供
 */

import { TypingChar } from './TypingChar';

/**
 * ひらがなとローマ字の変換テーブル
 * etyping-refの実装を参考に拡充
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
  'じゃ': ['zya', 'ja', 'jya'],
  'じぃ': ['zyi', 'jyi'],
  'じゅ': ['zyu', 'ju', 'jyu'],
  'じぇ': ['zye', 'je', 'jye'],
  'じょ': ['zyo', 'jo', 'jyo'],
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

  // 小文字
  'ぁ': ['xa', 'la'],
  'ぃ': ['xi', 'li'],
  'ぅ': ['xu', 'lu'],
  'ぇ': ['xe', 'le'],
  'ぉ': ['xo', 'lo'],
  'ゃ': ['xya', 'lya'],
  'ゅ': ['xyu', 'lyu'],
  'ょ': ['xyo', 'lyo'],
  'っ': ['xtu', 'ltu', 'xtsu', 'ltsu'],
  'ゎ': ['xwa', 'lwa'],

  // その他
  'ー': ['-'],
  '・': ['/'],
  '〜': ['~'],
  '？': ['?'],
  '！': ['!'],
  '　': [' '],
};

export interface RomajiData {
  kana: string;
  alternatives: string[];
}

/**
 * typingmania-ref流の日本語変換クラス
 * romanizer.jsに相当する機能を提供
 */
export class JapaneseConverter {
  /**
   * ひらがなをローマ字パターンに変換
   * 「ん」の特殊処理を含む
   */
  static convertToRomaji(hiragana: string): RomajiData[] {
    const result: RomajiData[] = [];
    const chars = Array.from(hiragana);
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      
      // 促音(っ)の処理
      if (char === 'っ') {
        const nextChar = chars[i + 1];
        if (nextChar && japaneseToRomajiMap[nextChar]) {
          const nextRomaji = japaneseToRomajiMap[nextChar][0];
          if (nextRomaji) {
            const consonant = nextRomaji[0];
            result.push({
              kana: char,
              alternatives: [consonant, 'xtu', 'ltu']
            });
          }
        } else {
          result.push({
            kana: char,
            alternatives: ['xtu', 'ltu', 'xtsu', 'ltsu']
          });
        }
        continue;
      }
      
      // 「ん」の特殊処理
      if (char === 'ん') {
        const nextChar = chars[i + 1];
        const nPatterns = this.getNPatterns(nextChar);
        result.push({
          kana: char,
          alternatives: nPatterns
        });
        continue;
      }
      
      // 拗音の処理（2文字組み合わせ）
      if (i < chars.length - 1) {
        const twoCharKana = char + chars[i + 1];
        if (japaneseToRomajiMap[twoCharKana]) {
          result.push({
            kana: twoCharKana,
            alternatives: japaneseToRomajiMap[twoCharKana]
          });
          i++; // 次の文字をスキップ
          continue;
        }
      }
      
      // 通常の文字処理
      if (japaneseToRomajiMap[char]) {
        result.push({
          kana: char,
          alternatives: japaneseToRomajiMap[char]
        });
      } else {
        // マッピングにない文字は1文字として扱う
        result.push({
          kana: char,
          alternatives: [char]
        });
      }
    }
    
    return result;
  }

  /**
   * 「ん」の後続文字に応じたパターン生成
   */
  private static getNPatterns(nextChar?: string): string[] {
    if (!nextChar) {
      return ['nn', 'xn', 'n'];
    }
    
    const nextRomaji = japaneseToRomajiMap[nextChar];
    if (!nextRomaji || nextRomaji.length === 0) {
      return ['nn', 'xn', 'n'];
    }
    
    const firstRomaji = nextRomaji[0].toLowerCase();
    const firstChar = firstRomaji[0];
    
    // 'y'や'w'で始まる場合は'n'を許可しない
    if (firstChar === 'y' || firstChar === 'w') {
      return ['nn', 'xn'];
    }
    
    // 母音で始まる場合は'n'を許可しない
    if (['a', 'i', 'u', 'e', 'o'].includes(firstChar)) {
      return ['nn', 'xn'];
    }
    
    return ['nn', 'xn', 'n'];
  }

  /**
   * ひらがなからTypingCharの配列を作成
   * typingmania-ref流の統合メソッド
   */
  static createTypingChars(hiragana: string): TypingChar[] {
    const romajiData = this.convertToRomaji(hiragana);
    return romajiData.map(data => new TypingChar(data.kana, data.alternatives));
  }

  /**
   * typingmania-ref流：進捗計算
   */
  static calculateProgress(chars: TypingChar[], currentIndex: number): number {
    if (chars.length === 0) return 0;
    return Math.floor((currentIndex / chars.length) * 100);
  }

  /**
   * typingmania-ref流：完了チェック
   */
  static isWordCompleted(chars: TypingChar[], currentIndex: number): boolean {
    return currentIndex >= chars.length && chars.every(char => char.completed);
  }

  /**
   * typingmania-ref流：合計文字数計算
   */
  static getTotalCharacterCount(chars: TypingChar[]): number {
    return chars.reduce((total, char) => total + char.basePoint, 0);
  }
  /**
   * typingmania-ref流：残り文字数計算
   */
  static getRemainingCharacterCount(chars: TypingChar[], currentIndex: number): number {
    return chars.slice(currentIndex).reduce((total, char) => {
      return total + (char.completed ? 0 : char.remainingText.length);
    }, 0);
  }

  /**
   * ひらがなからTypingCharの配列を生成
   * NewSimpleGameScreenから呼び出される主要メソッド
   */
  static convertToTypingChars(hiragana: string): TypingChar[] {
    return JapaneseConverter.createTypingChars(hiragana);
  }
}
