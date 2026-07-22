'use client';

import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Low-poly Trireme Ship
function Trireme() {
  const group = useRef<THREE.Group>(null);
  
  // High-frequency dark wet wood texture
  const woodTexture = React.useMemo(() => {
    if (typeof window === 'undefined') return new THREE.Texture();
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#2a1a10'; // Very dark, wet wood
    ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = '#1c1005';
      ctx.fillRect(0, i * 20.48, 1024, 2);
      for (let j = 0; j < 1000; j++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)';
        ctx.fillRect(Math.random() * 1024, i * 20.48 + Math.random() * 20, Math.random() * 30 + 5, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 16;
    return tex;
  }, []);

  useFrame((state) => {
    if (group.current) {
      // Violent rocking in the waves
      const t = state.clock.elapsedTime;
      group.current.rotation.x = Math.sin(t * 2) * 0.1 - 0.05;
      group.current.rotation.z = Math.cos(t * 1.5) * 0.15;
      group.current.position.y = Math.sin(t * 2 + 1) * 0.3;
    }
  });

  const { viewport } = useThree();
  const scale = Math.min(1, viewport.width / 12);

  return (
    <group ref={group} position={[0, 0, 0]} scale={scale}>
      <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]} castShadow scale={[1, 0.5, 2.5]}>
        <sphereGeometry args={[2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial map={woodTexture} color="#2a1a10" roughness={0.4} bumpMap={woodTexture} bumpScale={0.05} metalness={0.1} />
      </mesh>
      
      {/* Front Ram (Bronze) */}
      <mesh position={[0, -0.2, 4.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.3, 2, 8]} />
        <meshPhysicalMaterial color="#8c5a2b" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* Deck */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[3.8, 9.8]} />
        <meshPhysicalMaterial map={woodTexture} color="#3a2518" roughness={0.8} />
      </mesh>

      {/* Mast */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 6]} />
        <meshPhysicalMaterial map={woodTexture} color="#2a1a10" roughness={0.9} />
      </mesh>
      
      {/* Yardarm */}
      <mesh position={[0, 5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 6]} />
        <meshPhysicalMaterial map={woodTexture} color="#2a1a10" roughness={0.9} />
      </mesh>

      {/* Torn Sail */}
      <mesh position={[0, 3, 0.1]} castShadow receiveShadow>
        <planeGeometry args={[5.8, 4, 16, 16]} />
        <meshPhysicalMaterial color="#c0b5a2" roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      
      {/* Rigging Ropes */}
      <mesh position={[0, 2.5, -2]} rotation={[Math.PI / 4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 6]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0, 2.5, 2]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 6]} />
        <meshBasicMaterial color="#111" />
      </mesh>
    </group>
  );
}

// Procedural Stormy Waves
function StormyOcean() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => new THREE.PlaneGeometry(100, 100, 64, 64), []);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const positions = geometry.attributes.position;
    
    // Animate vertices for waves
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const wave1 = Math.sin(x * 0.2 + t) * 0.5;
      const wave2 = Math.cos(y * 0.2 + t * 1.2) * 0.5;
      const wave3 = Math.sin((x + y) * 0.1 + t * 0.8) * 1.5;
      positions.setZ(i, wave1 + wave2 + wave3);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <meshPhysicalMaterial color="#001a33" roughness={0.1} metalness={0.8} clearcoat={1.0} />
    </mesh>
  );
}

// Lighting flashes
function StormLightning() {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame(() => {
    if (!lightRef.current) return;
    // Random lightning flashes
    if (Math.random() > 0.98) {
      lightRef.current.intensity = 50 + Math.random() * 100;
    } else {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.1);
    }
  });

  return <pointLight ref={lightRef} position={[0, 20, -10]} color="#aaccff" distance={100} />;
}

function OceanCamera() {
  const scroll = useScroll();
  useFrame((state, delta) => {
    const t = scroll.offset;
    // Move the camera past the ship as the journey progresses
    const targetX = Math.sin(t * Math.PI) * 10;
    const targetZ = 15 - t * 30; // Move forward
    const targetY = 5 + Math.sin(state.clock.getElapsedTime()) * 0.5; // Bob with the waves
    
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 4, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 4, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 4, delta);
    state.camera.lookAt(0, 2, 0);
  });
  return null;
}

function HtmlOverlays() {
  const scroll = useScroll();
  const [opacity, setOpacity] = useState(1);
  const [stage, setStage] = useState(0);

  useFrame(() => {
    const t = scroll.offset;
    if (t < 0.3) {
      setStage(0);
      setOpacity(1 - (t / 0.3));
    } else if (t < 0.6) {
      setStage(1);
      setOpacity(Math.sin(((t - 0.3) / 0.3) * Math.PI));
    } else {
      setStage(2);
      setOpacity(Math.sin(((t - 0.6) / 0.4) * Math.PI));
    }
  });

  return (
    <Html center pointerEvents="none" style={{ opacity, transition: 'opacity 0.1s' }}>
      <div className="w-[80vw] max-w-xl text-center">
        <h2 className="text-4xl md:text-6xl text-cyan-500 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          {stage === 0 && "The Wrath of Poseidon"}
          {stage === 1 && "Monsters of the Deep"}
          {stage === 2 && "The Sirens' Song"}
        </h2>
        <p className="mt-4 text-sm md:text-lg text-cyan-100 tracking-widest leading-loose drop-shadow-md">
          {stage === 0 && "For blinding the Cyclops Polyphemus, Odysseus drew the ire of the Sea God. The oceans turned against him, throwing his fleet off course."}
          {stage === 1 && "He navigated the treacherous straits between Scylla, a six-headed monster, and Charybdis, a massive whirlpool that swallowed the sea."}
          {stage === 2 && "Tied to the mast of his ship, he alone heard the enchanting, deadly song of the Sirens, surviving only through sheer will."}
        </p>
      </div>
    </Html>
  );
}

export default function OceanLore() {
  return (
    <section className="snap-start shrink-0 relative w-full h-screen bg-[#000510] overflow-hidden">
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 5, 15], fov: 50 }}>
        <Suspense fallback={null}>
          <ScrollControls pages={3} damping={0.1}>
            <OceanCamera />
            <HtmlOverlays />
            
            {/* The Environment */}
            <fog attach="fog" args={['#000510', 10, 40]} />
            <color attach="background" args={['#000510']} />
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            
            {/* Lighting */}
            <ambientLight intensity={0.1} color="#002244" />
            <directionalLight position={[10, 20, 10]} intensity={0.5} color="#4488ff" castShadow />
            <StormLightning />
            
            <StormyOcean />
            <Trireme />
            
          </ScrollControls>
        </Suspense>
      </Canvas>
    </section>
  );
}
