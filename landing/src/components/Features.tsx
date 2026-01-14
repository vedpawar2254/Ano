import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    title: 'Inline annotations',
    description: 'Add comments directly to specific lines. Tag them as concerns, blockers, or suggestions.',
  },
  {
    title: 'Approval gates',
    description: 'Block execution until your team signs off. Track who approved and when.',
  },
  {
    title: 'Claude integration',
    description: 'Claude reads your annotations and responds. Keep AI in your feedback loop.',
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Everything you need
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            Simple tools for reviewing AI-generated plans as a team.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="group"
            >
              {/* Number */}
              <div className="mb-6">
                <span className="text-6xl font-bold bg-gradient-to-b from-neutral-700 to-neutral-900 bg-clip-text text-transparent">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-violet-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-neutral-500 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover line */}
              <div className="mt-6 h-px w-0 group-hover:w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
