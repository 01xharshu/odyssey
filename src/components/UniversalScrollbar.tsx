'use client';

import React, { useEffect, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export default function UniversalScrollbar() {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map 0-1 to "0% - 100%" for the dot's top position
  const dotTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (!mounted) return null;

  return (
    <div className="fixed right-4 top-[10%] bottom-[10%] w-[2px] z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-white/5 rounded-full" />
      <motion.div
        className="absolute top-0 left-0 w-full rounded-full"
        style={{
          scaleY: scrollYProgress,
          transformOrigin: 'top',
          background: 'linear-gradient(to bottom, rgba(245, 158, 11, 1), transparent)',
        }}
      />
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
        style={{
          top: dotTop,
          background: 'rgba(245, 158, 11, 1)',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
        }}
      />
    </div>
  );
}
