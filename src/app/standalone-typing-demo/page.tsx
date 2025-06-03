"use client";

import React from 'react';
import StandaloneTypingGame from '@/components/StandaloneTypingGame';

/**
 * StandaloneTypingGameのデモページ
 * - SPA遷移システムから完全に独立
 * - シンプルな統合例を提供
 */
const StandaloneTypingGameDemo: React.FC = () => {
  // ゲーム完了時のハンドラー
  const handleGameComplete = (finalScore: any, scoreLog: any[]) => {
    console.log('🎉 ゲーム完了!', { finalScore, scoreLog });
    alert(`ゲーム完了!\nKPM: ${Math.floor(finalScore.kpm)}\n精度: ${Math.floor(finalScore.accuracy * 100)}%`);
  };

  // メニューに戻る処理
  const handleGoMenu = () => {
    console.log('📱 メニューに戻る');
    alert('メニューに戻る処理が実行されました');
  };

  // ランキングに移動する処理
  const handleGoRanking = () => {
    console.log('🏆 ランキングに移動');
    alert('ランキング処理が実行されました');
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <StandaloneTypingGame
        questionCount={5}
        onGameComplete={handleGameComplete}
        onGoMenu={handleGoMenu}
        onGoRanking={handleGoRanking}
        autoStart={false}
      />
    </div>
  );
};

export default StandaloneTypingGameDemo;
