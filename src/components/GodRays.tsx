'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  godRayVertexShader,
  godRayFragmentShader,
} from '@/shaders/godRayShaders';

interface GodRaysProps {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
  color: [number, number, number];
  intensity?: number;
}

export default function GodRays({
  scrollProgress,
  mouseX,
  mouseY,
  color,
  intensity = 0.8,
}: GodRaysProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Smoothly interpolate color
  const targetColor = useRef(new THREE.Color(...color));
  const currentColor = useRef(new THREE.Color(...color));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uColor: { value: new THREE.Color(...color) },
      uIntensity: { value: intensity },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScrollProgress.value = scrollProgress;
      materialRef.current.uniforms.uMouse.value.set(mouseX, mouseY);

      // Smoothly transition color
      targetColor.current.setRGB(color[0], color[1], color[2]);
      currentColor.current.lerp(targetColor.current, 0.03);
      materialRef.current.uniforms.uColor.value.copy(currentColor.current);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]}>
      <planeGeometry args={[20, 14]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={godRayVertexShader}
        fragmentShader={godRayFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
