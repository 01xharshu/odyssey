'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { Howl } from 'howler';
import { useScroll, useTransform, motion } from 'framer-motion';

export default function CinematicIntro() {
  const [phase, setPhase] = useState<'scratching' | 'revealed'>('scratching');
  const [scratchPercent, setScratchPercent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const mousePos = useMousePosition();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const fadeOutOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scaleOut = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  const parallaxX = mousePos.x * 20;
  const parallaxY = mousePos.y * 20;

  const hoverSound = useRef<Howl | null>(null);
  const scratchSound = useRef<Howl | null>(null);

  useEffect(() => {
    hoverSound.current = new Howl({
      src: ['https://cdn.pixabay.com/download/audio/2022/03/15/audio_73bb6d6e27.mp3?filename=whoosh-6316.mp3'],
      volume: 0.1,
    });
    scratchSound.current = new Howl({
      src: ['https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=deep-whoosh-1-88484.mp3'],
      volume: 0.3,
    });
  }, []);

  // Lock scroll until revealed
  useEffect(() => {
    if (phase === 'scratching') {
      document.body.style.overflow = 'hidden';
      const preventDefault = (e: TouchEvent) => e.preventDefault();
      document.addEventListener('touchmove', preventDefault, { passive: false });
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('touchmove', preventDefault);
      };
    }
  }, [phase]);

  // Setup Scratch Canvas
  useEffect(() => {
    const canvas = scratchCanvasRef.current;
    if (!canvas || phase !== 'scratching') return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Create a hyper-realistic sand pattern off-screen
    const patCanvas = document.createElement('canvas');
    patCanvas.width = 256;
    patCanvas.height = 256;
    const patCtx = patCanvas.getContext('2d')!;
    
    // Base sand color
    patCtx.fillStyle = '#c39c63';
    patCtx.fillRect(0, 0, 256, 256);
    
    // Generate fine noise for grains
    const imgData = patCtx.createImageData(256, 256);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 40;
      imgData.data[i] = 195 + noise;     // R
      imgData.data[i+1] = 156 + noise;   // G
      imgData.data[i+2] = 99 + noise;    // B
      imgData.data[i+3] = 255;           // A
    }
    patCtx.putImageData(imgData, 0, 0);

    // Add some larger pebbles/grains
    for(let i=0; i<1000; i++) {
      patCtx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
      patCtx.beginPath();
      patCtx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 1.5, 0, Math.PI * 2);
      patCtx.fill();
    }

    const sandPattern = ctx.createPattern(patCanvas, 'repeat')!;

    const drawSand = (w: number, h: number) => {
      // Add lighting gradient over the pattern
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#e6c896');
      grad.addColorStop(1, '#a67b45');
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = sandPattern;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'source-over';
      ctx.font = '24px "Cinzel", serif';
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; // Shadow for text
      ctx.textAlign = 'center';
      ctx.fillText('WIPE AWAY THE SAND TO REVEAL THE MYTH', w / 2 + 2, h / 2 + 2);
      ctx.fillStyle = 'rgba(255, 230, 180, 0.8)';
      ctx.fillText('WIPE AWAY THE SAND TO REVEAL THE MYTH', w / 2, h / 2);
    };

    drawSand(width, height);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      drawSand(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [phase]);

  // Handle Scratching
  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
    if (scratchSound.current && !scratchSound.current.playing()) {
      scratchSound.current.play();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
    checkScratchPercent();
  };

  const scratch = (x: number, y: number) => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Adjust for scroll offset if any (though overflow should be hidden)
    const rect = canvas.getBoundingClientRect();
    const clientX = x - rect.left;
    const clientY = y - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    
    // Soft radial brush for realistic sand displacement
    const brushRadius = 100;
    const radGrad = ctx.createRadialGradient(clientX, clientY, 0, clientX, clientY, brushRadius);
    radGrad.addColorStop(0, 'rgba(0,0,0,1)');
    radGrad.addColorStop(0.5, 'rgba(0,0,0,0.8)');
    radGrad.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(clientX, clientY, brushRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add organic scatter grains falling off the brush
    for (let i = 0; i < 8; i++) {
      const offsetX = (Math.random() - 0.5) * 80;
      const offsetY = (Math.random() - 0.5) * 80;
      const size = Math.random() * 20 + 10;
      const scatterGrad = ctx.createRadialGradient(clientX + offsetX, clientY + offsetY, 0, clientX + offsetX, clientY + offsetY, size);
      scatterGrad.addColorStop(0, 'rgba(0,0,0,0.9)');
      scatterGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = scatterGrad;
      ctx.beginPath();
      ctx.arc(clientX + offsetX, clientY + offsetY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const checkScratchPercent = useCallback(() => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    // Check every 4th pixel (stride by 16 to save performance)
    for (let i = 0; i < pixels.length; i += 16) {
      if (pixels[i + 3] < 128) {
        transparent++;
      }
    }
    
    const total = pixels.length / 16;
    const percent = (transparent / total) * 100;
    setScratchPercent(percent);

    if (percent > 25) { // If 25% is wiped away, reveal the rest
      setPhase('revealed');
      window.dispatchEvent(new Event('introComplete'));
    }
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-[#1c1c1e] z-50">
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Film Grain Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-2000 z-40"
        style={{
          opacity: 0.3, // Keep grain always on
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Background Interactive Particles (CSS based for intro) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: phase === 'revealed' ? 0.3 : 0,
          transform: `translate(${parallaxX * -0.5}px, ${parallaxY * -0.5}px)`,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-500 animate-pulse"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: (Math.random() * 3 + 2) + 's',
              animationDelay: (Math.random() * 2) + 's',
            }}
          />
        ))}
      </div>

      {/* Title with Parallax and Hover Glow */}
      <motion.div 
        className="relative z-10 text-center group transition-all duration-[2000ms]"
        style={{
          transform: `translate(${parallaxX}px, ${parallaxY}px)`,
          opacity: phase === 'revealed' ? fadeOutOpacity : 0, // Hidden until scratched, then fades on scroll
          scale: scaleOut,
          filter: phase === 'scratching' ? 'blur(20px)' : 'blur(0px)',
        }}
      >
        <p className="text-xs tracking-[0.6em] uppercase text-amber-500/50 font-sans mb-4">
          Homer&apos;s Epic
        </p>

        <h1
          className="text-7xl md:text-9xl font-light tracking-[0.2em] transition-all duration-1000 group-hover:tracking-[0.3em] group-hover:text-shadow-[0_0_30px_rgba(245,158,11,0.8)] cursor-default"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            background: 'linear-gradient(135deg, #fff 0%, #f59e0b 50%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ODYSSEY
        </h1>

        <p className="mt-6 text-sm md:text-base tracking-[0.3em] uppercase text-gray-400/70 font-sans group-hover:text-amber-500/70 transition-colors">
          An Interactive Journey Through Myth
        </p>
        
        {/* Scroll Indicator */}
        <div className="mt-16 flex flex-col items-center animate-bounce opacity-50">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2">Scroll Down</p>
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>

      {/* Scratch Canvas Overlay */}
      <canvas
        ref={scratchCanvasRef}
        className={`absolute inset-0 z-30 cursor-crosshair touch-none transition-opacity duration-1000 ${phase !== 'scratching' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      </div>
    </section>
  );
}
