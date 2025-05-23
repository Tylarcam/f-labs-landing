'use client';
import { useState } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import GameDemoDisplay from '@/components/sections/GameDemoDisplay';
import GameSection from '@/components/sections/GameSection';
import AIInfrastructureSection from '@/components/sections/AIInfrastructureSection';
import RoadmapSection from '@/components/sections/RoadmapSection';
import SignupSection from '@/components/sections/SignupSection';
import Footer from '@/components/layout/Footer';
import Modal from '@/components/ui/Modal';

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <HeroSection onGetStarted={() => setShowDemo(true)} />
      <GameSection />
      <AIInfrastructureSection />
      <RoadmapSection />
      <SignupSection />
      <Footer />
      <Modal open={showDemo} onClose={() => setShowDemo(false)}>
        <GameDemoDisplay />
      </Modal>
    </main>
  );
}
