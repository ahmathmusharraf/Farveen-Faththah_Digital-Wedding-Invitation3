import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  spin: number;
  opacity: number;
  type: 'petal' | 'sparkle' | 'rose';
}

export default function GlitterDust() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate static set of random particles to prevent infinite state updates
    const tempParticles: Particle[] = Array.from({ length: 24 }).map((_, i) => {
      const types: ('petal' | 'sparkle' | 'rose')[] = ['petal', 'sparkle', 'rose'];
      return {
        id: i,
        left: Math.random() * 100, // percentage
        size: Math.random() * 14 + 6, // px
        delay: Math.random() * 8, // seconds delay
        duration: Math.random() * 10 + 6, // seconds duration
        spin: Math.random() * 360,
        opacity: Math.random() * 0.6 + 0.3,
        type: types[i % 3]
      };
    });

    setParticles(tempParticles);
  }, []);

  return (
    <div id="glitter-particles-container" className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((p) => {
        const style = {
          left: `${p.left}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          animation: `drift ${p.duration}s linear infinite`,
          animationDelay: `${p.delay}s`,
          transform: `rotate(${p.spin}deg) translate3d(0, 0, 0)`,
          '--particle-opacity': p.opacity,
          top: '-20px',
          willChange: 'transform, opacity'
        } as React.CSSProperties;

        if (p.type === 'sparkle') {
          return (
            <div
              key={p.id}
              style={style}
              className="absolute pointer-events-none"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-300 drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill="currentColor" />
              </svg>
            </div>
          );
        } else if (p.type === 'rose') {
          return (
            <div
              key={p.id}
              style={style}
              className="absolute pointer-events-none rounded-full bg-amber-200/40 border border-amber-300/30 shadow-[0_2px_8px_rgba(217,119,6,0.1)] flex items-center justify-center text-[10px]"
            >
              🌸
            </div>
          );
        } else {
          return (
            <div
              key={p.id}
              style={style}
              className="absolute pointer-events-none w-3 h-2 bg-gradient-to-tr from-stone-100 to-amber-50 rounded-full opacity-60 border border-amber-200/20"
            />
          );
        }
      })}
    </div>
  );
}
