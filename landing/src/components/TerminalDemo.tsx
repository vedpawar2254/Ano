import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const commandOutputs: Record<string, () => React.ReactNode> = {
  'ano serve': () => <ServeOutput />,
  'ano serve --port 8080': () => <ServeOutput port={8080} />,
  'ano review plan.md': () => <ReviewOutput />,
  'ano review': () => <ReviewOutput />,
  'ano status': () => <StatusOutput />,
  'ano approve': () => <ApproveOutput />,
  'ano approve --all': () => <ApproveOutput all />,
  'ano export': () => <ExportOutput />,
  'ano export --format md': () => <ExportOutput format="md" />,
  'ano help': () => <HelpOutput />,
  'ano --help': () => <HelpOutput />,
  'ano init': () => <InitOutput />,
  'ano config': () => <ConfigOutput />,
  'ano users': () => <UsersOutput />,
};

const commands = [
  'ano serve',
  'ano review plan.md',
  'ano status',
  'ano approve --all',
  'ano export',
  'ano help',
  'ano init',
  'ano config',
  'ano users',
  'clear',
];

export function TerminalDemo() {
  const [input, setInput] = useState('');
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    if (cmd === 'clear') {
      setHistory([]);
      setCurrentCommand(null);
      setInput('');
      return;
    }
    setCurrentCommand(cmd);
    setHistory(prev => [...prev, cmd]);
    setInput('');
    setHistoryIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      if (history[history.length - 1 - newIndex]) {
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : history[history.length - 1 - newIndex] || '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const match = commands.find(c => c.startsWith(input));
      if (match) setInput(match);
    }
  };

  const focusInput = () => inputRef.current?.focus();

  useEffect(() => {
    focusInput();
  }, []);

  const output = currentCommand && commandOutputs[currentCommand]
    ? commandOutputs[currentCommand]()
    : currentCommand
    ? <div className="text-red-400 text-sm">Command not found: {currentCommand}</div>
    : <div className="text-zinc-600 text-sm">Run a command to see output</div>;

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-emerald-500 text-sm font-medium mb-3">Try it</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Interactive terminal
          </h2>
          <p className="text-zinc-500 text-lg">
            Type a command and press Enter, or click one from the list.
          </p>
        </div>

        <div className="flex gap-3" style={{ display: 'flex', flexDirection: 'row' }}>
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3 overflow-hidden" style={{ width: '160px', flexShrink: 0 }}>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-3">
              Commands
            </p>
            <div className="space-y-0.5">
              {commands.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    setInput(cmd);
                    focusInput();
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-colors ${
                    currentCommand === cmd
                      ? 'bg-zinc-800 text-emerald-400'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {cmd.replace('ano ', '')}
                </button>
              ))}
            </div>
          </div>

          <div
            className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex flex-col"
            style={{ flex: 1 }}
            onClick={focusInput}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="text-[10px] text-zinc-600 font-mono ml-2">terminal</span>
            </div>

            <div className="flex-1 p-4 font-mono text-sm min-h-[300px]">
              {history.slice(-5).map((cmd, i) => (
                <div key={i} className="flex items-center gap-2 text-zinc-600 mb-1">
                  <span className="text-zinc-700">$</span>
                  <span>{cmd}</span>
                </div>
              ))}

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <span className="text-emerald-500">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white outline-none caret-emerald-500"
                  placeholder="type command..."
                  spellCheck={false}
                  autoComplete="off"
                />
              </form>

              <div className="mt-6 text-[10px] text-zinc-700">
                Tab to autocomplete · Arrow keys for history
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex flex-col" style={{ flex: 1 }}>
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="text-[10px] text-zinc-600 font-mono ml-2">output</span>
              {currentCommand && (
                <span className="text-[10px] text-emerald-500 font-mono ml-auto">
                  {currentCommand}
                </span>
              )}
            </div>

            <div className="flex-1 p-4 min-h-[300px] overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCommand || 'empty'}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {output}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServeOutput({ port = 3000 }: { port?: number }) {
  return (
    <div className="font-mono text-xs space-y-1.5">
      <div className="text-zinc-500">Starting server...</div>
      <div className="text-emerald-400">✓ Running on http://localhost:{port}</div>
      <div className="text-emerald-400">✓ WebSocket ready</div>
      <div className="text-emerald-400">✓ Watching files</div>
      <div className="mt-4 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="text-zinc-500 text-[10px] mb-2">CONNECTED</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-300">Piyush</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-300">Aarya</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewOutput() {
  return (
    <div className="font-mono text-xs">
      <div className="text-zinc-500 mb-3">Opening plan.md...</div>
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-zinc-900 px-2 py-1 border-b border-zinc-800 text-[10px] text-zinc-500 flex justify-between">
          <span>plan.md</span>
          <span className="text-amber-500">2 annotations</span>
        </div>
        <div className="p-2 space-y-0.5 text-[11px]">
          <div><span className="text-zinc-700 mr-2">1</span><span className="text-white"># Deploy</span></div>
          <div><span className="text-zinc-700 mr-2">2</span></div>
          <div className="bg-amber-500/10 border-l-2 border-amber-500 pl-1 -ml-1">
            <span className="text-zinc-700 mr-2">3</span>
            <span className="text-zinc-300">- Backup DB</span>
          </div>
          <div><span className="text-zinc-700 mr-2">4</span><span className="text-zinc-300">- Migrate</span></div>
          <div className="bg-red-500/10 border-l-2 border-red-500 pl-1 -ml-1">
            <span className="text-zinc-700 mr-2">5</span>
            <span className="text-zinc-300">- Deploy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusOutput() {
  return (
    <div className="font-mono text-xs space-y-3">
      <div className="flex justify-between p-2 rounded bg-zinc-900">
        <span className="text-zinc-500">Annotations</span>
        <span className="text-amber-400">3 open</span>
      </div>
      <div className="flex justify-between p-2 rounded bg-zinc-900">
        <span className="text-zinc-500">Blockers</span>
        <span className="text-red-400">1</span>
      </div>
      <div className="flex justify-between p-2 rounded bg-zinc-900">
        <span className="text-zinc-500">Approvals</span>
        <span className="text-emerald-400">2/3</span>
      </div>
      <div className="text-amber-400 text-[10px] mt-2">
        ⚠ Blocked: 1 unresolved blocker
      </div>
    </div>
  );
}

function ApproveOutput({ all }: { all?: boolean }) {
  return (
    <div className="font-mono text-xs space-y-1">
      <div className="text-emerald-400">✓ Approved L3</div>
      {all && <div className="text-emerald-400">✓ Approved L5</div>}
      {all && <div className="text-emerald-400">✓ Approved plan</div>}
      <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <div className="text-emerald-400 font-medium">Ready to execute</div>
        <div className="text-zinc-500 text-[10px] mt-1">Run: ano run</div>
      </div>
    </div>
  );
}

function ExportOutput({ format = 'md' }: { format?: string }) {
  return (
    <div className="font-mono text-xs space-y-1">
      <div className="text-emerald-400">✓ 3 annotations</div>
      <div className="text-emerald-400">✓ 3 approvals</div>
      <div className="text-zinc-400 mt-2">
        → ./plan-reviewed.{format}
      </div>
    </div>
  );
}

function HelpOutput() {
  return (
    <div className="font-mono text-xs">
      <div className="text-white mb-3">ano commands</div>
      <div className="space-y-1 text-[11px]">
        <div><span className="text-emerald-400 w-20 inline-block">serve</span> <span className="text-zinc-500">Start server</span></div>
        <div><span className="text-emerald-400 w-20 inline-block">review</span> <span className="text-zinc-500">Open file</span></div>
        <div><span className="text-emerald-400 w-20 inline-block">status</span> <span className="text-zinc-500">Show status</span></div>
        <div><span className="text-emerald-400 w-20 inline-block">approve</span> <span className="text-zinc-500">Approve items</span></div>
        <div><span className="text-emerald-400 w-20 inline-block">export</span> <span className="text-zinc-500">Export plan</span></div>
        <div><span className="text-emerald-400 w-20 inline-block">init</span> <span className="text-zinc-500">Initialize</span></div>
        <div><span className="text-emerald-400 w-20 inline-block">config</span> <span className="text-zinc-500">View config</span></div>
        <div><span className="text-emerald-400 w-20 inline-block">users</span> <span className="text-zinc-500">List users</span></div>
      </div>
    </div>
  );
}

function InitOutput() {
  return (
    <div className="font-mono text-xs space-y-1">
      <div className="text-emerald-400">✓ .ano/config.json</div>
      <div className="text-emerald-400">✓ .ano/reviewers.json</div>
      <div className="text-zinc-400 mt-2">Initialized. Run: ano serve</div>
    </div>
  );
}

function ConfigOutput() {
  return (
    <div className="font-mono text-[11px] text-zinc-400">
      <div>{'{'}</div>
      <div className="pl-3">"port": <span className="text-emerald-400">3000</span>,</div>
      <div className="pl-3">"approvals": <span className="text-emerald-400">2</span>,</div>
      <div className="pl-3">"blockOnBlockers": <span className="text-emerald-400">true</span></div>
      <div>{'}'}</div>
    </div>
  );
}

function UsersOutput() {
  return (
    <div className="font-mono text-xs space-y-2">
      <div className="text-zinc-500">Connected:</div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-zinc-300">Sarah</span>
        <span className="text-zinc-600 text-[10px]">viewing</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-zinc-300">Mike</span>
        <span className="text-zinc-600 text-[10px]">annotating</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
        <span className="text-zinc-500">Ved</span>
        <span className="text-zinc-700 text-[10px]">idle</span>
      </div>
    </div>
  );
}
