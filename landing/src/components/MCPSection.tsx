import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function MCPSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section ref={containerRef} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-emerald-500 text-sm font-medium mb-3">MCP integration</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Claude connects directly
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Ano includes an MCP server. Claude can read annotations, check approval status, and understand team feedback without switching contexts.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MCPDiagram />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Feature
              title="Seamless integration"
              description="Claude can directly query annotations, blockers, and approval status through the MCP protocol."
            />
            <Feature
              title="Real-time awareness"
              description="AI sees team feedback instantly. No copy-pasting annotations or summarizing discussions."
            />
            <Feature
              title="Automatic adaptation"
              description="Claude reads your concerns and blockers, then revises the plan accordingly before you even ask."
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MCPDiagram() {
  return (
    <div className="relative p-8 rounded-xl border border-zinc-800 bg-zinc-900/30">
      <div className="space-y-8">
        {/* Claude */}
        <div className="flex items-center justify-center">
          <div className="px-6 py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <span className="text-emerald-400 font-medium">Claude</span>
          </div>
        </div>

        {/* Connection line */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-px h-8 bg-gradient-to-b from-emerald-500/50 to-zinc-700" />
            <div className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700">
              <span className="text-xs text-zinc-400 font-mono">MCP Protocol</span>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-zinc-700 to-emerald-500/50" />
          </div>
        </div>

        {/* Ano MCP Server */}
        <div className="flex items-center justify-center">
          <div className="px-6 py-3 rounded-lg border border-zinc-700 bg-zinc-800">
            <span className="text-zinc-300 font-medium">Ano MCP Server</span>
          </div>
        </div>

        {/* Connections to resources */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <Resource label="Annotations" />
          <Resource label="Approvals" />
          <Resource label="Blockers" />
        </div>
      </div>

      {/* Decorative dots */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/10" />
      </div>
    </div>
  );
}

function Resource({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-px h-4 bg-zinc-700" />
      <div className="px-3 py-2 rounded border border-zinc-800 bg-zinc-900/50 text-center">
        <span className="text-xs text-zinc-400">{label}</span>
      </div>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
