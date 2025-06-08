'use client';

import React, { lazy, Suspense } from 'react';

// 重いゲームコンポーネントを動的インポート
const SimpleUnifiedTypingGame = lazy(() => import('@/components/SimpleUnifiedTypingGame'));

// ローディング表示コンポーネント
const GameLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-lg text-gray-600">ゲーム画面を読み込み中...</p>
    </div>
  </div>
);

interface LazyGameScreenProps {
  onGoMenu: () => void;
  onGoRanking: () => void;
}

// 遅延読み込み対応のゲーム画面
const LazyGameScreen: React.FC<LazyGameScreenProps> = ({ onGoMenu, onGoRanking }) => {
  return (
    <Suspense fallback={<GameLoadingFallback />}>
      <SimpleUnifiedTypingGame onGoMenu={onGoMenu} onGoRanking={onGoRanking} />
    </Suspense>
  );
};

export default LazyGameScreen;
