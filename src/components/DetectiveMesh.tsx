'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useScroll, MotionValue } from 'framer-motion';
import { Html, Line, Sphere, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Character Data ---
interface CharacterNode {
  id: number;
  name: string;
  pos: THREE.Vector3;
  role: string;
  fate: 'dead' | 'alive';
  causeOfDeath?: string;
}

const characterNodes: CharacterNode[] = [
  { id: 0, name: "Achilles", pos: new THREE.Vector3(-6, 4, -1), role: "Greatest Greek Warrior", fate: "dead", causeOfDeath: "Arrow of Paris" },
  { id: 1, name: "Hector", pos: new THREE.Vector3(6, 5, -3), role: "Champion of Troy", fate: "dead", causeOfDeath: "Slain by Achilles" },
  { id: 2, name: "Paris", pos: new THREE.Vector3(3, -3, 0), role: "The Abductor", fate: "dead", causeOfDeath: "Arrow of Philoctetes" },
  { id: 3, name: "Odysseus", pos: new THREE.Vector3(-5, -2, 2), role: "The Mastermind", fate: "alive" },
  { id: 4, name: "Helen", pos: new THREE.Vector3(0, 6, -2), role: "The Face That Launched 1000 Ships", fate: "alive" },
  { id: 5, name: "Agamemnon", pos: new THREE.Vector3(-7, 0, 1), role: "King of the Greeks", fate: "dead", causeOfDeath: "Murdered by Clytemnestra" },
  { id: 6, name: "Patroclus", pos: new THREE.Vector3(-2, 2, 3), role: "Beloved of Achilles", fate: "dead", causeOfDeath: "Slain by Hector" },
  { id: 7, name: "Priam", pos: new THREE.Vector3(5, 1, -1), role: "King of Troy", fate: "dead", causeOfDeath: "Killed in the Sack" },
];

const connections = [
  { source: 6, target: 1, label: "Patroclus falls to Hector", scrollStart: 0.05, scrollEnd: 0.15 },
  { source: 0, target: 6, label: "Achilles mourns Patroclus", scrollStart: 0.12, scrollEnd: 0.22 },
  { source: 0, target: 1, label: "Achilles avenges — kills Hector", scrollStart: 0.20, scrollEnd: 0.32 },
  { source: 2, target: 4, label: "Paris steals Helen from Sparta", scrollStart: 0.28, scrollEnd: 0.40 },
  { source: 5, target: 2, label: "Agamemnon wages war for Helen", scrollStart: 0.36, scrollEnd: 0.48 },
  { source: 2, target: 0, label: "Paris kills Achilles with a guided arrow", scrollStart: 0.44, scrollEnd: 0.56 },
  { source: 3, target: 7, label: "Odysseus devises the Wooden Horse", scrollStart: 0.52, scrollEnd: 0.64 },
  { source: 3, target: 5, label: "The Greeks sack Troy, Priam falls", scrollStart: 0.60, scrollEnd: 0.72 },
  { source: 5, target: 4, label: "Agamemnon's curse follows him home", scrollStart: 0.68, scrollEnd: 0.80 },
  { source: 3, target: 4, label: "Odysseus begins his long journey home", scrollStart: 0.78, scrollEnd: 0.92 },
];

// --- The Constellation Scene ---
function WebOfFatesBoard({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const nodeHtmlRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeInfoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lineMatRefs = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const lineHtmlRefs = useRef<(HTMLDivElement | null)[]>([]);

  useFrame((state, delta) => {
    const t = scrollYProgress.get();
    let activeConn = -1;
    let activeNode = -1;
    
    // Determine active states
    for (let i = 0; i < connections.length; i++) {
      const conn = connections[i];
      if (t >= conn.scrollStart && t <= conn.scrollEnd + 0.05) {
        activeConn = i;
        const progress = (t - conn.scrollStart) / (conn.scrollEnd - conn.scrollStart);
        activeNode = progress < 0.5 ? conn.source : conn.target;
      }
    }

    // --- Dynamic Camera Animation ---
    let targetX = 0;
    let targetY = 2;
    let targetZ = 16;
    const lookAtTarget = new THREE.Vector3(0, 1, -2);

    if (activeConn >= 0) {
      // Zoom into the active connection
      const conn = connections[activeConn];
      const sourcePos = characterNodes[conn.source].pos;
      const targetPos = characterNodes[conn.target].pos;
      const midPoint = new THREE.Vector3().addVectors(sourcePos, targetPos).multiplyScalar(0.5);
      
      targetX = midPoint.x * 0.5;
      targetY = midPoint.y * 0.5 + 1;
      targetZ = midPoint.z + 8; // Zoom in
      lookAtTarget.copy(midPoint);
    } else {
      // Idle slow pan
      targetX = Math.sin(t * Math.PI) * 4 - 2;
      targetY = 2 - t * 4;
      targetZ = 16 - Math.sin(t * Math.PI) * 2;
    }

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 2, delta);

    const currentLookAt = new THREE.Vector3(0, 0, 1).applyQuaternion(state.camera.quaternion).add(state.camera.position);
    currentLookAt.lerp(lookAtTarget, 0.05);
    state.camera.lookAt(currentLookAt);

    // --- High-Performance DOM & Material Updates ---
    // Update nodes
    characterNodes.forEach((node, idx) => {
      const isFocused = (activeNode === idx) || 
                        (activeConn >= 0 && (connections[activeConn].source === idx || connections[activeConn].target === idx));
      
      // Update HTML Labels
      if (nodeHtmlRefs.current[idx]) {
        nodeHtmlRefs.current[idx]!.style.opacity = isFocused ? '1' : '0.2';
        nodeHtmlRefs.current[idx]!.style.transform = activeNode === idx ? 'scale(1.1)' : 'scale(1)';
        nodeHtmlRefs.current[idx]!.style.border = activeNode === idx ? '1px solid rgba(251, 191, 36, 0.8)' : '1px solid rgba(251, 191, 36, 0.2)';
      }
      
      // Update Info Panel
      if (nodeInfoRefs.current[idx]) {
        nodeInfoRefs.current[idx]!.style.opacity = activeNode === idx ? '1' : '0';
      }

      // Update Materials
      if (nodeMatRefs.current[idx]) {
        const mat = nodeMatRefs.current[idx]!;
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, activeNode === idx ? 2 : 0.5, 0.1);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, isFocused ? 1 : 0.4, 0.1);
      }
    });

    // Update connections
    connections.forEach((conn, idx) => {
      const isActive = activeConn === idx;
      
      // Line Material
      if (lineMatRefs.current[idx]) {
        const mat = lineMatRefs.current[idx]!;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, isActive ? 1 : 0, 0.1);
        mat.linewidth = isActive ? 3 : 1;
      }

      // Line Label HTML
      if (lineHtmlRefs.current[idx]) {
        lineHtmlRefs.current[idx]!.style.opacity = isActive ? '1' : '0';
        lineHtmlRefs.current[idx]!.style.transform = isActive ? 'translateY(0px)' : 'translateY(10px)';
      }
    });
  });

  return (
    <group>
      {/* Background Starfield */}
      <Sparkles count={400} scale={30} size={2} speed={0.2} opacity={0.3} color="#fbbf24" />

      {/* Character Nodes (Stars) */}
      {characterNodes.map((node, i) => (
        <group key={node.id} position={node.pos}>
          {/* Glowing core */}
          <Sphere args={[0.3, 32, 32]}>
            <meshStandardMaterial
              ref={el => { nodeMatRefs.current[i] = el; }}
              color="#fbbf24"
              emissive="#fbbf24"
              roughness={0.2}
              transparent
            />
          </Sphere>

          {/* Node Label */}
          <Html position={[0, 0.6, 0.1]} center className="pointer-events-none">
            <div 
              ref={el => { nodeHtmlRefs.current[i] = el; }}
              className="px-4 py-1 rounded-sm backdrop-blur-md bg-black/60 shadow-[0_0_15px_rgba(251,191,36,0.1)] transition-all duration-300 ease-out"
            >
              <p className="text-amber-200 font-serif tracking-[0.2em] whitespace-nowrap text-sm md:text-base" style={{ fontFamily: "'Cinzel', serif" }}>
                {node.name}
              </p>
            </div>
          </Html>

          {/* Node Info Panel */}
          <Html position={[0, -1.2, 0.1]} center className="pointer-events-none">
            <div 
              ref={el => { nodeInfoRefs.current[i] = el; }}
              className="flex flex-col items-center gap-1 transition-all duration-500 ease-out"
            >
              <div className="bg-black/80 border border-amber-900/50 px-3 py-1.5 rounded-sm backdrop-blur-sm max-w-[200px] text-center shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                <p className="text-amber-400/80 text-[10px] tracking-[0.15em] uppercase font-sans">
                  {node.role}
                </p>
                {node.fate === 'dead' && node.causeOfDeath && (
                  <p className="text-red-400/70 text-[9px] tracking-[0.1em] uppercase font-sans mt-1">
                    ✦ {node.causeOfDeath}
                  </p>
                )}
              </div>
            </div>
          </Html>
        </group>
      ))}

      {/* The Threads of Destiny */}
      {connections.map((conn, i) => {
        const sourcePos = characterNodes[conn.source].pos;
        const targetPos = characterNodes[conn.target].pos;
        const midPoint = new THREE.Vector3().addVectors(sourcePos, targetPos).multiplyScalar(0.5);
        midPoint.y += 0.5;
        midPoint.z += 1.5;

        return (
          <group key={`conn-${i}`}>
            <Line
              points={[sourcePos, targetPos]}
              color="#fbbf24"
              transparent
            >
              {/* @ts-ignore */}
              <lineBasicMaterial ref={el => { lineMatRefs.current[i] = el; }} />
            </Line>
            
            <Html position={midPoint} center className="pointer-events-none">
              <div
                ref={el => { lineHtmlRefs.current[i] = el; }}
                className="bg-black/90 border border-amber-500/40 px-4 py-2 rounded-sm shadow-[0_0_30px_rgba(251,191,36,0.3)] backdrop-blur-md transition-all duration-500 ease-out"
              >
                <p className="text-amber-400 font-serif text-xs md:text-sm tracking-widest whitespace-nowrap">
                  {conn.label}
                </p>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function DetectiveMesh({ progress }: { progress: MotionValue<number> }) {
  return (
    <section className="relative w-full h-full bg-[#050505]">
      {/* Background Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-[#050505]/50 to-[#050505] z-10" />

      <div className="absolute inset-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 20], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
          <WebOfFatesBoard scrollYProgress={progress} />
        </Canvas>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-amber-500/30 z-20 pointer-events-none">
        <p className="text-[10px] tracking-[0.3em] uppercase mb-2">The Web of Fates</p>
        <div className="w-[1px] h-12 bg-gradient-to-b from-amber-500/50 to-transparent" />
      </div>
    </section>
  );
}
