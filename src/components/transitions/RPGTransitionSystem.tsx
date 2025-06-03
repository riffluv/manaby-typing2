import React, { useState, useEffect, useRef } from 'react';
import { useTransition } from '@/hooks/useTransition';
import { TransitionType } from '@/core/transition/TransitionManager';

interface SimpleTransitionSystemProps {
  children: React.ReactNode;
  transitionType?: TransitionType;
  delayMs?: number;
  className?: string;
  onEnterComplete?: () => void;
}

/**
 * シンプルなトランジションシステム
 * 基本的なfade/slide遷移のみをサポート
 */
export const RPGTransitionSystem: React.FC<SimpleTransitionSystemProps> = ({
  children,
  transitionType = 'fade',
  delayMs = 0,
  className = '',
  onEnterComplete
}) => {
  const [show, setShow] = useState(delayMs === 0);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // 遅延表示の処理
  useEffect(() => {
    if (delayMs > 0) {
      const timer = setTimeout(() => {
        setShow(true);
      }, delayMs);
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  // トランジション効果の適用
  const {
    isVisible,
    animationClass
  } = useTransition(
    show,
    transitionType,
    {
      duration: 600,
      easing: 'ease-in-out',
      delay: 0
    }
  );

  // トランジション完了時の処理
  useEffect(() => {
    if (show && isVisible) {
      const transitionTimer = setTimeout(() => {
        if (onEnterComplete) {
          onEnterComplete();
        }
      }, 600);
      
      return () => clearTimeout(transitionTimer);
    }
  }, [show, isVisible, onEnterComplete]);

  const containerClass = [
    'simple-transition-container',
    className,
    animationClass
  ].filter(Boolean).join(' ');

  if (!isVisible) return null;

  return (
    <div 
      ref={nodeRef} 
      className={containerClass} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto'
      }}
    >
      <div 
        className="transition-content" 
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {children}
      </div>
    </div>
  );
};
