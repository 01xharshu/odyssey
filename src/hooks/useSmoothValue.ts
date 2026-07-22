'use client';

import { useRef, useEffect, useState } from 'react';

export function useSmoothValue(target: number, damping: number = 0.1): number {
  const [value, setValue] = useState(target);
  const currentRef = useRef(target);
  const rafRef = useRef<number>(undefined);

  useEffect(() => {
    const animate = () => {
      currentRef.current += (target - currentRef.current) * damping;
      setValue(currentRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, damping]);

  return value;
}
