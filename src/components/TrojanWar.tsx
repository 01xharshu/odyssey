'use client';

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { useInView, MotionValue, useTransform, motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- Procedural Textures (Smooth, Low-Noise to prevent jitter) ---
function createStoneTexture() {
  if (typeof window === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  
  // Base smooth gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#2a2a2a');
  grad.addColorStop(0.5, '#333333');
  grad.addColorStop(1, '#222222');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft, large block patterns instead of high-frequency noise
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 4;
  for (let y = 0; y < 1024; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
    for (let x = 0; x < 1024; x += 128) {
      const offset = (y / 64) % 2 === 0 ? 0 : 64;
      ctx.beginPath();
      ctx.moveTo(x + offset, y);
      ctx.lineTo(x + offset, y + 64);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

function createWoodTexture() {
  if (typeof window === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  
  // Base smooth wood color
  ctx.fillStyle = '#2d1a0f'; // Rich dark mahogany
  ctx.fillRect(0, 0, 1024, 1024);
  
  // Smooth, sweeping wood grains (low frequency)
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    const yStart = i * 25.6;
    ctx.moveTo(0, yStart);
    ctx.bezierCurveTo(340, yStart + 20, 680, yStart - 20, 1024, yStart);
    ctx.lineTo(1024, yStart + 12);
    ctx.bezierCurveTo(680, yStart - 8, 340, yStart + 32, 0, yStart + 12);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

// --- Trojan Walls (Smoothed out geometry) ---
function TrojanWalls({ scrollYProgress, stoneTexture }: { scrollYProgress: MotionValue<number>, stoneTexture: THREE.Texture }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const t = scrollYProgress.get();
      groupRef.current.visible = t < 0.85;
    }
  });

  return (
    <group ref={groupRef} position={[0, -2.5, 12]}>
      {/* Outer curved wall - High segment count for perfectly smooth curve */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[28, 28, 18, 64, 1, false, -Math.PI / 3, Math.PI * 2 / 3]} />
        <meshPhysicalMaterial map={stoneTexture} color="#4a4a4a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Inner curved wall */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[26, 26, 18, 64, 1, false, -Math.PI / 3, Math.PI * 2 / 3]} />
        <meshPhysicalMaterial map={stoneTexture} color="#4a4a4a" roughness={0.8} metalness={0.1} side={THREE.BackSide} />
      </mesh>

      {/* Top of the wall */}
      <mesh position={[0, 9, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <ringGeometry args={[26, 28, 64, 1, -Math.PI / 3, Math.PI * 2 / 3]} />
        <meshPhysicalMaterial map={stoneTexture} color="#4a4a4a" roughness={0.8} />
      </mesh>

      {/* Towers (Smoother cylinders) */}
      <mesh receiveShadow castShadow position={[-24.2, 3, 14]}>
        <cylinderGeometry args={[3, 3.5, 24, 32]} />
        <meshPhysicalMaterial map={stoneTexture} color="#4a4a4a" roughness={0.8} />
      </mesh>
      <mesh receiveShadow castShadow position={[24.2, 3, 14]}>
        <cylinderGeometry args={[3, 3.5, 24, 32]} />
        <meshPhysicalMaterial map={stoneTexture} color="#4a4a4a" roughness={0.8} />
      </mesh>

      {/* Gate (Arch instead of box) */}
      <mesh position={[0, 0, 28]} receiveShadow>
        <boxGeometry args={[6, 12, 4]} />
        <meshPhysicalMaterial color="#080808" roughness={0.9} />
      </mesh>
      <mesh position={[0, 6, 28]} receiveShadow>
        <cylinderGeometry args={[3, 3, 4, 32, 1, false, 0, Math.PI]} />
        <meshPhysicalMaterial color="#222" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// --- Smooth Trojan Horse (Carved Sculpture Aesthetic) ---
function WoodenHorse({ woodTexture }: { woodTexture: THREE.Texture }) {
  const horseRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (horseRef.current) {
      const t = state.clock.elapsedTime;
      horseRef.current.rotation.z = Math.sin(t * 0.5) * 0.015;
    }
  });

  // Reusable highly polished wood material
  const polishedWood = (
    <meshPhysicalMaterial 
      map={woodTexture} 
      color="#3a1f0f" 
      roughness={0.3} 
      clearcoat={0.3} 
      clearcoatRoughness={0.4} 
      metalness={0.1} 
    />
  );

  return (
    <group ref={horseRef} position={[0, 1.5, 35]} scale={1.2}>
      {/* Body - Smooth sculpted belly */}
      <mesh position={[0, 5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <sphereGeometry args={[3.2, 64, 32]} />
        <meshPhysicalMaterial 
          map={woodTexture} 
          color="#3a1f0f" 
          roughness={0.3} 
          clearcoat={0.3} 
          clearcoatRoughness={0.4} 
          metalness={0.1} 
        />
        {/* Flatten the sides of the sphere to make it horse-shaped */}
        <group scale={[1, 0.6, 1]} /> 
      </mesh>

      {/* Neck - Sweeping curve */}
      <mesh position={[0, 7.5, 2.5]} rotation={[Math.PI / 6, 0, 0]} castShadow scale={[1, 1, 1.2]}>
        <sphereGeometry args={[1.8, 32, 32]} />
        {polishedWood}
      </mesh>
      <mesh position={[0, 9, 3.5]} rotation={[Math.PI / 8, 0, 0]} castShadow scale={[0.8, 1, 0.9]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        {polishedWood}
      </mesh>

      {/* Head - Elegant curve */}
      <mesh position={[0, 10.5, 4.5]} rotation={[-Math.PI / 8, 0, 0]} castShadow scale={[0.7, 0.8, 1.5]}>
        <sphereGeometry args={[1.6, 32, 32]} />
        {polishedWood}
      </mesh>
      {/* Snout */}
      <mesh position={[0, 10.2, 6]} rotation={[-Math.PI / 6, 0, 0]} castShadow scale={[0.6, 0.6, 1.2]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        {polishedWood}
      </mesh>

      {/* Ears - Smooth cones */}
      <mesh position={[-0.6, 11.5, 3.8]} rotation={[0, 0, 0.2]} castShadow>
        <coneGeometry args={[0.3, 1.2, 32]} />
        <meshPhysicalMaterial color="#1a0d06" roughness={0.6} />
      </mesh>
      <mesh position={[0.6, 11.5, 3.8]} rotation={[0, 0, -0.2]} castShadow>
        <coneGeometry args={[0.3, 1.2, 32]} />
        <meshPhysicalMaterial color="#1a0d06" roughness={0.6} />
      </mesh>

      {/* Legs - Sturdy, polished cylinders */}
      {/* Front Left */}
      <mesh position={[-1.5, 2, 2.5]} castShadow>
        <cylinderGeometry args={[0.6, 0.5, 5, 32]} />
        {polishedWood}
      </mesh>
      {/* Front Right */}
      <mesh position={[1.5, 2, 2.5]} castShadow>
        <cylinderGeometry args={[0.6, 0.5, 5, 32]} />
        {polishedWood}
      </mesh>
      {/* Back Left */}
      <mesh position={[-1.5, 2, -2.5]} castShadow>
        <cylinderGeometry args={[0.6, 0.5, 5, 32]} />
        {polishedWood}
      </mesh>
      {/* Back Right */}
      <mesh position={[1.5, 2, -2.5]} castShadow>
        <cylinderGeometry args={[0.6, 0.5, 5, 32]} />
        {polishedWood}
      </mesh>

      {/* Platform - Clean curved edges */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.5, 4.5, 0.8, 64]} />
        {polishedWood}
      </mesh>
    </group>
  );
}

// --- Cinematic Fire ---
function FireParticles({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [intensity, setIntensity] = useState(0);

  useFrame(() => {
    const t = scrollYProgress.get();
    if (t > 0.55) {
      setIntensity(Math.min((t - 0.55) / 0.45, 1));
    } else {
      setIntensity(0);
    }
  });

  if (intensity === 0) return null;

  return (
    <group position={[0, 2, -10]}>
      <pointLight color="#ff4400" intensity={intensity * 150} distance={120} decay={2} />
      
      <Sparkles
        count={200}
        scale={[40, 20, 40]}
        size={8}
        speed={0.4}
        opacity={intensity}
        color="#ff8800"
      />
      <Sparkles
        count={300}
        scale={[60, 30, 60]}
        size={4}
        speed={1}
        opacity={intensity * 0.8}
        color="#ff2200"
      />
    </group>
  );
}

// --- Camera Controller ---
function SceneCamera({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  useFrame((state, delta) => {
    const t = scrollYProgress.get();

    let targetX = 0;
    let targetY = 5;
    let targetZ = 45;
    const lookAtTarget = new THREE.Vector3(0, 5, 12);

    if (t < 0.3) {
      const phase = t / 0.3; 
      targetX = Math.sin(phase * Math.PI * 0.5) * 15;
      targetY = 4 + phase * 8; 
      targetZ = 45 - phase * 10;
      lookAtTarget.set(0, 5, 12);
    } else if (t < 0.6) {
      const sweepT = (t - 0.3) / 0.3;
      targetX = 15 * Math.cos(sweepT * Math.PI * 0.5); 
      targetY = 12 + Math.sin(sweepT * Math.PI) * 4; 
      targetZ = 35 - sweepT * 50; 
      lookAtTarget.set(0, THREE.MathUtils.lerp(5, 3, sweepT), THREE.MathUtils.lerp(12, 0, sweepT));
    } else {
      const fireT = (t - 0.6) / 0.4; 
      targetX = Math.sin(fireT * Math.PI) * -10; 
      targetY = 12 + fireT * 20; 
      targetZ = -15 - fireT * 10; 
      lookAtTarget.set(0, THREE.MathUtils.lerp(3, 0, fireT), 0);
    }

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 3, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 3, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 3, delta);

    const currentLookAt = new THREE.Vector3(0, 0, 1).applyQuaternion(state.camera.quaternion).add(state.camera.position);
    currentLookAt.lerp(lookAtTarget, 0.06);
    state.camera.lookAt(currentLookAt);
  });
  return null;
}

// --- Text Overlays ---
function DOMOverlays({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  // Fix massive frame drops (jitter) by animating natively on the GPU instead of triggering React re-renders on scroll
  const op0 = useTransform(scrollYProgress, [0, 0.05, 0.22, 0.3], [0, 1, 1, 0]);
  const op1 = useTransform(scrollYProgress, [0.28, 0.33, 0.555, 0.6], [0, 1, 1, 0]);
  const op2 = useTransform(scrollYProgress, [0.58, 0.64, 0.94, 1.0], [0, 1, 1, 0]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
      <div className="w-[80vw] max-w-xl text-center relative">
        
        {/* Stage 0: The Walls of Troy */}
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: op0 }}>
          <h2 className="text-4xl md:text-6xl text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] font-serif whitespace-nowrap" style={{ fontFamily: "'Cinzel', serif" }}>
            The Walls of Troy
          </h2>
          <p className="mt-4 text-sm md:text-lg text-amber-200 tracking-widest leading-loose drop-shadow-md">
            For ten years, the impenetrable walls of Troy withstood the Greek siege. Blood soaked the sands, heroes fell, but the city stood unyielding.
          </p>
        </motion.div>

        {/* Stage 1: The Cunning Deception */}
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: op1 }}>
          <h2 className="text-4xl md:text-6xl text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] font-serif whitespace-nowrap" style={{ fontFamily: "'Cinzel', serif" }}>
            The Cunning Deception
          </h2>
          <p className="mt-4 text-sm md:text-lg text-amber-200 tracking-widest leading-loose drop-shadow-md">
            Led by the cunning Odysseus, they offered a massive wooden horse as tribute. The Trojans, believing they had won, brought it within their walls.
          </p>
        </motion.div>

        {/* Stage 2: The City Burns */}
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: op2 }}>
          <h2 className="text-4xl md:text-6xl text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] font-serif whitespace-nowrap" style={{ fontFamily: "'Cinzel', serif" }}>
            The City Burns
          </h2>
          <p className="mt-4 text-sm md:text-lg text-amber-200 tracking-widest leading-loose drop-shadow-md">
            Under the cover of night, the Greeks emerged from the belly of the beast. Troy burned, ending the greatest war of the ancient world.
          </p>
        </motion.div>
        
      </div>
    </div>
  );
}

export default function TrojanWar({ progress }: { progress: MotionValue<number> }) {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { margin: "0px 0px 0px 0px" });

  const stoneTexture = useMemo(() => createStoneTexture(), []);
  const woodTexture = useMemo(() => createWoodTexture(), []);

  return (
    <section ref={containerRef} className="relative w-full h-full bg-transparent z-10">
      <DOMOverlays scrollYProgress={progress} />
      
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <Canvas frameloop={isInView ? 'always' : 'demand'} shadows={{ type: THREE.PCFSoftShadowMap }} dpr={[1, 1.5]} camera={{ position: [0, 5, 45], fov: 50 }}>
          <Suspense fallback={null}>
            <SceneCamera scrollYProgress={progress} />

            <fog attach="fog" args={['#1a0500', 10, 80]} />
            <color attach="background" args={['#111111']} />
            <Environment preset="night" />

            <ambientLight intensity={0.2} color="#ff3300" />
            {/* Softer directional light to prevent harsh pixelated shadow edges */}
            <directionalLight position={[10, 20, -10]} intensity={1.2} color="#ffaa00" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
            <pointLight position={[0, 5, 10]} intensity={20} distance={40} color="#ff3300" />
            
            <FireParticles scrollYProgress={progress} />

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
              <planeGeometry args={[120, 120]} />
              <meshPhysicalMaterial map={stoneTexture} color="#151515" roughness={0.9} />
            </mesh>

            <TrojanWalls scrollYProgress={progress} stoneTexture={stoneTexture} />
            <WoodenHorse woodTexture={woodTexture} />
            
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
