'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AIInfrastructureSection() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/cloud_Networks_3.jpg"
        alt="Futuristic Server Background"
        fill
        className="object-cover z-0"
        priority={false}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70 z-10" />
      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-600">
            AI-Powered Infrastructure
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Leveraging cutting-edge AI technology to create a robust and scalable gaming platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              {
                title: "Machine Learning",
                description: "Advanced algorithms that learn and adapt to player behavior",
                icon: "🧠"
              },
              {
                title: "Cloud Computing",
                description: "Scalable infrastructure that grows with your needs",
                icon: "☁️"
              },
              {
                title: "Real-time Analytics",
                description: "Instant insights into player engagement and performance",
                icon: "📊"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4"
              >
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative h-[400px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_100%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🤖</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 