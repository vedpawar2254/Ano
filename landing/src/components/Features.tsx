import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    title: 'Line-by-line annotations',
    description: 'Click any line to leave feedback. Tag as concern, blocker, or suggestion.',
  },
  {
    title: 'Approval workflow',
    description: 'Plans are blocked until your team signs off. Track who approved and when.',
  },
  {
    title: 'AI sees your feedback',
    description: 'Claude reads your annotations and iterates on the plan.',
  },
  {
    title: 'Real-time presence',
    description: 'See who\'s reviewing. Collaborate live with your team.',
  },
  {
    title: 'Version history',
    description: 'Every revision tracked. Compare changes and understand evolution.',
  },
  {
    title: 'Blocker enforcement',
    description: 'Critical issues halt execution. Nothing runs until resolved.',
  },
];

const capabilities = [
  'Markdown rendering',
  'Keyboard shortcuts',
  'Dark mode',
  'CLI integration',
  'Export to PDF',
  'Slack webhooks',
  'Access controls',
  'Audit logging',
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section id="features" ref={ref} className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <p className="text-emerald-500 text-sm font-medium mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Built for the new workflow
          </h2>
          <p className="text-zinc-500 text-lg max-w-xl">
            Everything you need to refine plans and steer AI with your team.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300"
            >
              <h3 className="text-white font-medium mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Capabilities row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-10 border-t border-zinc-800"
        >
          <p className="text-zinc-600 text-sm mb-6">Also includes</p>
          <div className="flex flex-wrap gap-3">
            {capabilities.map((cap) => (
              <span
                key={cap}
                className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm"
              >
                {cap}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
