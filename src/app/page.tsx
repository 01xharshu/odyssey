'use client';

import dynamic from 'next/dynamic';

const CinematicIntro = dynamic(() => import('@/components/CinematicIntro'), {
  ssr: false,
});
const OdysseyCarousel = dynamic(
  () => import('@/components/OdysseyCarousel'),
  { ssr: false }
);
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
    <main className="bg-[#1c1c1e] text-white min-h-screen">
      <CinematicIntro />
      <CustomCursor />
      <AudioManager />
      <OdysseyCarousel />
      <Epilogue />
      <GreekCity />
    </main>
  );
}
