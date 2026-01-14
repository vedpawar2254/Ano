import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const commands = [
  {
    command: 'ano serve',
    description: 'Start the review server and open in browser'
  },
  {
    command: 'ano review <file>',
    description: 'Open a specific plan file for review'
  },
  {
    command: 'ano status',
    description: 'Check annotation and approval status'
  },
  {
    command: 'ano approve',
    description: 'Approve the current plan'
  },
  {
    command: 'ano lgtm <file>',
    description: 'Approve with "Looks good to me"'
  },
  {
    command: 'ano shipit <file>',
    description: 'Strong approve, ready to ship'
  },
  {
    command: 'ano nit <file>:<line> "msg"',
    description: 'Minor nitpick (won\'t block)'
  },
  {
    command: 'ano block <file>:<line> "msg"',
    description: 'Blocker (will block execution)'
  },
  {
    command: 'ano question <file>:<line> "msg"',
    description: 'Quick question'
  },
  {
    command: 'ano export',
    description: 'Export annotated plan to markdown'
  },
  {
    command: 'ano init',
    description: 'Initialize ano in your project'
  }
];

export function QuickCommands() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-emerald-500 text-sm font-medium mb-3">Quick reference</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Simple CLI commands
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {commands.map((cmd, index) => (
            <CommandCard
              key={cmd.command}
              command={cmd.command}
              description={cmd.description}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommandCard({
  command,
  description,
  index,
  isInView,
}: {
  command: string;
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
      transition={{ duration: 0.5, delay: 0.05 * index }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 overflow-hidden transition-all duration-300 group"
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
        <code className="text-emerald-400 text-sm font-mono">{command}</code>
        <p className="text-zinc-500 text-xs mt-2">{description}</p>
      </div>
    </motion.div>
  );
}
