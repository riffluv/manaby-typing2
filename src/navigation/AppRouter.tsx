import React, { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import MainMenu from '@/components/MainMenu';
import SimpleUnifiedTypingGame from '@/components/SimpleUnifiedTypingGame';
import CleanRankingScreen from '@/components/CleanRankingScreen';
import { useSceneNavigationStore, SceneType } from '@/store/sceneNavigationStore';
import ScreenLayout from '@/components/common/ScreenLayout';
import { TransitionManager, TransitionType } from '@/core/transition/TransitionManager';
import { RPGTransitionSystem } from '@/components/transitions/RPGTransitionSystem';

// トランジションレイアウト用スタイル
import '@/styles/transition-layout.css';
import '@/styles/ranking-responsive.css';

/**
 * SPA画面遷移の中心ロジックを集約したAppRouter
 * - Zustandストアで状態管理
 * - シーンごとに最適なレイアウト/コンポーネントを切り替え
 * - TransitionManagerによる高度な遷移効果を管理
 * - 製品レベルの拡張性・テスト容易性を考慮
 */
const AppRouter: React.FC = () => {
  const { currentScene, previousScene, goToMenu, goToGame, goToRanking } = useSceneNavigationStore();
  const prevSceneRef = useRef<SceneType | null>(null);

  // シーンに基づいてレイアウトバリアントを選択
  const getLayoutVariant = (scene: SceneType): 'default' | 'game' | 'result' | 'ranking' => {
    switch (scene) {
      case 'game': return 'game';
      case 'result': return 'result';
      case 'ranking': return 'ranking';
      default: return 'default';
    }
  };

  // シーンに応じたトランジション設定を取得
  const getTransitionType = (from: SceneType | null, to: SceneType): string => {
    const config = TransitionManager.getSceneConfig(to);
    return config.enter.type || 'fade';
  };

  // 画面遷移を記録
  useEffect(() => {
    if (prevSceneRef.current !== currentScene && prevSceneRef.current !== null) {
      // シーン間の遷移を記録（分析・デバッグ用）
      try {
        const transitionType = getTransitionType(prevSceneRef.current, currentScene);
        TransitionManager.recordTransition(
          prevSceneRef.current,
          currentScene,
          transitionType as TransitionType,
          800 // デフォルト遷移時間
        );
      } catch (error) {
        console.error('[AppRouter] 遷移記録に失敗:', error);
      }
    }
    prevSceneRef.current = currentScene;
  }, [currentScene]);

  // 現在のシーンの遷移設定を取得
  const sceneConfig = TransitionManager.getSceneConfig(currentScene);
  
  // 遷移終了時のハンドラー
  const handleTransitionComplete = useCallback(() => {
    // トランジション完了時のクリーンアップ
    try {
      const { setTransitioning } = useSceneNavigationStore.getState();
      setTransitioning(false);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[AppRouter] トランジション完了:', currentScene);
      }
    } catch (error) {
      console.error('[AppRouter] トランジションハンドラーエラー:', error);
    }
  }, [currentScene]);

  return (
    <AnimatePresence mode="wait">
      <RPGTransitionSystem
        key={currentScene}
        transitionType={sceneConfig.enter.type}
        showParticles={sceneConfig.particles}
        particleCount={sceneConfig.particleCount}
        enableGlow={true}
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
            {/* GameResultScreenはTypingGame内で管理 */}
          </ScreenLayout>
        )}
      </RPGTransitionSystem>
    </AnimatePresence>
  );
};

export default AppRouter;
