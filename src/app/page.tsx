'use client';
import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import UnifiedTypingGame from '@/components/UnifiedTypingGame';
import MainMenu from '@/components/MainMenu';
import NewRankingScreen from '@/components/NewRankingScreen';
import { useSceneNavigationStore, SceneType } from '@/store/sceneNavigationStore';
import ScreenLayout from '@/components/common/ScreenLayout';

export default function Home() {
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
      <ScreenLayout 
        variant={getLayoutVariant(currentScene)}
        key={currentScene}
      >        {currentScene === 'menu' && <MainMenu onStart={goToGame} onRanking={goToRanking} onRetry={goToGame} />}
        {currentScene === 'game' && <UnifiedTypingGame onGoMenu={goToMenu} onGoRanking={goToRanking} />}
        {currentScene === 'ranking' && <NewRankingScreen onGoMenu={goToMenu} />}
        {/* GameResultScreenは直接使用せず、TypingGameコンポーネント内で管理します */}
      </ScreenLayout>
    </AnimatePresence>
  );
}
