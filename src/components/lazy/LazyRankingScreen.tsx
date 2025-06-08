import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// CleanRankingScreenの動的インポート
const CleanRankingScreen = dynamic(() => import('@/components/CleanRankingScreen'), {
  loading: () => (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.2rem',
      color: '#ccc'
    }}>
      ランキングロード中...
    </div>
  ),
  ssr: false
});

interface LazyRankingScreenProps {
  onGoMenu: () => void;
}

/**
 * ランキング画面の遅延読み込みラッパー
 * コード分割によりメインバンドルサイズを削減
 */
const LazyRankingScreen: React.FC<LazyRankingScreenProps> = ({ onGoMenu }) => {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem',
        color: '#ccc'
      }}>
        ランキングロード中...
      </div>
    }>
      <CleanRankingScreen onGoMenu={onGoMenu} />
    </Suspense>
  );
};

export default LazyRankingScreen;
