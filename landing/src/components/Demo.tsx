import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

export function Demo() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);

  const [activeTab, setActiveTab] = useState<'annotations' | 'activity'>('annotations');
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(1);

  return (
    <section id="demo" ref={containerRef} className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-emerald-500 text-sm font-medium mb-3">The interface</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Refine plans together
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Your team reviews and annotates in real-time. Claude sees the feedback and iterates.
          </p>
        </motion.div>

        <motion.div style={{ y, opacity }} className="relative">
          <div className="relative bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-zinc-400 font-mono">deploy-plan.md</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">2 open</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-zinc-500">Piyush</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-zinc-500">Aarya</span>
                </div>
                <button className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-300">
                  Export
                </button>
              </div>
            </div>

            <div className="flex" style={{ height: '420px' }}>
              <div className="flex-1 overflow-hidden border-r border-zinc-800">
                <div className="p-4 font-mono text-sm">
                  <div className="space-y-0">
                    <Line num={1} content="# Deployment Plan" bold />
                    <Line num={2} content="" />
                    <Line num={3} content="## 1. Pre-deploy" muted />
                    <Line num={4} content="- Backup production database" annotation="concern" annotationCount={1} />
                    <Line num={5} content="- Notify on-call team" />
                    <Line num={6} content="" />
                    <Line num={7} content="## 2. Deploy" muted />
                    <Line num={8} content="- Push to staging first" annotation="blocker" annotationCount={1} />
                    <Line num={9} content="- Run smoke tests" />
                    <Line num={10} content="- Deploy to production" />
                    <Line num={11} content="" />
                    <Line num={12} content="## 3. Verify" muted />
                    <Line num={13} content="- Monitor error rates" selected />
                    <Line num={14} content="- Check latency metrics" />
                  </div>
                </div>
              </div>

              <div className="w-72 bg-zinc-900/30 flex flex-col">
                <div className="flex gap-1 p-3 border-b border-zinc-800/50">
                  <button
                    onClick={() => setActiveTab('annotations')}
                    className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                      activeTab === 'annotations'
                        ? 'bg-zinc-800 text-zinc-200'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Annotations
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                      activeTab === 'activity'
                        ? 'bg-zinc-800 text-zinc-200'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Activity
                  </button>
                </div>

                <div className="px-3 py-2">
                  <input
                    type="text"
                    placeholder="Search annotations..."
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 placeholder-zinc-600 focus:outline-none"
                    readOnly
                  />
                </div>

                <div className="flex border-b border-zinc-800/50 px-3 text-[11px]">
                  <button className="px-2 py-2 text-zinc-200 border-b border-zinc-400">
                    All <span className="text-zinc-600 ml-0.5">2</span>
                  </button>
                  <button className="px-2 py-2 text-zinc-500">
                    Open <span className="text-zinc-600 ml-0.5">2</span>
                  </button>
                  <button className="px-2 py-2 text-zinc-500">
                    Blockers <span className="text-zinc-600 ml-0.5">1</span>
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-3 space-y-2">
                  <div className="mb-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Approvals</p>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-400">2 of 3 approved</span>
                      </div>
                    </div>
                  </div>

                  <AnnotationCard
                    type="concern"
                    line={4}
                    author="Sarah"
                    text="How long will this take? We have a 5min window."
                    time="2h"
                    selected={selectedAnnotation === 1}
                    onClick={() => setSelectedAnnotation(1)}
                    replies={[
                      { author: "Mike", text: "Usually under 2 min", time: "1h" }
                    ]}
                  />
                  <AnnotationCard
                    type="blocker"
                    line={8}
                    author="Mike"
                    text="Need QA sign-off before staging."
                    time="1h"
                    selected={selectedAnnotation === 2}
                    onClick={() => setSelectedAnnotation(2)}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-20"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <WorkflowStep
              step="1"
              title="AI generates a plan"
              description="Claude creates a detailed implementation plan."
            />
            <WorkflowStep
              step="2"
              title="Team refines it"
              description="Review, annotate, and flag concerns collaboratively."
            />
            <WorkflowStep
              step="3"
              title="AI adapts"
              description="Claude sees feedback and iterates on the plan."
            />
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
  annotationCount,
  selected,
}: {
  num: number;
  content: string;
  bold?: boolean;
  muted?: boolean;
  annotation?: 'concern' | 'blocker';
  annotationCount?: number;
  selected?: boolean;
}) {
  const bgClass = annotation === 'concern'
    ? 'bg-amber-500/5'
    : annotation === 'blocker'
    ? 'bg-red-500/5'
    : selected
    ? 'bg-zinc-800/50'
    : '';

  const markerClass = annotation === 'concern'
    ? 'bg-amber-500'
    : annotation === 'blocker'
    ? 'bg-red-500'
    : '';

  const textClass = bold
    ? 'text-white font-medium'
    : muted
    ? 'text-zinc-500'
    : 'text-zinc-400';

  return (
    <div className={`flex items-center group relative ${bgClass} hover:bg-zinc-800/30`}>
      <span className="text-zinc-700 w-8 text-right text-xs select-none pr-4 flex-shrink-0">{num}</span>
      {annotation && (
        <div className={`w-0.5 h-full absolute left-8 ${markerClass}`} />
      )}
      <span className={`pl-4 py-0.5 ${textClass}`}>{content}</span>
      {annotationCount && (
        <span className="ml-auto text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 pr-2">
          {annotationCount}
        </span>
      )}
    </div>
  );
}

function AnnotationCard({
  type,
  line,
  author,
  text,
  time,
  selected,
  onClick,
  replies,
}: {
  type: 'concern' | 'blocker';
  line: number;
  author: string;
  text: string;
  time: string;
  selected?: boolean;
  onClick?: () => void;
  replies?: { author: string; text: string; time: string }[];
}) {
  const borderClass = type === 'concern' ? 'border-amber-500/20' : 'border-red-500/20';
  const typeColor = type === 'concern' ? 'text-amber-500' : 'text-red-500';
  const hoverGlow = type === 'concern'
    ? 'hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
    : 'hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]';

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border ${borderClass} cursor-pointer transition-all duration-300 ${hoverGlow} ${
        selected ? 'bg-zinc-800' : 'bg-zinc-900/50 hover:bg-zinc-800/50'
      }`}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-medium ${typeColor}`}>{type}</span>
          <span className="text-[10px] text-zinc-600">L{line}</span>
        </div>
        <p className={`text-[12px] text-zinc-300 mb-2 ${selected ? '' : 'line-clamp-2'}`}>{text}</p>
        <div className="flex items-center justify-between text-[10px] text-zinc-600">
          <span>{author}</span>
          <span>{time}</span>
        </div>
      </div>

      {selected && replies && replies.length > 0 && (
        <div className="border-t border-zinc-800 px-3 py-2">
          {replies.map((reply, i) => (
            <div key={i} className="pl-2 border-l-2 border-zinc-700">
              <p className="text-[11px] text-zinc-400">{reply.text}</p>
              <div className="flex items-center gap-2 mt-0.5 text-[9px] text-zinc-600">
                <span>{reply.author}</span>
                <span>{reply.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="border-t border-zinc-800 px-3 py-2 flex items-center gap-3">
          <button className="text-[10px] text-zinc-500 hover:text-zinc-300">Reply</button>
          <button className="text-[10px] text-zinc-500 hover:text-emerald-400">Resolve</button>
          <button className="text-[10px] text-zinc-500 hover:text-red-400 ml-auto">Delete</button>
        </div>
      )}
    </div>
  );
}

function WorkflowStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
        <span className="text-sm font-medium text-emerald-500">{step}</span>
      </div>
      <h3 className="text-white font-medium mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm">{description}</p>
    </div>
  );
}
