'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TempleProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  accentColor: string;
}

export default function Temple({ position, rotation, scale, isSelected, isHovered, onHover, onClick, accentColor }: TempleProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(() => {
    if (materialRef.current) {
      const targetEmissive = isSelected ? new THREE.Color(accentColor) : (isHovered ? new THREE.Color(accentColor).multiplyScalar(0.3) : new THREE.Color(0x000000));
      materialRef.current.emissive.lerp(targetEmissive, 0.1);
    }
  });

  const columns = [];
  for (let x = -2; x <= 2; x += 1) {
    for (let z = -3; z <= 3; z += 1.5) {
      if (x === -2 || x === 2 || z === -3 || z === 3) {
        // Skip one column to make it look like ruins
        if (x === 2 && z === 0) continue; 

        columns.push(
          <mesh key={`col-${x}-${z}`} position={[x, 1.5, z]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.25, 3, 16]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.9} metalness={0.1} />
          </mesh>
        );
      }
    }
  }

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
      {/* Base / Stylobate */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[5, 0.5, 7]} />
        <meshStandardMaterial ref={materialRef} color="#a3a3a3" roughness={1} emissiveIntensity={0.5} />
      </mesh>
      
      {/* Steps (Crepidoma) */}
      <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[5.5, 0.5, 7.5]} />
        <meshStandardMaterial color="#8e8e8e" roughness={1} />
      </mesh>
      <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[6, 0.5, 8]} />
        <meshStandardMaterial color="#7a7a7a" roughness={1} />
      </mesh>

      {/* Columns */}
      {columns}
      
      {/* Broken Column */}
      <mesh position={[2.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.25, 1.5, 16]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Architrave */}
      <mesh position={[0, 3.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.4, 7]} />
        <meshStandardMaterial color="#a3a3a3" roughness={0.9} />
      </mesh>

      {/* Frieze with some basic details (blocks) */}
      <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.3, 6.8]} />
        <meshStandardMaterial color="#8e8e8e" roughness={0.9} />
      </mesh>

      {/* Pediment (Triangular Roof) */}
      <mesh position={[0, 4.3, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[3.8, 1.8, 4]} />
        <meshStandardMaterial color="#8e8e8e" roughness={0.9} />
      </mesh>
      
      {/* Inner Cella (Sanctuary room) */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 3, 4]} />
        <meshStandardMaterial color="#525252" roughness={1} />
      </mesh>
    </group>
  );
}
