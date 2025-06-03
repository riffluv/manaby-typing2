import React, { useEffect, useState } from 'react';

export type TransitionType = 'fade' | 'slide' | 'none';

interface SceneTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  show?: boolean;
  onEnterComplete?: () => void;
  onExitComplete?: () => void;
  className?: string;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  type = 'fade',
  duration = 800,
  show = true,
  onEnterComplete,
  onExitComplete,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // 入場アニメーション開始
      requestAnimationFrame(() => {
        setAnimationClass(
          type === 'slide' ? 'rpg-slide-enter' : 'rpg-transition-enter'
        );
      });

      // 入場アニメーション完了
      const enterTimer = setTimeout(() => {
        onEnterComplete?.();
      }, duration);

      return () => clearTimeout(enterTimer);
    } else {
      // 退場アニメーション開始
      setAnimationClass(
        type === 'slide' ? 'rpg-slide-exit' : 'rpg-transition-exit'
      );

      // 退場アニメーション完了
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        onExitComplete?.();
      }, duration * 0.75); // 退場は少し速く

      return () => clearTimeout(exitTimer);
    }
  }, [show, type, duration, onEnterComplete, onExitComplete]);

  if (!isVisible) return null;

  return (
    <div className={`${animationClass} ${className}`}>
      {children}
    </div>
  );
};