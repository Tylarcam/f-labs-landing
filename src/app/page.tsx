import HeroSection from '@/components/sections/HeroSection';
import GameSection from '@/components/sections/GameSection';
import AIInfrastructureSection from '@/components/sections/AIInfrastructureSection';
import RoadmapSection from '@/components/sections/RoadmapSection';
import SignupSection from '@/components/sections/SignupSection';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <HeroSection />
      <GameSection />
      <AIInfrastructureSection />
      <RoadmapSection />
      <SignupSection />
      <Footer />
    </main>
  );
}
