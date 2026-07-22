'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ScrollState } from '@/types';

export function useScrollProgress(
  containerRef: React.RefObject<HTMLDivElement | null>,
  trackHeight: number = 4 // in vh units (e.g. 400vh → 4)
): ScrollState {
  const [state, setState] = useState<ScrollState>({
    progress: 0,
    velocity: 0,
    direction: 'idle',
  });

  const prevScrollY = useRef(0);
  const ticking = useRef(false);

  const update = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollableDistance = containerRef.current.offsetHeight - window.innerHeight;

    let progress = 0;
    if (rect.top <= 0 && scrollableDistance > 0) {
      progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
    }

    const currentY = window.scrollY;
    const delta = currentY - prevScrollY.current;
    const velocity = Math.min(Math.abs(delta) / 16, 1); // normalized 0-1
    const direction: ScrollState['direction'] =
      delta > 0 ? 'down' : delta < 0 ? 'up' : 'idle';

    prevScrollY.current = currentY;

    setState({ progress, velocity, direction });
    ticking.current = false;
  }, [containerRef]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    update();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [update]);

  return state;
}
