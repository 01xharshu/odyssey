'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { useInView, useScroll, MotionValue } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Html, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Trojan Walls with battlements and gate ---
function TrojanWalls({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: '#4a4a4a',
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  // Animate wall opacity based on scroll — walls visible in phase 1
  useFrame(() => {
    if (groupRef.current) {
      const t = scrollYProgress.get();
      // Walls fully visible until phase 3, then fade
      groupRef.current.visible = t < 0.85;
    }
  });

  return (
    <group ref={groupRef} position={[0, -2.5, 12]}>
      {/* Outer curved wall */}
      <mesh receiveShadow castShadow material={stoneMaterial}>
        <cylinderGeometry args={[28, 28, 18, 48, 1, false, -Math.PI / 3, Math.PI * 2 / 3]} />
      </mesh>

      {/* Inner curved wall */}
      <mesh receiveShadow castShadow material={new THREE.MeshStandardMaterial({ color: '#4a4a4a', roughness: 0.9, flatShading: true, side: THREE.BackSide })}>
        <cylinderGeometry args={[26, 26, 18, 48, 1, false, -Math.PI / 3, Math.PI * 2 / 3]} />
      </mesh>

      {/* Top of the wall */}
      <mesh position={[0, 9, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow material={stoneMaterial}>
        <ringGeometry args={[26, 28, 48, 1, -Math.PI / 3, Math.PI * 2 / 3]} />
      </mesh>

      {/* Left tower */}
      <mesh receiveShadow castShadow position={[-24.2, 3, 14]} material={stoneMaterial}>
        <cylinderGeometry args={[3, 3.5, 24, 12]} />
      </mesh>

      {/* Right tower */}
      <mesh receiveShadow castShadow position={[24.2, 3, 14]} material={stoneMaterial}>
        <cylinderGeometry args={[3, 3.5, 24, 12]} />
      </mesh>

      {/* Battlements along the top */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (-Math.PI / 3) + (i / 19) * (Math.PI * 2 / 3);
        const bx = 27 * Math.sin(angle);
        const bz = 27 * Math.cos(angle);
        return (
          <mesh key={`bat-${i}`} position={[bx, 9.5, bz]} castShadow material={stoneMaterial}>
            <boxGeometry args={[2, 2, 2]} />
          </mesh>
        );
      })}

      {/* Gate (dark opening in the wall) */}
      <mesh position={[0, 0, 28]} receiveShadow>
        <boxGeometry args={[6, 12, 4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} flatShading={true} />
      </mesh>

      {/* Gate arch */}
      <mesh position={[0, 6, 28]} receiveShadow material={new THREE.MeshStandardMaterial({ color: '#444', roughness: 1, flatShading: true, side: THREE.DoubleSide })}>
        <cylinderGeometry args={[3, 3, 4, 16, 1, false, 0, Math.PI]} />
      </mesh>
    </group>
  );
}

// --- Fire Ring Shader ---
const fireVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fireFragmentShader = `
  uniform float time;
  uniform float progress;
  varying vec2 vUv;
  
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }
  
  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
      mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
      mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    
    float ringRadius = progress * 0.5;
    float ringWidth = 0.05 + progress * 0.15;
    
    float n = noise(vUv * 20.0 + time * 2.0) * 0.05;
    dist += n;
    
    float d = abs(dist - ringRadius);
    float intensity = smoothstep(ringWidth, 0.0, d);
    
    // Also add an inner glow that fills the ring
    float innerGlow = smoothstep(ringRadius, 0.0, dist) * progress * 0.4;
    intensity = max(intensity, innerGlow);
    
    vec3 color = mix(vec3(1.0, 0.1, 0.0), vec3(1.0, 0.8, 0.0), intensity);
    
    gl_FragColor = vec4(color, intensity * smoothstep(0.0, 0.1, progress));
  }
`;

function FireRing({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      const t = scrollYProgress.get();
      let fireProgress = 0;
      if (t > 0.55) {
        fireProgress = Math.min((t - 0.55) / 0.45, 1);
      }
      materialRef.current.uniforms.progress.value = fireProgress;
    }
  });

  return (
    <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[120, 120]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={fireVertexShader}
        fragmentShader={fireFragmentShader}
        uniforms={{
          time: { value: 0 },
          progress: { value: 0 }
        }}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// --- Wooden Horse ---
function WoodenHorse() {
  const group = useRef<THREE.Group>(null);
  
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: '#4a3219',
    roughness: 0.95,
    metalness: 0.1,
    flatShading: true,
  });

  const { viewport } = useThree();
  const scale = Math.min(1, viewport.width / 12);

  return (
    <group ref={group} position={[0, -2, 0]} scale={scale} castShadow receiveShadow>
      {/* Body */}
      <mesh position={[0, 5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={woodMaterial}>
        <cylinderGeometry args={[2.5, 3, 6, 16]} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 7.5, 3]} rotation={[Math.PI / 6, 0, 0]} castShadow material={woodMaterial}>
        <cylinderGeometry args={[1.2, 1.8, 4, 12]} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 9.5, 4]} rotation={[-Math.PI / 12, 0, 0]} castShadow material={woodMaterial}>
        <boxGeometry args={[1.2, 1.5, 3.5]} />
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
      {/* Binding Ropes */}
      <mesh position={[0, 5, 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[2.8, 0.1, 8, 24]} />
        <meshPhysicalMaterial color="#8b5a2b" roughness={1} />
      </mesh>
      <mesh position={[0, 5, -2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[2.6, 0.1, 8, 24]} />
        <meshPhysicalMaterial color="#8b5a2b" roughness={1} />
      </mesh>
      {/* Legs */}
      <mesh position={[-1.5, 2, 2.5]} castShadow material={woodMaterial}>
        <cylinderGeometry args={[0.4, 0.3, 4, 8]} />
      </mesh>
      <mesh position={[1.5, 2, 2.5]} castShadow material={woodMaterial}>
        <cylinderGeometry args={[0.4, 0.3, 4, 8]} />
      </mesh>
      <mesh position={[-1.5, 2, -2.5]} castShadow material={woodMaterial}>
        <cylinderGeometry args={[0.4, 0.3, 4, 8]} />
      </mesh>
      <mesh position={[1.5, 2, -2.5]} castShadow material={woodMaterial}>
        <cylinderGeometry args={[0.4, 0.3, 4, 8]} />
      </mesh>
      {/* Platform */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow material={woodMaterial}>
        <boxGeometry args={[5, 0.5, 8]} />
      </mesh>
      {/* Wheels */}
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

// --- Camera Controller ---
function SceneCamera({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  useFrame((state, delta) => {
    const t = scrollYProgress.get();

    let targetX = 0;
    let targetY = 5;
    let targetZ = 45;
    const lookAtTarget = new THREE.Vector3(0, 5, 12);

    if (t < 0.3) {
      // Phase 1: Outside the walls — dramatic establishing shot
      const phase = t / 0.3; // 0 to 1
      targetX = Math.sin(phase * Math.PI * 0.5) * 15; // 0 to 15
      targetY = 4 + phase * 8; // 4 to 12
      targetZ = 45 - phase * 10; // 45 to 35
      lookAtTarget.set(0, 5, 12);
    } else if (t < 0.6) {
      // Phase 2: The sweep over the wall — dramatic arc revealing the horse
      const sweepT = (t - 0.3) / 0.3; // 0 to 1
      targetX = 15 * Math.cos(sweepT * Math.PI * 0.5); // 15 to 0
      targetY = 12 + Math.sin(sweepT * Math.PI) * 4; // 12 -> 16 -> 12
      targetZ = 35 - sweepT * 50; // 35 to -15

      lookAtTarget.set(
        0,
        THREE.MathUtils.lerp(5, 3, sweepT),
        THREE.MathUtils.lerp(12, 0, sweepT)
      );
    } else {
      // Phase 3: Inside — fire consuming everything, bird's eye rising
      const fireT = (t - 0.6) / 0.4; // 0 to 1
      targetX = Math.sin(fireT * Math.PI) * -10; // 0 -> -10 -> 0
      targetY = 12 + fireT * 20; // 12 to 32
      targetZ = -15 - fireT * 10; // -15 to -25
      
      lookAtTarget.set(
        0, 
        THREE.MathUtils.lerp(3, 0, fireT), 
        0
      );
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
function HtmlOverlays({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [stage, setStage] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    const t = scrollYProgress.get();
    if (t < 0.3) {
      setStage(0);
      // Fade in then hold
      setOpacity(t < 0.05 ? t / 0.05 : (t > 0.22 ? 1 - ((t - 0.22) / 0.08) : 1));
    } else if (t < 0.6) {
      setStage(1);
      const local = (t - 0.3) / 0.3;
      setOpacity(local < 0.1 ? local / 0.1 : (local > 0.85 ? 1 - ((local - 0.85) / 0.15) : 1));
    } else {
      setStage(2);
      const local = (t - 0.6) / 0.4;
      setOpacity(local < 0.1 ? local / 0.1 : (local > 0.85 ? 1 - ((local - 0.85) / 0.15) : 1));
    }
  });

  return (
    <Html center pointerEvents="none" style={{ opacity, transition: 'opacity 0.15s' }}>
      <div className="w-[80vw] max-w-xl text-center">
        <h2 className="text-4xl md:text-6xl text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
          {stage === 0 && "The Walls of Troy"}
          {stage === 1 && "The Cunning Deception"}
          {stage === 2 && "The City Burns"}
        </h2>
        <p className="mt-4 text-sm md:text-lg text-amber-200 tracking-widest leading-loose drop-shadow-md">
          {stage === 0 && "For ten years, the impenetrable walls of Troy withstood the Greek siege. Blood soaked the sands, heroes fell, but the city stood unyielding."}
          {stage === 1 && "Led by the cunning Odysseus, they offered a massive wooden horse as tribute. The Trojans, believing they had won, brought it within their walls."}
          {stage === 2 && "Under the cover of night, the Greeks emerged from the belly of the beast. Troy burned, ending the greatest war of the ancient world."}
        </p>
      </div>
    </Html>
  );
}

export default function TrojanWar({ progress }: { progress: MotionValue<number> }) {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { margin: "0px 0px 0px 0px" });

  return (
    <section ref={containerRef} className="relative w-full h-full bg-transparent z-10">
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <Canvas frameloop={isInView ? 'always' : 'demand'} shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 1.5]} camera={{ position: [0, 5, 45], fov: 50 }}>
          <Suspense fallback={null}>
            <SceneCamera scrollYProgress={progress} />
            <HtmlOverlays scrollYProgress={progress} />

            {/* The Environment */}
            <fog attach="fog" args={['#2a0800', 10, 80]} />
            <color attach="background" args={['#1c1c1e']} />

            {/* Lighting */}
            <ambientLight intensity={0.15} color="#ff3300" />
            <directionalLight position={[10, 15, -10]} intensity={1.5} color="#ffaa00" castShadow />
            <pointLight position={[0, 0, 5]} intensity={5} distance={30} color="#ff3300" />
            <pointLight position={[-5, 5, -5]} intensity={3} distance={20} color="#ff0000" />
            <pointLight position={[0, 10, -15]} intensity={2} distance={40} color="#ff4400" />

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
              <planeGeometry args={[200, 200]} />
              <meshPhysicalMaterial color="#1a0a00" roughness={1} />
            </mesh>

            <TrojanWalls scrollYProgress={progress} />
            <FireRing scrollYProgress={progress} />

            {/* The Horse */}
            <PresentationControls
              global={false}
              snap={true}
              rotation={[0, 0, 0]}
              polar={[-0.1, 0.1]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
            >
              <WoodenHorse />
            </PresentationControls>

            {/* Embers */}
            <Sparkles count={600} scale={25} size={4} speed={0.5} opacity={0.6} color="#ffaa00" position={[0, 8, 0]} />

          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
