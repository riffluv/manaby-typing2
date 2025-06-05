/**
 * Typing Module - typingmania-ref流のタイピングシステム
 * 
 * typingmania-refのベストプラクティスに基づいた
 * 高速レスポンス・シンプル設計のタイピングシステム
 */

// Core Classes
export { TypingChar } from './TypingChar';
export { TypingEngine } from './TypingEngine';
export { JapaneseConverter } from './JapaneseConverter';

// React Integration
export { useTyping } from './TypingHook';

// Types
export type { DisplayInfo } from './TypingChar';
export type { TypingEngineState } from './TypingEngine';
export type { RomajiData } from './JapaneseConverter';
export type { TypingHookProps, TypingHookReturn } from './TypingHook';

// Utilities
export { japaneseToRomajiMap } from './JapaneseConverter';
