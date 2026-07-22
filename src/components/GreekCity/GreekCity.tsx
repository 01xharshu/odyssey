'use client';

import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import CityScene from './CityScene';
import WebGLScroll from './WebGLScroll';
import { cityLoreData } from '@/data/cityLore';

export default function GreekCity() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [gameTime, setGameTime] = useState<string>("06:00 AM");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedBuilding = cityLoreData.find(b => b.id === selectedId);

  const [isLocked, setIsLocked] = useState(false);

  // Implement the Point of No Return (Scroll Lock)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
            document.body.style.overflow = 'hidden';
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: 'smooth'
            });
            const mainBody = document.querySelector('main');
            if (mainBody) {
              const carousel = mainBody.querySelector('.relative.h-\\[400vh\\]');
              if (carousel) {
                (carousel as HTMLElement).style.display = 'none';
              }
            }
            setIsLocked(true);
            window.dispatchEvent(new Event('cityLocked'));
          }
        });
      },
      { threshold: 0.9 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const [displayedBuilding, setDisplayedBuilding] = useState(selectedBuilding);

  useEffect(() => {
    if (selectedBuilding) setDisplayedBuilding(selectedBuilding);
  }, [selectedBuilding]);

  return (
    <div ref={containerRef} className="snap-start shrink-0 relative w-full h-screen bg-[#1c1c1e] overflow-hidden">
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 2, 15], fov: 55 }}>
        <Suspense fallback={null}>
          <CityScene 
            selectedId={selectedId} 
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onClick={(id) => setSelectedId(id === selectedId ? null : id)} // Toggle selection
            onTimeUpdate={setGameTime}
          />
          {displayedBuilding && (
            <WebGLScroll 
              title={displayedBuilding.title}
              excerpt={displayedBuilding.excerpt}
              isOpen={!!selectedId}
              onClose={() => setSelectedId(null)}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-10">
        <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] text-amber-500/80 drop-shadow-lg" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
          The Ancient World
        </h2>
        <p className="mt-2 text-xs md:text-sm tracking-[0.4em] uppercase text-gray-400">
          {selectedId ? "Behold the godly glare" : "Hover and click to explore the ruins"}
        </p>
      </div>

      {/* Point of No Return Notice */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <p className="text-[9px] tracking-[0.2em] uppercase text-red-500/50">Point of no return reached</p>
      </div>

      {/* Sand Clock Time UI */}
      <div 
        className={`fixed top-6 left-6 md:top-12 md:left-12 z-50 flex flex-col items-center pointer-events-none drop-shadow-lg transition-opacity duration-1000 ${isLocked ? 'opacity-90' : 'opacity-0'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500 mb-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-[10px] md:text-xs tracking-[0.3em] font-mono text-amber-200">
          {gameTime}
        </div>
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] z-[5]" />
    </div>
  );
}
