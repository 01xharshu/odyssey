'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

// =============================================
// GLSL shaders for mythological wipe effects
// =============================================

// 1. FIRE DISSOLVE — for Troy transitions
const fireDissolveFS = `
  precision mediump float;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float n = fbm(uv * 6.0 + uTime * 0.5);
    float threshold = uProgress * 1.4 - 0.2;
    float edge = smoothstep(threshold - 0.1, threshold, n);
    float emberEdge = smoothstep(threshold - 0.15, threshold - 0.05, n) - edge;
    
    vec3 fireColor = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.8, 0.0), emberEdge * 2.0);
    vec3 color = mix(fireColor, vec3(0.0), edge);
    float alpha = 1.0 - edge + emberEdge * 1.5;
    
    gl_FragColor = vec4(color, alpha * smoothstep(0.0, 0.05, uProgress) * smoothstep(1.0, 0.95, uProgress));
  }
`;

// 2. OCEAN WAVES — for sea transitions
const oceanWaveFS = `
  precision mediump float;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    
    float wave1 = sin(uv.x * 8.0 + uTime * 2.0 + noise(uv * 3.0) * 3.0) * 0.08;
    float wave2 = sin(uv.x * 12.0 - uTime * 1.5 + noise(uv * 5.0) * 2.0) * 0.05;
    float waveY = uv.y + wave1 + wave2;
    
    float waterLine = 1.0 - uProgress * 1.3;
    float alpha = smoothstep(waterLine + 0.05, waterLine - 0.02, waveY);
    
    float foam = smoothstep(waterLine + 0.02, waterLine - 0.01, waveY) - smoothstep(waterLine - 0.01, waterLine - 0.04, waveY);
    
    vec3 deepWater = vec3(0.02, 0.08, 0.2);
    vec3 shallowWater = vec3(0.05, 0.15, 0.35);
    vec3 foamColor = vec3(0.6, 0.8, 0.9);
    
    float depth = smoothstep(waterLine - 0.3, waterLine, waveY);
    vec3 color = mix(deepWater, shallowWater, depth);
    color = mix(color, foamColor, foam * 1.5);
    
    gl_FragColor = vec4(color, alpha * smoothstep(0.0, 0.05, uProgress) * smoothstep(1.0, 0.95, uProgress));
  }
`;

// 3. GOLDEN DUST — for ethereal/divine transitions
const goldenDustFS = `
  precision mediump float;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    
    float n = noise(uv * 15.0 + uTime);
    float sparkle = pow(noise(uv * 50.0 + uTime * 3.0), 8.0) * 3.0;
    
    float radius = uProgress * 1.0;
    float ring = smoothstep(radius + 0.15, radius, dist) * smoothstep(radius - 0.3, radius - 0.05, dist);
    float fill = smoothstep(radius, radius - 0.05, dist);
    
    vec3 gold = vec3(0.96, 0.76, 0.15);
    vec3 darkGold = vec3(0.6, 0.4, 0.05);
    vec3 color = mix(darkGold, gold, ring + sparkle * fill);
    
    float alpha = (ring * 0.9 + fill * 0.6 + sparkle * fill * 0.3);
    alpha *= smoothstep(0.0, 0.08, uProgress) * smoothstep(1.0, 0.92, uProgress);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// 4. BLOOD STRINGS — for detective transitions
const bloodStringsFS = `
  precision mediump float;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    
    float lines = 0.0;
    for (float i = 0.0; i < 8.0; i++) {
      float y = hash(vec2(i, 0.0));
      float x = hash(vec2(0.0, i));
      float angle = hash(vec2(i, i)) * 3.14159;
      
      vec2 dir = vec2(cos(angle), sin(angle));
      vec2 start = vec2(x, y);
      
      vec2 toUV = uv - start;
      float proj = dot(toUV, dir);
      float perpDist = length(toUV - dir * proj);
      
      float lineLen = uProgress * 1.5;
      float onLine = step(0.0, proj) * step(proj, lineLen);
      float lineAlpha = smoothstep(0.003, 0.0, perpDist) * onLine;
      
      lines = max(lines, lineAlpha);
    }
    
    vec3 bloodRed = vec3(0.8, 0.0, 0.15);
    vec3 darkRed = vec3(0.3, 0.0, 0.05);
    vec3 color = mix(darkRed, bloodRed, lines);
    
    float alpha = lines * smoothstep(0.0, 0.05, uProgress) * smoothstep(1.0, 0.95, uProgress);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// 5. STONE CRUMBLE — for ruins transitions
const stoneCrumbleFS = `
  precision mediump float;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    
    // Column-like vertical bands
    float col = floor(uv.x * 12.0);
    float colOffset = hash(vec2(col, 0.0)) * 0.3;
    
    float fallProgress = uProgress * 1.4 - colOffset;
    float stoneY = 1.0 - clamp(fallProgress, 0.0, 1.0);
    
    float n = noise(uv * 20.0 + col) * 0.05;
    float alpha = smoothstep(stoneY + 0.02 + n, stoneY - 0.01, uv.y);
    
    // Stone texture
    float tex = noise(uv * 30.0) * 0.3 + 0.5;
    vec3 stoneColor = vec3(0.35, 0.32, 0.28) * tex;
    vec3 crackColor = vec3(0.15, 0.12, 0.08);
    float cracks = step(0.85, noise(uv * 40.0));
    vec3 color = mix(stoneColor, crackColor, cracks);
    
    alpha *= smoothstep(0.0, 0.05, uProgress) * smoothstep(1.0, 0.92, uProgress);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const VS = `
  precision mediump float;
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

// =============================================
// Shader Canvas Component
// =============================================

function ShaderCanvas({ 
  fragmentShader, 
  progress 
}: { 
  fragmentShader: string; 
  progress: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTime = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const progressRef = useRef(progress);

  progressRef.current = progress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      premultipliedAlpha: false,
      antialias: false 
    });
    if (!gl) return;
    glRef.current = gl;

    // Create shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VS);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    programRef.current = program;

    // Full screen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    startTime.current = Date.now();

    const render = () => {
      if (!glRef.current || !programRef.current) return;

      const p = progressRef.current;
      // Only render when there's something to show
      if (p < 0.01 || p > 0.99) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(programRef.current);

      const time = (Date.now() - startTime.current) / 1000;
      gl.uniform1f(gl.getUniformLocation(programRef.current, 'uProgress'), p);
      gl.uniform1f(gl.getUniformLocation(programRef.current, 'uTime'), time);
      gl.uniform2f(gl.getUniformLocation(programRef.current, 'uResolution'), canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [fragmentShader]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 50 }}
    />
  );
}

// =============================================
// The Transition Component
// =============================================

export type TransitionType = 'fire' | 'ocean' | 'golden' | 'blood' | 'stone';

interface MythTransitionProps {
  type: TransitionType;
  chapter: string;
  title: string;
  subtitle?: string;
}

const shaderMap: Record<TransitionType, string> = {
  fire: fireDissolveFS,
  ocean: oceanWaveFS,
  golden: goldenDustFS,
  blood: bloodStringsFS,
  stone: stoneCrumbleFS,
};

const colorMap: Record<TransitionType, string> = {
  fire: '#ff6600',
  ocean: '#0088cc',
  golden: '#f59e0b',
  blood: '#ff0044',
  stone: '#8b8070',
};

export default function MythTransition({ type, chapter, title, subtitle }: MythTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Map scroll progress to shader progress
  const shaderProgress = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0, 0.5, 1]);

  // Text animations — text appears when shader is at peak
  const textOpacity = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.75], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.75], [30, 0, 0, -30]);
  const textScale = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.75], [0.9, 1, 1, 1.05]);

  // Track shader progress as a number for canvas
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const unsub = shaderProgress.on('change', (v) => setProgress(v));
    return unsub;
  }, [shaderProgress]);

  const accentColor = colorMap[type];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[60vh] bg-[#1c1c1e] z-30"
    >
      {/* WebGL Shader Canvas */}
      <ShaderCanvas fragmentShader={shaderMap[type]} progress={progress} />

      {/* Chapter + Title text overlay */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-none">
        <motion.div
          style={{ opacity: textOpacity, y: textY, scale: textScale }}
          className="relative z-[60] text-center px-8"
        >
          <span
            className="tracking-[0.5em] uppercase text-xs md:text-sm font-sans mb-4 block"
            style={{ color: accentColor, opacity: 0.7 }}
          >
            {chapter}
          </span>
          <h2
            className="text-3xl md:text-5xl font-light tracking-widest drop-shadow-lg"
            style={{
              fontFamily: "'Cinzel', serif",
              color: 'white',
              textShadow: `0 0 40px ${accentColor}44`,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="mt-4 text-gray-400 text-sm md:text-base tracking-wide max-w-lg mx-auto font-light leading-relaxed"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
            >
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
