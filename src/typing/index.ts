/**
 * Typing Module - DirectTypingEngine2 System
 * 
 * 高度なタイピングエンジンシステム
 * ひらがな文字フォーカス機能付き
 */

// Core Classes
export { TypingChar } from './TypingChar';
export { JapaneseConverter } from './JapaneseConverter';

// 🚀 DirectTypingEngine2 - ひらがな文字フォーカス版（メイン）
export { DirectTypingEngine2 } from './DirectTypingEngine2';

// React Integration
export { useDirectTyping2 } from './DirectTypingHook2';

// Types
export type { DisplayInfo } from './TypingChar';
export type { RomajiData } from './JapaneseConverter';

// 🚀 DirectTypingHook2 Types
export type { UseDirectTyping2Props, DirectTypingHook2Config } from './DirectTypingHook2';

// Utilities
export { japaneseToRomajiMap } from './JapaneseConverter';
