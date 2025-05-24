import React from 'react';
import BackgroundEffect from './BackgroundEffect';
import RetroBackground from '@/components/RetroBackground';

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
}) => {  // 画面タイプに応じた背景を表示
  const showRetroBackground = variant === 'game';
  const showDefaultBackground = variant !== 'game' && variant !== 'result' && variant !== 'ranking';

  return (
    <div 
      className={`min-h-screen w-full flex items-center justify-center relative bg-gray-900 text-white font-mono overflow-hidden ${className}`}
      style={{ border: 'none' }}
    >
      {/* 画面タイプに応じた背景 */}
      {showRetroBackground && <RetroBackground />}
      {showDefaultBackground && <BackgroundEffect />}
      
      {/* コンテンツエリア */}
      <div 
        className="relative z-10 w-full flex items-center justify-center py-10"
        style={{ border: 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScreenLayout;
