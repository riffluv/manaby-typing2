import { create } from 'zustand';
import { createSelectors } from '@/store/createSelectors';
import { 
  preloadAllSounds
} from '@/utils/soundPlayer';
import UnifiedAudioSystem from '@/utils/UnifiedAudioSystem';

/**
 * オーディオ再生・管理ストア
 * @module audioStore
 */

// オーディオ状態の型定義
interface AudioState {
  // サウンドの設定状態
  effectsEnabled: boolean;
  bgmEnabled: boolean;
  effectsVolume: number;
  bgmVolume: number;
  
  // アクション
  preloadSounds: () => void;
  playSound: (type: 'correct' | 'wrong', volume?: number) => void;
  playBGM: (type: 'game' | 'menu' | 'result', loop?: boolean, volume?: number) => void;
  stopBGM: () => void;
  pauseBGM: () => void;
  resumeBGM: () => void;
  
  // 設定変更
  setEffectsEnabled: (enabled: boolean) => void;
  setBGMEnabled: (enabled: boolean) => void;
  setEffectsVolume: (volume: number) => void;
  setBGMVolume: (volume: number) => void;
}

// オーディオ状態の初期値
const initialAudioState = {
  effectsEnabled: true,
  bgmEnabled: true,
  effectsVolume: 0.5,
  bgmVolume: 0.3
};

// Zustandストアの作成
const useAudioStoreBase = create<AudioState>((set, get) => ({
  // 初期状態
  ...initialAudioState,
  
  // アクション
  preloadSounds: preloadAllSounds,

  playSound: (type, volume = 1.0) => {
    if (get().effectsEnabled) {
      UnifiedAudioSystem.playSound(type, volume);
    }
  },

  playBGM: (type, loop = true, volume = 1.0) => {
    if (get().bgmEnabled) {
      UnifiedAudioSystem.playBGM(type, loop, volume);
    }
  },

  stopBGM: UnifiedAudioSystem.stopBGM,
  pauseBGM: UnifiedAudioSystem.pauseBGM,
  resumeBGM: UnifiedAudioSystem.resumeBGM,

  // 設定変更
  setEffectsEnabled: (enabled) => {
    set({ effectsEnabled: enabled });
    UnifiedAudioSystem.setEffectsEnabled(enabled);
  },

  setBGMEnabled: (enabled) => {
    set({ bgmEnabled: enabled });
    UnifiedAudioSystem.setBGMEnabled(enabled);
  },

  setEffectsVolume: (volume) => {
    set({ effectsVolume: volume });
    UnifiedAudioSystem.setEffectsVolume(volume);
  },

  setBGMVolume: (volume) => {
    set({ bgmVolume: volume });
    UnifiedAudioSystem.setBGMVolume(volume);
  }
}));

// セレクターを使用して最適化されたストアをエクスポート
export const useAudioStore = createSelectors(useAudioStoreBase);

// 個別のセレクター（必要に応じて）
export const useEffectsEnabled = () => useAudioStoreBase((state) => state.effectsEnabled);
export const useBGMEnabled = () => useAudioStoreBase((state) => state.bgmEnabled);
