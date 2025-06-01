import { create } from 'zustand';
import { createSelectors } from '@/store/createSelectors';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';

/**
 * 純粋WebAudioシステム専用ストア（MP3完全削除版）
 * @module audioStore
 */

// オーディオ状態の型定義
interface AudioState {
  // サウンドの設定状態
  effectsEnabled: boolean;
  effectsVolume: number;
  
  // アクション（WebAudioのみ）
  playClickSound: () => void;
  playSuccessSound: (volume?: number) => void;
  playErrorSound: (volume?: number) => void;
  
  // 設定変更
  setEffectsEnabled: (enabled: boolean) => void;
  setEffectsVolume: (volume: number) => void;
  
  // システム管理
  initializeAudio: () => Promise<void>;
  resumeAudioContext: () => Promise<void>;
}

// オーディオ状態の初期値
const initialAudioState = {
  effectsEnabled: true,
  effectsVolume: 0.5
};

// Zustandストアの作成（WebAudio専用）
const useAudioStoreBase = create<AudioState>((set, get) => ({
  // 初期状態
  ...initialAudioState,
  
  // アクション（純粋WebAudio）
  playClickSound: () => {
    if (get().effectsEnabled) {
      OptimizedAudioSystem.playClickSound();
    }
  },

  playSuccessSound: (volume = 1.0) => {
    if (get().effectsEnabled) {
      OptimizedAudioSystem.playSuccessSound();
    }
  },

  playErrorSound: (volume = 1.0) => {
    if (get().effectsEnabled) {
      OptimizedAudioSystem.playErrorSound();
    }
  },

  // 設定変更
  setEffectsEnabled: (enabled) => {
    set({ effectsEnabled: enabled });
  },

  setEffectsVolume: (volume) => {
    set({ effectsVolume: volume });
  },

  // システム管理
  initializeAudio: async () => {
    OptimizedAudioSystem.init();
  },

  resumeAudioContext: async () => {
    await OptimizedAudioSystem.resumeAudioContext();
  },
}));

// セレクターを使用して最適化されたストアをエクスポート
export const useAudioStore = createSelectors(useAudioStoreBase);

// 個別のセレクター
export const useEffectsEnabled = () => useAudioStoreBase((state) => state.effectsEnabled);
export const useEffectsVolume = () => useAudioStoreBase((state) => state.effectsVolume);
