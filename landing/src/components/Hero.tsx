import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FlowingRibbon } from './FlowingRibbon';
import { Logo } from './Logo';

const words = ['review', 'annotate', 'approve', 'collaborate on'];

function MorphingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)', scale: 0.9 }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)', scale: 0.9 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function GlowingOrb({ delay = 0, className = "" }: { delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 2, delay, ease: "easeOut" }}
      className={`absolute rounded-full blur-3xl ${className}`}
    />
  );
}

function FloatingBadge({ children, delay, className }: { children: React.ReactNode; delay: number; className: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-sm text-white/80"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npm install -g ano');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Animated gradient orbs */}
      <GlowingOrb delay={0} className="w-[600px] h-[600px] -top-40 -left-40 bg-violet-600/30" />
      <GlowingOrb delay={0.2} className="w-[500px] h-[500px] top-1/2 -right-40 bg-fuchsia-600/20" />
      <GlowingOrb delay={0.4} className="w-[400px] h-[400px] bottom-0 left-1/3 bg-orange-600/20" />

      {/* 3D Background */}
      <div className="absolute inset-0">
        <FlowingRibbon />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_70%)] pointer-events-none" />

      {/* Floating badges */}
      <FloatingBadge delay={1.2} className="top-1/4 left-[10%] hidden lg:block">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Real-time sync
        </span>
      </FloatingBadge>
      <FloatingBadge delay={1.4} className="top-1/3 right-[12%] hidden lg:block">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          Team collaboration
        </span>
      </FloatingBadge>
      <FloatingBadge delay={1.6} className="bottom-1/3 left-[15%] hidden lg:block">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          Claude integration
        </span>
      </FloatingBadge>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5"
      >
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9" />
          <span className="text-xl font-semibold text-white">ano</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
          <a href="#demo" className="text-sm text-white/60 hover:text-white transition-colors">Demo</a>
          <a href="https://github.com" className="text-sm text-white/60 hover:text-white transition-colors">GitHub</a>
          <a href="#" className="px-4 py-2 text-sm bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors">
            Get Started
          </a>
        </nav>
      </motion.header>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-sm">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            <span className="text-white/80">Now in public beta</span>
            <span className="text-white/40">•</span>
            <span className="text-violet-400">v1.0 coming soon</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
        >
          <span className="text-white"><MorphingText /> AI plans</span>
          <br />
          <span className="bg-gradient-to-r from-white/60 to-white/40 bg-clip-text text-transparent">as a team.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
        >
          Ano lets your team annotate, review, and approve Claude-generated plans
          before execution. <span className="text-white/70">Keep humans in the loop.</span>
        </motion.p>

        {/* Install command */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10"
        >
          <button
            onClick={copyCommand}
            className="group relative inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <span className="font-mono text-base text-white/90">
              $ npm install -g ano
            </span>
            <span className="text-white/50 group-hover:text-white/80 transition-colors">
              {copied ? (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </span>

            {/* Animated gradient border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 opacity-0 group-hover:opacity-50 transition-opacity -z-10 blur-sm"
            />
          </button>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#demo"
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            <span className="flex items-center gap-2">
              See it in action
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 flex items-center justify-center gap-12 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-white">500+</div>
            <div className="text-sm text-white/40 mt-1">Teams using</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <div className="text-3xl font-bold text-white">10k+</div>
            <div className="text-sm text-white/40 mt-1">Plans reviewed</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <div className="text-3xl font-bold text-white">99%</div>
            <div className="text-sm text-white/40 mt-1">Safer deployments</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-2 bg-white/50 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
