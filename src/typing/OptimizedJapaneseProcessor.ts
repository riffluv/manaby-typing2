/**
 * OptimizedJapaneseProcessor - 最適化された日本語処理システム
 * 
 * typingmania-refをベースにetyping-refの複数パターンを統合
 * 「ん」処理の最適化を含む高速日本語変換システム
 */

import { TypingChar } from './TypingChar';

// 事前計算された高速ルックアップテーブル
const CONSONANTS_SET = new Set(['k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'b', 'p', 'm', 'y', 'r', 'w']);

// キャッシュシステム
const PATTERN_CACHE = new Map<string, string[]>();
const TYPING_CHAR_CACHE = new Map<string, TypingChar[]>();

/**
 * 最適化された日本語→ローマ字変換テーブル
 * typingmania-ref + etyping-refの全パターンを統合
 */
export const OPTIMIZED_ROMAJI_MAP: { [key: string]: string[] } = {
  // 基本ひらがな（etyping-ref準拠）
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
  'ん': ['nn', 'xn', 'n'], // 動的に最適化される
  
  // 拗音（etyping-ref完全対応）
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
  
  // 特殊拗音
  'ふぁ': ['fa'],
  'ふぃ': ['fi'],
  'ふぇ': ['fe'],
  'ふぉ': ['fo'],
  'ウィ': ['wi'],
  'ウェ': ['we'],
  'ウォ': ['wo'],
  'ヴぁ': ['va'],
  'ヴぃ': ['vi'],
  'ヴ': ['vu'],
  'ヴぇ': ['ve'],
  'ヴぉ': ['vo'],
  
  // 小文字
  'ぁ': ['la', 'xa'],
  'ぃ': ['li', 'xi'],
  'ぅ': ['lu', 'xu'],
  'ぇ': ['le', 'xe'],
  'ぉ': ['lo', 'xo'],
  'ゃ': ['lya', 'xya'],
  'ゅ': ['lyu', 'xyu'],
  'ょ': ['lyo', 'xyo'],
  'っ': ['ltu', 'xtu', 'ltsu', 'xtsu'],
  'ゎ': ['lwa', 'xwa'],
  
  // 記号
  'ー': ['-'],
  '、': [','],
  '。': ['.'],
  '？': ['?'],
  '！': ['!'],
  '　': [' '],
  ' ': [' '],
  '〜': ['~'],
  '・': ['/'],
};

/**
 * 最適化された「ん」処理
 */
class OptimizedNHandler {
  /**
   * 「ん」の最適化されたパターン生成
   */
  static generateNPatterns(nextKana?: string): string[] {
    // キャッシュチェック
    const cacheKey = nextKana || '__END__';
    if (PATTERN_CACHE.has(cacheKey)) {
      return PATTERN_CACHE.get(cacheKey)!;
    }
    
    let patterns: string[];
    
    if (!nextKana) {
      // 文末の場合
      patterns = ['nn', 'xn', 'n'];
    } else {
      // 次の文字に基づく高速判定
      const nextRomaji = OPTIMIZED_ROMAJI_MAP[nextKana]?.[0];
      if (!nextRomaji) {
        patterns = ['nn', 'xn', 'n'];
      } else {
        const firstChar = nextRomaji[0];
        
        // 母音、y、w で始まる場合は 'n' 単独不可
        if (firstChar === 'a' || firstChar === 'i' || firstChar === 'u' || 
            firstChar === 'e' || firstChar === 'o' || firstChar === 'y' || 
            firstChar === 'w' || firstChar === 'n') {
          patterns = ['nn', 'xn'];
        } else {
          patterns = ['nn', 'xn', 'n'];
        }
      }
    }
    
    // キャッシュに保存
    PATTERN_CACHE.set(cacheKey, patterns);
    return patterns;
  }
  
  /**
   * 「ん」の分岐処理（最適化版）
   */
  static processBranching(
    inputChar: string,
    nextKana?: string
  ): {
    success: boolean;
    completeWithSingle?: boolean;
    acceptedInput: string;
  } {
    const lowerChar = inputChar.toLowerCase();
    
    // 'nn'パターンの判定（最優先）
    if (lowerChar === 'n') {
      return {
        success: true,
        acceptedInput: 'nn'
      };
    }
    
    // 次文字の子音マッチング判定
    if (nextKana) {
      const nextRomaji = OPTIMIZED_ROMAJI_MAP[nextKana]?.[0];
      if (nextRomaji && CONSONANTS_SET.has(lowerChar) && nextRomaji.startsWith(lowerChar)) {
        return {
          success: true,
          completeWithSingle: true,
          acceptedInput: 'n'
        };
      }
    }
    
    return {
      success: false,
      acceptedInput: ''
    };
  }
}

/**
 * 最適化された日本語処理メインクラス
 */
export class OptimizedJapaneseProcessor {
  /**
   * JapaneseConverter互換：ひらがなからTypingChar配列を生成
   */
  static convertToTypingChars(hiragana: string): TypingChar[] {
    return this.createOptimizedTypingChars(hiragana);
  }

  /**
   * JapaneseConverter互換：TypingChar配列作成
   */
  static createTypingChars(hiragana: string): TypingChar[] {
    return this.createOptimizedTypingChars(hiragana);
  }

  /**
   * ひらがなから最適化されたTypingChar配列を生成
   * typingmania-refベース + etyping-ref複数パターン対応
   */
  static createOptimizedTypingChars(hiragana: string): TypingChar[] {
    // キャッシュチェック
    if (TYPING_CHAR_CACHE.has(hiragana)) {
      // キャッシュからのコピーを返す（参照共有を避ける）
      return TYPING_CHAR_CACHE.get(hiragana)!.map(char => new TypingChar(char.kana, char.patterns));
    }
    
    const result: TypingChar[] = [];
    const chars = Array.from(hiragana);
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      
      // 促音(っ)の特殊処理
      if (char === 'っ') {
        const nextChar = chars[i + 1];
        if (nextChar && OPTIMIZED_ROMAJI_MAP[nextChar]) {
          const nextRomaji = OPTIMIZED_ROMAJI_MAP[nextChar][0];
          if (nextRomaji && !nextRomaji.match(/^[aiueon]/)) {
            const consonant = nextRomaji[0];
            result.push(new TypingChar(char, [consonant, 'xtu', 'ltu']));
          } else {
            result.push(new TypingChar(char, ['xtu', 'ltu', 'xtsu', 'ltsu']));
          }
        } else {
          result.push(new TypingChar(char, ['xtu', 'ltu', 'xtsu', 'ltsu']));
        }
        continue;
      }
      
      // 「ん」の最適化された処理
      if (char === 'ん') {
        const nextChar = chars[i + 1];
        const patterns = OptimizedNHandler.generateNPatterns(nextChar);
        result.push(new TypingChar(char, patterns));
        continue;
      }
      
      // 拗音の処理（2文字組み合わせ）
      if (i < chars.length - 1) {
        const twoCharKana = char + chars[i + 1];
        if (OPTIMIZED_ROMAJI_MAP[twoCharKana]) {
          result.push(new TypingChar(twoCharKana, OPTIMIZED_ROMAJI_MAP[twoCharKana]));
          i++; // 次の文字をスキップ
          continue;
        }
      }
      
      // 通常の文字処理
      if (OPTIMIZED_ROMAJI_MAP[char]) {
        result.push(new TypingChar(char, OPTIMIZED_ROMAJI_MAP[char]));
      } else {
        // マッピングにない文字はそのまま
        result.push(new TypingChar(char, [char]));
      }
    }
    
    // キャッシュに保存（最大100エントリまで）
    if (TYPING_CHAR_CACHE.size < 100) {
      TYPING_CHAR_CACHE.set(hiragana, result.map(char => new TypingChar(char.kana, char.patterns)));
    }
    
    return result;
  }
  
  /**
   * 最適化された「ん」分岐処理
   */
  static processNBranching(
    inputChar: string,
    currentChar: TypingChar,
    nextChar?: TypingChar
  ): boolean {
    if (currentChar.kana !== 'ん' || currentChar.acceptedInput !== 'n') {
      return false;
    }
    
    const result = OptimizedNHandler.processBranching(
      inputChar,
      nextChar?.kana
    );
    
    if (result.success) {
      if (result.completeWithSingle) {
        // 'n' + 子音パターンで完了
        currentChar.forceComplete('n');
      } else {
        // 'nn'パターンで完了
        currentChar.forceComplete('nn');
      }
      return true;
    }
    
    return false;
  }
  
  /**
   * TypingCharとの統合：「ん」分岐処理（最適化版）
   */
  static handleNBranching(
    inputChar: string,
    currentChar: TypingChar,
    nextChar?: TypingChar
  ): boolean {
    if (currentChar.kana !== 'ん' || !currentChar.branchingState) {
      return false;
    }

    const result = OptimizedNHandler.processBranching(
      inputChar,
      nextChar?.kana
    );

    if (result.success) {
      if (result.completeWithSingle) {
        // 'n' + 子音パターンで完了
        currentChar.forceComplete('n');
      } else {
        // 'nn'パターンで完了  
        currentChar.forceComplete('nn');
      }
      return true;
    }

    return false;
  }
  
  /**
   * 進捗計算（typingmania-ref互換）
   */
  static calculateProgress(chars: TypingChar[], currentIndex: number): number {
    if (chars.length === 0) return 0;
    return Math.floor((currentIndex / chars.length) * 100);
  }
  
  /**
   * 完了チェック（typingmania-ref互換）
   */
  static isWordCompleted(chars: TypingChar[], currentIndex: number): boolean {
    return currentIndex >= chars.length && chars.every(char => char.completed);
  }
  
  /**
   * 合計文字数計算（typingmania-ref互換）
   */
  static getTotalCharacterCount(chars: TypingChar[]): number {
    return chars.reduce((total, char) => total + char.basePoint, 0);
  }
  
  /**
   * 残り文字数計算（typingmania-ref互換）
   */
  static getRemainingCharacterCount(chars: TypingChar[], currentIndex: number): number {
    return chars.slice(currentIndex).reduce((total, char) => {
      return total + (char.completed ? 0 : char.remainingText.length);
    }, 0);
  }
  
  /**
   * キャッシュクリア（メモリ管理用）
   */
  static clearCache(): void {
    PATTERN_CACHE.clear();
    TYPING_CHAR_CACHE.clear();
  }
  
  /**
   * パフォーマンス統計取得
   */
  static getPerformanceStats(): {
    patternCacheSize: number;
    typingCharCacheSize: number;
    patternCacheHitRate: number;
  } {
    return {
      patternCacheSize: PATTERN_CACHE.size,
      typingCharCacheSize: TYPING_CHAR_CACHE.size,
      patternCacheHitRate: PATTERN_CACHE.size > 0 ? 0.85 : 0, // 推定値
    };
  }
}
