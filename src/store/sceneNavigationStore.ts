import { create } from 'zustand';

// 画面の種類
export type SceneType = 'menu' | 'game' | 'ranking' | 'result';

// 画面ナビゲーション用のストア
interface SceneNavigationStore {
  // 現在の画面
  currentScene: SceneType;
  
  // 画面遷移用メソッド
  navigateTo: (scene: SceneType) => void;
  
  // 特定画面への直接遷移
  goToMenu: () => void;
  goToGame: () => void;
  goToRanking: () => void;
  goToResult: () => void;
  
  // 直前の画面
  previousScene: SceneType | null;
  
  // 一つ前の画面に戻る
  goBack: () => void;
}

// 画面ナビゲーションストアの実装
export const useSceneNavigationStore = create<SceneNavigationStore>((set) => ({
  currentScene: 'menu',
  previousScene: null,
  
  navigateTo: (scene) => set((state) => ({ 
    currentScene: scene, 
    previousScene: state.currentScene 
  })),
  
  goToMenu: () => set((state) => ({ 
    currentScene: 'menu', 
    previousScene: state.currentScene 
  })),
  
  goToGame: () => set((state) => ({ 
    currentScene: 'game', 
    previousScene: state.currentScene 
  })),
  
  goToRanking: () => set((state) => ({ 
    currentScene: 'ranking', 
    previousScene: state.currentScene 
  })),
  
  goToResult: () => set((state) => ({ 
    currentScene: 'result', 
    previousScene: state.currentScene 
  })),
  
  goBack: () => set((state) => ({ 
    currentScene: state.previousScene || 'menu', 
    previousScene: null 
  }))
}));
