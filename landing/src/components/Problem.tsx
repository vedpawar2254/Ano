import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const problems = [
  {
    title: 'No structured review process',
    description: 'Claude generates plans, but there\'s no formal way for teams to review, discuss, and approve before execution.'
  },
  {
    title: 'Feedback gets lost',
    description: 'Comments in Slack, Discord, or docs disappear. Claude can\'t see them or understand what needs to change.'
  },
  {
    title: 'No collaboration workflow',
    description: 'Multiple stakeholders need to weigh in, but there\'s no system to track who reviewed, approved, or raised concerns.'
  },
  {
    title: 'Risky to execute blindly',
    description: 'Running AI-generated plans without oversight can introduce bugs, miss edge cases, or break production.'
  },
  {
    title: 'No approval gates',
    description: 'You need sign-off from security, QA, or leads, but there\'s no enforcement mechanism to block execution until cleared.'
  },
  {
    title: 'Plans need iteration',
    description: 'The real work is refining and steering AI. The tooling treats it as one-shot generation instead of an iterative process.'
  }
];

export function Problem() {
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
          <p className="text-zinc-500 text-sm font-medium mb-3">The shift</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Development is changing
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            We spend less time coding, more time refining plans and steering AI. The tooling hasn't caught up.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="p-5 rounded-lg border border-zinc-800 bg-zinc-900/30"
            >
              <h3 className="text-base font-medium text-white mb-2">{problem.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
