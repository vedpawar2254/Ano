import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FlowingRibbon } from './FlowingRibbon';
import { Logo } from './Logo';

const words = ['review', 'annotate', 'approve', 'ship'];

function MorphingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative h-[1.1em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="inline-block text-emerald-400"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
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
    <section className="relative min-h-screen flex flex-col">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-60">
        <FlowingRibbon />
      </div>

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5"
      >
        <a href="#" className="flex items-center gap-2.5">
          <Logo className="w-8 h-8" />
          <span className="text-lg font-semibold text-white">ano</span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
          <a href="#demo" className="text-sm text-zinc-400 hover:text-white transition-colors">Demo</a>
          <a href="https://github.com" className="text-sm text-zinc-400 hover:text-white transition-colors">GitHub</a>
          <a href="#" className="px-4 py-2 text-sm bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-100 transition-colors">
            Get Started
          </a>
        </nav>
      </motion.header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-xs text-zinc-400 border border-zinc-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Now in beta
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.1]"
          >
            <MorphingText /> AI plans
            <br />
            <span className="text-zinc-500">before they run.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-lg text-zinc-500 max-w-lg mx-auto"
          >
            Your team annotates and approves Claude's plans before execution.
            Human oversight for AI-assisted development.
          </motion.p>

          {/* Install command */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={copyCommand}
              className="group flex items-center gap-3 px-5 py-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <span className="font-mono text-sm text-zinc-300">
                npm install -g ano
              </span>
              <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                {copied ? (
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </span>
            </button>

            <a
              href="#demo"
              className="px-5 py-3 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-3 text-xs text-zinc-600"
          >
            npm package coming soon - <a href="https://github.com/vedpawar2254/Ano" className="text-zinc-500 hover:text-emerald-500 transition-colors">install from source</a>
          </motion.p>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 flex items-center justify-center gap-8 text-xs text-zinc-600"
          >
            <span>Used by</span>
            <div className="flex items-center gap-6 text-zinc-500">
              <span className="font-medium">Cool People</span>
              <span className="font-medium">Sharp minds</span>
              <span className="font-medium">Ved</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 pb-12 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
