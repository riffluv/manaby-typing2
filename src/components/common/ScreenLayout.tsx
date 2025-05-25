import React from 'react';
import BackgroundEffect from './BackgroundEffect';
import RetroBackground from '@/components/RetroBackground';
import styles from '@/styles/ScreenLayout.module.css';

type ScreenLayoutProps = {
  children: React.ReactNode;
  variant?: 'default' | 'game' | 'result' | 'ranking';
  className?: string;
};

/**
 * 画面共通のレイアウトコンポーネント
 * すべての画面で共通となる構造とスタイルを提供します
 */
const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  // 画面タイプごとの背景コンポーネントをマッピング
  const backgroundComponents = {
    default: <BackgroundEffect />,
    game: <RetroBackground />,
    result: null,
    ranking: null
  };

  return (
    <div 
      className={`${styles.screenLayout} ${className}`}
      style={{ border: 'none' }}
    >
      {/* 画面タイプに応じた背景 */}
      {backgroundComponents[variant]}
      
      {/* コンテンツエリア */}
      <div className={styles.contentArea}>
        {children}
      </div>
    </div>
  );
};

export default ScreenLayout;
