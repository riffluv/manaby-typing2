/**
 * Typing Types - typingmania-ref流の型定義
 * 
 * 高速レスポンスを維持しながら段階的リファクタリングをサポート
 */

export type TypingWord = {
  japanese: string;
  hiragana: string;
  romaji: string;
  typingChars: any[]; // 新しいTypingCharを使用
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
  typingChars: any[]; // 新しいTypingCharを使用予定
  displayChars: string[];
};
