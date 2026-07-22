'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const scrollVertexShader = `
uniform float uProgress;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // The scroll rolls up from the bottom to the top.
  // Y goes from -height/2 to +height/2
  
  // 0 = fully rolled, 1 = fully unrolled
  float unrollProgress = uProgress;
  
  float rollRadius = 0.5;
  // Calculate how far down the paper is
  float yDist = (5.0 - pos.y); // Assuming height is 10, y goes -5 to 5. Top is 5.
  
  // The unrolled length
  float unrolledLength = unrollProgress * 10.0;
  
  if (yDist > unrolledLength) {
    // This part is rolled up!
    float rollAngle = (yDist - unrolledLength) / rollRadius;
    
    // Calculate rolled position relative to the current unrolled bottom
    float currentBottomY = 5.0 - unrolledLength;
    
    pos.y = currentBottomY + sin(rollAngle) * rollRadius;
    pos.z = pos.z + cos(rollAngle) * rollRadius - rollRadius;
  }
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const scrollFragmentShader = `
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);
  
  // Darken the edges slightly for an aged look
  float edgeDarken = 1.0 - (pow(vUv.x - 0.5, 2.0) * 2.0 + pow(vUv.y - 0.5, 2.0) * 2.0);
  edgeDarken = clamp(edgeDarken + 0.5, 0.0, 1.0);
  
  // Warm papyrus color #e6d5b8
  vec3 papyrusColor = vec3(0.9, 0.83, 0.72);
  
  gl_FragColor = vec4(papyrusColor * texColor.rgb * edgeDarken, 1.0);
}
`;

interface WebGLScrollProps {
  title: string;
  excerpt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WebGLScroll({ title, excerpt, isOpen, onClose }: WebGLScrollProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const textOpacityRef = useRef(0);

  // Generate a noisy papyrus texture
  const noiseTexture = React.useMemo(() => {
    if (typeof window === 'undefined') return new THREE.Texture();
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e6d5b8';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 20000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      const targetProgress = isOpen ? 1 : 0.05; // 0.05 so it's a small rolled tube when closed
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uProgress.value,
        targetProgress,
        4,
        delta
      );
      
      // Update text opacity
      const p = materialRef.current.uniforms.uProgress.value;
      textOpacityRef.current = THREE.MathUtils.clamp((p - 0.5) * 2, 0, 1);
    }
    
    if (groupRef.current) {
      // Stick to the camera
      const dir = new THREE.Vector3();
      state.camera.getWorldDirection(dir);
      
      const targetPos = state.camera.position.clone().add(dir.multiplyScalar(6));
      // Bob slightly
      targetPos.y += Math.sin(state.clock.elapsedTime) * 0.1;
      
      groupRef.current.position.lerp(targetPos, 0.1);
      groupRef.current.quaternion.slerp(state.camera.quaternion, 0.1);
    }
  });

  if (!isOpen && materialRef.current?.uniforms.uProgress.value < 0.1) {
    return null; // Unmount when fully closed
  }

  return (
    <group ref={groupRef} position={[0, 0, 8]} rotation={[-0.1, 0, 0]}>
      {/* The Scroll Mesh */}
      <mesh castShadow receiveShadow>
        <planeGeometry args={[6, 10, 64, 128]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={scrollVertexShader}
          fragmentShader={scrollFragmentShader}
          uniforms={{
            uProgress: { value: 0.05 },
            uTexture: { value: noiseTexture }
          }}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* The Finials (Wooden rods at the top) */}
      <mesh position={[0, 5.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 7, 16]} />
        <meshPhysicalMaterial color="#4a3219" roughness={0.8} />
      </mesh>

      {/* Render 3D Text directly onto the scroll */}
      <group position={[0, 0, 0.1]}>
        <Text
          position={[0, 3, 0]}
          fontSize={0.6}
          color="#3e2723"
          font="https://fonts.gstatic.com/s/cinzel/v19/8vIJ7ww63mVu7gtzRE1n.woff"
          anchorX="center"
          anchorY="middle"
          fillOpacity={textOpacityRef.current}
        >
          {title}
        </Text>
        
        <mesh position={[0, 2.2, 0]}>
          <planeGeometry args={[4, 0.02]} />
          <meshBasicMaterial color="#a67c52" transparent opacity={textOpacityRef.current} />
        </mesh>

        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#4e342e"
          maxWidth={4.5}
          lineHeight={1.5}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          fillOpacity={textOpacityRef.current}
        >
          {excerpt}
        </Text>

        {/* Close Button hit area */}
        {isOpen && (
          <group position={[0, -3.5, 0]} onClick={onClose} onPointerOver={() => document.body.style.cursor='pointer'} onPointerOut={() => document.body.style.cursor='auto'}>
            <Text
              fontSize={0.25}
              color="#795548"
              letterSpacing={0.2}
            >
              [ CLOSE SCROLL ]
            </Text>
            <mesh visible={false}>
              <planeGeometry args={[3, 1]} />
              <meshBasicMaterial />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
