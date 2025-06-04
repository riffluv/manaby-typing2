import React from 'react';
import styles from '@/styles/components/ScreenLayout.module.css';

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
  // 背景コンポーネントは使用しない
  const backgroundComponents = {
    default: null,
    game: null,
    result: null,
    ranking: null
  };  return (
    <div 
      className={`screen-layout ${className} ${styles['screenLayout--noBorder']}`}
    >
      {/* 画面タイプに応じた背景 */}
      {backgroundComponents[variant]}
      
      {/* コンテンツエリア */}
      <div className="content-area">
        {children}
      </div>
    </div>
  );
};

export default ScreenLayout;
