const steps = [
  {
    number: 1,
    title: 'Install Ano',
    description: 'Add Ano as a Claude Code plugin. It integrates with your existing workflow.',
    color: 'blue'
  },
  {
    number: 2,
    title: 'Annotate Plans',
    description: "Review Claude's plans and add annotations. Tag concerns, questions, or blockers.",
    color: 'purple'
  },
  {
    number: 3,
    title: 'Approve & Execute',
    description: 'Once the team approves, Claude can proceed with execution. Full audit trail included.',
    color: 'green'
  }
];

export function HowItWorks() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          How it works
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <div
              className={`w-12 h-12 rounded-full bg-${step.color}-500/20 text-${step.color}-400 flex items-center justify-center text-xl font-bold mx-auto mb-4`}
              style={{
                backgroundColor: step.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' :
                                step.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' :
                                'rgba(34, 197, 94, 0.2)',
                color: step.color === 'blue' ? 'rgb(96, 165, 250)' :
                       step.color === 'purple' ? 'rgb(192, 132, 252)' :
                       'rgb(74, 222, 128)'
              }}
            >
              {step.number}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-slate-400 text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
