'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, SpotLight, useDepthBuffer, Clouds, Cloud, Stars } from '@react-three/drei';
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
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

  const trees = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => {
      let x = (Math.random() - 0.5) * 150;
      let z = (Math.random() - 0.5) * 150;
      if (Math.abs(x) < 25 && Math.abs(z) < 25) {
        x += 30 * Math.sign(x);
        z += 30 * Math.sign(z);
      }
      const scale = Math.random() * 0.4 + 0.4;
      return (
        <group key={`tree-${i}`} position={[x, 0, z]} scale={scale}>
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.4, 2, 5]} />
            <meshStandardMaterial color="#3e2723" roughness={1} />
          </mesh>
          <mesh position={[0, 3, 0]} castShadow receiveShadow>
            <coneGeometry args={[1.5, 3, 7]} />
            <meshStandardMaterial color="#1b5e20" roughness={1} />
          </mesh>
        </group>
      );
    });
  }, []);
  
  // Simple scattered huts
  const shelters = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      let x = (Math.random() - 0.5) * 180;
      let z = (Math.random() - 0.5) * 180;
      if (Math.abs(x) < 30 && Math.abs(z) < 30) {
        x += 40 * Math.sign(x);
        z += 40 * Math.sign(z);
      }
      return (
        <group key={`hut-${i}`} position={[x, 0, z]} rotation={[0, Math.random() * Math.PI, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 1.6, 2.5]} />
            <meshStandardMaterial color="#5c4033" roughness={1} />
          </mesh>
          <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
            <coneGeometry args={[2, 1, 4]} />
            <meshStandardMaterial color="#3e2723" roughness={1} />
          </mesh>
        </group>
      );
    });
  }, []);

  const hills = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      const scaleX = Math.random() * 20 + 10;
      const scaleY = Math.random() * 5 + 2;
      const scaleZ = Math.random() * 20 + 10;
      return (
        <mesh key={`hill-${i}`} position={[x, -2, z]} scale={[scaleX, scaleY, scaleZ]} receiveShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#1a202c" roughness={1} metalness={0.1} map={terrainTexture || undefined} />
        </mesh>
      );
    });
  }, [terrainTexture]);
  
  const lastTimeRef = useRef(-1);

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
    
    const isSelectedNight = selectedId !== null;
    
    const targetSunY = isSelectedNight ? -50 : sunElevation * 100;
    sunPosition.current.y += (targetSunY - sunPosition.current.y) * delta * 2;
    sunPosition.current.x = Math.cos(time * cycleSpeed) * 100;
    
    // Moon orbits opposite
    moonPosition.current.set(-sunPosition.current.x, -sunPosition.current.y, -sunPosition.current.z);

    if (ambientLightRef.current) {
      const naturalIntensity = Math.max(0.05, sunElevation * 0.6);
      const targetIntensity = isSelectedNight ? 0.1 : naturalIntensity;
      ambientLightRef.current.intensity += (targetIntensity - ambientLightRef.current.intensity) * delta * 2;
    }
    
    if (directionalLightRef.current) {
      const naturalIntensity = Math.max(0.0, sunElevation * 1.5);
      const targetIntensity = isSelectedNight ? 0.05 : naturalIntensity;
      directionalLightRef.current.intensity += (targetIntensity - directionalLightRef.current.intensity) * delta * 2;
      
      directionalLightRef.current.position.copy(sunPosition.current);
    }

    if (selectedBuilding) {
      spotLightTargetRef.current.position.set(...selectedBuilding.position);
      spotLightTargetRef.current.updateMatrixWorld();
    }

    if (starsRef.current) {
      const isNightTime = sunPosition.current.y < 5 || isSelectedNight;
      const targetOpacity = isNightTime ? 1 : 0;
      const mat = starsRef.current.material as THREE.PointsMaterial;
      mat.opacity += (targetOpacity - mat.opacity) * delta * 1.5;
    }
    
    if (moonRef.current) {
      moonRef.current.position.copy(moonPosition.current);
      const isNightTime = sunPosition.current.y < 5 || isSelectedNight;
      const mat = moonRef.current.material as THREE.MeshStandardMaterial;
      const targetOpacity = isNightTime ? 1 : 0;
      mat.opacity += (targetOpacity - mat.opacity) * delta * 2;
    }
  });

  return (
    <>
      <EffectComposer>
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <fog attach="fog" args={['#030303', 20, 150]} />

      <Sky 
        distance={450000} 
        sunPosition={sunPosition.current} 
        inclination={0} 
        azimuth={0.25} 
        turbidity={sunPosition.current.y < 20 ? 15 : 2} 
        rayleigh={sunPosition.current.y < 20 ? 0.5 : 1}
      />

      {/* Moon */}
      <mesh ref={moonRef} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0} />
      </mesh>
      {/* Weak directional light from the moon */}
      {moonRef.current && moonRef.current.position.y > 0 && (
        <directionalLight position={moonPosition.current} intensity={0.1} color="#adc7e6" />
      )}

      <Stars 
        ref={starsRef}
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
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
        intensity={1.0} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
      />

      {selectedBuilding && (
        <>
          <SpotLight
            position={[selectedBuilding.position[0], 40, selectedBuilding.position[2]]}
            angle={0.2}
            penumbra={0.5}
            attenuation={100}
            anglePower={6}
            intensity={250}
            distance={150}
            castShadow
            color={selectedBuilding.color}
            target={spotLightTargetRef.current}
            depthBuffer={depthBuffer}
          />
          <pointLight 
            position={[selectedBuilding.position[0], selectedBuilding.position[1] + 10, selectedBuilding.position[2]]}
            intensity={80}
            distance={40}
            color={selectedBuilding.color}
          />
        </>
      )}
      
      <primitive object={spotLightTargetRef.current} />

      {/* Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[250, 250, 64, 64]} />
        <meshStandardMaterial color="#1a202c" roughness={1} metalness={0.1} map={terrainTexture || undefined} />
      </mesh>
      
      {/* The River */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-40, -0.15, -20]} receiveShadow>
        <planeGeometry args={[20, 250]} />
        <meshStandardMaterial color="#001122" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 6]} position={[-30, -0.16, -100]} receiveShadow>
        <planeGeometry args={[20, 150]} />
        <meshStandardMaterial color="#001122" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Dirt Roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.19, -5]} receiveShadow>
        <planeGeometry args={[60, 4]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[-15, -0.19, -15]} receiveShadow>
        <planeGeometry args={[60, 4]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      
      {hills}
      {trees}
      {shelters}

      {/* Buildings */}
      {cityLoreData.map((building) => {
        const isSelected = selectedId === building.id;
        const isHovered = hoveredId === building.id;
        
        const props = {
          key: building.id,
          position: building.position,
          rotation: building.rotation,
          scale: building.scale,
          isSelected,
          isHovered,
          accentColor: building.color,
          onHover: (hovered: boolean) => onHover(hovered ? building.id : null),
          onClick: () => onClick(building.id)
        };

        switch (building.type) {
          case 'temple': return <Temple {...props} />;
          case 'fort': return <Fort {...props} />;
          case 'house': return <House {...props} />;
          default: return null;
        }
      })}
    </>
  );
}
