import {
  Navbar,
  Hero,
  Problem,
  Features,
  Demo,
  HowItWorks,
  Testimonials,
  QuickStart,
  Footer
} from './components';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <Demo />
      <HowItWorks />
      <Testimonials />
      <QuickStart />
      <Footer />
    </div>
  );
}

export default App;
