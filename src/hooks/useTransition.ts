/**
 * useTransition.ts
 * シンプルなトランジション管理のためのReactフック
 */

import { useState, useEffect, useRef } from 'react';
import { TransitionType, TransitionConfig } from '@/core/transition/TransitionManager';

// トランジションフックの戻り値型
interface UseTransitionReturn {
  isVisible: boolean;
  animationClass: string;
  nodeRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * useTransition - シンプルなトランジションフック
 */
export function useTransition(
  show: boolean,
  type: TransitionType = 'fade',
  config: Partial<TransitionConfig> = {}
): UseTransitionReturn {
  const [isVisible, setIsVisible] = useState(show);
  const [animationClass, setAnimationClass] = useState('');
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const duration = config.duration || 600;

  // showの変化を検出してトランジションを実行
  useEffect(() => {
    if (show) {
      // 表示トランジション
      setIsVisible(true);
      
      requestAnimationFrame(() => {
        setAnimationClass(
          type === 'slide' ? 'simple-slide-enter' : 'simple-fade-enter'
        );
      });
    } else {
      // 非表示トランジション
      setAnimationClass(
        type === 'slide' ? 'simple-slide-exit' : 'simple-fade-exit'
      );
      
      // アニメーション完了後に非表示
      setTimeout(() => {
        setIsVisible(false);
        setAnimationClass('');
      }, duration * 0.75);
    }
  }, [show, type, duration]);

  return {
    isVisible,
    animationClass,
    nodeRef
  };
}

export default useTransition;
