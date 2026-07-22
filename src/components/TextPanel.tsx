'use client';

import React from 'react';
import type { OdysseyCharacter } from '@/types';

interface TextPanelProps {
  character: OdysseyCharacter;
  activeIndex: number;
}

export default function TextPanel({ character, activeIndex }: TextPanelProps) {
  const nameLetters = character.name.split('');

  return (
    <div className="relative z-10 w-full md:w-[45%] h-1/2 md:h-full flex items-center justify-center p-8 md:p-16 lg:p-24">
      <div key={activeIndex} className="max-w-lg">
        {/* Character index ornament */}
        <div className="flex items-center gap-3 mb-6 opacity-40">
          <div className="w-8 h-px bg-amber-500/50" />
          <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-amber-500/60">
            {String(activeIndex + 1).padStart(2, '0')} / 05
          </span>
          <div className="w-8 h-px bg-amber-500/50" />
        </div>

        {/* Role */}
        <h3
          className="tracking-[0.3em] uppercase text-sm md:text-base mb-4 font-sans font-semibold"
          style={{
            color: character.accentHex,
            animation: 'textSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            animationDelay: '0.1s',
            opacity: 0,
          }}
        >
          {character.role}
        </h3>

        {/* Name — letter-by-letter stagger */}
        <h1 className="text-6xl md:text-8xl font-light mb-6 tracking-wide">
          {nameLetters.map((letter, i) => (
            <span
              key={`${activeIndex}-${i}`}
              className="inline-block"
              style={{
                background: `linear-gradient(135deg, #ffffff 0%, ${character.accentHex}88 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'letterReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                animationDelay: `${0.15 + i * 0.04}s`,
                opacity: 0,
                transform: 'translateY(40px) rotateX(90deg)',
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </h1>

        {/* Animated divider */}
        <div
          className="h-[2px] mb-8 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${character.accentHex}, transparent)`,
            animation: 'dividerExpand 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            animationDelay: '0.3s',
            width: 0,
          }}
        />

        {/* Description with fade up */}
        <p
          className="text-gray-300/90 text-lg md:text-xl leading-relaxed font-light"
          style={{
            animation: 'textSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            animationDelay: '0.5s',
            opacity: 0,
          }}
        >
          {character.description}
        </p>

        {/* Greek ornament footer */}
        <div
          className="mt-10 flex items-center gap-2 opacity-0"
          style={{
            animation: 'textSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            animationDelay: '0.7s',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="opacity-30"
          >
            <path
              d="M12 2L14.5 9H22L16 13.5L18 21L12 17L6 21L8 13.5L2 9H9.5L12 2Z"
              stroke={character.accentHex}
              strokeWidth="1"
              fill="none"
            />
          </svg>
          <div
            className="h-px flex-1 max-w-[100px]"
            style={{
              background: `linear-gradient(90deg, ${character.accentHex}40, transparent)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
