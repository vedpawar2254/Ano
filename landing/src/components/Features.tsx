import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: '💬',
    title: 'Inline Annotations',
    description: 'Add comments to specific lines in plans and markdown files. Support threaded discussions with your team.',
    color: 'blue',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: '🏷️',
    title: 'Structured Templates',
    description: 'Use concern, question, suggestion, or blocker tags for clarity in your feedback.',
    color: 'purple',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    icon: '🤖',
    title: 'Claude Integration',
    description: 'Claude can read annotations and respond to feedback via MCP, making AI-assisted reviews seamless.',
    color: 'green',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: '✅',
    title: 'Approval Gates',
    description: 'Require team approvals before proceeding. Block plan execution until reviewers sign off.',
    color: 'amber',
    gradient: 'from-amber-500/20 to-orange-500/20'
  },
  {
    icon: '📁',
    title: 'Git-Friendly Storage',
    description: 'Annotations stored as sidecar JSON files. Commit alongside your code and share via git.',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    icon: '🌐',
    title: 'Web Interface',
    description: 'Visual annotation interface with click-to-annotate, real-time updates, and beautiful UI.',
    color: 'rose',
    gradient: 'from-rose-500/20 to-red-500/20'
  }
];

const colorClasses: Record<string, string> = {
  blue: 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/20',
  purple: 'group-hover:border-purple-500/50 group-hover:shadow-purple-500/20',
  green: 'group-hover:border-green-500/50 group-hover:shadow-green-500/20',
  amber: 'group-hover:border-amber-500/50 group-hover:shadow-amber-500/20',
  cyan: 'group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20',
  rose: 'group-hover:border-rose-500/50 group-hover:shadow-rose-500/20'
};

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const }
    }
  };

  return (
    <section id="features" className="relative py-32 overflow-hidden" ref={ref}>
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-full mb-6"
          >
            Features
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Built for{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              developers
            </span>
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Everything you need to review AI-generated plans as a team, with
            Claude Code integration built-in.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className={`group relative p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl transition-all duration-300 ${colorClasses[feature.color]} hover:shadow-xl`}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300`} />

              <div className="relative">
                {/* Icon */}
                <motion.div
                  className="text-4xl mb-4"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {feature.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
