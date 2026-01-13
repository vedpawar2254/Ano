const features = [
  {
    icon: '💬',
    title: 'Inline Annotations',
    description: 'Add comments to specific lines in plans and markdown. Support threaded discussions with your team.'
  },
  {
    icon: '🏷️',
    title: 'Structured Templates',
    description: 'Use concern, question, suggestion, or blocker tags for clarity in your feedback.'
  },
  {
    icon: '🤖',
    title: 'Claude Integration',
    description: 'Claude can read annotations and respond to feedback, making AI-assisted reviews seamless.'
  },
  {
    icon: '✅',
    title: 'Approval Gates',
    description: 'Require team approvals before proceeding. Track who approved or rejected plans.'
  },
  {
    icon: '📁',
    title: 'Git-Friendly',
    description: 'Annotations stored as sidecar JSON files. Commit alongside your code and share via git.'
  },
  {
    icon: '🌐',
    title: 'Web Interface',
    description: 'Visual annotation interface with click-to-annotate and real-time collaboration.'
  }
];

export function Features() {
  return (
    <div id="features" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Everything you need for plan review
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Ano integrates seamlessly with Claude Code to enable team collaboration on AI-generated plans.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
