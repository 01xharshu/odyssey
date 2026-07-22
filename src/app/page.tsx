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
const DetectiveMesh = dynamic(() => import('@/components/DetectiveMesh'), {
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
    <main className="text-white min-h-screen overflow-x-hidden bg-[#1c1c1e]">
      <CinematicIntro />
      <CustomCursor />
      <AudioManager />
      <TrojanWar />
      <DetectiveMesh />
      <OdysseyCarousel />
      <OceanLore />
      <Epilogue />
      <GreekCity />
    </main>
  );
}
