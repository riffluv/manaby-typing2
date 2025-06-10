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

// 🚀 HybridTypingEngine - ローマ字のみCanvas超高速化版
export { HybridTypingEngine } from './HybridTypingEngine';

// React Integration
export { useDirectTyping2 } from './DirectTypingHook2';
export { useHybridTyping } from './HybridTypingHook';

// Types
export type { DisplayInfo } from './TypingChar';
export type { RomajiData } from './JapaneseConverter';

// 🚀 DirectTypingEngine2 Types
export type { UseDirectTyping2Props, DirectTypingHook2Config } from './DirectTypingHook2';

// 🚀 HybridTypingEngine Types
export type { UseHybridTypingProps, HybridTypingHookConfig } from './HybridTypingHook';

// Utilities
export { japaneseToRomajiMap } from './JapaneseConverter';
