import ArtCarousel from '@/components/ArtCarousel';

export const metadata = {
  title: 'Homer’s Odyssey | Art Carousel',
  description: 'Interactive 3D scroll-driven character carousel from Homer’s Greek Odyssey.',
};

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen">
      <ArtCarousel />
    </main>
  );
}
