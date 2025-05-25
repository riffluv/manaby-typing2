import React from 'react';
import styles from '@/styles/BackgroundEffect.module.css';

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
      className={`${styles.backgroundEffect} ${className}`}
      style={{ border: 'none' }} // ボーダーを明示的に無効化
    >
      <div className={styles.radialGradient}></div>
      <div className={styles.horizontalLine}></div>
      <div className={styles.horizontalLine}></div>
    </div>
  );
};

export default BackgroundEffect;
