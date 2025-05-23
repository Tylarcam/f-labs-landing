'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function SignupSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted with email:', email);
  };

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_100%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Join the Future of Gaming
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Be among the first to experience our revolutionary gaming platform
          </p>

          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow"
            >
              Get Early Access
            </motion.button>
          </motion.form>

          <p className="mt-6 text-sm text-gray-400">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </section>
  );
} 