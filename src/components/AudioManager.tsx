'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function AudioManager() {
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Use a free ambient epic sound
    const audio = new Audio();
    audio.src = 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3';
    audio.loop = true;
    audio.volume = 0.15;
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.addEventListener('canplaythrough', () => setIsLoaded(true));

    const handleIntroComplete = () => {
      audio.play().catch(() => {});
      setIsMuted(false);
    };
    window.addEventListener('introComplete', handleIntroComplete);

    return () => {
      audio.pause();
      audio.src = '';
      window.removeEventListener('introComplete', handleIntroComplete);
    };
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  }, [isMuted]);

  if (!isLoaded) return null;

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-6 right-6 z-[100] w-12 h-12 rounded-full border border-amber-500/30 bg-black/50 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-amber-500/60 hover:bg-black/70 group"
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
    >
      {isMuted ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(245,158,11,0.6)"
          strokeWidth="1.5"
          className="group-hover:stroke-amber-400 transition-colors"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(245,158,11,0.8)"
          strokeWidth="1.5"
          className="group-hover:stroke-amber-400 transition-colors"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
        </svg>
      )}

      {/* Pulsing ring when unmuted */}
      {!isMuted && (
        <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping" />
      )}
    </button>
  );
}
