import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

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
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              index={index}
              isInView={isInView}
            />
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
                className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-default"
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

function FeatureCard({
  title,
  description,
  index,
  isInView,
}: {
  title: string;
  description: string;
  index: number;
  isInView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative p-6 rounded-lg border border-zinc-800 bg-zinc-900/20 overflow-hidden transition-all duration-300 group"
      style={{
        boxShadow: isHovering
          ? '0 0 20px rgba(16, 185, 129, 0.15)'
          : 'none',
      }}
    >
      {/* Cursor-following glow effect on border */}
      {isHovering && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.15), transparent 40%)`,
          }}
        />
      )}
      {/* Border gradient that follows cursor */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(250px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.4), transparent 100%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      <div className="relative z-10">
        <h3 className="text-white font-medium mb-2">{title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
