import React, { Suspense } from 'react';
import MainMenu from '@/components/MainMenu';
import LazyGameScreen from '@/components/lazy/LazyGameScreen';
import LazyRankingScreen from '@/components/lazy/LazyRankingScreen';
import LazySettingsScreen from '@/components/lazy/LazySettingsScreen';
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
        <LazyRankingScreen onGoMenu={goToMenu} />
      )}
      {currentScene === 'settings' && (
        <LazySettingsScreen />
      )}
      {currentScene === 'game' && (
        <Suspense fallback={
          <div style={{ 
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.2rem',
            color: '#ccc'
          }}>
            ゲームロード中...
          </div>
        }>
          <LazyGameScreen onGoMenu={goToMenu} onGoRanking={goToRanking} />
        </Suspense>
      )}
    </div>
  );
});

AppRouter.displayName = 'AppRouter';

export default AppRouter;
