export function QuickStart() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
        <div className="space-y-4 font-mono text-sm">
          <div className="flex items-start gap-3">
            <span className="text-slate-500 select-none">$</span>
            <code className="text-green-400">npm install -g ano</code>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-slate-500 select-none">$</span>
            <code className="text-green-400">ano serve plan.md</code>
          </div>
          <div className="text-slate-400 text-xs mt-4">
            Or use the CLI commands:{' '}
            <code className="text-blue-400">ano annotate</code>,{' '}
            <code className="text-blue-400">ano list</code>,{' '}
            <code className="text-blue-400">ano approve</code>
          </div>
        </div>
      </div>
    </div>
  );
}
