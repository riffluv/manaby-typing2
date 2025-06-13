import { create } from 'zustand';
import { globalBGMPlayer, type BGMMode, type BGMStatus } from '@/utils/BGMPlayer';

interface BGMState {
  // 状態
  currentMode: BGMMode;
  isPlaying: boolean;
  volume: number;
  enabled: boolean;

  // アクション  switchMode: (mode: BGMMode) => Promise<void>;
  setVolume: (volume: number) => void;
  setEnabled: (enabled: boolean) => void;
  stop: () => Promise<void>;
  getStatus: () => { currentMode: BGMMode; isPlaying: boolean; volume: number; enabled: boolean };
}

const useBGMStoreBase = create<BGMState>((set, get) => ({
  // 初期状態
  currentMode: 'silent',
  isPlaying: false,
  volume: 0.5,
  enabled: true,

  // BGMモード切り替え
  switchMode: async (mode: BGMMode) => {
    const { enabled } = get();
    
    if (!enabled) {
      console.log('[BGMStore] BGM無効のため切り替えスキップ');
      set({ currentMode: mode });
      return;
    }    try {
      await globalBGMPlayer.switchMode(mode);
      const status: BGMStatus = globalBGMPlayer.getStatus();
        set({
        currentMode: mode,
        isPlaying: status.isPlaying ?? false
      });
      
      console.log(`[BGMStore] ✅ BGMモード切り替え完了: ${mode}`);
    } catch (error) {
      console.error('[BGMStore] BGMモード切り替えエラー:', error);
    }
  },
  // 音量設定
  setVolume: (volume: number) => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    globalBGMPlayer.setVolume(normalizedVolume); // 🔧 setGlobalVolume → setVolume に修正
    
    set({ volume: normalizedVolume });
    console.log(`[BGMStore] 🔊 BGM音量: ${(normalizedVolume * 100).toFixed(0)}%`);
  },

  // BGM有効/無効切り替え
  setEnabled: async (enabled: boolean) => {
    set({ enabled });
    
    if (!enabled) {
      await globalBGMPlayer.stop();
      set({ isPlaying: false });
      console.log('[BGMStore] 🔇 BGM無効化');
    } else {
      const { currentMode } = get();      if (currentMode !== 'silent') {        await globalBGMPlayer.switchMode(currentMode);
        const status: BGMStatus = globalBGMPlayer.getStatus();
        set({ isPlaying: status.isPlaying ?? false });
      }
      console.log('[BGMStore] 🔊 BGM有効化');
    }
  },

  // BGM停止
  stop: async () => {
    await globalBGMPlayer.stop();
    set({ 
      currentMode: 'silent',
      isPlaying: false 
    });
    console.log('[BGMStore] 🛑 BGM停止');
  },
  // 現在の状態取得
  getStatus: (): BGMState & BGMStatus => {
    const store = get();
    const playerStatus: BGMStatus = globalBGMPlayer.getStatus();
    
    return {
      ...store,
      ...playerStatus
    };
  }
}));

// BGMストア
export const useBGMStore = useBGMStoreBase;

export default useBGMStore;
