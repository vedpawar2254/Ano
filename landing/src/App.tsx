import { Hero, Features, TerminalDemo, Demo, Footer } from './components';
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
          Yes, it's that easy.
        </h2>
        <p className="text-zinc-500 text-lg">
          One command to start. Your team reviews in the browser. Claude adapts to feedback.
        </p>
      </motion.div>
    </section>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Hero />
      <Features />
      <TerminalDemo />
      <EasySection />
      <Demo />
      <Footer />
    </div>
  );
}

export default App;
