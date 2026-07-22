'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FortProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  accentColor: string;
}

export default function Fort({ position, rotation, scale, isSelected, isHovered, onHover, onClick, accentColor }: FortProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null!);

  useFrame(() => {
    if (materialRef.current) {
      const targetEmissive = isSelected ? new THREE.Color(accentColor) : (isHovered ? new THREE.Color(accentColor).multiplyScalar(0.3) : new THREE.Color(0x000000));
      materialRef.current.emissive.lerp(targetEmissive, 0.1);
    }
  });

  const towers = [
    [-3, -3], [3, -3], [-3, 3], [3, 3]
  ].map(([x, z], i) => (
    <group key={`tower-${i}`} position={[x, 2.5, z]}>
      {/* Base Tower */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 5.5, 1.8]} />
        <meshPhysicalMaterial color="#8e8e8e" roughness={0.9} />
      </mesh>
      {/* Crenellations (Battlements) */}
      {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([cx, cz], ci) => (
        <mesh key={`cren-${ci}`} position={[cx, 3, cz]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshPhysicalMaterial color="#7a7a7a" roughness={1.0} />
        </mesh>
      ))}
    </group>
  ));

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
      {/* Main walls */}
      <mesh position={[0, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[6.5, 4, 6.5]} />
        <meshPhysicalMaterial ref={materialRef} color="#a3a3a3" roughness={1.0} emissiveIntensity={0.5} />
      </mesh>

      {/* Outer Step */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[8, 0.5, 8]} />
        <meshPhysicalMaterial color="#7a7a7a" roughness={1.0} />
      </mesh>

      {/* Towers */}
      {towers}

      {/* Gatehouse */}
      <mesh position={[0, 1.5, 3.5]} receiveShadow castShadow>
        <boxGeometry args={[2.5, 3, 1]} />
        <meshPhysicalMaterial color="#8e8e8e" roughness={1.0} />
      </mesh>

      {/* Gate Door */}
      <mesh position={[0, 1, 4.05]} receiveShadow castShadow>
        <boxGeometry args={[1.5, 2, 0.1]} />
        <meshPhysicalMaterial color="#3f3f46" roughness={0.9} metalness={0.2} />
      </mesh>
      
      {/* Courtyard Inner Cutout (visual hack via darker block inside) */}
      <mesh position={[0, 2.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[4, 3, 4]} />
        <meshPhysicalMaterial color="#525252" roughness={1.0} />
      </mesh>
    </group>
  );
}
