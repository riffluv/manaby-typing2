import { normalizeSymbol, hiraganaToRomaji } from './japaneseUtils';
import { OptimizedTypingChar, TypingChar } from './OptimizedTypingChar';

/**
 * typingmania-ref流 最適化された日本語ユーティリティ
 * 
 * 複雑な最適化を削除し、シンプルで効率的な処理を実現
 */

/**
 * ひらがなからTypingCharの配列を作成
 */
export function createOptimizedTypingChars(hiragana: string): TypingChar[] {
  const chars: TypingChar[] = [];
  
  // hiraganaToRomajiは文字単位ではなく、単語全体の変換結果を返す
  const romajiData = hiraganaToRomaji(hiragana);
  
  for (const item of romajiData) {
    chars.push(new OptimizedTypingChar(item.kana, item.alternatives));
  }
  
  return chars;
}

/**
 * typingmania-ref流：シンプルな進捗計算
 */
export function calculateProgress(chars: TypingChar[], currentIndex: number): number {
  if (chars.length === 0) return 0;
  return Math.floor((currentIndex / chars.length) * 100);
}

/**
 * typingmania-ref流：完了チェック
 */
export function isWordCompleted(chars: TypingChar[], currentIndex: number): boolean {
  return currentIndex >= chars.length;
}

/**
 * typingmania-ref流：残り文字数計算
 */
export function getRemainingCharCount(chars: TypingChar[], currentIndex: number): number {
  let remaining = 0;
  for (let i = currentIndex; i < chars.length; i++) {
    remaining += chars[i].getLeftoverCharCount();
  }
  return remaining;
}
