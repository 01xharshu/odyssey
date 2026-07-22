'use client';

import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useScroll, MotionValue } from 'framer-motion';
import { Html, Line, Sphere, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Character Data ---
interface CharacterNode {
  id: number;
  name: string;
  pos: THREE.Vector3;
  color: string;
  role: string;
  fate: 'dead' | 'alive';
  causeOfDeath?: string;
}

const characterNodes: CharacterNode[] = [
  { id: 0, name: "Achilles", pos: new THREE.Vector3(-6, 4, -1), color: "#ff3333", role: "Greatest Greek Warrior", fate: "dead", causeOfDeath: "Arrow of Paris" },
  { id: 1, name: "Hector", pos: new THREE.Vector3(6, 5, -3), color: "#f59e0b", role: "Champion of Troy", fate: "dead", causeOfDeath: "Slain by Achilles" },
  { id: 2, name: "Paris", pos: new THREE.Vector3(3, -3, 0), color: "#a855f7", role: "The Abductor", fate: "dead", causeOfDeath: "Arrow of Philoctetes" },
  { id: 3, name: "Odysseus", pos: new THREE.Vector3(-5, -2, 2), color: "#3b82f6", role: "The Mastermind", fate: "alive" },
  { id: 4, name: "Helen", pos: new THREE.Vector3(0, 6, -2), color: "#ec4899", role: "The Face That Launched 1000 Ships", fate: "alive" },
  { id: 5, name: "Agamemnon", pos: new THREE.Vector3(-7, 0, 1), color: "#eab308", role: "King of the Greeks", fate: "dead", causeOfDeath: "Murdered by Clytemnestra" },
  { id: 6, name: "Patroclus", pos: new THREE.Vector3(-2, 2, 3), color: "#14b8a6", role: "Beloved of Achilles", fate: "dead", causeOfDeath: "Slain by Hector" },
  { id: 7, name: "Priam", pos: new THREE.Vector3(5, 1, -1), color: "#f97316", role: "King of Troy", fate: "dead", causeOfDeath: "Killed in the Sack" },
];

// --- Connections with scroll timing ---
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

// --- Cork Board Background ---
function CorkBoard() {
  return (
    <mesh position={[0, 1, -6]} receiveShadow>
      <planeGeometry args={[24, 18]} />
      <meshStandardMaterial color="#2a1f14" roughness={1} />
    </mesh>
  );
}

// --- Pin at character node ---
function Pin({ position, color }: { position: THREE.Vector3; color: string }) {
  return (
    <group position={position}>
      {/* Pin head */}
      <Sphere args={[0.12, 16, 16]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
      </Sphere>
      {/* Pin needle */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// --- The String Board Scene ---
function StringBoard({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const [revealedConnections, setRevealedConnections] = useState<Set<number>>(new Set());
  const [activeConnection, setActiveConnection] = useState<number>(-1);
  const [activeNode, setActiveNode] = useState<number>(-1);

  useFrame((state) => {
    const t = scrollYProgress.get();

    // Determine which connections are revealed and which is active
    const newRevealed = new Set<number>();
    let newActive = -1;
    let newNode = -1;

    connections.forEach((conn, index) => {
      if (t >= conn.scrollStart) {
        newRevealed.add(index);
      }
      if (t >= conn.scrollStart && t <= conn.scrollEnd + 0.05) {
        newActive = index;
      }
    });

    // Find the most relevant node for the active connection
    if (newActive >= 0) {
      const conn = connections[newActive];
      const progress = (t - conn.scrollStart) / (conn.scrollEnd - conn.scrollStart);
      newNode = progress < 0.5 ? conn.source : conn.target;
    }

    setRevealedConnections(newRevealed);
    setActiveConnection(newActive);
    setActiveNode(newNode);

    // Slow orbit camera
    const orbitRadius = 14;
    state.camera.position.x = Math.sin(t * Math.PI * 1.5) * orbitRadius;
    state.camera.position.y = 2 + Math.sin(t * Math.PI) * 3;
    state.camera.position.z = Math.cos(t * Math.PI * 1.5) * orbitRadius;
    state.camera.lookAt(0, 1, 0);
  });

  return (
    <group ref={groupRef}>
      <CorkBoard />

      {/* Character Nodes */}
      {characterNodes.map((node) => {
        const isActive = activeNode === node.id;
        const isRevealed = revealedConnections.size > 0; // All nodes visible from start

        return (
          <group key={node.id} position={node.pos}>
            {/* Pin */}
            <Pin position={new THREE.Vector3(0, 0, 0)} color={node.color} />

            {/* Glowing sphere */}
            <Sphere args={[isActive ? 0.45 : 0.3, 32, 32]}>
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={isActive ? 1.2 : 0.3}
                roughness={0.3}
                transparent
                opacity={isRevealed ? 1 : 0.2}
              />
            </Sphere>

            {/* Character name */}
            <Text
              position={[0, -0.6, 0.1]}
              fontSize={0.35}
              color="white"
              font="https://fonts.gstatic.com/s/cinzel/v19/8vIX7kw6OSWKfXRi71A4N17O.woff"
              anchorX="center"
              anchorY="top"
              outlineWidth={0.02}
              outlineColor="black"
            >
              {node.name}
            </Text>

            {/* Fate icon — skull or laurel */}
            {isActive && (
              <Html position={[0, 0.9, 0.1]} center className="pointer-events-none">
                <div className="flex flex-col items-center gap-1" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                  <span className="text-2xl">
                    {node.fate === 'dead' ? '💀' : '🏛️'}
                  </span>
                  <span className={`text-[10px] tracking-[0.2em] uppercase font-sans px-2 py-0.5 rounded ${
                    node.fate === 'dead' 
                      ? 'bg-red-900/80 text-red-300 border border-red-700/50' 
                      : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/50'
                  }`}>
                    {node.fate === 'dead' ? 'FALLEN' : 'SURVIVES'}
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Faint background connections (all visible) */}
      {connections.map((conn, i) => (
        <Line
          key={`bg-${i}`}
          points={[characterNodes[conn.source].pos, characterNodes[conn.target].pos]}
          color="#333333"
          lineWidth={0.5}
          transparent
          opacity={0.15}
        />
      ))}

      {/* Revealed red detective strings */}
      {connections.map((conn, i) => {
        const isRevealed = revealedConnections.has(i);
        const isActive = activeConnection === i;
        const sourcePos = characterNodes[conn.source].pos;
        const targetPos = characterNodes[conn.target].pos;
        const midPoint = new THREE.Vector3().addVectors(sourcePos, targetPos).multiplyScalar(0.5);
        midPoint.z += 1; // Push label forward

        return (
          <group key={`conn-${i}`}>
            <Line
              points={[sourcePos, targetPos]}
              color={isActive ? "#ff0044" : "#882233"}
              lineWidth={isActive ? 3 : (isRevealed ? 1.5 : 0)}
              transparent
              opacity={isActive ? 1 : (isRevealed ? 0.5 : 0)}
            />
            {isActive && (
              <Html position={midPoint} center className="pointer-events-none">
                <div
                  className="bg-black/90 border border-[#ff0044]/40 px-4 py-2 rounded-sm shadow-[0_0_20px_rgba(255,0,68,0.4)] backdrop-blur-sm"
                  style={{ animation: 'fadeIn 0.4s ease-out' }}
                >
                  <p className="text-[#ff0044] font-serif text-xs md:text-sm tracking-widest whitespace-nowrap">
                    {conn.label}
                  </p>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Active node role info panel */}
      {activeNode >= 0 && (
        <Html
          position={[characterNodes[activeNode].pos.x, characterNodes[activeNode].pos.y - 1.3, characterNodes[activeNode].pos.z + 0.5]}
          center
          className="pointer-events-none"
        >
          <div
            className="bg-black/80 border border-gray-700/50 px-3 py-1.5 rounded-sm backdrop-blur-sm max-w-[200px] text-center"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          >
            <p className="text-gray-400 text-[10px] tracking-[0.15em] uppercase font-sans">
              {characterNodes[activeNode].role}
            </p>
            {characterNodes[activeNode].fate === 'dead' && characterNodes[activeNode].causeOfDeath && (
              <p className="text-red-500/70 text-[9px] tracking-[0.1em] uppercase font-sans mt-1">
                ✦ {characterNodes[activeNode].causeOfDeath}
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// --- Progress indicator ---
function ScrollProgress({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => setProgress(v));
    return unsub;
  }, [scrollYProgress]);

  const currentConn = connections.find((c, i) =>
    progress >= c.scrollStart && progress <= c.scrollEnd + 0.05
  );

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
      {/* Progress dots */}
      <div className="flex gap-2">
        {connections.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              progress >= connections[i].scrollStart
                ? (progress <= connections[i].scrollEnd + 0.05 ? 'bg-red-500 scale-150 shadow-[0_0_8px_rgba(255,0,68,0.8)]' : 'bg-red-900')
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <span className="text-[9px] tracking-[0.3em] uppercase text-gray-600 font-sans">
        Scroll to unravel the web
      </span>
    </div>
  );
}

export default function DetectiveMesh() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative w-full h-[400vh] bg-[#1c1c1e] z-10">
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        <div className="absolute top-8 left-0 w-full text-center z-10 pointer-events-none">
          <span className="text-[10px] tracking-[0.5em] uppercase text-red-500/50 font-sans">Interlude</span>
          <h2 className="text-2xl md:text-4xl text-gray-500/80 font-light tracking-[0.3em] mt-2" style={{ fontFamily: "'Cinzel', serif" }}>
            The Web of Fates
          </h2>
        </div>

        <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 1.5]} camera={{ position: [0, 0, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ff0044" />
            <pointLight position={[0, 8, 5]} intensity={0.6} color="#f59e0b" />

            <StringBoard scrollYProgress={scrollYProgress} />

            {/* Dust Particles */}
            <Sparkles count={800} scale={30} size={1} speed={0.15} opacity={0.3} color="#666666" />
          </Suspense>
        </Canvas>

        <ScrollProgress scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
}
