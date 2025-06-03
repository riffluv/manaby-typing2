import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ParticleEffect } from './ParticleEffect';
import { useTransition } from '@/hooks/useTransition';
import { TransitionManager, TransitionType } from '@/core/transition/TransitionManager';
import { AnimationSystem } from '@/core/animation/AnimationSystem';

interface RPGTransitionSystemProps {
  children: React.ReactNode;
  transitionType?: TransitionType;
  showParticles?: boolean;
  particleCount?: number;
  enableGlow?: boolean;
  delayMs?: number;
  className?: string;
  onEnterComplete?: () => void;
}

/**
 * RPGゲーム風の高級感あるトランジションシステム
 * PS5/Steamライクな演出を実現するためのコンポーネント
 */
export const RPGTransitionSystem: React.FC<RPGTransitionSystemProps> = ({
  children,
  transitionType = 'fade',
  showParticles = true,
  particleCount = 20,
  enableGlow = true,
  delayMs = 0,
  className = '',
  onEnterComplete: parentOnEnterComplete
}) => {
  // 初期表示状態（delayMsを考慮）
  const [show, setShow] = useState(delayMs === 0);
  const [particlesActive, setParticlesActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // トランジション入場完了時の処理
  const handleEnterComplete = useCallback(() => {
    // 高級感演出: 入場完了後に追加エフェクト
    if (containerRef.current && enableGlow) {
      try {
        AnimationSystem.animate(
          containerRef.current,
          'glow',
          { 
            duration: 600, 
            intensity: 3,
            fillMode: 'forwards'
          }
        );
      } catch (err) {
        console.error('アニメーション適用エラー:', err);
      }
    }
    
    // パーティクルエフェクト制御
    if (showParticles) {
      setParticlesActive(true);
      setTimeout(() => {
        setParticlesActive(false);
      }, 2000);
    }
    
    // 親コンポーネントのコールバックを実行
    if (typeof parentOnEnterComplete === 'function') {
      parentOnEnterComplete();
    }
  }, [containerRef, enableGlow, showParticles, parentOnEnterComplete]);
  
  // トランジション効果の適用
  const {
    isVisible,
    animationClass,
    nodeRef
  } = useTransition(
    show,
    transitionType,
    {
      duration: 800,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // イージング調整
      delay: delayMs
    }
  );

  // 遅延表示があれば適用
  useEffect(() => {
    if (delayMs > 0) {
      const timer = setTimeout(() => {
        setShow(true);
      }, delayMs);

      return () => clearTimeout(timer);
    }
  }, [delayMs]);
  
  // 表示状態が変わったときにトランジション完了イベントを発火
  useEffect(() => {
    if (show && isVisible) {
      // トランジションの完了を検知するタイマー
      // 実際のCSSトランジションの時間に合わせる
      const transitionTimer = setTimeout(() => {
        handleEnterComplete();
      }, 800); // トランジションのdurationに合わせる
      
      return () => clearTimeout(transitionTimer);
    }
  }, [show, isVisible, handleEnterComplete]);

  const containerClass = [
    'fullscreen-transition',
    className,
    enableGlow ? 'rpg-glow-container' : '',
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
        ref={containerRef} 
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
      
      {showParticles && (
        <ParticleEffect
          show={particlesActive}
          count={particleCount}
          duration={3000}
        />
      )}
    </div>
  );
};