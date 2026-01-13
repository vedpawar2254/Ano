export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
        {/* Logo and title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-8 shadow-lg shadow-blue-500/25">
            <span className="text-4xl font-bold text-white">A</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ano
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-4">
            Collaborative annotation for Claude-generated plans
          </p>

          <p className="text-slate-400 max-w-xl mx-auto mb-10">
            Review, annotate, and approve AI-generated plans with your team.
            Keep Claude in the feedback loop.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://github.com/anthropics/ano"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="px-8 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-all border border-slate-600"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Hero visual - Mock annotation UI */}
        <div className="mt-16 relative">
          <div className="bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 shadow-2xl overflow-hidden max-w-4xl mx-auto">
            {/* Mock header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-slate-800/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-slate-400 text-sm font-mono">plan.md</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">2 open</span>
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">1 approved</span>
              </div>
            </div>

            {/* Mock content */}
            <div className="flex">
              <div className="flex-1 p-6 font-mono text-sm">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <span className="text-slate-500 w-8">1</span>
                    <span className="text-blue-400"># Implementation Plan</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 w-8">2</span>
                    <span className="text-slate-400"></span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 w-8">3</span>
                    <span className="text-purple-400">## Step 1: Database Migration</span>
                  </div>
                  <div className="flex items-center relative">
                    <div className="absolute -left-1 w-1 h-5 bg-amber-500 rounded-full"></div>
                    <span className="text-slate-500 w-8">4</span>
                    <span className="text-slate-300 bg-amber-500/10 px-1 rounded">Run migration scripts on staging first</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 w-8">5</span>
                    <span className="text-slate-400"></span>
                  </div>
                  <div className="flex items-center relative">
                    <div className="absolute -left-1 w-1 h-5 bg-red-500 rounded-full"></div>
                    <span className="text-slate-500 w-8">6</span>
                    <span className="text-purple-400 bg-red-500/10 px-1 rounded">## Step 2: Deploy to Production</span>
                  </div>
                </div>
              </div>

              {/* Mock sidebar */}
              <div className="w-64 border-l border-slate-700 p-4 bg-slate-800/30 hidden md:block">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Annotations</div>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 text-xs bg-amber-500/30 text-amber-400 rounded">concern</span>
                      <span className="text-xs text-slate-400">Line 4</span>
                    </div>
                    <p className="text-sm text-slate-300">Have we tested rollback?</p>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 text-xs bg-red-500/30 text-red-400 rounded">blocker</span>
                      <span className="text-xs text-slate-400">Line 6</span>
                    </div>
                    <p className="text-sm text-slate-300">Need security review first</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
