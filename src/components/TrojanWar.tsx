'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, ScrollControls, useScroll, Html } from '@react-three/drei';
import * as THREE from 'three';

function WoodenHorse() {
  const group = useRef<THREE.Group>(null);
  
  // Generate a hyper-realistic wood plank texture
  const woodTexture = React.useMemo(() => {
    if (typeof window === 'undefined') return new THREE.Texture();
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#3e2723'; // Dark wood base
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Draw planks
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = '#2d1c10';
      ctx.fillRect(0, i * 51.2, 1024, 2); // Horizontal plank lines
      ctx.fillStyle = '#4a3219';
      ctx.fillRect(0, i * 51.2 + 2, 1024, 49); // Plank body
      
      // Wood grain noise
      for (let j = 0; j < 500; j++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)';
        ctx.fillRect(Math.random() * 1024, i * 51.2 + Math.random() * 50, Math.random() * 50 + 10, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 16;
    return tex;
  }, []);
  
  // A stylized, highly-detailed constructed wooden horse
  return (
    <group ref={group} position={[0, -2, 0]} castShadow receiveShadow>
      {/* Body */}
      <mesh position={[0, 5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[2.5, 3, 6, 16]} />
        <meshPhysicalMaterial map={woodTexture} color="#5c4033" roughness={0.9} bumpMap={woodTexture} bumpScale={0.05} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 7.5, 3]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.8, 4, 12]} />
        <meshPhysicalMaterial map={woodTexture} color="#4a3219" roughness={0.9} bumpMap={woodTexture} bumpScale={0.05} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 9.5, 4]} rotation={[-Math.PI / 12, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 1.5, 3.5]} />
        <meshPhysicalMaterial map={woodTexture} color="#3e2723" roughness={0.9} bumpMap={woodTexture} bumpScale={0.05} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.4, 10.5, 3]} castShadow>
        <coneGeometry args={[0.2, 0.8, 4]} />
        <meshPhysicalMaterial color="#2d1c10" roughness={1} />
      </mesh>
      <mesh position={[0.4, 10.5, 3]} castShadow>
        <coneGeometry args={[0.2, 0.8, 4]} />
        <meshPhysicalMaterial color="#2d1c10" roughness={1} />
      </mesh>
      
      {/* Binding Ropes (Torus) */}
      <mesh position={[0, 5, 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[2.8, 0.1, 8, 24]} />
        <meshPhysicalMaterial color="#8b5a2b" roughness={1} />
      </mesh>
      <mesh position={[0, 5, -2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[2.6, 0.1, 8, 24]} />
        <meshPhysicalMaterial color="#8b5a2b" roughness={1} />
      </mesh>
      
      {/* Legs (Thick logs) */}
      <mesh position={[-1.5, 2, 2.5]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 4, 8]} />
        <meshPhysicalMaterial map={woodTexture} color="#4a3219" roughness={0.9} bumpMap={woodTexture} bumpScale={0.05} />
      </mesh>
      <mesh position={[1.5, 2, 2.5]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 4, 8]} />
        <meshPhysicalMaterial map={woodTexture} color="#4a3219" roughness={0.9} bumpMap={woodTexture} bumpScale={0.05} />
      </mesh>
      <mesh position={[-1.5, 2, -2.5]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 4, 8]} />
        <meshPhysicalMaterial map={woodTexture} color="#4a3219" roughness={0.9} bumpMap={woodTexture} bumpScale={0.05} />
      </mesh>
      <mesh position={[1.5, 2, -2.5]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 4, 8]} />
        <meshPhysicalMaterial map={woodTexture} color="#4a3219" roughness={0.9} bumpMap={woodTexture} bumpScale={0.05} />
      </mesh>

      {/* Wheels/Platform */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.5, 8]} />
        <meshPhysicalMaterial map={woodTexture} color="#2d1c10" roughness={0.9} bumpMap={woodTexture} bumpScale={0.05} />
      </mesh>
      <mesh position={[-2.5, -0.5, 3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.4]} />
        <meshPhysicalMaterial color="#1c1c1e" roughness={0.9} />
      </mesh>
      <mesh position={[2.5, -0.5, 3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.4]} />
        <meshPhysicalMaterial color="#1c1c1e" roughness={0.9} />
      </mesh>
      <mesh position={[-2.5, -0.5, -3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.4]} />
        <meshPhysicalMaterial color="#1c1c1e" roughness={0.9} />
      </mesh>
      <mesh position={[2.5, -0.5, -3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.4]} />
        <meshPhysicalMaterial color="#1c1c1e" roughness={0.9} />
      </mesh>
    </group>
  );
}

function SceneCamera() {
  const scroll = useScroll();
  useFrame((state) => {
    // scroll.offset goes from 0 to 1
    const t = scroll.offset;
    // Orbit around the horse as user scrolls
    state.camera.position.x = Math.sin(t * Math.PI * 1.5) * 15;
    state.camera.position.z = Math.cos(t * Math.PI * 1.5) * 15;
    state.camera.position.y = 2 + t * 4;
    state.camera.lookAt(0, 4, 0);
  });
  return null;
}

function HtmlOverlays() {
  const scroll = useScroll();
  const [opacity, setOpacity] = useState(1);
  const [stage, setStage] = useState(0);

  useFrame(() => {
    const t = scroll.offset;
    // Calculate which text to show based on scroll
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
        <h2 className="text-4xl md:text-6xl text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          {stage === 0 && "The Fall of Troy"}
          {stage === 1 && "A Cunning Deception"}
          {stage === 2 && "The City Burns"}
        </h2>
        <p className="mt-4 text-sm md:text-lg text-amber-200 tracking-widest leading-loose drop-shadow-md">
          {stage === 0 && "For ten years, the impenetrable walls of Troy withstood the Greek siege. Blood soaked the sands, heroes fell, but the city stood unyielding."}
          {stage === 1 && "Led by the cunning Odysseus, they offered a massive wooden horse as a false tribute to Athena. The Trojans, believing they had won, brought it within their walls."}
          {stage === 2 && "Under the cover of night, the Greeks emerged from the belly of the beast. Troy burned, ending the greatest war of the ancient world."}
        </p>
      </div>
    </Html>
  );
}

export default function TrojanWar() {
  return (
    <section className="snap-start shrink-0 relative w-full h-screen bg-[#0a0000] overflow-hidden">
      <Canvas shadows camera={{ position: [0, 2, 15], fov: 50 }}>
        <Suspense fallback={null}>
          <ScrollControls pages={3} damping={0.1}>
            <SceneCamera />
            <HtmlOverlays />
            
            {/* The Environment */}
            <fog attach="fog" args={['#2a0800', 5, 40]} />
            <color attach="background" args={['#1a0500']} />
            
            {/* Lighting (Fire and destruction) */}
            <ambientLight intensity={0.2} color="#ff3300" />
            <directionalLight position={[10, 10, -10]} intensity={1.5} color="#ffaa00" castShadow />
            <pointLight position={[0, 0, 5]} intensity={5} distance={20} color="#ff3300" />
            <pointLight position={[-5, 5, -5]} intensity={3} distance={20} color="#ff0000" />
            
            {/* Terrain */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshPhysicalMaterial color="#1a0a00" roughness={1} />
            </mesh>

            {/* The Horse */}
            <WoodenHorse />
            
            {/* Embers/Sparks */}
            <Sparkles count={500} scale={20} size={4} speed={0.4} opacity={0.5} color="#ffaa00" position={[0, 5, 0]} />
            
          </ScrollControls>
        </Suspense>
      </Canvas>
    </section>
  );
}
