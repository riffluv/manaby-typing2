import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // 音響設定
  bgmEnabled: boolean;
  bgmVolume: number;
  soundEffectsEnabled: boolean;
  soundEffectsVolume: number;
  hitSoundEnabled: boolean;
  hitSoundVolume: number;
  
  // 表示設定
  showKeyboard: boolean;
  showKanaDisplay: boolean;
  
  // アクション
  setBgmEnabled: (enabled: boolean) => void;
  setBgmVolume: (volume: number) => void;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  setSoundEffectsVolume: (volume: number) => void;
  setHitSoundEnabled: (enabled: boolean) => void;
  setHitSoundVolume: (volume: number) => void;
  setShowKeyboard: (show: boolean) => void;
  setShowKanaDisplay: (show: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  bgmEnabled: true,
  bgmVolume: 8,
  soundEffectsEnabled: true,
  soundEffectsVolume: 7,
  hitSoundEnabled: true,
  hitSoundVolume: 6,
  showKeyboard: true,
  showKanaDisplay: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
        setBgmEnabled: (enabled) => set({ bgmEnabled: enabled }),
      setBgmVolume: (volume) => set({ bgmVolume: volume }),
      setSoundEffectsEnabled: (enabled) => set({ soundEffectsEnabled: enabled }),
      setSoundEffectsVolume: (volume) => set({ soundEffectsVolume: volume }),
      setHitSoundEnabled: (enabled) => set({ hitSoundEnabled: enabled }),
      setHitSoundVolume: (volume) => set({ hitSoundVolume: volume }),
      setShowKeyboard: (show) => set({ showKeyboard: show }),
      setShowKanaDisplay: (show) => set({ showKanaDisplay: show }),
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'manaby-settings',
    }
  )
);
