import React, { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import MainMenu from '@/components/MainMenu';
import SimpleUnifiedTypingGame from '@/components/SimpleUnifiedTypingGame';
import CleanRankingScreen from '@/components/CleanRankingScreen';
import { useSceneNavigationStore, SceneType } from '@/store/sceneNavigationStore';
import ScreenLayout from '@/components/common/ScreenLayout';
import { TransitionManager } from '@/core/transition/TransitionManager';
import { RPGTransitionSystem } from '@/components/transitions/RPGTransitionSystem';

// シンプルなトランジション用スタイル
import '@/styles/simple-transitions.css';
import '@/styles/ranking-responsive.css';

/**
 * シンプルなSPA画面遷移ルーター
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

  // 遷移終了時のハンドラー
  const handleTransitionComplete = useCallback(() => {
    const { setTransitioning } = useSceneNavigationStore.getState();
    setTransitioning(false);
  }, []);

  // 現在のシーンの遷移設定を取得
  const sceneConfig = TransitionManager.getSceneConfig(currentScene);

  return (
    <AnimatePresence mode="wait">
      <RPGTransitionSystem
        key={currentScene}
        transitionType={sceneConfig.enter.type}
        delayMs={0}
        onEnterComplete={handleTransitionComplete}
        className={`scene-${currentScene}`}
      >
        {currentScene === 'menu' ? (
          <MainMenu onStart={goToGame} onRanking={goToRanking} onRetry={goToGame} />
        ) : currentScene === 'ranking' ? (
          <CleanRankingScreen onGoMenu={goToMenu} />
        ) : (
          <ScreenLayout 
            variant={getLayoutVariant(currentScene)}
          >
            {currentScene === 'game' && <SimpleUnifiedTypingGame onGoMenu={goToMenu} onGoRanking={goToRanking} />}
          </ScreenLayout>
        )}
      </RPGTransitionSystem>
    </AnimatePresence>
  );
};

export default AppRouter;
