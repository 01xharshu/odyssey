'use client';

import React, { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export default function Epilogue() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Reveal animations as user scrolls into the section
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 0.8], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [60, 0]);
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.3], [0, 80]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[300vh] bg-[#1c1c1e] z-10"
    >
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-[#1c1c1e] pointer-events-none" />

        <motion.div
          className="relative z-10 text-center max-w-2xl px-8"
          style={{ opacity, y }}
        >
        {/* Ornamental line */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <motion.div
            className="h-px bg-gradient-to-r from-transparent to-amber-500/40"
            style={{ width: lineWidth }}
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="opacity-40"
          >
            <path
              d="M12 2L14.5 9H22L16 13.5L18 21L12 17L6 21L8 13.5L2 9H9.5L12 2Z"
              stroke="#f59e0b"
              strokeWidth="1"
            />
          </svg>
          <motion.div
            className="h-px bg-gradient-to-l from-transparent to-amber-500/40"
            style={{ width: lineWidth }}
          />
        </div>

        {/* Quote */}
        <blockquote
          className="text-2xl md:text-4xl font-light leading-relaxed text-gray-200/90 mb-8 italic"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          &ldquo;Tell me, O Muse, of that ingenious hero who travelled far and wide&hellip;&rdquo;
        </blockquote>

        <p
          className="text-sm tracking-[0.3em] uppercase text-amber-500/50 font-sans"
        >
          — Homer, The Odyssey, Book I
        </p>

        {/* Bottom ornament */}
        <div
          className="mt-16 flex flex-col items-center gap-4 opacity-40"
        >
          <div className="text-[10px] tracking-[0.5em] uppercase text-gray-500 font-sans">
            An Interactive Experience
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-amber-500/30 to-transparent" />
          <div className="text-[10px] tracking-[0.3em] uppercase text-gray-600 font-sans">
            ΩΔΥ΢΢ΕΙΑ
          </div>
        </div>
      </motion.div>
      </div>
    </section>
  );
}
