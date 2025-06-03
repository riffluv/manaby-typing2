import React, { useState, useEffect } from 'react';
import { SceneTransition, type TransitionType } from './SceneTransition';
import { ParticleEffect } from './ParticleEffect';

interface RPGTransitionSystemProps {
  children: React.ReactNode;
  transitionType?: TransitionType;
  showParticles?: boolean;
  particleCount?: number;
  enableGlow?: boolean;
  delayMs?: number;
  className?: string;
}

export const RPGTransitionSystem: React.FC<RPGTransitionSystemProps> = ({
  children,
  transitionType = 'fade',
  showParticles = true,
  particleCount = 20,
  enableGlow = true,
  delayMs = 0,
  className = ''
}) => {
  const [show, setShow] = useState(false);
  const [particlesActive, setParticlesActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
      if (showParticles) {
        setParticlesActive(true);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, showParticles]);

  const handleEnterComplete = () => {
    // 入場完了後、パーティクルを少し遅れて停止
    if (showParticles) {
      setTimeout(() => {
        setParticlesActive(false);
      }, 2000);
    }
  };

  const containerClass = [
    className,
    enableGlow ? 'ff16-glow' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <SceneTransition
        show={show}
        type={transitionType}
        onEnterComplete={handleEnterComplete}
        className={containerClass}
      >
        {children}
      </SceneTransition>
      
      {showParticles && (
        <ParticleEffect
          show={particlesActive}
          count={particleCount}
          duration={3000}
        />
      )}
    </>
  );
};