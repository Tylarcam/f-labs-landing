'use client';

import { motion } from 'framer-motion';

export default function GameSection() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Interactive Gaming Experience
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Dive into our innovative gaming platform that combines cutting-edge technology with immersive gameplay
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Real-time Interaction",
              description: "Experience seamless multiplayer gaming with our advanced networking infrastructure",
              icon: "🎮"
            },
            {
              title: "AI Integration",
              description: "Play against intelligent AI opponents that adapt to your gaming style",
              icon: "🤖"
            },
            {
              title: "Cross-platform",
              description: "Access your games from any device with our cloud-based platform",
              icon: "🌐"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 