'use client';

import { useEffect } from 'react';

export default function WarningSuppressor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && (
        args[0].includes('THREE.Clock: This module has been deprecated') ||
        args[0].includes('PCFSoftShadowMap has been deprecated')
      )) {
        return;
      }
      originalWarn(...args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
