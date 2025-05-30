import { create } from 'zustand';
import type { PerWordScoreLog } from '@/types/score';
import type { GameScoreLog } from '@/types/score';

// --- 型定義を強化 ---
export interface ScoreLogEntry {
  time?: number;
  correct: number;
  miss: number;
  kpm?: number;
  accuracy?: number;
  // 必要に応じて拡張
}
export interface ResultScore {
  kpm: number;
  accuracy: number;
  correct: number;
  miss: number;
  // 必要に応じて拡張
}

// 画面の種類
export type SceneType = 'menu' | 'game' | 'ranking' | 'result';

// 画面ナビゲーション用のストア
interface SceneNavigationStore {
  // 現在の画面
  currentScene: SceneType;
  sceneHistory: SceneType[];

  // 画面遷移用メソッド
  navigateTo: (scene: SceneType) => void;
  goBack: () => void;

  // 特定画面への直接遷移
  goToMenu: () => void;
  goToGame: () => void;
  goToRanking: () => void;
  goToResult: () => void;

  // 直近スコア・ログの保持
  lastScoreLog: PerWordScoreLog[];
  lastResultScore: GameScoreLog['total'] | null;
  setLastScore: (scoreLog: PerWordScoreLog[], resultScore: GameScoreLog['total'] | null) => void;
}

// 画面ナビゲーションストアの実装
export const useSceneNavigationStore = create<SceneNavigationStore>((set, get) => ({
  currentScene: 'menu',
  sceneHistory: [],
  lastScoreLog: [],
  lastResultScore: null,

  navigateTo: (scene) => set((state) => ({
    sceneHistory: [...state.sceneHistory, state.currentScene],
    currentScene: scene,
  })),

  goBack: () => set((state) => {
    if (state.sceneHistory.length === 0) {
      return { currentScene: 'menu', sceneHistory: [] };
    }
    const prev = state.sceneHistory[state.sceneHistory.length - 1];
    return {
      currentScene: prev,
      sceneHistory: state.sceneHistory.slice(0, -1),
    };
  }),

  goToMenu: () => set((state) => ({
    sceneHistory: [...state.sceneHistory, state.currentScene],
    currentScene: 'menu',
  })),
  goToGame: () => set((state) => ({
    sceneHistory: [...state.sceneHistory, state.currentScene],
    currentScene: 'game',
  })),
  goToRanking: () => set((state) => ({
    sceneHistory: [...state.sceneHistory, state.currentScene],
    currentScene: 'ranking',
  })),
  goToResult: () => set((state) => ({
    sceneHistory: [...state.sceneHistory, state.currentScene],
    currentScene: 'result',
  })),

  setLastScore: (scoreLog, resultScore) => set({
    lastScoreLog: scoreLog,
    lastResultScore: resultScore,
  }),
}));
