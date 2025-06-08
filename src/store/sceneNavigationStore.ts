import { create } from 'zustand';
import { createSelectors } from '@/store/createSelectors';
import type { PerWordScoreLog } from '@/types/score';
import type { GameScoreLog } from '@/types/score';
import { TransitionManager } from '@/core/transition/TransitionManager';

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
export type SceneType = 'menu' | 'game' | 'ranking' | 'result' | 'settings';

// 画面ナビゲーション用のストア
interface SceneNavigationStore {
  currentScene: SceneType;
  previousScene: SceneType | null;
  sceneHistory: SceneType[];
  isTransitioning: boolean;
  navigateTo: (scene: SceneType) => void;
  goBack: () => void;  goToMenu: () => void;
  goToGame: () => void;
  goToRanking: () => void;
  goToResult: () => void;
  goToSettings: () => void;
  setTransitioning: (isTransitioning: boolean) => void;
  lastScoreLog: PerWordScoreLog[];
  lastResultScore: GameScoreLog['total'] | null;
  setLastScore: (scoreLog: PerWordScoreLog[], resultScore: GameScoreLog['total'] | null) => void;
}

// Zustandストアの作成
const useSceneNavigationStoreBase = create<SceneNavigationStore>((set, get) => ({
  currentScene: 'menu',
  previousScene: null,
  sceneHistory: [],
  isTransitioning: false,
  lastScoreLog: [],
  lastResultScore: null,
  navigateTo: (scene) => {
    const state = get();
    // 同一シーンへの遷移の場合は何もしない
    if (state.currentScene === scene) return;

    // 遷移中フラグを設定
    set({ isTransitioning: true });

    // トランジション用の最適な設定を取得
    const transitionConfig = TransitionManager.getSceneConfig(scene);

    // トランジション記録（開発モードのみ）
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Navigation] ${state.currentScene} -> ${scene}`, transitionConfig);
    }

    set({
      previousScene: state.currentScene,
      sceneHistory: [...state.sceneHistory, state.currentScene],
      currentScene: scene,
      isTransitioning: false
    });
  },

  goBack: () => set((state) => {
    if (state.sceneHistory.length === 0) {
      return { currentScene: 'menu', previousScene: state.currentScene, sceneHistory: [] };
    }
    const prev = state.sceneHistory[state.sceneHistory.length - 1];
    
    // 遷移中フラグを設定
    set({ isTransitioning: true });
    
    return {
      currentScene: prev,
      previousScene: state.currentScene,
      sceneHistory: state.sceneHistory.slice(0, -1),
    };
  }),  goToMenu: () => get().navigateTo('menu'),
  goToGame: () => get().navigateTo('game'),
  goToRanking: () => get().navigateTo('ranking'),
  goToResult: () => get().navigateTo('result'),
  goToSettings: () => get().navigateTo('settings'),
  
  setTransitioning: (isTransitioning) => set({ isTransitioning }),

  setLastScore: (scoreLog, resultScore) => set({
    lastScoreLog: scoreLog,
    lastResultScore: resultScore,
  }),
}));

// セレクターを使用して最適化されたストアをエクスポート
export const useSceneNavigationStore = createSelectors(useSceneNavigationStoreBase);
