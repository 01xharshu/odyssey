'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useInView, useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import * as THREE from 'three';
import CityScene from './CityScene';
import WebGLScroll from './WebGLScroll';
import { cityLoreData } from '@/data/cityLore';

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = size.width < 768 ? 75 : 55;
      camera.updateProjectionMatrix();
    }
  }, [size.width, camera]);
  return null;
}

export default function GreekCity({ progress }: { progress: MotionValue<number> }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [gameTime, setGameTime] = useState<string>("06:00 AM");
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "0px 0px 0px 0px" });

  const selectedBuilding = cityLoreData.find(b => b.id === selectedId);

  // Time progression based on local progress
  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      // Maps 0-1 to 06:00 AM to 06:00 PM (12 hours)
      const hours = 6 + Math.floor(v * 12);
      const mins = Math.floor((v * 12 * 60) % 60);
      
      const ampm = hours >= 12 && hours < 24 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours;
      
      const hStr = displayHours.toString().padStart(2, '0');
      const mStr = mins.toString().padStart(2, '0');
      
      setGameTime(`${hStr}:${mStr} ${ampm}`);
    });
    return unsub;
  }, [progress]);

  const [displayedBuilding, setDisplayedBuilding] = useState(selectedBuilding);

  useEffect(() => {
    if (selectedBuilding) setDisplayedBuilding(selectedBuilding);
  }, [selectedBuilding]);

  const opacity = useTransform(progress, [0, 0.1, 1], [0, 1, 1]);

  return (
    <motion.section ref={containerRef} className="relative w-full h-full bg-transparent" style={{ opacity }}>
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 1.5]} camera={{ position: [0, 20, 80] }}>
          <ResponsiveCamera />
          <Suspense fallback={null}>
            {displayedBuilding && (
              <WebGLScroll 
                title={displayedBuilding.title}
                excerpt={displayedBuilding.excerpt}
                isOpen={!!selectedId}
                onClose={() => setSelectedId(null)}
              />
            )}
            <CityScene 
              selectedId={selectedId} 
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onClick={(id) => setSelectedId(id === selectedId ? null : id)} // Toggle selection
              onTimeUpdate={setGameTime}
            />
            {/* The Environment */}
            <fog attach="fog" args={['#050505', 20, 150]} />
            <color attach="background" args={['#050505']} />
          </Suspense>
        </Canvas>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050505] via-transparent to-[#050505] z-10" />
        
        {/* Lore Panel */}
        <div className="absolute bottom-12 md:bottom-24 left-4 md:left-12 z-20 max-w-sm pointer-events-none transition-all duration-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: displayedBuilding ? 1 : 0, y: displayedBuilding ? 0 : 20 }}
            className="backdrop-blur-md bg-black/40 border border-amber-500/20 p-6 rounded-sm"
          >
            <h3 className="text-amber-500 font-serif text-xl md:text-2xl mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
              {displayedBuilding?.title || '---'}
            </h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {displayedBuilding?.excerpt || '---'}
            </p>
          </motion.div>
        </div>

        {/* Global UI */}
        <motion.div 
          className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none"
          style={{ opacity }}
        >
          <h2 className="text-3xl md:text-5xl text-gray-200 font-light tracking-[0.2em]" style={{ fontFamily: "'Cinzel', serif" }}>
            The Ancient World
          </h2>
          <p className="mt-2 text-xs md:text-sm tracking-[0.4em] uppercase text-gray-400">
            {selectedId ? "Behold the godly glare" : "Hover and click to explore the ruins"}
          </p>
        </motion.div>

        {/* Sand Clock Time UI */}
        <div 
          className={`absolute top-6 left-6 md:top-12 md:left-12 z-50 flex flex-col items-center pointer-events-none drop-shadow-lg transition-opacity duration-1000 opacity-90`}
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
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20"
          style={{ opacity }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-amber-500/40 mb-2">
            Scroll to Conclude
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-amber-500/40 to-transparent" />
        </motion.div>

      </div>
    </motion.section>
  );
}
