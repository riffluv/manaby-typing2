/**
 * basicJapaneseUtils - typingmania-ref流のシンプル日本語ユーティリティ
 * 
 * OptimizedTypingCharに依存せず、BasicTypingCharを使用
 * ユーザーの複雑なタイピングロジック（複数パターン、「ん」処理）は japaneseUtils.ts で完全保持
 */

import { hiraganaToRomaji } from './japaneseUtils';
import { BasicTypingChar } from './BasicTypingChar';

/**
 * ひらがなからBasicTypingCharの配列を作成
 * japaneseUtils.tsの複雑な変換ロジックをそのまま使用
 */
export function createBasicTypingChars(hiragana: string): BasicTypingChar[] {
  const chars: BasicTypingChar[] = [];
  
  // japaneseUtils.tsの変換ロジックを使用（複数パターン、「ん」処理含む）
  const romajiData = hiraganaToRomaji(hiragana);
  
  for (const item of romajiData) {
    chars.push(new BasicTypingChar(item.kana, item.alternatives));
  }
  
  return chars;
}

/**
 * typingmania-ref流：シンプルな進捗計算
 */
export function calculateBasicProgress(chars: BasicTypingChar[], currentIndex: number): number {
  if (chars.length === 0) return 0;
  return Math.floor((currentIndex / chars.length) * 100);
}

/**
 * typingmania-ref流：完了チェック
 */
export function isBasicWordCompleted(chars: BasicTypingChar[], currentIndex: number): boolean {
  return currentIndex >= chars.length && chars.every(char => char.isCompleted());
}

/**
 * typingmania-ref流：合計文字数計算
 */
export function getTotalCharacterCount(chars: BasicTypingChar[]): number {
  return chars.reduce((total, char) => total + char.getCharacterCount(), 0);
}

/**
 * typingmania-ref流：残り文字数計算
 */
export function getLeftoverCharacterCount(chars: BasicTypingChar[]): number {
  return chars.reduce((total, char) => total + char.getLeftoverCharCount(), 0);
}
