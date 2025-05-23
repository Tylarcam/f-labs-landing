'use client';

import { motion } from 'framer-motion';

export default function RoadmapSection() {
  const roadmapItems = [
    {
      phase: "Phase 1",
      title: "Platform Launch",
      description: "Initial release of our gaming platform with core features",
      date: "Q1 2024",
      status: "completed"
    },
    {
      phase: "Phase 2",
      title: "AI Integration",
      description: "Implementation of advanced AI features and machine learning capabilities",
      date: "Q2 2024",
      status: "current"
    },
    {
      phase: "Phase 3",
      title: "Global Expansion",
      description: "Scaling infrastructure and expanding to new markets",
      date: "Q3 2024",
      status: "upcoming"
    },
    {
      phase: "Phase 4",
      title: "Advanced Features",
      description: "Launch of premium features and enhanced user experience",
      date: "Q4 2024",
      status: "upcoming"
    }
  ];

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
            Development Roadmap
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our journey to revolutionize gaming with AI technology
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500" />
          
          <div className="space-y-12">
            {roadmapItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                  <div className={`p-6 rounded-xl ${
                    item.status === 'completed' ? 'bg-green-900/50' :
                    item.status === 'current' ? 'bg-purple-900/50' :
                    'bg-gray-800/50'
                  }`}>
                    <div className="text-sm font-semibold text-purple-400 mb-2">{item.phase}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-300 mb-2">{item.description}</p>
                    <div className="text-sm text-gray-400">{item.date}</div>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 