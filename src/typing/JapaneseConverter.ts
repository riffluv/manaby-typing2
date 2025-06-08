/**
 * JapaneseConverter - typingmania-ref流の日本語変換クラス
 * 
 * japaneseUtils.tsとbasicJapaneseUtils.tsを統合し、
 * typingmania-refのromanizer.jsに相当する機能を提供
 */

import { TypingChar } from './TypingChar';
import { OptimizedNProcessor } from './OptimizedNProcessor';

/**
 * ひらがなとローマ字の変換テーブル
 * etyping-refの完全な実装に基づく包括的パターン集
 */
export const japaneseToRomajiMap: { [key: string]: string[] } = {
  // 基本的なひらがな
  'あ': ['a'],
  'い': ['i', 'yi'],
  'う': ['u', 'wu'],
  'え': ['e'],
  'お': ['o'],
  
  // か行
  'か': ['ka', 'ca'],
  'き': ['ki'],
  'く': ['ku', 'cu', 'qu'],
  'け': ['ke'],
  'こ': ['ko', 'co'],
  'が': ['ga'],
  'ぎ': ['gi'],
  'ぐ': ['gu'],
  'げ': ['ge'],
  'ご': ['go'],
  
  // さ行
  'さ': ['sa'],
  'し': ['si', 'shi', 'ci'],
  'す': ['su'],
  'せ': ['se', 'ce'],
  'そ': ['so'],
  'ざ': ['za'],
  'じ': ['ji', 'zi'],
  'ず': ['zu'],
  'ぜ': ['ze'],
  'ぞ': ['zo'],
  
  // た行
  'た': ['ta'],
  'ち': ['ti', 'chi'],
  'つ': ['tu', 'tsu'],
  'て': ['te'],
  'と': ['to'],
  'だ': ['da'],
  'ぢ': ['di'],
  'づ': ['du'],
  'で': ['de'],
  'ど': ['do'],
  
  // な行
  'な': ['na'],
  'に': ['ni'],
  'ぬ': ['nu'],
  'ね': ['ne'],
  'の': ['no'],
  
  // は行
  'は': ['ha'],
  'ひ': ['hi'],
  'ふ': ['fu', 'hu'],
  'へ': ['he'],
  'ほ': ['ho'],
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
  
  // ま行
  'ま': ['ma'],
  'み': ['mi'],
  'む': ['mu'],
  'め': ['me'],
  'も': ['mo'],
  
  // や行
  'や': ['ya'],
  'ゆ': ['yu'],
  'よ': ['yo'],
  
  // ら行
  'ら': ['ra'],
  'り': ['ri'],
  'る': ['ru'],
  'れ': ['re'],
  'ろ': ['ro'],
  
  // わ行
  'わ': ['wa'],
  'ゐ': ['wyi'],
  'ゑ': ['wye'],
  'を': ['wo'],
  'ん': ['nn', 'xn', 'n'],
  
  // 特殊文字（うぁ系）
  'うぁ': ['wha'],
  'うぃ': ['whi'],
  'うぇ': ['whe'],
  'うぉ': ['who'],
  
  // 拗音 - きゃ行
  'きゃ': ['kya'],
  'きぃ': ['kyi'],
  'きゅ': ['kyu'],
  'きぇ': ['kye'],
  'きょ': ['kyo'],
  
  // 拗音 - くぁ行
  'くぁ': ['qa', 'qwa'],
  'くぃ': ['qi', 'qwi'],
  'くぇ': ['qe', 'qwe'],
  'くぉ': ['qo', 'qwo'],
  'くゃ': ['qya'],
  'くゅ': ['qyu'],
  'くょ': ['qyo'],
  
  // 拗音 - しゃ行
  'しゃ': ['sya', 'sha'],
  'しぃ': ['syi'],
  'しゅ': ['syu', 'shu'],
  'しぇ': ['sye', 'she'],
  'しょ': ['syo', 'sho'],
  
  // 拗音 - つぁ行
  'つぁ': ['tsa'],
  'つぃ': ['tsi'],
  'つぇ': ['tse'],
  'つぉ': ['tso'],
  
  // 拗音 - ちゃ行
  'ちゃ': ['tya', 'cha'],
  'ちぃ': ['tyi'],
  'ちゅ': ['tyu', 'chu'],
  'ちぇ': ['tye', 'che'],
  'ちょ': ['tyo', 'cho'],
  
  // 拗音 - てゃ行
  'てゃ': ['tha'],
  'てぃ': ['thi'],
  'てゅ': ['thu'],
  'てぇ': ['the'],
  'てょ': ['tho'],
  
  // 拗音 - とぁ行
  'とぁ': ['twa'],
  'とぃ': ['twi'],
  'とぅ': ['twu'],
  'とぇ': ['twe'],
  'とぉ': ['two'],
  
  // 拗音 - にゃ行
  'にゃ': ['nya'],
  'にぃ': ['nyi'],
  'にゅ': ['nyu'],
  'にぇ': ['nye'],
  'にょ': ['nyo'],
  
  // 拗音 - ひゃ行
  'ひゃ': ['hya'],
  'ひぃ': ['hyi'],
  'ひゅ': ['hyu'],
  'ひぇ': ['hye'],
  'ひょ': ['hyo'],
  
  // 拗音 - ふぁ行
  'ふぁ': ['fa'],
  'ふぃ': ['fi'],
  'ふぇ': ['fe'],
  'ふぉ': ['fo'],
  
  // 拗音 - みゃ行
  'みゃ': ['mya'],
  'みぃ': ['myi'],
  'みゅ': ['myu'],
  'みぇ': ['mye'],
  'みょ': ['myo'],
  
  // 拗音 - りゃ行
  'りゃ': ['rya'],
  'りぃ': ['ryi'],
  'りゅ': ['ryu'],
  'りぇ': ['rye'],
  'りょ': ['ryo'],
  
  // ヴ系
  'ヴぁ': ['va'],
  'ヴぃ': ['vi'],
  'ヴ': ['vu'],
  'ヴぇ': ['ve'],
  'ヴぉ': ['vo'],
  
  // 濁音拗音 - ぎゃ行
  'ぎゃ': ['gya'],
  'ぎぃ': ['gyi'],
  'ぎゅ': ['gyu'],
  'ぎぇ': ['gye'],
  'ぎょ': ['gyo'],
  
  // 濁音拗音 - ぐぁ行
  'ぐぁ': ['gwa'],
  'ぐぃ': ['gwi'],
  'ぐぅ': ['gwu'],
  'ぐぇ': ['gwe'],
  'ぐぉ': ['gwo'],
  
  // 濁音拗音 - じゃ行
  'じゃ': ['ja', 'zya'],
  'じぃ': ['jyi', 'zyi'],
  'じゅ': ['ju', 'zyu'],
  'じぇ': ['je', 'zye'],
  'じょ': ['jo', 'zyo'],
  
  // 濁音拗音 - でゃ行
  'でゃ': ['dha'],
  'でぃ': ['dhi'],
  'でゅ': ['dhu'],
  'でぇ': ['dhe'],
  'でょ': ['dho'],
  
  // 濁音拗音 - ぢゃ行
  'ぢゃ': ['dya'],
  'ぢぃ': ['dyi'],
  'ぢゅ': ['dyu'],
  'ぢぇ': ['dye'],
  'ぢょ': ['dyo'],
  
  // 濁音拗音 - びゃ行
  'びゃ': ['bya'],
  'びぃ': ['byi'],
  'びゅ': ['byu'],
  'びぇ': ['bye'],
  'びょ': ['byo'],
  
  // 半濁音拗音 - ぴゃ行
  'ぴゃ': ['pya'],
  'ぴぃ': ['pyi'],
  'ぴゅ': ['pyu'],
  'ぴぇ': ['pye'],
  'ぴょ': ['pyo'],
  
  // 小文字
  'ぁ': ['la', 'xa'],
  'ぃ': ['li', 'xi'],
  'ぅ': ['lu', 'xu'],
  'ぇ': ['le', 'xe'],
  'ぉ': ['lo', 'xo'],
  'ゃ': ['lya', 'xya'],
  'ゅ': ['lyu', 'xyu'],
  'ょ': ['lyo', 'xyo'],
  'っ': ['ltu', 'xtu'],
  'ゎ': ['lwa', 'xwa'],
  
  // 記号・特殊文字
  'ー': ['-'],
  ',': [','],
  '.': ['.'],
  '、': [','],
  '。': ['.'],
  '？': ['?'],
  '！': ['!'],
  '　': [' '],
  '〜': ['~'],
  '・': ['/'],
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
   * 「ん」の後続文字に応じたパターン生成（最適化版）
   * OptimizedNProcessorを使用した高速パターン生成
   */
  private static getNPatterns(nextChar?: string): string[] {
    return OptimizedNProcessor.getNPatterns(nextChar);
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
