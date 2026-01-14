import { Hero, Features, TerminalDemo, Demo, Footer } from './components';

function App() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Hero />
      <Features />
      <TerminalDemo />
      <Demo />
      <Footer />
    </div>
  );
}

export default App;
