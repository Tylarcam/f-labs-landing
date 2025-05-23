import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, TestTube, Mail, Brain, Gamepad2, Microscope, Code, Check, Clock, ArrowRight } from 'lucide-react';

const FLabsLanding = () => {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = () => {
    if (!email || !userType) {
      alert('Please fill in all fields');
      return;
    }
    console.log('Email signup:', { email, userType });
    // Connect to your preferred email service here
    alert('Thanks for joining the uprising! We\'ll be in touch soon.');
    setEmail('');
    setUserType('');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className={`text-center max-w-5xl mx-auto transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 leading-tight">
              Play the Future.
            </h1>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-8 leading-tight">
              Build the Intelligence.
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            A cyberpunk game where your decisions power the next generation of AI systems. 
            F-Labs is where immersive storytelling meets real-world AI training.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
              <Gamepad2 className="w-6 h-6" />
              Play the Demo
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group border-2 border-cyan-500 px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 hover:bg-cyan-500/10 transition-all duration-300">
              <TestTube className="w-6 h-6" />
              Join Our Beta Test
            </button>
            <button className="group border-2 border-purple-500 px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 hover:bg-purple-500/10 transition-all duration-300">
              <Mail className="w-6 h-6" />
              Get Early Access
            </button>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-20 w-6 h-6 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-32 w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
      </section>

      {/* Section 2: The Game */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              A Cyberpunk World Built on Code, Choice, and Chaos
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Inspired by Code Geass and Megaman, F-Labs drops players into a dark future where factions fight for control 
              of the digital frontier. Navigate conspiracies, manipulate networks, and reshape reality — all through gameplay that evolves with you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-lg border border-cyan-500/30">
                <h3 className="text-2xl font-bold text-cyan-400 mb-3">Dynamic Storytelling</h3>
                <p className="text-gray-300">Every choice alters the environment — and trains the AI behind it.</p>
              </div>
              <div className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
                <h3 className="text-2xl font-bold text-purple-400 mb-3">Faction Warfare</h3>
                <p className="text-gray-300">Navigate complex alliances and betrayals in a world where trust is currency.</p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-lg border border-cyan-500/30 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <p className="text-gray-400">Game Screenshots Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: AI Infrastructure */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/10 to-cyan-900/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Not Just a Game. A Living Simulation for AI Research.
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              F-Labs is more than entertainment — it's a platform where real human behavior fuels next-gen AI systems. 
              By logging complex decisions, interactions, and problem-solving, we create dynamic environments that can train and simulate intelligent systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-b from-cyan-900/20 to-transparent rounded-lg border border-cyan-500/30">
              <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Synthetic Data</h3>
              <p className="text-gray-300">Generate rich datasets for reinforcement learning through natural gameplay.</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-b from-purple-900/20 to-transparent rounded-lg border border-purple-500/30">
              <Microscope className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Multi-Agent Modeling</h3>
              <p className="text-gray-300">Study complex interactions between players, NPCs, and AI systems.</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-b from-pink-900/20 to-transparent rounded-lg border border-pink-500/30">
              <Code className="w-16 h-16 text-pink-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-pink-400 mb-4">Human-in-the-Loop</h3>
              <p className="text-gray-300">Real-time AI experiments powered by authentic human decision-making.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Who This Is For */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Who This Is For
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-b from-cyan-900/20 to-transparent rounded-lg border border-cyan-500/30">
              <Gamepad2 className="w-12 h-12 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Gamers</h3>
              <p className="text-gray-300 mb-6">Looking for immersive, evolving worlds with narrative depth and consequence.</p>
            </div>
            <div className="p-8 bg-gradient-to-b from-purple-900/20 to-transparent rounded-lg border border-purple-500/30">
              <Brain className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-purple-400 mb-4">AI Researchers</h3>
              <p className="text-gray-300 mb-6">Seeking better simulation environments for behavior-rich, multi-agent data.</p>
            </div>
            <div className="p-8 bg-gradient-to-b from-pink-900/20 to-transparent rounded-lg border border-pink-500/30">
              <Code className="w-12 h-12 text-pink-400 mb-6" />
              <h3 className="text-2xl font-bold text-pink-400 mb-4">Indie Developers</h3>
              <p className="text-gray-300 mb-6">Interested in building the AI-native future of gaming.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="group bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 mx-auto hover:from-purple-400 hover:to-pink-400 transition-all duration-300 transform hover:scale-105">
              Want to collaborate? Reach out
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 5: Roadmap */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-900/10 to-purple-900/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            We're Building the MVP Now – Here's the Plan
          </h2>

          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-green-900/20 rounded-lg border border-green-500/30">
              <Check className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-green-400">Week 1: World design + story concept</h3>
                <p className="text-gray-300">Complete</p>
              </div>
            </div>
            <div className="flex items-center gap-6 p-6 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
              <Clock className="w-8 h-8 text-yellow-400 flex-shrink-0 animate-spin" />
              <div>
                <h3 className="text-xl font-bold text-yellow-400">Week 2: Prototype core game loop</h3>
                <p className="text-gray-300">In Progress</p>
              </div>
            </div>
            <div className="flex items-center gap-6 p-6 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
              <TestTube className="w-8 h-8 text-cyan-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-cyan-400">Week 3: Begin AI data experiments</h3>
                <p className="text-gray-300">Coming Soon</p>
              </div>
            </div>
            <div className="flex items-center gap-6 p-6 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <Play className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-purple-400">Week 4: MVP playtest & demo launch</h3>
                <p className="text-gray-300">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Sign Up */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Want Early Access? Join the Uprising.
          </h2>

          <div className="max-w-md mx-auto space-y-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-6 py-4 bg-gray-900 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="">Are you a gamer, researcher, or curious observer?</option>
              <option value="gamer">Gamer</option>
              <option value="researcher">AI Researcher</option>
              <option value="developer">Indie Developer</option>
              <option value="observer">Curious Observer</option>
            </select>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105"
            >
              Join the Uprising
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-8 text-gray-400 hover:text-white transition-colors">
              <a href="#" className="hover:text-cyan-400 transition-colors">About</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Discord</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
            </div>
            <p className="text-gray-400">© F-Labs 2025. Hack the future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FLabsLanding;