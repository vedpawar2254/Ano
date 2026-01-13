import { Hero, Features, HowItWorks, QuickStart, Footer } from './components';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <Hero />
      <Features />
      <HowItWorks />
      <QuickStart />
      <Footer />
    </div>
  );
}

export default App;
