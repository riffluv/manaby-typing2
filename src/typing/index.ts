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

// 🚀 Phase 1: HyperTypingEngine - 性能突破版
export { HyperTypingEngine } from './HyperTypingEngine';

// React Integration
export { useTyping } from './TypingHook';
export { useHyperTyping } from './HyperTypingHook';

// Types
export type { DisplayInfo } from './TypingChar';
export type { TypingEngineState } from './TypingEngine';
export type { RomajiData } from './JapaneseConverter';
export type { TypingHookProps, TypingHookReturn } from './TypingHook';

// 🚀 Phase 1: HyperTypingHook Types
export type { HyperTypingHookProps, HyperTypingHookReturn } from './HyperTypingHook';

// Utilities
export { japaneseToRomajiMap } from './JapaneseConverter';
