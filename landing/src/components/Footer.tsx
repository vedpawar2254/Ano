export function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-slate-400">Ano</span>
        </div>
        <p className="text-slate-500 text-sm">
          A Claude Code plugin for collaborative annotation
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="#"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
