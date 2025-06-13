/**
 * Typing Types - typingmania-ref流の型定義
 * 
 * 高速レスポンスを維持しながら段階的リファクタリングをサポート
 */

import type { TypingChar } from '@/typing/TypingChar';

// TypingCharを再エクスポート
export type { TypingChar } from '@/typing/TypingChar';

export type TypingWord = {
  japanese: string;
  hiragana: string;
  romaji: string;
  typingChars: TypingChar[]; // TypingCharを使用
  displayChars: string[];
};

export type KanaDisplay = {
  acceptedText: string;
  remainingText: string;
  displayText: string;
};

// 将来のリファクタリングのための準備
export type NewTypingWord = {
  japanese: string;
  hiragana: string;
  romaji: string;
  typingChars: TypingChar[]; // TypingCharを使用
  displayChars: string[];
};
