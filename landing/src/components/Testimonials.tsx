import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    content: "Finally, we can review AI-generated plans as a team before Claude executes them. This has saved us from so many potential issues.",
    author: 'John Martinez',
    role: 'Engineering Manager',
    company: 'TechFlow',
    avatar: 'JM',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    content: "The Claude integration is seamless. Claude reads our annotations and addresses feedback directly. It feels like having an AI that actually listens.",
    author: 'Sarah Chen',
    role: 'Senior Engineer',
    company: 'DataStream',
    avatar: 'SC',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    content: "Git-based annotations are genius. We track feedback history alongside code, and the approval workflow fits perfectly into our PR process.",
    author: 'Mike Johnson',
    role: 'Tech Lead',
    company: 'CloudScale',
    avatar: 'MJ',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 4,
    content: "The blocker annotation type is a game-changer. No more accidentally executing plans with unresolved security concerns.",
    author: 'Emily Park',
    role: 'Security Engineer',
    company: 'SecureOps',
    avatar: 'EP',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    id: 5,
    content: "We went from chaotic Slack threads about Claude's plans to organized, threaded discussions right on the file. So much cleaner.",
    author: 'Alex Rivera',
    role: 'Staff Engineer',
    company: 'BuildFast',
    avatar: 'AR',
    gradient: 'from-rose-500 to-red-500'
  }
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance testimonials
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isInView]);

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/30 to-slate-900" />

      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"
        animate={{ scale: [1.3, 1, 1.3], y: [0, -50, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

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
            className="inline-block px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium rounded-full mb-6"
          >
            Testimonials
          </motion.span>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Loved by{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              engineering teams
            </span>
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            See what developers are saying about reviewing AI plans with Ano.
          </p>
        </motion.div>

        {/* Testimonial carousel */}
        <div className="max-w-3xl mx-auto">
          <div className="relative h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <motion.div
                  className="h-full bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 flex flex-col justify-between"
                  whileHover={{ borderColor: 'rgba(100, 116, 139, 0.5)' }}
                >
                  {/* Quote icon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl text-slate-700 mb-4"
                  >
                    "
                  </motion.div>

                  {/* Content */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-slate-200 leading-relaxed mb-6"
                  >
                    {testimonials[activeIndex].content}
                  </motion.p>

                  {/* Author */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonials[activeIndex].gradient} flex items-center justify-center text-white font-bold`}>
                      {testimonials[activeIndex].avatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{testimonials[activeIndex].author}</div>
                      <div className="text-slate-400 text-sm">
                        {testimonials[activeIndex].role} at {testimonials[activeIndex].company}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation dots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-3 mt-8"
          >
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </motion.div>

          {/* Navigation arrows */}
          <div className="flex justify-center gap-4 mt-6">
            <motion.button
              onClick={() => goTo((activeIndex - 1 + testimonials.length) % testimonials.length)}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => goTo((activeIndex + 1) % testimonials.length)}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
