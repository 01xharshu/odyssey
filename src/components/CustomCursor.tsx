'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorPos = useRef({ x: -100, y: -100 });
  const trailPositions = useRef(
    Array.from({ length: 8 }, () => ({ x: -100, y: -100 }))
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('a, button, [role="button"], .cursor-pointer') ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON'
      ) {
        setIsHovering(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('a, button, [role="button"], .cursor-pointer') ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON'
      ) {
        setIsHovering(false);
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    let raf: number;
    const animate = () => {
      // Main cursor follows with tighter spring for less sluggishness
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.45;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.45;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px) translate(-50%, -50%) scale(${isHovering ? 1.8 : 1})`;
      }

      // Trail particles follow with increasing delay
      for (let i = trailPositions.current.length - 1; i > 0; i--) {
        trailPositions.current[i].x +=
          (trailPositions.current[i - 1].x - trailPositions.current[i].x) *
          (0.2 - i * 0.015);
        trailPositions.current[i].y +=
          (trailPositions.current[i - 1].y - trailPositions.current[i].y) *
          (0.2 - i * 0.015);
      }
      trailPositions.current[0].x +=
        (cursorPos.current.x - trailPositions.current[0].x) * 0.3;
      trailPositions.current[0].y +=
        (cursorPos.current.y - trailPositions.current[0].y) * 0.3;

      trailRefs.current.forEach((el, i) => {
        if (el) {
          el.style.transform = `translate(${trailPositions.current[i].x}px, ${trailPositions.current[i].y}px) translate(-50%, -50%)`;
        }
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(raf);
    };
  }, [isHovering, isVisible]);

  return (
    <>
      {/* Trail particles */}
      {trailPositions.current.map((_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => {
            if (el) trailRefs.current[i] = el;
          }}
          className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
          style={{
            width: `${6 - i * 0.5}px`,
            height: `${6 - i * 0.5}px`,
            background: `radial-gradient(circle, rgba(255,255,255,${0.6 - i * 0.07}) 0%, transparent 70%)`,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      ))}
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <div
          className="rounded-full border transition-all duration-300 flex items-center justify-center"
          style={{
            width: isHovering ? '48px' : '24px',
            height: isHovering ? '48px' : '24px',
            borderColor: 'rgba(255,255,255,0.4)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      </div>
    </>
  );
}
