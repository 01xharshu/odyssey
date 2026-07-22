'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function AudioManager() {
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isCityLocked, setIsCityLocked] = useState(false);

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
    
    const handleCityLocked = () => {
      setIsCityLocked(true);
    };

    window.addEventListener('introComplete', handleIntroComplete);
    window.addEventListener('cityLocked', handleCityLocked);

    return () => {
      audio.pause();
      audio.src = '';
      window.removeEventListener('introComplete', handleIntroComplete);
      window.removeEventListener('cityLocked', handleCityLocked);
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
      className={`fixed bottom-6 right-6 z-[100] w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer transition-all duration-700 hover:border-white/40 hover:bg-white/20 hover:scale-110 group opacity-100`}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
    >
      {isMuted ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.5"
          className="group-hover:stroke-white transition-colors"
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
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.5"
          className="group-hover:stroke-white transition-colors"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
        </svg>
      )}

      {/* Pulsing ring when unmuted */}
      {!isMuted && (
        <div className="absolute inset-0 rounded-full border border-white/30 animate-ping" />
      )}
    </button>
  );
}
