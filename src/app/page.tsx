'use client';

import dynamic from 'next/dynamic';

const CinematicIntro = dynamic(() => import('@/components/CinematicIntro'), {
  ssr: false,
});
const TrojanWar = dynamic(() => import('@/components/TrojanWar'), {
  ssr: false,
});
const OdysseyCarousel = dynamic(
  () => import('@/components/OdysseyCarousel'),
  { ssr: false }
);
const OceanLore = dynamic(() => import('@/components/OceanLore'), {
  ssr: false,
});
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), {
  ssr: false,
});
const AudioManager = dynamic(() => import('@/components/AudioManager'), {
  ssr: false,
});
const Epilogue = dynamic(() => import('@/components/Epilogue'), {
  ssr: false,
});
const GreekCity = dynamic(() => import('@/components/GreekCity/GreekCity'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="text-white min-h-screen overflow-x-hidden">
      <CinematicIntro />
      <CustomCursor />
      <AudioManager />
      
      {/* 1. The Fall of Troy (Before the Odyssey) */}
      <TrojanWar />
      
      {/* 2. The 10-year Journey */}
      <OdysseyCarousel />
      
      {/* 3. The Dangers of the Sea (Odyssey Lore) */}
      <OceanLore />
      
      {/* 4. Reaching Ithaca */}
      <Epilogue />
      
      {/* 5. The Ruins Today */}
      <GreekCity />
    </main>
  );
}
