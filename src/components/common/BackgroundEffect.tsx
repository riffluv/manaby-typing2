import React from 'react';

type BackgroundEffectProps = {
  variant?: 'default' | 'none';
  className?: string;
};

/**
 * 共通の背景エフェクトコンポーネント
 * 全画面共通で使用できる背景エフェクトを提供します
 */
const BackgroundEffect: React.FC<BackgroundEffectProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  if (variant === 'none') return null;

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ border: 'none' }} // ボーダーを明示的に無効化
    >
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(55,65,81,0.3)_0,rgba(17,24,39,0)_70%)]"></div>
      <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
    </div>
  );
};

export default BackgroundEffect;
