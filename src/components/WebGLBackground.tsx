'use client';

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useInView } from 'framer-motion';
import ParticleField from './ParticleField';
import GodRays from './GodRays';

interface WebGLBackgroundProps {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
  activeIndex: number;
  accentColor: [number, number, number];
}

export default function WebGLBackground({
  scrollProgress,
  mouseX,
  mouseY,
  activeIndex,
  accentColor,
}: WebGLBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "0px 0px 0px 0px" });

  return (
    <div ref={containerRef} className="absolute inset-0 z-[1] pointer-events-none">
      <Canvas
        frameloop={isInView ? 'always' : 'demand'}
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <GodRays
          scrollProgress={scrollProgress}
          mouseX={mouseX}
          mouseY={mouseY}
          color={accentColor}
          intensity={0.6}
        />
        <ParticleField
          count={3500}
          scrollProgress={scrollProgress}
          mouseX={mouseX}
          mouseY={mouseY}
          activeIndex={activeIndex}
        />
      </Canvas>
    </div>
  );
}
