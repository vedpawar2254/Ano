import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const codeBlocks = [
  {
    title: 'Install',
    code: 'npm install -g ano',
    description: 'Install Ano globally'
  },
  {
    title: 'Serve',
    code: 'ano serve plan.md',
    description: 'Start web viewer'
  },
  {
    title: 'Annotate',
    code: 'ano annotate plan.md:15 --type concern "Review?"',
    description: 'Add annotation via CLI'
  },
  {
    title: 'Approve',
    code: 'ano approve plan.md',
    description: 'Approve the plan'
  }
];

export function QuickStart() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="quickstart" className="relative py-32 overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium rounded-full mb-6"
          >
            Quick Start
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Up and running in{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              seconds
            </span>
          </h2>

          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Get started with Ano using these simple commands.
          </p>
        </motion.div>

        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.div
            className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
            whileHover={{ borderColor: 'rgb(71, 85, 105)' }}
          >
            {/* Terminal header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <motion.div className="w-3 h-3 rounded-full bg-red-500" whileHover={{ scale: 1.3 }} />
                  <motion.div className="w-3 h-3 rounded-full bg-yellow-500" whileHover={{ scale: 1.3 }} />
                  <motion.div className="w-3 h-3 rounded-full bg-green-500" whileHover={{ scale: 1.3 }} />
                </div>
                <span className="text-slate-500 text-sm font-mono">~/project</span>
              </div>
              <span className="text-slate-500 text-xs">bash</span>
            </div>

            {/* Code content */}
            <div className="p-6 font-mono text-sm space-y-6">
              {codeBlocks.map((block, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-xs"># {block.description}</span>
                    <motion.button
                      onClick={() => copyToClipboard(block.code, index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-700/50 rounded"
                    >
                      {copiedIndex === index ? (
                        <span className="text-green-400">Copied!</span>
                      ) : (
                        'Copy'
                      )}
                    </motion.button>
                  </div>
                  <motion.div
                    className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 group-hover:border-slate-600 transition-colors"
                    whileHover={{ x: 5, borderColor: 'rgb(59, 130, 246, 0.3)' }}
                  >
                    <span className="text-green-400">$</span>
                    <span className="text-slate-200">{block.code}</span>
                  </motion.div>
                </motion.div>
              ))}

              {/* Output example */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 }}
                className="pt-4 border-t border-slate-700/50"
              >
                <span className="text-slate-500 text-xs"># Example output</span>
                <div className="mt-2 space-y-1 text-slate-400">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.9 }}
                  >
                    <span className="text-green-400">✓</span> Server running at{' '}
                    <span className="text-blue-400">http://localhost:3000</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1 }}
                  >
                    <span className="text-green-400">✓</span> Watching plan.md for changes...
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.1 }}
                  >
                    <span className="text-green-400">✓</span> Ready for annotations!
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View Source
          </motion.a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Documentation
          </motion.a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            FAQ
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
