import { create } from 'zustand';
import { createSelectors } from '@/store/createSelectors';

/**
 * タイピング入力状態管理ストア（Zustand）
 * @module typingStore
 */

// タイピング状態の型定義
interface TypingState {
  // 入力関連の状態
  // userInput, currentKanaIndex, currentKanaDisplayはuseRef/useStateで管理するためZustandから除外
  // アクションも不要
}

// Zustandストアの作成
// 進行状態はZustandで管理しないため、ストア自体を空に
const useTypingStoreBase = create<TypingState>(() => ({}));

// セレクターを使用して最適化されたストアをエクスポート
export const useTypingStore = createSelectors(useTypingStoreBase);
