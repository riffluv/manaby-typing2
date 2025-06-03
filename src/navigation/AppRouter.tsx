import React from 'react';
import { AnimatePresence } from 'framer-motion';
import MainMenu from '@/components/MainMenu';
import SimpleUnifiedTypingGame from '@/components/SimpleUnifiedTypingGame';
import CleanRankingScreen from '@/components/CleanRankingScreen';
import { useSceneNavigationStore, SceneType } from '@/store/sceneNavigationStore';
import ScreenLayout from '@/components/common/ScreenLayout';

/**
 * SPA画面遷移の中心ロジックを集約したAppRouter
 * - Zustandストアで状態管理
 * - シーンごとに最適なレイアウト/コンポーネントを切り替え
 * - 製品レベルの拡張性・テスト容易性を考慮
 */
const AppRouter: React.FC = () => {
  const { currentScene, goToMenu, goToGame, goToRanking } = useSceneNavigationStore();

  // シーンに基づいてレイアウトバリアントを選択
  const getLayoutVariant = (scene: SceneType): 'default' | 'game' | 'result' | 'ranking' => {
    switch (scene) {
      case 'game': return 'game';
      case 'result': return 'result';
      case 'ranking': return 'ranking';
      default: return 'default';
    }
  };

  return (
    <AnimatePresence mode="wait">
      {currentScene === 'menu' ? (
        <MainMenu onStart={goToGame} onRanking={goToRanking} onRetry={goToGame} key={currentScene} />
      ) : currentScene === 'ranking' ? (
        <CleanRankingScreen onGoMenu={goToMenu} key={currentScene} />
      ) : (
        <ScreenLayout 
          variant={getLayoutVariant(currentScene)}
          key={currentScene}
        >
          {currentScene === 'game' && <SimpleUnifiedTypingGame onGoMenu={goToMenu} onGoRanking={goToRanking} />}
          {/* GameResultScreenはTypingGame内で管理 */}
        </ScreenLayout>
      )}
    </AnimatePresence>
  );
};

export default AppRouter;
