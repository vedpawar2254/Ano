import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';

export function Demo() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

  return (
    <section id="demo" ref={containerRef} className="relative py-32 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            See it in action
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            Add annotations, discuss with your team, approve when ready.
          </p>
        </motion.div>

        {/* Product screenshot mockup */}
        <motion.div
          style={{ y, opacity, scale }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-orange-500/20 rounded-2xl blur-3xl" />

          {/* Screenshot container */}
          <div className="relative bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-neutral-600 font-mono">localhost:3000/plan.md</span>
              </div>
            </div>

            {/* Content area */}
            <div className="flex min-h-[400px]">
              {/* Editor panel */}
              <div className="flex-1 p-6 font-mono text-sm border-r border-neutral-800">
                <div className="space-y-2">
                  <Line num={1} content="# Deployment Plan" type="heading" />
                  <Line num={2} content="" />
                  <Line num={3} content="## Phase 1: Preparation" type="subheading" />
                  <Line num={4} content="- Backup production database" annotation="concern" />
                  <Line num={5} content="- Notify on-call team" />
                  <Line num={6} content="" />
                  <Line num={7} content="## Phase 2: Deploy" type="subheading" />
                  <Line num={8} content="- Deploy to staging first" annotation="blocker" />
                  <Line num={9} content="- Run smoke tests" />
                  <Line num={10} content="- Deploy to production" />
                </div>
              </div>

              {/* Annotations panel */}
              <div className="w-72 p-4 bg-neutral-950/50">
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-4">
                  Annotations
                </div>
                <div className="space-y-3">
                  <Annotation
                    type="concern"
                    line={4}
                    author="SC"
                    text="How long will backup take?"
                  />
                  <Annotation
                    type="blocker"
                    line={8}
                    author="MJ"
                    text="Need QA approval first"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Line({
  num,
  content,
  type,
  annotation,
}: {
  num: number;
  content: string;
  type?: 'heading' | 'subheading';
  annotation?: 'concern' | 'blocker';
}) {
  const textColor = type === 'heading'
    ? 'text-white font-bold'
    : type === 'subheading'
    ? 'text-neutral-300 font-semibold'
    : 'text-neutral-400';

  const annotationStyle = annotation === 'concern'
    ? 'bg-amber-500/10 border-l-2 border-amber-500'
    : annotation === 'blocker'
    ? 'bg-red-500/10 border-l-2 border-red-500'
    : '';

  return (
    <div className={`flex items-center gap-4 px-2 py-0.5 rounded ${annotationStyle}`}>
      <span className="text-neutral-600 w-6 text-right select-none">{num}</span>
      <span className={textColor}>{content}</span>
    </div>
  );
}

function Annotation({
  type,
  line,
  author,
  text,
}: {
  type: 'concern' | 'blocker';
  line: number;
  author: string;
  text: string;
}) {
  const colors = type === 'concern'
    ? 'border-amber-500/30 bg-amber-500/5'
    : 'border-red-500/30 bg-red-500/5';

  const badge = type === 'concern'
    ? 'bg-amber-500/20 text-amber-400'
    : 'bg-red-500/20 text-red-400';

  return (
    <div className={`p-3 rounded-lg border ${colors}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-1.5 py-0.5 rounded ${badge}`}>
          {type}
        </span>
        <span className="text-xs text-neutral-600">Line {line}</span>
      </div>
      <p className="text-sm text-neutral-300 mb-2">{text}</p>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] text-white font-medium">
          {author}
        </div>
        <span className="text-xs text-neutral-500">2h ago</span>
      </div>
    </div>
  );
}
