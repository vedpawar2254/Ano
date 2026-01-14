import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function MCPSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-emerald-500 text-sm font-medium mb-3">MCP integration</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Claude connects directly
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Ano includes an MCP server. Claude can read annotations, check approval status, and understand team feedback without switching contexts.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MCPDiagram />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Feature
              title="Seamless integration"
              description="Claude can directly query annotations, blockers, and approval status through the MCP protocol."
            />
            <Feature
              title="Real-time awareness"
              description="AI sees team feedback instantly. No copy-pasting annotations or summarizing discussions."
            />
            <Feature
              title="Automatic adaptation"
              description="Claude reads your concerns and blockers, then revises the plan accordingly before you even ask."
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MCPDiagram() {
  return (
    <div className="relative p-12 rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(63, 63, 70)" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative space-y-6">
        {/* Claude Node */}
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0.2)',
                  '0 0 40px rgba(16, 185, 129, 0.4)',
                  '0 0 20px rgba(16, 185, 129, 0.2)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-8 py-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 backdrop-blur-sm"
            >
              <span className="text-emerald-400 font-semibold text-lg">Claude</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated connection lines */}
        <div className="flex items-center justify-center">
          <div className="relative flex flex-col items-center">
            {/* Top line with flowing animation */}
            <div className="relative w-px h-12 bg-gradient-to-b from-emerald-500/30 to-zinc-700/30 overflow-hidden">
              <motion.div
                className="absolute inset-0 w-full bg-gradient-to-b from-transparent via-emerald-500 to-transparent"
                animate={{
                  y: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </div>

            {/* MCP Protocol badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 shadow-lg"
            >
              <span className="text-xs text-zinc-400 font-mono">MCP Protocol</span>
            </motion.div>

            {/* Bottom line with flowing animation */}
            <div className="relative w-px h-12 bg-gradient-to-b from-zinc-700/30 to-emerald-500/30 overflow-hidden">
              <motion.div
                className="absolute inset-0 w-full bg-gradient-to-b from-transparent via-emerald-500 to-transparent"
                animate={{
                  y: ['-100%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 1
                }}
              />
            </div>
          </div>
        </div>

        {/* Ano MCP Server */}
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="px-8 py-4 rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl"
          >
            <span className="text-zinc-200 font-semibold">Ano MCP Server</span>
          </motion.div>
        </div>

        {/* Connection branches */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <svg width="100%" height="60" className="overflow-visible">
              <motion.path
                d="M 50% 0 L 50% 20 M 50% 20 L 16.66% 60 M 50% 20 L 50% 60 M 50% 20 L 83.33% 60"
                stroke="rgb(63, 63, 70)"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </svg>
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-3 gap-4">
          <Resource label="Annotations" delay={0.8} />
          <Resource label="Approvals" delay={0.9} />
          <Resource label="Blockers" delay={1.0} />
        </div>
      </div>

      {/* Animated particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-500/50"
          style={{
            left: `${20 + i * 15}%`,
            top: '50%'
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

function Resource({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center"
    >
      <div className="px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300">
        <span className="text-sm text-zinc-300 font-medium">{label}</span>
      </div>
    </motion.div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
