import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

interface ParticleEffectProps {
  count?: number;
  duration?: number;
  show?: boolean;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  count = 20,
  duration = 3000,
  show = true
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [count, duration, show]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="particle-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </div>
  );
};