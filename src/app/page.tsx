'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useScroll, useTransform, motion } from 'framer-motion';

const CinematicIntro = dynamic(() => import('@/components/CinematicIntro'), { ssr: false });
const TrojanWar = dynamic(() => import('@/components/TrojanWar'), { ssr: false });
const OdysseyCarousel = dynamic(() => import('@/components/OdysseyCarousel'), { ssr: false });
const OceanLore = dynamic(() => import('@/components/OceanLore'), { ssr: false });
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });
const AudioManager = dynamic(() => import('@/components/AudioManager'), { ssr: false });
const DetectiveMesh = dynamic(() => import('@/components/DetectiveMesh'), { ssr: false });
const Epilogue = dynamic(() => import('@/components/Epilogue'), { ssr: false });
const GreekCity = dynamic(() => import('@/components/GreekCity/GreekCity'), { ssr: false });
const CloudTransition = dynamic(() => import('@/components/CloudTransition'), { ssr: false });

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map global scroll to local progress (0 to 1) for each section
  const pIntro = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const pTroy = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);
  const pDetective = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);
  const pCarousel = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const pOcean = useTransform(scrollYProgress, [0.75, 0.90], [0, 1]);
  const pEpilogue = useTransform(scrollYProgress, [0.90, 1.0], [0, 1]);

  // Section visibility based on scroll (z-index switching)
  // This ensures sections are only visible when they are active
  const zIntro = useTransform(scrollYProgress, (v) => v < 0.15 ? 10 : -1);
  const zTroy = useTransform(scrollYProgress, (v) => v >= 0.15 && v < 0.35 ? 10 : -1);
  const zDetective = useTransform(scrollYProgress, (v) => v >= 0.35 && v < 0.55 ? 10 : -1);
  const zCarousel = useTransform(scrollYProgress, (v) => v >= 0.55 && v < 0.75 ? 10 : -1);
  const zOcean = useTransform(scrollYProgress, (v) => v >= 0.75 && v < 0.90 ? 10 : -1);
  const zEpilogue = useTransform(scrollYProgress, (v) => v >= 0.90 ? 10 : -1);

  // Cloud Transition progresses (mapped so CloudTransition runs at the intersection)
  // Transition 1: Intro -> Troy (0.13 to 0.17)
  const tTroy = useTransform(scrollYProgress, [0.13, 0.17], [0, 1]);
  // Transition 2: Troy -> Detective (0.33 to 0.37)
  const tDetective = useTransform(scrollYProgress, [0.33, 0.37], [0, 1]);
  // Transition 3: Detective -> Carousel (0.53 to 0.57)
  const tCarousel = useTransform(scrollYProgress, [0.53, 0.57], [0, 1]);
  // Transition 4: Carousel -> Ocean (0.73 to 0.77)
  const tOcean = useTransform(scrollYProgress, [0.73, 0.77], [0, 1]);
  // Transition 5: Ocean -> Epilogue (0.88 to 0.92)
  const tEpilogue = useTransform(scrollYProgress, [0.88, 0.92], [0, 1]);

  return (
    <main ref={containerRef} className="bg-black text-white relative" style={{ height: '5000vh' }}>
      <CustomCursor />
      <AudioManager />

      {/* 0. Cinematic Intro */}
      <motion.div className="fixed inset-0" style={{ zIndex: zIntro }}>
        <CinematicIntro progress={pIntro} />
      </motion.div>

      <CloudTransition progress={tTroy} chapter="Chapter I" title="The Fall of Troy" color="#ffd700" />

      {/* 1. Trojan War */}
      <motion.div className="fixed inset-0" style={{ zIndex: zTroy }}>
        <TrojanWar progress={pTroy} />
      </motion.div>

      <CloudTransition progress={tDetective} chapter="Interlude" title="The Web of Fates" color="#ffb6c1" />

      {/* 2. Detective Mesh */}
      <motion.div className="fixed inset-0" style={{ zIndex: zDetective }}>
        <DetectiveMesh progress={pDetective} />
      </motion.div>

      <CloudTransition progress={tCarousel} chapter="Chapter II" title="The Ten-Year Journey" color="#f0e68c" />

      {/* 3. Odyssey Carousel */}
      <motion.div className="fixed inset-0" style={{ zIndex: zCarousel }}>
        <OdysseyCarousel progress={pCarousel} />
      </motion.div>

      <CloudTransition progress={tOcean} chapter="Chapter III" title="The Dangers of the Deep" color="#87cefa" />

      {/* 4. Ocean Lore */}
      <motion.div className="fixed inset-0" style={{ zIndex: zOcean }}>
        <OceanLore progress={pOcean} />
      </motion.div>

      <CloudTransition progress={tEpilogue} chapter="Chapter IV" title="Reaching Ithaca" color="#ffffff" />

      {/* 5. Epilogue & Ruins */}
      <motion.div className="fixed inset-0" style={{ zIndex: zEpilogue }}>
        {/* We can combine Epilogue and GreekCity in a single view or stack them */}
        <div className="absolute inset-0">
          <Epilogue progress={useTransform(pEpilogue, [0, 0.5], [0, 1])} />
        </div>
        <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'auto' }}>
          <GreekCity progress={useTransform(pEpilogue, [0.5, 1.0], [0, 1])} />
        </div>
      </motion.div>

    </main>
  );
}
