import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// SettingsScreenの動的インポート
const SettingsScreen = dynamic(() => import('@/components/SettingsScreen'), {
  loading: () => (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.2rem',
      color: '#ccc'
    }}>
      設定ロード中...
    </div>
  ),
  ssr: false
});

/**
 * 設定画面の遅延読み込みラッパー
 * コード分割によりメインバンドルサイズを削減
 */
const LazySettingsScreen: React.FC = () => {
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
        設定ロード中...
      </div>
    }>
      <SettingsScreen />
    </Suspense>
  );
};

export default LazySettingsScreen;
