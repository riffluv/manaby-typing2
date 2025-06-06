import React from 'react';
import MainMenu from '@/components/MainMenu';
import SimpleUnifiedTypingGame from '@/components/SimpleUnifiedTypingGame';
import CleanRankingScreen from '@/components/CleanRankingScreen';
import SettingsScreen from '@/components/SettingsScreen';
import { useSceneNavigationStore } from '@/store/sceneNavigationStore';

// Phase 1完了により、パフォーマンス比較ツールは削除済み

/**
 * シンプルなSPA画面遷移ルーター
 */
const AppRouter: React.FC = () => {
  const { currentScene, goToMenu, goToGame, goToRanking } = useSceneNavigationStore();

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
};

export default AppRouter;
