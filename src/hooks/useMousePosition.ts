'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { MouseState } from '@/types';

export function useMousePosition(): MouseState {
  const [state, setState] = useState<MouseState>({
    x: 0,
    y: 0,
    clientX: 0,
    clientY: 0,
    isMoving: false,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lerpX = useRef(0);
  const lerpY = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const rafRef = useRef<number>(undefined);

  const animate = useCallback(() => {
    lerpX.current += (targetX.current - lerpX.current) * 0.08;
    lerpY.current += (targetY.current - lerpY.current) * 0.08;

    setState((prev) => ({
      ...prev,
      x: lerpX.current,
      y: lerpY.current,
    }));

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetX.current = (e.clientX / window.innerWidth) * 2 - 1;
      targetY.current = -(e.clientY / window.innerHeight) * 2 + 1;

      setState((prev) => ({
        ...prev,
        clientX: e.clientX,
        clientY: e.clientY,
        isMoving: true,
      }));

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isMoving: false }));
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [animate]);

  return state;
}
