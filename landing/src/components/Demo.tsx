import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';

export function Demo() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);

  return (
    <section id="demo" ref={containerRef} className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-emerald-500 text-sm font-medium mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Review before execution
          </h2>
        </motion.div>

        {/* Screenshot */}
        <motion.div style={{ y, opacity }} className="relative">
          {/* Window */}
          <div className="relative bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/50">
            {/* Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-zinc-600 font-mono">ano review deploy-plan.md</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex">
              {/* Editor */}
              <div className="flex-1 p-5 font-mono text-sm border-r border-zinc-800">
                <div className="space-y-1">
                  <Line num={1} content="# Deployment Plan" bold />
                  <Line num={2} content="" />
                  <Line num={3} content="## 1. Pre-deploy" muted />
                  <Line num={4} content="- Backup production database" annotation="concern" />
                  <Line num={5} content="- Notify on-call team" />
                  <Line num={6} content="" />
                  <Line num={7} content="## 2. Deploy" muted />
                  <Line num={8} content="- Push to staging first" annotation="blocker" />
                  <Line num={9} content="- Run smoke tests" />
                  <Line num={10} content="- Deploy to production" />
                  <Line num={11} content="" />
                  <Line num={12} content="## 3. Verify" muted />
                  <Line num={13} content="- Monitor error rates" />
                  <Line num={14} content="- Check latency metrics" />
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-64 p-4 bg-zinc-900/30">
                <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-4">
                  Annotations
                </p>
                <div className="space-y-3">
                  <AnnotationCard
                    type="concern"
                    line={4}
                    author="Sarah"
                    text="How long will this take? We have a 5min window."
                  />
                  <AnnotationCard
                    type="blocker"
                    line={8}
                    author="Mike"
                    text="Need QA sign-off before staging."
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-3">
                    Approvals
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs text-zinc-500">2 of 3 approved</span>
                  </div>
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
  bold,
  muted,
  annotation,
}: {
  num: number;
  content: string;
  bold?: boolean;
  muted?: boolean;
  annotation?: 'concern' | 'blocker';
}) {
  const bgClass = annotation === 'concern'
    ? 'bg-amber-500/5 border-l-2 border-amber-500/50'
    : annotation === 'blocker'
    ? 'bg-red-500/5 border-l-2 border-red-500/50'
    : '';

  const textClass = bold
    ? 'text-white font-medium'
    : muted
    ? 'text-zinc-500'
    : 'text-zinc-400';

  return (
    <div className={`flex items-center gap-4 px-2 py-0.5 -mx-2 rounded ${bgClass}`}>
      <span className="text-zinc-700 w-5 text-right text-xs select-none">{num}</span>
      <span className={textClass}>{content}</span>
    </div>
  );
}

function AnnotationCard({
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
  const borderClass = type === 'concern' ? 'border-amber-500/20' : 'border-red-500/20';
  const badgeClass = type === 'concern'
    ? 'bg-amber-500/10 text-amber-500'
    : 'bg-red-500/10 text-red-500';

  return (
    <div className={`p-3 rounded-lg border ${borderClass} bg-zinc-900/50`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badgeClass}`}>
          {type}
        </span>
        <span className="text-[10px] text-zinc-600">L{line}</span>
      </div>
      <p className="text-xs text-zinc-400 mb-2">{text}</p>
      <p className="text-[10px] text-zinc-600">{author}</p>
    </div>
  );
}
