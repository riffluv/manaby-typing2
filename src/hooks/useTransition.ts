/**
 * useTransition.ts
 * トランジション管理のためのReactフック
 * 
 * 画面遷移や要素のアニメーションを簡単に利用するための
 * 統一インターフェースを提供するカスタムフック
 */

import { useState, useEffect, useRef } from 'react';
import { TransitionManager, TransitionType, TransitionConfig } from '@/core/transition/TransitionManager';
import { TransitionEffects } from '@/core/transition/TransitionEffects';

// トランジションフックの戻り値型
interface UseTransitionReturn {
  isVisible: boolean;
  animationClass: string;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  onEnterComplete: () => void;
  onExitComplete: () => void;
}

/**
 * useTransition - トランジションを簡単に扱うためのフック
 * @param show 表示状態
 * @param type トランジションタイプ
 * @param config トランジション設定
 * @param dependencies 依存配列
 * @returns トランジション制御オブジェクト
 */
export function useTransition(
  show: boolean,
  type: TransitionType = 'fade',
  config: Partial<TransitionConfig> = {},
  dependencies: any[] = []
): UseTransitionReturn {
  const [isVisible, setIsVisible] = useState(show);
  const [animationClass, setAnimationClass] = useState('');
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // 前回のshowの値を保持
  const prevShowRef = useRef(show);
  
  // イベントコールバック
  const onEnterCompleteRef = useRef<() => void>(() => {});
  const onExitCompleteRef = useRef<() => void>(() => {});
  
  // トランジション設定
  const transitionConfig: TransitionConfig = {
    type: type,
    duration: config.duration || 800,
    easing: config.easing || 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    delay: config.delay || 0,
    direction: 'both'
  };

  // showの変化を検出して適切なトランジションを実行
  useEffect(() => {
    // showに変化がない場合は何もしない
    if (prevShowRef.current === show) return;
    
    prevShowRef.current = show;
    
    if (show) {
      // 表示トランジション
      setIsVisible(true);
      
      // トランジションを実行
      requestAnimationFrame(() => {
        if (!nodeRef.current) return;
        
        const enterConfig: TransitionConfig = {
          ...transitionConfig,
          direction: 'in'
        };
        
        // 入場時のアニメーションクラスを設定
        setAnimationClass(
          type === 'slide' ? 'rpg-slide-enter' : 
          type === 'zoom' ? 'rpg-zoom-enter' : 
          type === 'blur' ? 'rpg-blur-enter' : 
          type === 'pixelate' ? 'rpg-pixelate-enter' : 
          'rpg-transition-enter'
        );
        
        // 必要があればTransitionEffectsも使用
        if (nodeRef.current) {
          TransitionEffects.applyEffect(
            nodeRef.current, 
            type, 
            enterConfig, 
            () => {
              onEnterCompleteRef.current();
            }
          );
        }
      });
    } else {
      // 非表示トランジション
      if (!nodeRef.current) {
        setIsVisible(false);
        return;
      }
      
      const exitConfig: TransitionConfig = {
        ...transitionConfig,
        duration: transitionConfig.duration * 0.75, // 退場は少し速く
        direction: 'out'
      };
      
      // 退場時のアニメーションクラスを設定
      setAnimationClass(
        type === 'slide' ? 'rpg-slide-exit' : 
        type === 'zoom' ? 'rpg-zoom-exit' : 
        type === 'blur' ? 'rpg-blur-exit' : 
        type === 'pixelate' ? 'rpg-pixelate-exit' : 
        'rpg-transition-exit'
      );
      
      // TransitionEffectsを使用
      TransitionEffects.applyEffect(
        nodeRef.current, 
        type, 
        exitConfig, 
        () => {
          setIsVisible(false);
          onExitCompleteRef.current();
        }
      );
    }
    
  }, [show, type, ...dependencies]);

  // コールバック関数を更新するための公開メソッド
  const onEnterComplete = () => {
    // 公開用の関数（コンポーネントから呼ばれる）
  };
  
  const onExitComplete = () => {
    // 公開用の関数（コンポーネントから呼ばれる）
  };

  return {
    isVisible,
    animationClass,
    nodeRef,
    onEnterComplete,
    onExitComplete
  };
}

export default useTransition;
