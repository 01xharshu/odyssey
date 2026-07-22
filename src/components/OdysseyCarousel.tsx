'use client';

import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { odysseyCharacters } from '@/data/odysseyCharacters';
import { useMousePosition } from '@/hooks/useMousePosition';
import TextPanel from './TextPanel';
import CharacterCard from './CharacterCard';

import { MotionValue } from 'framer-motion';

const WebGLBackground = lazy(() => import('./WebGLBackground'));

export default function OdysseyCarousel({ progress }: { progress: MotionValue<number> }) {
  const [rotation, setRotation] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();

  const numItems = odysseyCharacters.length;
  const stepAngle = (2 * Math.PI) / numItems;
  const radius = 220;

  const mod = (n: number, m: number) => ((n % m) + m) % m;

  useEffect(() => {
    const unsub = progress.on('change', (v) => {
      setScrollProgress(v);
      
      // Map 0-1 progress to full rotation (e.g., 2 full loops or just enough to see everyone)
      // Since we have 7 items, rotating by Math.PI * 2 * 1.5 feels good
      const newRotation = -(v * Math.PI * 2 * 1.5);
      setRotation(newRotation);

      const normalizedAngle = mod(-newRotation, 2 * Math.PI);
      const calculatedIndex = Math.round(normalizedAngle / stepAngle) % numItems;
      setActiveIndex(calculatedIndex);
    });
    return unsub;
  }, [progress, stepAngle, numItems]);

  const handleCardClick = (index: number) => {
    // Scroll hijacking is now disabled as it breaks the master timeline
  };

  const activeCharacter = odysseyCharacters[activeIndex];

  // Memoize card positions for performance
  const cardPositions = useMemo(() => {
    return odysseyCharacters.map((_, index) => {
      const angle = index * stepAngle;
      const initialOffset = Math.PI;
      const totalAngle = angle + rotation + initialOffset;

      const x = radius + radius * Math.cos(totalAngle);
      const y = radius + radius * Math.sin(totalAngle);

      const depthFactor = (1 - Math.cos(totalAngle)) / 2;
      const scale = 0.6 + depthFactor * 0.5;
      const opacity = 0.2 + depthFactor * 0.8;
      const zIndex = Math.round(depthFactor * 100);

      return { x, y, scale, opacity, zIndex, depthFactor };
    });
  }, [rotation, stepAngle]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-transparent text-white selection:bg-amber-500 selection:text-black z-10"
      style={{ fontFamily: "'Cinzel', serif" }}
    >
      {/* Container viewport */}
      <div className="absolute inset-0 h-full w-full overflow-hidden flex flex-col md:flex-row">
        {/* Dynamic backgrounds */}
        {odysseyCharacters.map((character, index) => (
          <div
            key={`bg-${character.id}`}
            className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out pointer-events-none"
            style={{
              opacity: index === activeIndex ? 1 : 0,
              zIndex: index === activeIndex ? 0 : -1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.background}
              alt=""
              className="object-cover w-full h-full"
              style={{
                opacity: 0.2,
                filter: 'saturate(0.6) brightness(0.5)',
                transform: `scale(1.1) translate(${mouse.x * -10}px, ${mouse.y * 10}px)`,
                transition: 'transform 0.5s ease-out',
              }}
              loading="lazy"
            />
          </div>
        ))}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1c1e]/95 via-[#1c1c1e]/60 to-[#1c1c1e]/40 z-[1] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-[#1c1c1e]/50 z-[1] pointer-events-none" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* WebGL Layer */}
        <Suspense fallback={null}>
          <WebGLBackground
            scrollProgress={scrollProgress}
            mouseX={mouse.x}
            mouseY={mouse.y}
            activeIndex={activeIndex}
            accentColor={activeCharacter.accentColor}
          />
        </Suspense>

        {/* Left Panel: Text */}
        <TextPanel character={activeCharacter} activeIndex={activeIndex} />

        {/* Right Panel: Carousel */}
        <div className="relative z-10 w-full md:w-[55%] h-1/2 md:h-full flex items-center justify-center">
          {/* Carousel container */}
          <div
            className="relative scale-[0.55] sm:scale-[0.7] md:scale-[0.85] lg:scale-100"
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
            }}
          >
            {odysseyCharacters.map((character, index) => {
              const pos = cardPositions[index];
              return (
                <CharacterCard
                  key={character.id}
                  character={character}
                  isActive={index === activeIndex}
                  x={pos.x}
                  y={pos.y}
                  scale={pos.scale}
                  opacity={pos.opacity}
                  zIndex={pos.zIndex}
                  depthFactor={pos.depthFactor}
                  onClick={() => handleCardClick(index)}
                />
              );
            })}
          </div>

          {/* Circular track indicator */}
          <div
            className="absolute pointer-events-none opacity-10"
            style={{
              width: `${radius * 2 + 40}px`,
              height: `${radius * 2 + 40}px`,
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '50%',
              transform: `scale(${0.55}) rotate(${rotation * (180 / Math.PI)}deg)`,
            }}
          />
        </div>

      </div>
    </div>
  );
}

