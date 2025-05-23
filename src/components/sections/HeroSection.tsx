'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/0_1_640_N.jpg"
        alt="Pixel Art Hero Background"
        fill
        className="object-cover z-0"
        priority
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="container mx-auto px-4 z-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Welcome to F-Labs
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Exploring the intersection of AI, gaming, and infrastructure
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-lg transition-shadow"
            onClick={onGetStarted}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
} 