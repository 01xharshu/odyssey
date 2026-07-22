'use client';

import React, { useState, useEffect } from 'react';

export default function Epilogue() {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={observerRef}
      className="relative min-h-screen bg-[#030303] flex items-center justify-center overflow-hidden"
    >
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

      <div
        className="relative z-10 text-center max-w-2xl px-8 transition-all duration-[2000ms]"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
        }}
      >
        {/* Ornamental line */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div
            className="h-px bg-gradient-to-r from-transparent to-amber-500/40 transition-all duration-[1500ms]"
            style={{ width: isVisible ? '80px' : '0px', transitionDelay: '500ms' }}
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
          <div
            className="h-px bg-gradient-to-l from-transparent to-amber-500/40 transition-all duration-[1500ms]"
            style={{ width: isVisible ? '80px' : '0px', transitionDelay: '500ms' }}
          />
        </div>

        {/* Quote */}
        <blockquote
          className="text-2xl md:text-4xl font-light leading-relaxed text-gray-200/90 mb-8 italic transition-all duration-[1500ms]"
          style={{
            fontFamily: "'Cinzel', serif",
            opacity: isVisible ? 1 : 0,
            transitionDelay: '800ms',
          }}
        >
          &ldquo;Tell me, O Muse, of that ingenious hero who travelled far and wide&hellip;&rdquo;
        </blockquote>

        <p
          className="text-sm tracking-[0.3em] uppercase text-amber-500/50 font-sans transition-all duration-[1200ms]"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDelay: '1200ms',
          }}
        >
          — Homer, The Odyssey, Book I
        </p>

        {/* Bottom ornament */}
        <div
          className="mt-16 flex flex-col items-center gap-4 transition-all duration-[1500ms]"
          style={{
            opacity: isVisible ? 0.4 : 0,
            transitionDelay: '1600ms',
          }}
        >
          <div className="text-[10px] tracking-[0.5em] uppercase text-gray-500 font-sans">
            An Interactive Experience
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-amber-500/30 to-transparent" />
          <div className="text-[10px] tracking-[0.3em] uppercase text-gray-600 font-sans">
            ΩΔΥ΢΢ΕΙΑ
          </div>
        </div>
      </div>
    </section>
  );
}
