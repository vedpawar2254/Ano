import { Hero, Problem, Features, TerminalDemo, QuickCommands, MCPSection, Demo, Footer } from './components';
import { motion } from 'framer-motion';

function EasySection() {
  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-semibold text-white mb-4">
          Yes, it's that simple.
        </h2>
        <p className="text-zinc-500 text-lg">
          One command to start. Review in the browser. Iterate with AI.
        </p>
      </motion.div>
    </section>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Hero />
      <Problem />
      <Features />
      <TerminalDemo />
      <EasySection />
      <Demo />
      <QuickCommands />
      <MCPSection />
      <Footer />
    </div>
  );
}

export default App;
