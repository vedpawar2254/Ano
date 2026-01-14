import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

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
            <ProblemCard
              key={problem.title}
              title={problem.title}
              description={problem.description}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemCard({
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
      transition={{ duration: 0.5, delay: 0.1 * index }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative p-5 rounded-lg border border-zinc-800 bg-zinc-900/30 overflow-hidden transition-all duration-300 group"
      style={{
        boxShadow: isHovering
          ? '0 0 20px rgba(16, 185, 129, 0.15)'
          : 'none',
      }}
    >
      {isHovering && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.15), transparent 40%)`,
          }}
        />
      )}
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
        <h3 className="text-base font-medium text-white mb-2">{title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
