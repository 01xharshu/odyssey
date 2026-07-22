'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HouseProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  accentColor: string;
}

export default function House({ position, rotation, scale, isSelected, isHovered, onHover, onClick, accentColor }: HouseProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(() => {
    if (materialRef.current) {
      const targetEmissive = isSelected ? new THREE.Color(accentColor) : (isHovered ? new THREE.Color(accentColor).multiplyScalar(0.3) : new THREE.Color(0x000000));
      materialRef.current.emissive.lerp(targetEmissive, 0.1);
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(false); document.body.style.cursor = 'none'; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Plinth / Base */}
      <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[4, 0.5, 5]} />
        <meshStandardMaterial color="#d4d4d8" roughness={1.0} />
      </mesh>

      {/* Main walls */}
      <mesh position={[0, 1.5, -0.5]} receiveShadow castShadow>
        <boxGeometry args={[3.2, 2, 3]} />
        <meshStandardMaterial ref={materialRef} color="#e4e4e7" roughness={1.0} emissiveIntensity={0.5} />
      </mesh>

      {/* Roof Base */}
      <mesh position={[0, 2.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.5, 0.2, 4.5]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>

      {/* Sloped Roof (Terracotta) */}
      <mesh position={[0, 3.2, 0]} rotation={[0, 0, 0]} receiveShadow castShadow>
        <coneGeometry args={[2.5, 1.2, 4]} />
        <meshStandardMaterial color="#92400e" roughness={0.8} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1.1, 1.05]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 1.4, 0.1]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.9} />
      </mesh>
      
      {/* Front Porch (Stoa) Pillars */}
      <mesh position={[-1.2, 1.5, 1.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 2, 8]} />
        <meshStandardMaterial color="#d4d4d8" />
      </mesh>
      <mesh position={[1.2, 1.5, 1.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 2, 8]} />
        <meshStandardMaterial color="#d4d4d8" />
      </mesh>
    </group>
  );
}
