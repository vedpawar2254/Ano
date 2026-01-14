import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Banner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border-b border-emerald-500/20 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mx-auto">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-sm font-medium">Beta release in 2 days</span>
              </div>
              <span className="text-zinc-600 text-sm hidden sm:inline">→</span>
              <a
                href="https://github.com/vedpawar2254/Ano"
                className="text-zinc-400 hover:text-white text-sm transition-colors hidden sm:inline"
              >
                Star on GitHub
              </a>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors ml-4"
              aria-label="Close banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
