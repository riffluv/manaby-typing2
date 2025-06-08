import React from 'react';
import MainMenu from '@/components/MainMenu';
import SimpleUnifiedTypingGame from '@/components/SimpleUnifiedTypingGame';
import CleanRankingScreen from '@/components/CleanRankingScreen';
import SettingsScreen from '@/components/SettingsScreen';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';

// Phase 1完了により、パフォーマンス比較ツールは削除済み

/**
 * シンプルなSPA画面遷移ルーター - React最適化版
 * - 安定したナビゲーション関数
 * - 不要な再レンダリングを防止
 */
const AppRouter: React.FC = React.memo(() => {
  const currentScene = useSceneNavigationStore((state) => state.currentScene);
  const goToMenu = useSceneNavigationStore((state) => state.goToMenu);
  const goToGame = useSceneNavigationStore((state) => state.goToGame);
  const goToRanking = useSceneNavigationStore((state) => state.goToRanking);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'radial-gradient(circle, #0a0f1b 0%, #000000 100%)'
    }}>
      {currentScene === 'menu' && (
        <MainMenu onStart={goToGame} onRanking={goToRanking} onRetry={goToGame} />
      )}
      {currentScene === 'ranking' && (
        <CleanRankingScreen onGoMenu={goToMenu} />
      )}
      {currentScene === 'settings' && (
        <SettingsScreen />
      )}
      {currentScene === 'game' && (
        <SimpleUnifiedTypingGame onGoMenu={goToMenu} onGoRanking={goToRanking} />
      )}
    </div>
  );
});

AppRouter.displayName = 'AppRouter';

export default AppRouter;
