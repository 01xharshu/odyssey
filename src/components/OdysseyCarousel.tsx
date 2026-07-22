'use client';

import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { odysseyCharacters } from '@/data/odysseyCharacters';
import { useMousePosition } from '@/hooks/useMousePosition';
import TextPanel from './TextPanel';
import CharacterCard from './CharacterCard';

const WebGLBackground = lazy(() => import('./WebGLBackground'));

export default function OdysseyCarousel() {
  const [rotation, setRotation] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);
  const mouse = useMousePosition();

  const numItems = odysseyCharacters.length;
  const stepAngle = (2 * Math.PI) / numItems;
  const radius = 220;

  const mod = (n: number, m: number) => ((n % m) + m) % m;

  useEffect(() => {
    const updateScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance =
        containerRef.current.offsetHeight - window.innerHeight;

      if (rect.top <= 0) {
        const scrolledPx = -rect.top;

        // Map scroll distance to rotation
        const scrollSensitivity = 1500;
        const newRotation =
          -(scrolledPx / scrollSensitivity) * (Math.PI * 2);

        setRotation(newRotation);

        // Scroll progress for WebGL
        const progress =
          scrollableDistance > 0
            ? Math.min(Math.max(scrolledPx / scrollableDistance, 0), 1)
            : 0;
        setScrollProgress(progress);

        // Calculate active index
        const normalizedAngle = mod(-newRotation, 2 * Math.PI);
        const calculatedIndex =
          Math.round(normalizedAngle / stepAngle) % numItems;
        setActiveIndex(calculatedIndex);
      } else {
        setRotation(0);
        setActiveIndex(0);
        setScrollProgress(0);
      }

      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [stepAngle, numItems]);

  const handleCardClick = (index: number) => {
    if (!containerRef.current) return;
    const containerTop =
      window.scrollY + containerRef.current.getBoundingClientRect().top;
    const scrollSensitivity = 1500;
    const targetScrollPx =
      index * (stepAngle / (Math.PI * 2)) * scrollSensitivity;

    window.scrollTo({
      top: containerTop + targetScrollPx,
      behavior: 'smooth',
    });
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
      className="relative h-[400vh] bg-[#1c1c1e] text-white selection:bg-amber-500 selection:text-black"
      style={{ fontFamily: "'Cinzel', serif" }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col md:flex-row">
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

        {/* Scroll indicator */}
        <div className="absolute bottom-[6vh] left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none">
          <span
            className="text-[9px] tracking-[0.3em] uppercase text-amber-500/30 font-sans mb-2 transition-opacity duration-500"
            style={{ opacity: scrollProgress < 0.1 ? 0.6 : 0 }}
          >
            Scroll to explore
          </span>
          <div
            className="w-[1px] h-6 bg-gradient-to-b from-amber-500/40 to-transparent transition-opacity duration-500"
            style={{ opacity: scrollProgress < 0.1 ? 1 : 0 }}
          />
        </div>

        {/* Progress indicator on the right edge */}
        <div className="absolute right-4 top-[10%] bottom-[10%] w-[2px] z-20 pointer-events-none">
          <div className="absolute inset-0 bg-white/5 rounded-full" />
          <div
            className="absolute top-0 left-0 w-full rounded-full transition-all duration-150"
            style={{
              height: `${scrollProgress * 100}%`,
              background: `linear-gradient(to bottom, ${activeCharacter.accentHex}, transparent)`,
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-150"
            style={{
              top: `${scrollProgress * 100}%`,
              background: activeCharacter.accentHex,
              boxShadow: `0 0 10px ${activeCharacter.accentHex}60`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
