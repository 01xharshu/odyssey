'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, SpotLight, useDepthBuffer, Clouds, Cloud, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { cityLoreData } from '@/data/cityLore';
import Temple from './buildings/Temple';
import Fort from './buildings/Fort';
import House from './buildings/House';

interface CitySceneProps {
  selectedId: string | null;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  onTimeUpdate: (timeStr: string) => void;
}

export default function CityScene({ selectedId, hoveredId, onHover, onClick, onTimeUpdate }: CitySceneProps) {
  const depthBuffer = useDepthBuffer({ frames: 1 });
  const sunPosition = useRef(new THREE.Vector3(100, 20, 100));
  const moonPosition = useRef(new THREE.Vector3(-100, -20, -100));
  const ambientLightRef = useRef<THREE.AmbientLight>(null!);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null!);
  const spotLightTargetRef = useRef(new THREE.Object3D());
  const [scene] = useState(() => new THREE.Scene());

  const selectedBuilding = cityLoreData.find(b => b.id === selectedId);

  const isNight = selectedId !== null;
  const starsRef = useRef<THREE.Points>(null!);
  const moonRef = useRef<THREE.Mesh>(null!);

  const terrainTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#1a202c';
      context.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 20000; i++) {
        context.fillStyle = Math.random() > 0.5 ? '#171923' : '#2d3748';
        context.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    return texture;
  }, []);

  const roadTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#2d2d2d';
      context.fillRect(0, 0, 512, 512);
      // Generate cobblestone pattern
      for (let y = 0; y < 512; y += 32) {
        for (let x = 0; x < 512; x += 32) {
          context.fillStyle = Math.random() > 0.5 ? '#1a1a1a' : '#3a3a3a';
          context.fillRect(x + 2, y + 2, 28, 28);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(15, 2); // Stretch along roads
    return texture;
  }, []);

  const clearanceZones = useMemo(() => [
    [0, 0], // Center hub
    ...cityLoreData.map(b => [b.position[0], b.position[2]])
  ], []);

  const isClear = (x: number, z: number, radius: number) => {
    for (const [cx, cz] of clearanceZones) {
      if (Math.hypot(x - cx, z - cz) < radius) return false;
    }
    // Avoid river
    if (x < -20 && x > -60 && z > -150 && z < 100) return false;
    return true;
  };

  const trees = useMemo(() => {
    const arr = [];
    let attempts = 0;
    while (arr.length < 50 && attempts < 1000) { // Reduced count, tighter bounds
      attempts++;
      // Keep strictly within visible camera FOV [z: -5 to -40, x: -35 to 35]
      const x = (Math.random() - 0.5) * 70;
      const z = -5 - (Math.random() * 35);
      if (!isClear(x, z, 12)) continue;
      
      const scale = Math.random() * 0.4 + 0.4;
      arr.push(
        <group key={`tree-${arr.length}`} position={[x, 0, z]} scale={scale}>
          {/* Tapered Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.4, 3, 7]} />
            <meshPhysicalMaterial color="#3e2723" roughness={1} clearcoat={0.1} />
          </mesh>
          {/* Organic Canopy using overlapping spheres */}
          <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
            <sphereGeometry args={[1.5, 12, 12]} />
            <meshPhysicalMaterial color="#1b5e20" roughness={1} clearcoat={0.1} />
          </mesh>
          <mesh position={[-1, 3, 0.5]} castShadow receiveShadow>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshPhysicalMaterial color="#228b22" roughness={1} clearcoat={0.1} />
          </mesh>
          <mesh position={[1, 3, -0.5]} castShadow receiveShadow>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshPhysicalMaterial color="#145a14" roughness={1} clearcoat={0.1} />
          </mesh>
        </group>
      );
    }
    return arr;
  }, [clearanceZones]);
  
  // Simple scattered huts
  const shelters = useMemo(() => {
    const arr = [];
    let attempts = 0;
    while (arr.length < 10 && attempts < 1000) {
      attempts++;
      // Keep strictly within visible camera FOV
      const x = (Math.random() - 0.5) * 80;
      const z = -5 - (Math.random() * 40);
      if (!isClear(x, z, 15)) continue;

      arr.push(
        <group key={`hut-${arr.length}`} position={[x, 0, z]} rotation={[0, Math.random() * Math.PI, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 1.6, 2.5]} />
            <meshPhysicalMaterial color="#5c4033" roughness={1} clearcoat={0.1} map={terrainTexture || undefined} />
          </mesh>
          <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
            <coneGeometry args={[2, 1, 4]} />
            <meshPhysicalMaterial color="#3e2723" roughness={1} clearcoat={0.1} map={terrainTexture || undefined} />
          </mesh>
        </group>
      );
    }
    return arr;
  }, [terrainTexture, clearanceZones]);

  const hills = useMemo(() => {
    const arr = [];
    let attempts = 0;
    while (arr.length < 8 && attempts < 1000) {
      attempts++;
      // Background hills only
      const x = (Math.random() - 0.5) * 150;
      const z = -40 - (Math.random() * 60);
      if (!isClear(x, z, 25)) continue;

      const scaleX = Math.random() * 20 + 10;
      const scaleY = Math.random() * 5 + 2;
      const scaleZ = Math.random() * 20 + 10;
      arr.push(
        <mesh key={`hill-${arr.length}`} position={[x, -2, z]} scale={[scaleX, scaleY, scaleZ]} receiveShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshPhysicalMaterial color="#1c1c1e" roughness={1} clearcoat={0.1} metalness={0.1} map={terrainTexture || undefined} />
        </mesh>
      );
    }
    return arr;
  }, [terrainTexture, clearanceZones]);
  
  const lastTimeRef = useRef(-1);
  const sunRef = useRef<THREE.Mesh>(null!);
  const sunGlowRef = useRef<THREE.Mesh>(null!);
  const moonGlowRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const cycleSpeed = (Math.PI * 2) / 60; // 60 seconds = 24 hours
    
    // UI Update - Throttle to roughly once every 10 frames to save performance
    if (Math.floor(time * 10) !== lastTimeRef.current) {
      lastTimeRef.current = Math.floor(time * 10);
      const hoursInGame = (time / 60) * 24;
      // Start at 6 AM. Add 6 hours to base calculation.
      const totalHours = (hoursInGame + 6) % 24;
      const hours = Math.floor(totalHours);
      const mins = Math.floor((totalHours % 1) * 60);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      onTimeUpdate(`${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`);
    }

    const sunElevation = Math.sin(time * cycleSpeed);
    
    const isBuildingSelected = selectedId !== null;
    
    // Sun position continues normally
    const targetSunY = sunElevation * 100;
    sunPosition.current.y += (targetSunY - sunPosition.current.y) * delta * 2;
    sunPosition.current.x = Math.cos(time * cycleSpeed) * 100;
    
    // Moon orbits opposite
    moonPosition.current.set(-sunPosition.current.x, -sunPosition.current.y, -sunPosition.current.z);

    // Dim the environment lighting slightly if a building is selected, but keep it visible
    if (ambientLightRef.current) {
      const naturalIntensity = Math.max(0.05, sunElevation * 0.6);
      const targetIntensity = isBuildingSelected ? Math.max(0.2, naturalIntensity * 0.7) : naturalIntensity;
      ambientLightRef.current.intensity += (targetIntensity - ambientLightRef.current.intensity) * delta * 2;
    }
    
    if (directionalLightRef.current) {
      const naturalIntensity = Math.max(0.0, sunElevation * 1.5);
      const targetIntensity = isBuildingSelected ? Math.max(0.5, naturalIntensity * 0.5) : naturalIntensity;
      directionalLightRef.current.intensity += (targetIntensity - directionalLightRef.current.intensity) * delta * 2;
      
      directionalLightRef.current.position.copy(sunPosition.current);
    }

    if (selectedBuilding) {
      spotLightTargetRef.current.position.set(...selectedBuilding.position);
      spotLightTargetRef.current.updateMatrixWorld();
    }

    // Stars and Moon opacity are now purely based on the natural day/night cycle
    if (starsRef.current) {
      const isNightTime = sunPosition.current.y < 5;
      const targetOpacity = isNightTime ? 1 : 0;
      const mat = starsRef.current.material as THREE.PointsMaterial;
      mat.opacity += (targetOpacity - mat.opacity) * delta * 1.5;
    }
    
    if (moonRef.current && moonGlowRef.current) {
      moonRef.current.position.copy(moonPosition.current);
      moonGlowRef.current.position.copy(moonPosition.current);
      const isNightTime = sunPosition.current.y < 5;
      const mat = moonRef.current.material as THREE.MeshBasicMaterial;
      const glowMat = moonGlowRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = isNightTime ? 1 : 0;
      mat.opacity += (targetOpacity - mat.opacity) * delta * 2;
      glowMat.opacity += ((isNightTime ? 0.3 : 0) - glowMat.opacity) * delta * 2;
    }

    if (sunRef.current && sunGlowRef.current) {
      sunRef.current.position.copy(sunPosition.current);
      sunGlowRef.current.position.copy(sunPosition.current);
      const isDayTime = sunPosition.current.y > 0;
      const mat = sunRef.current.material as THREE.MeshBasicMaterial;
      const glowMat = sunGlowRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = isDayTime ? 1 : 0;
      mat.opacity += (targetOpacity - mat.opacity) * delta * 2;
      glowMat.opacity += ((isDayTime ? 0.4 : 0) - glowMat.opacity) * delta * 2;
    }

    // Fog also follows natural day/night cycle
    if (state.scene.fog) {
      const lerpFactor = (sunElevation + 1) / 2; // 0 to 1
      const dayFog = new THREE.Color('#adc7e6');
      const nightFog = new THREE.Color('#1c1c1e');
      const targetFogColor = nightFog.clone().lerp(dayFog, lerpFactor);
      (state.scene.fog as THREE.Fog).color.lerp(targetFogColor, delta * 2);
    }
  });

  return (
    <>
      <fog attach="fog" args={['#1c1c1e', 10, 100]} />

      <OrbitControls 
        target={[0, 2, -10]} 
        maxPolarAngle={Math.PI / 2 - 0.05} // Don't let them look under the ground
        minPolarAngle={Math.PI / 3} // Don't let them look straight down from top
        minAzimuthAngle={-Math.PI / 4} // Restrict looking too far left
        maxAzimuthAngle={Math.PI / 4} // Restrict looking too far right
        enableZoom={false}
        enablePan={false}
        dampingFactor={0.05}
      />

      <Sky 
        distance={450000} 
        sunPosition={sunPosition.current} 
        inclination={0} 
        azimuth={0.25} 
        turbidity={sunPosition.current.y < 20 ? 15 : 2} 
        rayleigh={sunPosition.current.y < 20 ? 0.5 : 1}
      />

      {/* Sun */}
      <mesh ref={sunRef} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[30, 32, 32]} />
        <meshBasicMaterial color="#ffeedd" transparent opacity={0} />
      </mesh>
      <mesh ref={sunGlowRef} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[45, 32, 32]} />
        <meshBasicMaterial color="#ffaa55" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Moon */}
      <mesh ref={moonRef} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[25, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
      </mesh>
      <mesh ref={moonGlowRef} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[35, 32, 32]} />
        <meshBasicMaterial color="#adc7e6" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Weak directional light from the moon */}
      {moonRef.current && moonRef.current.position.y > 0 && (
        <directionalLight position={moonPosition.current} intensity={0.1} color="#adc7e6" />
      )}

      <Stars 
        ref={starsRef}
        radius={150} 
        depth={50} 
        count={8000} 
        factor={7} 
        saturation={0} 
        fade 
        speed={1} 
      />

      <Clouds material={THREE.MeshLambertMaterial} limit={400} range={200}>
        <Cloud seed={1} bounds={[100, 10, 100]} color={sunPosition.current.y < 10 ? "#222" : "#eeddcc"} position={[0, 80, -50]} volume={30} opacity={0.6} speed={0.2} />
        <Cloud seed={2} bounds={[100, 10, 100]} color={sunPosition.current.y < 10 ? "#111" : "#ffffff"} position={[50, 90, 20]} volume={30} opacity={0.5} speed={0.1} />
        <Cloud seed={3} bounds={[100, 10, 100]} color={sunPosition.current.y < 10 ? "#0a0a0a" : "#ddccbb"} position={[-50, 75, 0]} volume={30} opacity={0.7} speed={0.3} />
      </Clouds>
      
      <ambientLight ref={ambientLightRef} intensity={0.4} />
      <directionalLight 
        ref={directionalLightRef} 
        position={[50, 50, 20]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0005}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      {selectedBuilding && (
        <group position={[selectedBuilding.position[0], 0, selectedBuilding.position[2]]}>
          {/* Main God Light */}
          <SpotLight
            position={[0, 50, 0]}
            angle={0.6}
            penumbra={0.8}
            attenuation={150}
            anglePower={4}
            intensity={300}
            distance={150}
            castShadow
            color={selectedBuilding.color}
            target={spotLightTargetRef.current}
          />
          {/* Ambient bounce to fill the shadows */}
          <pointLight 
            position={[0, 15, 0]}
            intensity={120}
            distance={60}
            color={selectedBuilding.color}
          />
          {/* Volumetric God Ray Cylinder */}
          <mesh position={[0, 25, 0]} castShadow={false} receiveShadow={false}>
            <cylinderGeometry args={[2, 10, 50, 32, 1, true]} />
            <meshBasicMaterial 
              color={selectedBuilding.color} 
              transparent 
              opacity={0.15} 
              blending={THREE.AdditiveBlending} 
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
      
      <primitive object={spotLightTargetRef.current} />

      {/* Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[250, 250, 64, 64]} />
        <meshPhysicalMaterial color="#1a202c" roughness={1} metalness={0.1} clearcoat={0.1} map={terrainTexture || undefined} />
      </mesh>
      
      {/* The River */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-40, -0.15, -20]} receiveShadow>
        <planeGeometry args={[20, 250]} />
        <meshPhysicalMaterial color="#001122" roughness={0.1} metalness={0.8} clearcoat={1.0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[-30, -0.16, -100]} receiveShadow>
        <planeGeometry args={[20, 150]} />
        <meshPhysicalMaterial color="#001122" roughness={0.1} metalness={0.8} clearcoat={1.0} />
      </mesh>

      {/* Hyper-realistic Dirt/Cobblestone Roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.19, -5]} receiveShadow>
        <planeGeometry args={[60, 4, 32, 2]} />
        <meshPhysicalMaterial color="#4e3b31" roughness={0.9} clearcoat={0.1} bumpMap={roadTexture || undefined} bumpScale={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[-15, -0.19, -15]} receiveShadow>
        <planeGeometry args={[60, 4, 32, 2]} />
        <meshPhysicalMaterial color="#4e3b31" roughness={0.9} clearcoat={0.1} bumpMap={roadTexture || undefined} bumpScale={0.15} />
      </mesh>
      
      {hills}
      {trees}
      {shelters}

      {/* Buildings */}
      {cityLoreData.map((building) => {
        const isSelected = selectedId === building.id;
        const isHovered = hoveredId === building.id;
        
        const props = {
          position: building.position,
          rotation: building.rotation,
          scale: building.scale,
          isSelected,
          isHovered,
          accentColor: building.color,
          noiseMap: terrainTexture || undefined,
          onHover: (hovered: boolean) => onHover(hovered ? building.id : null),
          onClick: () => onClick(building.id)
        };

        switch (building.type) {
          case 'temple': return <Temple key={building.id} {...props} />;
          case 'fort': return <Fort key={building.id} {...props} />;
          case 'house': return <House key={building.id} {...props} />;
          default: return null;
        }
      })}
    </>
  );
}
