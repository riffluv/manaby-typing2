/**
 * ユーザー設定ストア
 * 最適化機能のON/OFF制御を含む
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // 最適化関連設定
  enableOptimization: boolean;
  enablePerformanceMonitoring: boolean;
  enableDebugMode: boolean;
  
  // ゲーム設定
  questionCount: number;
  autoStart: boolean;
  
  // アクション
  setEnableOptimization: (enabled: boolean) => void;
  setEnablePerformanceMonitoring: (enabled: boolean) => void;
  setEnableDebugMode: (enabled: boolean) => void;
  setQuestionCount: (count: number) => void;
  setAutoStart: (autoStart: boolean) => void;
  
  // リセット
  resetToDefaults: () => void;
}

const defaultSettings = {
  enableOptimization: false, // デフォルトは従来版
  enablePerformanceMonitoring: true,
  enableDebugMode: false,
  questionCount: 8,
  autoStart: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setEnableOptimization: (enabled: boolean) => set({ enableOptimization: enabled }),
      setEnablePerformanceMonitoring: (enabled: boolean) => set({ enablePerformanceMonitoring: enabled }),
      setEnableDebugMode: (enabled: boolean) => set({ enableDebugMode: enabled }),
      setQuestionCount: (count: number) => set({ questionCount: Math.max(1, Math.min(20, count)) }),
      setAutoStart: (autoStart: boolean) => set({ autoStart }),
      
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'manaby-settings',
      version: 1,
    }
  )
);

// 便利なhooks
export const useOptimizationSettings = () => {
  const enableOptimization = useSettingsStore(state => state.enableOptimization);
  const enablePerformanceMonitoring = useSettingsStore(state => state.enablePerformanceMonitoring);
  const enableDebugMode = useSettingsStore(state => state.enableDebugMode);
  
  return { enableOptimization, enablePerformanceMonitoring, enableDebugMode };
};

export const useGameSettings = () => {
  const questionCount = useSettingsStore(state => state.questionCount);
  const autoStart = useSettingsStore(state => state.autoStart);
  
  return { questionCount, autoStart };
};
