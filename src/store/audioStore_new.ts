import { create } from 'zustand';
import { createSelectors } from '@/store/createSelectors';
import UnifiedAudioSystem from '@/utils/UnifiedAudioSystem';

/**
 * オーディオ再生・管理ストア（WebAudioのみ・シンプル版）
 * @module audioStore
 */

// オーディオ状態の型定義（WebAudioのみ）
interface AudioState {
  // サウンドの設定状態
  effectsEnabled: boolean;
  effectsVolume: number;
  
  // アクション - WebAudioのみのシンプルな操作
  playClickSound: () => void;
  playSuccessSound: () => void;
  playErrorSound: () => void;
  
  // 設定変更
  setEffectsEnabled: (enabled: boolean) => void;
  setEffectsVolume: (volume: number) => void;
}

// オーディオ状態の初期値（WebAudioのみ）
const initialAudioState = {
  effectsEnabled: true,
  effectsVolume: 0.5
};

// Zustandストアの作成（WebAudioのみ・シンプル版）
const useAudioStoreBase = create<AudioState>((set, get) => ({
  // 初期状態
  ...initialAudioState,
  
  // アクション - WebAudioのみ
  playClickSound: () => {
    if (get().effectsEnabled) {
      UnifiedAudioSystem.playClickSound();
    }
  },

  playSuccessSound: () => {
    if (get().effectsEnabled) {
      UnifiedAudioSystem.playSuccessSound();
    }
  },

  playErrorSound: () => {
    if (get().effectsEnabled) {
      UnifiedAudioSystem.playErrorSound();
    }
  },

  // 設定変更
  setEffectsEnabled: (enabled) => {
    set({ effectsEnabled: enabled });
  },

  setEffectsVolume: (volume) => {
    set({ effectsVolume: volume });
  }
}));

// セレクターを使用して最適化されたストアをエクスポート
export const useAudioStore = createSelectors(useAudioStoreBase);

// 個別のセレクター（必要に応じて）
export const useEffectsEnabled = () => useAudioStoreBase((state) => state.effectsEnabled);
