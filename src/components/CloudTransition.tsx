'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

const cloudFragmentShader = `
  precision highp float;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor;

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
    
    // Zoom effect based on progress (penetration)
    float zoom = 1.0;
    if (uProgress > 0.6) {
      zoom = 1.0 - ((uProgress - 0.6) * 1.5); // zoom in drastically
    }
    vec2 centeredUv = (uv - 0.5) * zoom + 0.5;
    
    float n1 = fbm(centeredUv * 3.0 - vec2(0.0, uTime * 0.1));
    float n2 = fbm(centeredUv * 6.0 + vec2(uTime * 0.05, uTime * 0.06));
    float n3 = fbm(centeredUv * 12.0 - vec2(uTime * 0.02, 0.0));
    
    float cloudDensity = n1 * 0.5 + n2 * 0.35 + n3 * 0.15;
    
    float alpha = 0.0;
    
    if (uProgress < 0.25) {
      // Fade in clouds
      float p = uProgress / 0.25;
      alpha = smoothstep(1.0 - p, 1.2 - p, cloudDensity);
    } else if (uProgress >= 0.25 && uProgress <= 0.75) {
      // Full clouds phase
      float p = 1.0;
      if (uProgress < 0.4) {
         p = (uProgress - 0.25) / 0.15;
      } else if (uProgress > 0.6) {
         p = (0.75 - uProgress) / 0.15;
      }
      float baseA = smoothstep(0.1, 0.8, cloudDensity);
      alpha = mix(baseA, 1.0, p);
    } else {
      // Penetrate and fade out
      float p = (uProgress - 0.75) / 0.25;
      alpha = smoothstep(p - 0.1, p + 0.2, cloudDensity);
    }
    
    // Ethereal/god-like volumetric cloud coloring
    vec3 shadowColor = mix(vec3(0.6, 0.7, 0.8), uColor, 0.3); // Bright airy shadows
    vec3 midColor = mix(vec3(0.9, 0.95, 1.0), uColor, 0.6); // Luminous midtones
    vec3 highlightColor = vec3(1.0, 1.0, 1.0); // Pure white/god-ray highlights
    
    vec3 col = mix(shadowColor, midColor, smoothstep(0.1, 0.6, cloudDensity));
    col = mix(col, highlightColor, smoothstep(0.6, 0.95, cloudDensity));
    
    // Add a slight bloom/glow effect to the alpha for ethereal feel
    alpha = clamp(alpha * 1.1, 0.0, 1.0);
    
    gl_FragColor = vec4(col, alpha);
  }
`;

const vertexShader = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

interface CloudTransitionProps {
  progress: MotionValue<number>;
  chapter: string;
  title: string;
  color?: string; // hex like "#ff0000"
}

// Convert hex to rgb float array [r,g,b]
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [0.1, 0.1, 0.1];
}

export default function CloudTransition({ progress, chapter, title, color = "#222222" }: CloudTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number>(0);
  const startTime = useRef(Date.now());
  const rgbColor = hexToRgb(color);

  // Text animations
  const textOpacity = useTransform(progress, [0.35, 0.45, 0.55, 0.65], [0, 1, 1, 0]);
  const textScale = useTransform(progress, [0.35, 0.65], [0.95, 1.05]);
  const zIndex = useTransform(progress, (v) => v > 0 && v < 1 ? 100 : -1);
  const pointerEvents = useTransform(progress, (v) => v > 0 && v < 1 ? 'auto' : 'none');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    glRef.current = gl;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, cloudFragmentShader);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    programRef.current = program;

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
      const p = progress.get();
      
      if (p <= 0 || p >= 1) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!programRef.current) return;
      gl.useProgram(programRef.current);
      const program = programRef.current;

      const time = (Date.now() - startTime.current) / 1000;
      gl.uniform1f(gl.getUniformLocation(program, 'uProgress'), p);
      gl.uniform1f(gl.getUniformLocation(program, 'uTime'), time);
      gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), canvas.width, canvas.height);
      gl.uniform3f(gl.getUniformLocation(program, 'uColor'), rgbColor[0], rgbColor[1], rgbColor[2]);

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
  }, [progress, rgbColor]);

  return (
    <motion.div 
      className="fixed inset-0 w-full h-full"
      style={{ zIndex, pointerEvents }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none">
        <motion.div style={{ opacity: textOpacity, scale: textScale }} className="text-center">
          <span className="tracking-[0.5em] uppercase text-xs md:text-sm font-sans mb-4 block text-amber-500/70">
            {chapter}
          </span>
          <h2 className="text-4xl md:text-6xl font-light tracking-widest drop-shadow-2xl" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
            {title}
          </h2>
        </motion.div>
      </div>
    </motion.div>
  );
}
