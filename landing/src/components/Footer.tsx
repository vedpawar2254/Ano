import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="relative py-16 px-6 border-t border-zinc-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Brand */}
          <div>
            <a href="#" className="inline-flex items-center gap-2.5 mb-4">
              <Logo className="w-7 h-7" />
              <span className="text-lg font-semibold text-white">ano</span>
            </a>
            <p className="text-zinc-600 text-sm max-w-xs">
              Team collaboration for AI-assisted development.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Product</p>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/vedpawar2254/Ano/blob/main/README.md" className="text-zinc-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#demo" className="text-zinc-400 hover:text-white transition-colors">Demo</a></li>
                {/* <li><a href="https://github.com/vedpawar2254/Ano/blob/main/CHANGELOG.md" className="text-zinc-400 hover:text-white transition-colors">Changelog</a></li> */}
              </ul>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Resources</p>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/vedpawar2254/Ano/blob/main/README.md" className="text-zinc-400 hover:text-white transition-colors">Docs</a></li>
                <li><a href="https://github.com/vedpawar2254/Ano" className="text-zinc-400 hover:text-white transition-colors">GitHub</a></li>
                {/* <li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Discord</a></li> */}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-600">
          <span>{new Date().getFullYear()} Ano</span>
          <div className="flex gap-6">
            {/* <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
