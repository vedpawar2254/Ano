import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Command {
  cmd: string;
  description: string;
  output: React.ReactNode;
}

const commands: Command[] = [
  {
    cmd: 'ano serve',
    description: 'Start the review server',
    output: <ServeOutput />,
  },
  {
    cmd: 'ano review plan.md',
    description: 'Open a plan for review',
    output: <ReviewOutput />,
  },
  {
    cmd: 'ano status',
    description: 'Check annotation status',
    output: <StatusOutput />,
  },
  {
    cmd: 'ano approve --all',
    description: 'Approve all pending items',
    output: <ApproveOutput />,
  },
  {
    cmd: 'ano export --format md',
    description: 'Export annotated plan',
    output: <ExportOutput />,
  },
];

export function TerminalDemo() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-emerald-500 text-sm font-medium mb-3">Terminal</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Simple CLI, powerful workflow
          </h2>
          <p className="text-zinc-500 text-lg max-w-xl">
            Everything runs from your terminal. No context switching.
          </p>
        </div>

        {/* Terminal container */}
        <div className="grid lg:grid-cols-[300px,1fr] gap-6">
          {/* Command list */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4">
            <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-4 px-2">
              Commands
            </p>
            <div className="space-y-1">
              {commands.map((command, index) => (
                <button
                  key={command.cmd}
                  onClick={() => setActiveIndex(index)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                    activeIndex === index
                      ? 'bg-zinc-800 border border-zinc-700'
                      : 'hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-500 text-xs">$</span>
                    <span className={`font-mono text-sm ${
                      activeIndex === index ? 'text-white' : 'text-zinc-400'
                    }`}>
                      {command.cmd}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 pl-4">
                    {command.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Output panel */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-zinc-600 font-mono">
                  ~ / project
                </span>
              </div>
            </div>

            {/* Command input display */}
            <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="text-emerald-500">$</span>
                <span className="text-white">{commands[activeIndex].cmd}</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-4 bg-white/70"
                />
              </div>
            </div>

            {/* Output content */}
            <div className="p-4 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {commands[activeIndex].output}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServeOutput() {
  return (
    <div className="font-mono text-sm space-y-2">
      <div className="text-zinc-500">Starting ano server...</div>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <span className="text-emerald-500">✓</span>
        <span className="text-zinc-400">Server running on</span>
        <span className="text-emerald-400">http://localhost:3000</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-500">✓</span>
        <span className="text-zinc-400">WebSocket ready</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-500">✓</span>
        <span className="text-zinc-400">Watching for changes</span>
      </div>
      <div className="h-4" />
      <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="text-zinc-500 text-xs mb-3">Live connections</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-300">Sarah (viewing)</span>
            </div>
            <span className="text-zinc-600 text-xs">plan.md</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-300">Mike (annotating)</span>
            </div>
            <span className="text-zinc-600 text-xs">plan.md:L42</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewOutput() {
  return (
    <div className="font-mono text-sm">
      <div className="text-zinc-500 mb-4">Opening plan.md for review...</div>
      <div className="rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-400 text-xs">plan.md</span>
          <span className="text-amber-500 text-xs">2 annotations</span>
        </div>
        <div className="p-3 space-y-1 text-xs">
          <div className="flex gap-3">
            <span className="text-zinc-700 w-4">1</span>
            <span className="text-white font-medium"># Deploy Plan</span>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-700 w-4">2</span>
            <span className="text-zinc-500"></span>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-700 w-4">3</span>
            <span className="text-zinc-400">## Steps</span>
          </div>
          <div className="flex gap-3 bg-amber-500/10 -mx-3 px-3 py-1 border-l-2 border-amber-500">
            <span className="text-zinc-700 w-4">4</span>
            <span className="text-zinc-300">- Backup database</span>
            <span className="text-amber-500 ml-auto">← concern</span>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-700 w-4">5</span>
            <span className="text-zinc-300">- Run migrations</span>
          </div>
          <div className="flex gap-3 bg-red-500/10 -mx-3 px-3 py-1 border-l-2 border-red-500">
            <span className="text-zinc-700 w-4">6</span>
            <span className="text-zinc-300">- Deploy to prod</span>
            <span className="text-red-500 ml-auto">← blocker</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusOutput() {
  return (
    <div className="font-mono text-sm space-y-4">
      <div className="text-zinc-400">Checking status for <span className="text-white">plan.md</span></div>
      <div className="h-2" />
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <div>
            <div className="text-zinc-300 mb-1">Annotations</div>
            <div className="text-xs text-zinc-600">2 open, 1 resolved</div>
          </div>
          <div className="text-2xl font-semibold text-amber-500">3</div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <div>
            <div className="text-zinc-300 mb-1">Blockers</div>
            <div className="text-xs text-zinc-600">1 unresolved</div>
          </div>
          <div className="text-2xl font-semibold text-red-500">1</div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <div>
            <div className="text-zinc-300 mb-1">Approvals</div>
            <div className="text-xs text-zinc-600">Sarah, Mike approved</div>
          </div>
          <div className="text-2xl font-semibold text-emerald-500">2/3</div>
        </div>
      </div>
      <div className="h-2" />
      <div className="flex items-center gap-2 text-amber-500">
        <span>⚠</span>
        <span className="text-zinc-400">Cannot proceed: 1 blocker pending</span>
      </div>
    </div>
  );
}

function ApproveOutput() {
  return (
    <div className="font-mono text-sm space-y-2">
      <div className="text-zinc-500">Approving all pending items...</div>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <span className="text-emerald-500">✓</span>
        <span className="text-zinc-400">Approved:</span>
        <span className="text-zinc-300">L4 - Backup database</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-500">✓</span>
        <span className="text-zinc-400">Approved:</span>
        <span className="text-zinc-300">L6 - Deploy to prod</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-500">✓</span>
        <span className="text-zinc-400">Approved:</span>
        <span className="text-zinc-300">Overall plan</span>
      </div>
      <div className="h-4" />
      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <div className="flex items-center gap-2 text-emerald-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">All items approved</span>
        </div>
        <div className="text-zinc-500 text-xs mt-2">
          Plan is ready for execution. Run <span className="text-emerald-400">ano run</span> to proceed.
        </div>
      </div>
    </div>
  );
}

function ExportOutput() {
  return (
    <div className="font-mono text-sm space-y-2">
      <div className="text-zinc-500">Exporting plan with annotations...</div>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <span className="text-emerald-500">✓</span>
        <span className="text-zinc-400">Collected 3 annotations</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-500">✓</span>
        <span className="text-zinc-400">Collected 3 approvals</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-500">✓</span>
        <span className="text-zinc-400">Generated markdown</span>
      </div>
      <div className="h-4" />
      <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-zinc-400 text-xs">plan-reviewed.md</span>
          <span className="text-emerald-500 text-xs">Created</span>
        </div>
        <div className="text-xs text-zinc-500 space-y-1">
          <div># Deploy Plan</div>
          <div className="text-zinc-600">---</div>
          <div>Reviewed: 2024-01-15</div>
          <div>Approvers: Sarah, Mike, Ved</div>
          <div>Annotations: 3 (all resolved)</div>
          <div className="text-zinc-600">---</div>
        </div>
      </div>
      <div className="h-2" />
      <div className="text-zinc-500">
        Saved to <span className="text-emerald-400">./plan-reviewed.md</span>
      </div>
    </div>
  );
}
