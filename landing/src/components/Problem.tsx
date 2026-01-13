import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const problems = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Claude writes complex plans',
    description: 'AI generates detailed implementation plans that need human oversight'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Teams need to review first',
    description: 'Critical decisions require input from multiple team members'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'No audit trail',
    description: 'Comments in Slack or docs get lost, no record of decisions'
  }
];

const solutions = [
  {
    icon: '💬',
    title: 'Inline Comments',
    description: 'Add feedback directly to specific lines'
  },
  {
    icon: '🏷️',
    title: 'Typed Annotations',
    description: 'concern, blocker, question, suggestion'
  },
  {
    icon: '✅',
    title: 'Approval Gates',
    description: 'Block execution until team approves'
  },
  {
    icon: '📝',
    title: 'Full History',
    description: 'Git-tracked annotations with full audit trail'
  }
];

export function Problem() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section id="problem" className="relative py-32 overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900" />

      {/* Animated lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
            style={{ top: `${20 + i * 15}%`, left: 0, right: 0 }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 8,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Problem section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-20"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-block px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-full mb-6">
              The Problem
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            AI plans need{' '}
            <span className="text-red-400">human oversight</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-slate-400 max-w-2xl mx-auto mb-12"
          >
            When Claude Code generates implementation plans, teams struggle to review,
            collaborate, and track approval before execution.
          </motion.p>

          {/* Problem cards */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 0 30px rgba(239, 68, 68, 0.1)'
                }}
                className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-14 h-14 bg-red-500/10 text-red-400 rounded-xl mb-4"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {problem.icon}
                </motion.div>
                <h3 className="text-white font-semibold mb-2">{problem.title}</h3>
                <p className="text-slate-400 text-sm">{problem.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Arrow transition */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex justify-center mb-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <span className="text-slate-500 text-sm mb-2">Ano solves this</span>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Solution section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-block px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium rounded-full mb-6">
              The Solution
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Collaborative annotation for{' '}
            <span className="text-green-400">AI plans</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-slate-400 max-w-2xl mx-auto mb-12"
          >
            Ano provides a complete workflow for reviewing, annotating, and approving
            Claude-generated plans before execution.
          </motion.p>

          {/* Solution cards */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.08,
                  borderColor: 'rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 0 30px rgba(34, 197, 94, 0.15)'
                }}
                className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center group"
              >
                <motion.span
                  className="text-3xl block mb-3"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {solution.icon}
                </motion.span>
                <h3 className="text-white font-semibold text-sm mb-1">{solution.title}</h3>
                <p className="text-slate-500 text-xs">{solution.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
