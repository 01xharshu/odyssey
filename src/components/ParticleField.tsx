'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  particleVertexShader,
  particleFragmentShader,
} from '@/shaders/particleShaders';

interface ParticleFieldProps {
  count?: number;
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
  activeIndex: number;
}

export default function ParticleField({
  count = 4000,
  scrollProgress,
  mouseX,
  mouseY,
  activeIndex,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, sizes, phases, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

      sizes[i] = Math.random() * 3 + 0.5;
      phases[i] = Math.random();
      speeds[i] = Math.random() * 0.5 + 0.5;
    }

    return { positions, sizes, phases, speeds };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uActiveIndex: { value: 0 },
      uClickTime: { value: -100.0 },
      uClickPos: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (materialRef.current) {
        // Convert screen coordinates to normalized device coordinates
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        materialRef.current.uniforms.uClickPos.value.set(x, y);
        materialRef.current.uniforms.uClickTime.value = materialRef.current.uniforms.uTime.value;
      }
    };
    
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScrollProgress.value = scrollProgress;
      materialRef.current.uniforms.uMouse.value.set(mouseX, mouseY);
      materialRef.current.uniforms.uActiveIndex.value = activeIndex;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          args={[phases, 1]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[speeds, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
