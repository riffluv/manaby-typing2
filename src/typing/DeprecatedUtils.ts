/**
 * DeprecatedUtils - 段階的移行サポート
 * 
 * 旧システムとの互換性を保ちながら、
 * 新しいtypingmania-ref流システムへの移行を支援
 */

import { TypingChar, JapaneseConverter } from '@/typing';
import { BasicTypingChar } from '@/utils/BasicTypingChar';

/**
 * BasicTypingCharからTypingCharへの変換
 * 段階的移行をサポート
 */
export function convertBasicToTypingChar(basicChar: BasicTypingChar): TypingChar {
  return new TypingChar(basicChar.kana, basicChar.patterns);
}

/**
 * BasicTypingChar配列からTypingChar配列への変換
 */
export function convertBasicToTypingChars(basicChars: BasicTypingChar[]): TypingChar[] {
  return basicChars.map(convertBasicToTypingChar);
}

/**
 * 旧createBasicTypingCharsの代替（新システム使用）
 */
export function createTypingCharsFromHiragana(hiragana: string): TypingChar[] {
  return JapaneseConverter.createTypingChars(hiragana);
}

/**
 * 段階的移行のための警告関数
 */
export function deprecationWarning(oldMethod: string, newMethod: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ [DEPRECATED] ${oldMethod} is deprecated. Use ${newMethod} instead.`);
  }
}

/**
 * 旧useSimpleTypingとの互換性層
 */
export interface LegacyTypingHookReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentCharIndex: number;
  kanaDisplay: any;
  detailedProgress: any;
  getDetailedProgress: () => any;
}

/**
 * 段階的移行のためのラッパー関数
 */
export function createLegacyCompatibleHook() {
  deprecationWarning('useSimpleTyping', 'useTyping from @/typing');
  // 新しいuseTypingへの移行を促すメッセージ
}
