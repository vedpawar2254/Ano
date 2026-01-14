import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="relative py-20 px-6 border-t border-neutral-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-3"
            whileHover={{ opacity: 0.8 }}
          >
            <img src="/logo.png" alt="Ano" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-semibold text-white">ano</span>
          </motion.a>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm">
            <a href="#" className="text-neutral-500 hover:text-white transition-colors">
              Docs
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="text-neutral-500 hover:text-white transition-colors">
              Twitter
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-neutral-600">
            {new Date().getFullYear()} Ano
          </p>
        </div>
      </div>
    </footer>
  );
}
