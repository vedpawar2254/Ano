import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

// Simulated annotation data
const annotations = [
  {
    id: 1,
    line: 4,
    type: 'concern',
    author: 'Sarah Chen',
    avatar: 'SC',
    content: 'Have we tested the rollback procedure?',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    line: 7,
    type: 'blocker',
    author: 'Mike Johnson',
    avatar: 'MJ',
    content: 'Need security review before production deployment',
    timestamp: '1 hour ago'
  },
  {
    id: 3,
    line: 10,
    type: 'suggestion',
    author: 'Alex Rivera',
    avatar: 'AR',
    content: 'Consider adding a staging environment step',
    timestamp: '30 min ago'
  }
];

const codeLines = [
  { num: 1, content: '# Deployment Plan', type: 'heading' },
  { num: 2, content: '', type: 'empty' },
  { num: 3, content: '## Phase 1: Database Migration', type: 'subheading' },
  { num: 4, content: '- Run migration scripts on production', type: 'text', hasAnnotation: 'concern' },
  { num: 5, content: '- Verify data integrity checks pass', type: 'text' },
  { num: 6, content: '', type: 'empty' },
  { num: 7, content: '## Phase 2: Deploy Services', type: 'subheading', hasAnnotation: 'blocker' },
  { num: 8, content: '- Deploy backend services first', type: 'text' },
  { num: 9, content: '- Deploy frontend after backend healthy', type: 'text' },
  { num: 10, content: '- Run smoke tests', type: 'text', hasAnnotation: 'suggestion' },
  { num: 11, content: '', type: 'empty' },
  { num: 12, content: '## Phase 3: Verification', type: 'subheading' },
  { num: 13, content: '- Monitor error rates for 30 minutes', type: 'text' },
  { num: 14, content: '- Get sign-off from on-call engineer', type: 'text' },
];

const typeColors: Record<string, { bg: string; border: string; text: string; marker: string }> = {
  concern: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    marker: 'bg-amber-500'
  },
  blocker: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    marker: 'bg-red-500'
  },
  suggestion: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    marker: 'bg-green-500'
  },
  question: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    marker: 'bg-blue-500'
  }
};

export function Demo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  // Auto-cycle through annotations
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setSelectedAnnotation(prev => {
        const next = prev === null ? 0 : (prev + 1) % annotations.length;
        setHighlightedLine(annotations[next].line);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section id="demo" className="relative py-32 overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium rounded-full mb-6"
          >
            Interactive Demo
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            See it in{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              action
            </span>
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Click on annotations to see how your team can collaborate on AI-generated plans.
          </p>
        </motion.div>

        {/* Demo UI */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <motion.div
            className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
            whileHover={{ borderColor: 'rgb(71, 85, 105)' }}
          >
            {/* Window header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <motion.div className="w-3 h-3 rounded-full bg-red-500" whileHover={{ scale: 1.3 }} />
                  <motion.div className="w-3 h-3 rounded-full bg-yellow-500" whileHover={{ scale: 1.3 }} />
                  <motion.div className="w-3 h-3 rounded-full bg-green-500" whileHover={{ scale: 1.3 }} />
                </div>
                <span className="text-slate-400 text-sm font-mono">deploy-plan.md</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded">
                  1 concern
                </span>
                <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                  1 blocker
                </span>
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                  1 suggestion
                </span>
              </div>
            </div>

            {/* Content area */}
            <div className="flex">
              {/* Code viewer */}
              <div className="flex-1 p-4 font-mono text-sm overflow-x-auto">
                {codeLines.map((line) => (
                  <motion.div
                    key={line.num}
                    className={`flex items-center py-0.5 px-2 rounded transition-colors relative ${
                      highlightedLine === line.num ? 'bg-blue-500/10' : ''
                    }`}
                    animate={{
                      backgroundColor: highlightedLine === line.num ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                    }}
                  >
                    {/* Annotation marker */}
                    {line.hasAnnotation && (
                      <motion.div
                        className={`absolute -left-1 w-1 h-5 rounded-full ${typeColors[line.hasAnnotation].marker}`}
                        layoutId={`marker-${line.num}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ width: 4, left: -2 }}
                      />
                    )}

                    <span className="text-slate-500 w-8 select-none">{line.num}</span>
                    <span className={`
                      ${line.type === 'heading' ? 'text-blue-400 font-bold' : ''}
                      ${line.type === 'subheading' ? 'text-purple-400 font-semibold' : ''}
                      ${line.type === 'text' ? 'text-slate-300' : ''}
                      ${line.hasAnnotation ? typeColors[line.hasAnnotation].bg + ' px-1 rounded' : ''}
                    `}>
                      {line.content}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="w-80 border-l border-slate-700 bg-slate-800/30">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-white font-semibold text-sm">Annotations</h3>
                  <p className="text-slate-500 text-xs mt-1">3 comments on this file</p>
                </div>

                <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {annotations.map((annotation, index) => (
                      <motion.div
                        key={annotation.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          setSelectedAnnotation(index);
                          setHighlightedLine(annotation.line);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          typeColors[annotation.type].bg
                        } border ${
                          selectedAnnotation === index
                            ? typeColors[annotation.type].border + ' shadow-lg'
                            : 'border-transparent'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <motion.span
                            className={`px-1.5 py-0.5 text-xs rounded ${typeColors[annotation.type].bg} ${typeColors[annotation.type].text} border ${typeColors[annotation.type].border}`}
                            whileHover={{ scale: 1.1 }}
                          >
                            {annotation.type}
                          </motion.span>
                          <span className="text-xs text-slate-500">Line {annotation.line}</span>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{annotation.content}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-medium">
                            {annotation.avatar}
                          </div>
                          <span className="text-xs text-slate-400">{annotation.author}</span>
                          <span className="text-xs text-slate-500 ml-auto">{annotation.timestamp}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Action buttons */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Add Comment
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA below demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <motion.a
            href="#quickstart"
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg shadow-purple-600/25"
          >
            Try it yourself
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
