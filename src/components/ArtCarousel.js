"use client";

import React, { useState, useEffect, useRef } from 'react';

const odysseyData = [
  {
    id: 1,
    name: 'Odysseus',
    role: 'King of Ithaca',
    description: 'Famed for his intellect and cunning, he spends ten years struggling to return home after the Trojan War, facing monsters, gods, and his own pride.',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Head_Odysseus_MAR_Sperlonga.jpg',
    background: 'https://images.unsplash.com/photo-1518355675402-990977dc8161?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Stormy sea
  },
  {
    id: 2,
    name: 'Penelope',
    role: 'Queen of Ithaca',
    description: 'The faithful and highly intelligent wife of Odysseus, who uses her wit to keep over a hundred aggressive suitors at bay while waiting for her husband’s return.',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/John_William_Waterhouse_-_Penelope_and_the_Suitors_%281912%29.jpg',
    background: 'https://images.unsplash.com/photo-1600577916048-804c9191e36c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Palace architecture
  },
  {
    id: 3,
    name: 'Athena',
    role: 'Goddess of Wisdom',
    description: 'Odysseus’s divine patron and protector. She admires his cunning mind and actively intervenes to help him and his son throughout their journeys.',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Mattei_Athena_Louvre_Ma530_n2.jpg',
    background: 'https://images.unsplash.com/photo-1507608158173-1dcec673a2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Greek ruins / Olive trees
  },
  {
    id: 4,
    name: 'Poseidon',
    role: 'God of the Sea',
    description: 'The primary antagonist of Odysseus’s journey. Enraged after Odysseus blinds his son, the cyclops Polyphemus, Poseidon constantly thwarts his return home.',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Poseidon_sculpture_Copenhagen_2005.jpg',
    background: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Crashing waves
  },
  {
    id: 5,
    name: 'Circe',
    role: 'The Enchantress',
    description: 'A powerful witch who turns Odysseus’s crew into swine. After he resists her magic, she provides crucial advice for his perilous journey to the Underworld.',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/John_William_Waterhouse_-_Circe_Offering_the_Cup_to_Ulysses.jpg',
    background: 'https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Mystical forest
  },
];

export default function ArtCarousel() {
  const [rotation, setRotation] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const tickingRef = useRef(false);

  const numItems = odysseyData.length;
  const stepAngle = (2 * Math.PI) / numItems;
  const radius = 220; // Size of the carousel wheel

  // Helper for true mathematical modulo (handles negative numbers)
  const mod = (n, m) => ((n % m) + m) % m;

  useEffect(() => {
    const updateScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      // We only animate when the top of our tall container hits the top of the viewport
      if (rect.top <= 0) {
        const scrolledPx = -rect.top;
        
        // Map scroll distance to rotation. 
        // 1500px of scroll equals one full rotation (2 * PI)
        const scrollSensitivity = 1500;
        const newRotation = -(scrolledPx / scrollSensitivity) * (Math.PI * 2);
        
        setRotation(newRotation);

        // Calculate which item is currently pointing to the LEFT (Math.PI)
        const normalizedAngle = mod(-newRotation, 2 * Math.PI);
        const calculatedIndex = Math.round(normalizedAngle / stepAngle) % numItems;
        
        setActiveIndex(calculatedIndex);
      } else {
        // Reset if scrolled above the component
        setRotation(0);
        setActiveIndex(0);
      }

      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount to set initial state based on current scroll position
    updateScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [stepAngle, numItems]);

  // Click on a character card to smoothly scroll to it
  const handleCardClick = (index) => {
    if (!containerRef.current) return;
    const containerTop = window.scrollY + containerRef.current.getBoundingClientRect().top;
    const scrollSensitivity = 1500;
    // Scrolled px needed to bring `index` to front (left)
    const targetScrollPx = index * (stepAngle / (Math.PI * 2)) * scrollSensitivity;

    window.scrollTo({
      top: containerTop + targetScrollPx,
      behavior: 'smooth',
    });
  };

  return (
    // The outer container is 400vh tall to allow for plenty of scrolling room
    <div ref={containerRef} className="relative h-[400vh] bg-black font-serif text-white selection:bg-amber-500 selection:text-black">
      
      {/* CSS for custom text animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      {/* The sticky container stays glued to the screen while we scroll through the 400vh */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col md:flex-row">
        
        {/* Dynamic Backgrounds */}
        {odysseyData.map((character, index) => (
          <div
            key={`bg-${character.id}`}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
            style={{
              opacity: index === activeIndex ? 1 : 0,
              zIndex: index === activeIndex ? 0 : -1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.background}
              alt="Background"
              className="object-cover w-full h-full opacity-30" // Deeply dimmed for contrast
            />
          </div>
        ))}
        
        {/* Gradient Overlay to blend background with the UI */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 z-0 pointer-events-none"></div>

        {/* Left Panel: Text Content */}
        <div className="relative z-10 w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center p-8 md:p-16 lg:p-24">
          {/* We use the key prop to force React to re-mount the div and trigger the animation */}
          <div key={activeIndex} className="animate-fade-in-up max-w-lg">
            <h3 className="text-amber-500 tracking-[0.3em] uppercase text-sm md:text-base mb-4 font-sans font-semibold">
              {odysseyData[activeIndex].role}
            </h3>
            <h1 className="text-6xl md:text-8xl font-light mb-6 tracking-wide text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
              {odysseyData[activeIndex].name}
            </h1>
            <div className="w-16 h-1 bg-amber-500 mb-8 rounded-full"></div>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light">
              {odysseyData[activeIndex].description}
            </p>
          </div>
        </div>

        {/* Right Panel: Circular Carousel */}
        <div className="relative z-10 w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center">
          
          <div 
            className="relative scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 transition-transform" 
            style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
          >
            {odysseyData.map((character, index) => {
              // Calculate mathematical position
              const angle = (index * stepAngle);
              // initialOffset of Math.PI sets item 0 to point to the LEFT (towards the text)
              const initialOffset = Math.PI; 
              const totalAngle = angle + rotation + initialOffset;

              const x = radius + radius * Math.cos(totalAngle);
              const y = radius + radius * Math.sin(totalAngle);

              // Calculate depth based on position. 
              // When pointing exactly left (Math.PI), cos is -1. 
              // We want depthFactor to be 1 at the front (left), and 0 at the back (right).
              const depthFactor = (1 - Math.cos(totalAngle)) / 2;
              
              const scale = 0.6 + (depthFactor * 0.5); // Ranges from 0.6 to 1.1
              const opacity = 0.3 + (depthFactor * 0.7); // Fades out towards the back
              const zIndex = Math.round(depthFactor * 100);

              const isActive = index === activeIndex;

              return (
                <div
                  key={character.id}
                  onClick={() => handleCardClick(index)}
                  // Removed transition-transform! 
                  // It is now instantly locked to the exact scroll position, feeling highly responsive.
                  className="absolute top-0 left-0 cursor-pointer"
                  style={{
                    transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
                    zIndex: zIndex,
                    opacity: opacity,
                  }}
                >
                  {/* Card Design */}
                  <div 
                    className={`
                      w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden 
                      border-2 transition-colors duration-500 relative group
                      ${isActive ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]' : 'border-gray-600'}
                    `}
                    style={{
                      boxShadow: isActive 
                        ? 'inset 0 0 20px rgba(0,0,0,0.8), 0 0 30px rgba(245,158,11,0.3)' 
                        : 'inset 0 0 20px rgba(0,0,0,0.8)'
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={character.portrait}
                      alt={character.name}
                      className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Glass overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none"></div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-70 animate-bounce pointer-events-none">
          <span className="text-xs uppercase tracking-[0.2em] mb-2 text-gray-400 font-sans">Scroll Down</span>
          <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>

      </div>
    </div>
  );
}
