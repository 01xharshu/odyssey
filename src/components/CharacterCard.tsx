'use client';

import React from 'react';
import type { OdysseyCharacter } from '@/types';

interface CharacterCardProps {
  character: OdysseyCharacter;
  isActive: boolean;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
  depthFactor: number;
  onClick: () => void;
}

export default function CharacterCard({
  character,
  isActive,
  x,
  y,
  scale,
  opacity,
  zIndex,
  depthFactor,
  onClick,
}: CharacterCardProps) {
  return (
    <div
      onClick={onClick}
      className="absolute top-0 left-0 cursor-pointer"
      style={{
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
        zIndex,
        opacity,
        filter: `brightness(${0.6 + depthFactor * 0.6})`,
      }}
    >
      {/* Outer glow ring */}
      {isActive && (
        <div
          className="absolute inset-[-6px] rounded-full animate-pulse-glow"
          style={{
            background: `radial-gradient(circle, ${character.accentHex}20 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Card container */}
      <div
        className={`
          w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden relative group
          border-2 transition-all duration-500
          ${isActive ? 'border-amber-500' : 'border-white/10'}
        `}
        style={{
          boxShadow: isActive
            ? `inset 0 0 20px rgba(0,0,0,0.8), 0 0 40px ${character.accentHex}40, 0 0 80px ${character.accentHex}20`
            : 'inset 0 0 20px rgba(0,0,0,0.8)',
        }}
      >
        {/* Portrait image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.portrait}
          alt={character.name}
          className="w-full h-full object-cover transition-all duration-500"
          style={{
            filter: isActive ? 'grayscale(0%) saturate(1.2)' : 'grayscale(40%) saturate(0.8)',
            transform: isActive ? 'scale(1.1)' : 'scale(1.0)',
          }}
          loading="lazy"
        />

        {/* Glass overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />

        {/* Hover shimmer */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${character.accentHex}15 25%, transparent 50%)`,
            animation: 'spin 3s linear infinite',
          }}
        />

        {/* Name label (shows on hover/active) */}
        <div
          className="absolute bottom-0 left-0 right-0 text-center pb-3 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isActive || depthFactor > 0.7 ? 1 : 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
          }}
        >
          <span
            className="text-[10px] tracking-[0.2em] uppercase font-sans font-semibold"
            style={{ color: character.accentHex }}
          >
            {character.name}
          </span>
        </div>
      </div>
    </div>
  );
}
