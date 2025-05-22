import { create } from 'zustand';
import { createSelectors } from '@/store/createSelectors';
import { TypingChar } from '@/utils/japaneseUtils';

// タイピング状態の型定義
interface TypingState {
  // 入力関連の状態
  userInput: string;
  currentKanaIndex: number;
  currentKanaDisplay: {
    acceptedText: string;
    remainingText: string;
    displayText: string;
  };
  
  // アクション
  setUserInput: (input: string) => void;
  setCurrentKanaIndex: (index: number) => void;
  setCurrentKanaDisplay: (display: { 
    acceptedText: string; 
    remainingText: string; 
    displayText: string; 
  }) => void;
  resetTypingState: () => void;
}

// タイピング状態の初期値
const initialTypingState = {
  userInput: '',
  currentKanaIndex: 0,
  currentKanaDisplay: {
    acceptedText: '',
    remainingText: '',
    displayText: ''
  }
};

// Zustandストアの作成
const useTypingStoreBase = create<TypingState>((set) => ({
  // 初期状態
  ...initialTypingState,
  
  // アクション
  setUserInput: (input) => set({ userInput: input }),
  setCurrentKanaIndex: (index) => set({ currentKanaIndex: index }),
  setCurrentKanaDisplay: (display) => set({ currentKanaDisplay: display }),
  resetTypingState: () => set({ 
    ...initialTypingState
  })
}));

// セレクターを使用して最適化されたストアをエクスポート
export const useTypingStore = createSelectors(useTypingStoreBase);

// より細かく分割したセレクターの例
export const useCurrentKanaIndex = () => useTypingStoreBase((state) => state.currentKanaIndex);
export const useUserInput = () => useTypingStoreBase((state) => state.userInput);
export const useCurrentKanaDisplay = () => useTypingStoreBase((state) => state.currentKanaDisplay);
