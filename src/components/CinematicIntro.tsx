'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';

export default function CinematicIntro() {
  const [phase, setPhase] = useState<'black' | 'bars' | 'title' | 'subtitle' | 'interaction' | 'ready'>('black');
  const [hasEntered, setHasEntered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useMousePosition();

  // Calculate parallax offsets based on mouse position
  const parallaxX = mousePos.x * 20; // max 20px shift
  const parallaxY = mousePos.y * 20;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('bars'), 500));
    timers.push(setTimeout(() => setPhase('title'), 1500));
    timers.push(setTimeout(() => setPhase('subtitle'), 3000));
    timers.push(setTimeout(() => setPhase('interaction'), 4500));
    
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnter = () => {
    setHasEntered(true);
    setPhase('ready');
  };

  const isGone = phase === 'ready';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-1000"
      style={{
        opacity: isGone ? 0 : 1,
        pointerEvents: isGone ? 'none' : 'auto',
        background: '#030303',
      }}
    >
      {/* Background Interactive Particles (CSS based for intro) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-1000"
        style={{
          opacity: phase !== 'black' ? 0.3 : 0,
          transform: `translate(${parallaxX * -0.5}px, ${parallaxY * -0.5}px)`,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-500 animate-pulse"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: (Math.random() * 3 + 2) + 's',
              animationDelay: (Math.random() * 2) + 's',
            }}
          />
        ))}
      </div>

      {/* Cinematic letterbox bars */}
      <div
        className="absolute top-0 left-0 right-0 bg-black z-10 transition-all duration-1000"
        style={{
          height: phase === 'black' ? '50%' : phase === 'bars' ? '12%' : '8%',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 bg-black z-10 transition-all duration-1000"
        style={{
          height: phase === 'black' ? '50%' : phase === 'bars' ? '12%' : '8%',
        }}
      />

      {/* Greek border ornament */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        style={{
          transform: `translate(${parallaxX * 0.2}px, ${parallaxY * 0.2}px)`,
        }}
      >
        <div
          className="w-[80vw] max-w-2xl aspect-[2/1] border transition-all duration-1000"
          style={{
            borderColor:
              phase === 'black' ? 'transparent' : 'rgba(245,158,11,0.15)',
            borderWidth: '1px',
            opacity: ['title', 'subtitle', 'interaction'].includes(phase) ? 1 : 0,
          }}
        >
          {/* Corner ornaments */}
          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
            (pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-6 h-6 transition-opacity duration-500`}
                style={{
                  opacity: ['title', 'subtitle', 'interaction'].includes(phase) ? 0.4 : 0,
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path
                    d={
                      pos.includes('top') && pos.includes('left')
                        ? 'M0 24V0H24'
                        : pos.includes('top') && pos.includes('right')
                        ? 'M24 24V0H0'
                        : pos.includes('bottom') && pos.includes('left')
                        ? 'M0 0V24H24'
                        : 'M24 0V24H0'
                    }
                    stroke="rgba(245,158,11,0.3)"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            )
          )}
        </div>
      </div>

      {/* Title with Parallax */}
      <div 
        className="relative z-30 text-center"
        style={{
          transform: `translate(${parallaxX}px, ${parallaxY}px)`,
        }}
      >
        <p
          className="text-xs tracking-[0.6em] uppercase text-amber-500/50 font-sans mb-4 transition-all duration-700"
          style={{
            opacity: ['title', 'subtitle', 'interaction'].includes(phase) ? 1 : 0,
            transform: ['title', 'subtitle', 'interaction'].includes(phase)
                ? 'translateY(0)'
                : 'translateY(20px)',
          }}
        >
          Homer&apos;s Epic
        </p>

        <h1
          className="text-7xl md:text-9xl font-light tracking-[0.2em] transition-all duration-1000"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            background: 'linear-gradient(135deg, #fff 0%, #f59e0b 50%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            opacity: ['title', 'subtitle', 'interaction'].includes(phase) ? 1 : 0,
            transform: ['title', 'subtitle', 'interaction'].includes(phase)
                ? 'translateY(0) scale(1)'
                : 'translateY(30px) scale(0.95)',
            textShadow: 'none',
          }}
        >
          ODYSSEY
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 text-sm md:text-base tracking-[0.3em] uppercase text-gray-400/70 font-sans transition-all duration-700"
          style={{
            opacity: ['subtitle', 'interaction'].includes(phase) ? 1 : 0,
            transform: ['subtitle', 'interaction'].includes(phase) ? 'translateY(0)' : 'translateY(15px)',
          }}
        >
          An Interactive Journey Through Myth
        </p>
      </div>

      {/* Interaction Prompt (Button) */}
      <div
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-6 transition-all duration-700"
        style={{
          opacity: phase === 'interaction' ? 1 : 0,
          transform: phase === 'interaction' ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: phase === 'interaction' ? 'auto' : 'none',
        }}
      >
        <button 
          onClick={handleEnter}
          className="group relative px-8 py-3 overflow-hidden rounded-sm bg-transparent border border-amber-500/30 hover:border-amber-500/80 transition-colors duration-500"
        >
          <div className="absolute inset-0 bg-amber-500/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          <span className="relative text-xs tracking-[0.4em] uppercase text-amber-500/80 group-hover:text-amber-400 transition-colors duration-300">
            Enter The Myth
          </span>
        </button>
        <div className="w-[1px] h-8 bg-gradient-to-b from-amber-500/50 to-transparent animate-pulse" />
      </div>
    </div>
  );
}
