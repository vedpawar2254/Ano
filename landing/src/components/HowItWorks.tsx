import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    number: 1,
    title: 'Install Ano',
    description: 'Add Ano to your project with npm. Works as a CLI tool and Claude Code plugin.',
    code: 'npm install -g @nakedved/ano',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    color: 'blue'
  },
  {
    number: 2,
    title: 'Review Plans',
    description: 'Open any markdown file in the web viewer. Click on lines to add annotations.',
    code: 'ano serve plan.md',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    color: 'purple'
  },
  {
    number: 3,
    title: 'Collaborate',
    description: 'Team members add concerns, questions, and blockers. Claude can respond to feedback.',
    code: 'ano annotate plan.md:15 --type concern "Review this"',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    color: 'green'
  },
  {
    number: 4,
    title: 'Approve & Execute',
    description: 'Once blockers are resolved and team approves, proceed with confidence.',
    code: 'ano approve plan.md',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'amber'
  }
];

const colorConfig: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20'
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: 'shadow-green-500/20'
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20'
  }
};

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-900/95" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium rounded-full mb-6"
          >
            How It Works
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Get started in{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              4 simple steps
            </span>
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            From installation to team collaboration in minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-amber-500/50 hidden lg:block" />

          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.15, duration: 0.6 }}
                className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
              >
                {/* Content */}
                <motion.div
                  className="flex-1 text-center lg:text-left"
                  whileHover={{ x: index % 2 === 0 ? 10 : -10 }}
                >
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${colorConfig[step.color].bg} border ${colorConfig[step.color].border} mb-4`}>
                    <span className={`${colorConfig[step.color].text}`}>{step.icon}</span>
                    <span className={`text-sm font-medium ${colorConfig[step.color].text}`}>
                      Step {step.number}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 mb-4 max-w-md">{step.description}</p>

                  {/* Code snippet */}
                  <motion.div
                    whileHover={{ scale: 1.02, borderColor: colorConfig[step.color].border }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg font-mono text-sm"
                  >
                    <span className="text-green-400">$</span>
                    <span className="text-slate-300">{step.code}</span>
                  </motion.div>
                </motion.div>

                {/* Number circle */}
                <motion.div
                  className="relative z-10"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`w-16 h-16 rounded-full ${colorConfig[step.color].bg} border-2 ${colorConfig[step.color].border} flex items-center justify-center shadow-xl ${colorConfig[step.color].glow}`}>
                    <span className={`text-2xl font-bold ${colorConfig[step.color].text}`}>
                      {step.number}
                    </span>
                  </div>
                  {/* Pulse effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-full ${colorConfig[step.color].bg} border ${colorConfig[step.color].border}`}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                </motion.div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
