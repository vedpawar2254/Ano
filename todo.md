- [ ]terminal UI in the landing
- [ ] terminal features testing
- [ ] claude code integration
- [ ] test team features and update accordingly
- [x] edit and anotation web
- [x] sidebar in web needs to improve 
- [x] better UI in the local web 
- [ ] publish
- [x] CI/CD
- [x] issue tracker, docs, etc.
- [x] remove UI friction
- [ ] remove comments in code
- [x] Shareable URLs with annotation state
- [ ] realtime team colaboration
- [ ] Also a "Send feedback" button to directly send feedback to claudecode
- [ ] Auto call/ open web when plan is created by claudecode



// Feature Request: Support Advanced Plan Metadata (Sub-agents, Tool Calls, MCP)
// What
// Extend Plannotator to capture and display rich metadata about the planning process, including:

// Sub-agent invocations: Which sub-agents were spawned (Explore, Plan, code-reviewer, etc.)
// Tool calls: Tools considered or called during planning (Read, Grep, Bash, etc.)
// MCP server interactions: Which MCP servers were queried and what data was retrieved
// Decision rationale: Why certain approaches were chosen over alternatives
// Planning iterations: How many times the plan was refined
// Why
// Currently, Plannotator only captures the final markdown plan content (event.tool_input?.plan). This is like seeing the final destination without knowing the journey. Users approving plans miss critical context:

// Informed Decision Making: Understanding HOW Claude arrived at a plan helps users evaluate its quality. A plan that spawned 5 sub-agents and queried 3 MCP servers demonstrates thoroughness.

// Trust Building: Showing the research process (files read, code explored) builds user confidence that the plan is well-informed.

// Debugging Planning Issues: When a plan misses something, seeing which tools/sub-agents were NOT used helps identify gaps.

// Learning Opportunity: Users can learn Claude's planning patterns by seeing which sub-agents handle which types of problems.

// Approval Granularity: Users might want to approve the "research" phase but request revisions on the "implementation" phase.

// How
// Phase 1: Data Capture (Core)
// 1.1 Extend Hook Event Parsing

// Update apps/hook/server/index.ts to extract additional fields from the hook event:

// // Current: Only captures plan markdown
// planContent = event.tool_input?.plan || "";

// // Proposed: Capture rich metadata
// interface PlanMetadata {
//   plan: string;                    // Existing markdown
//   subAgents?: SubAgentInvocation[]; // NEW
//   toolCalls?: ToolCallSummary[];    // NEW
//   mcpInteractions?: MCPInteraction[]; // NEW
//   iterations?: number;              // NEW
//   planningDuration?: number;        // NEW (milliseconds)
//   rationale?: string;               // NEW (why this approach)
// }

// interface SubAgentInvocation {
//   name: string;              // "Explore", "Plan", "code-reviewer"
//   purpose: string;           // Why this agent was spawned
//   status: "completed" | "failed" | "timeout";
//   tokensUsed?: number;
//   keyFindings?: string[];    // One-sentence summaries
// }

// interface ToolCallSummary {
//   tool: string;              // "Read", "Grep", "Bash"
//   purpose: string;           // What the tool was looking for
//   files?: string[];          // Files read/searched
//   commands?: string[];       // Bash commands run
//   resultCount?: number;      // Number of results
// }

// interface MCPInteraction {
//   server: string;            // MCP server name
//   tool: string;              // Tool called on server
//   purpose: string;           // Why this MCP was needed
//   success: boolean;
// }
// 1.2 Update Type Definitions

// Add to packages/ui/types.ts:

// export interface PlanMetadata {
//   plan: string;
//   subAgents?: SubAgentInvocation[];
//   toolCalls?: ToolCallSummary[];
//   mcpInteractions?: MCPInteraction[];
//   iterations?: number;
//   planningDuration?: number;
//   rationale?: string;
// }

// export interface SubAgentInvocation {
//   name: string;
//   purpose: string;
//   status: "completed" | "failed" | "timeout";
//   tokensUsed?: number;
//   keyFindings?: string[];
// }

// export interface ToolCallSummary {
//   tool: string;
//   purpose: string;
//   files?: string[];
//   commands?: string[];
//   resultCount?: number;
// }

// export interface MCPInteraction {
//   server: string;
//   tool: string;
//   purpose: string;
//   success: boolean;
// }
// 1.3 Server API Updates

// Modify apps/hook/server/index.ts:

// // API: Get plan with metadata
// if (url.pathname === "/api/plan") {
//   return Response.json({
//     plan: planContent,
//     metadata: planMetadata,  // NEW: Rich metadata
//   });
// }
// Phase 2: UI Components (Display)
// 2.1 Planning Insights Panel

// Create new component packages/ui/components/PlanningInsights.tsx:

// interface PlanningInsightsProps {
//   metadata: PlanMetadata;
// }

// export const PlanningInsights: React.FC<PlanningInsightsProps> = ({ metadata }) => {
//   return (
//     <div className="planning-insights-panel">
//       {/* Sub-agents section */}
//       {metadata.subAgents && (
//         <Section title="Sub-agents Spawned" icon={branchIcon}>
//           {metadata.subAgents.map(agent => (
//             <AgentCard key={agent.name} agent={agent} />
//           ))}
//         </Section>
//       )}

//       {/* Tool calls section */}
//       {metadata.toolCalls && (
//         <Section title="Tools Used" icon={toolIcon}>
//           <ToolCallList tools={metadata.toolCalls} />
//         </Section>
//       )}

//       {/* MCP interactions section */}
//       {metadata.mcpInteractions && (
//         <Section title="MCP Servers Queried" icon={serverIcon}>
//           <MCPList interactions={metadata.mcpInteractions} />
//         </Section>
//       )}

//       {/* Planning stats */}
//       <PlanningStats
//         iterations={metadata.iterations}
//         duration={metadata.planningDuration}
//       />
//     </div>
//   );
// };
// 2.2 Integrate into Main App

// Update packages/editor/App.tsx:

// const [metadata, setMetadata] = useState<PlanMetadata | null>(null);

// // Fetch from API
// useEffect(() => {
//   fetch('/api/plan')
//     .then(res => res.json())
//     .then((data: { plan: string; metadata?: PlanMetadata }) => {
//       setMarkdown(data.plan);
//       setMetadata(data.metadata || null);
//     });
// }, []);

// // Add collapsible insights panel
// {metadata && (
//   <PlanningInsights
//     metadata={metadata}
//     isOpen={showInsights}
//     onToggle={() => setShowInsights(!showInsights)}
//   />
// )}
// Phase 3: Advanced Features
// 3.1 Interactive Metadata Filtering

// Allow users to filter plan content by metadata:

// "Show only steps involving the Explore agent"
// "Highlight sections that used Grep tool"
// "Display MCP-derived insights separately"
// 3.2 Export with Metadata

// Extend exportDiff to include planning context:

// export function exportWithMetadata(
//   blocks: Block[],
//   annotations: Annotation[],
//   metadata: PlanMetadata
// ): string {
//   let output = exportDiff(blocks, annotations);

//   // Append planning context
//   output += "\n\n## Planning Context\n\n";
//   output += `- **Sub-agents**: ${metadata.subAgents?.map(a => a.name).join(", ") || "none"}\n`;
//   output += `- **Tools used**: ${metadata.toolCalls?.map(t => t.tool).join(", ") || "none"}\n`;
//   output += `- **MCP servers**: ${metadata.mcpInteractions?.map(m => m.server).join(", ") || "none"}\n`;
//   output += `- **Planning iterations**: ${metadata.iterations || 1}\n`;

//   return output;
// }
// 3.3 URL Sharing with Metadata

// Update packages/ui/utils/sharing.ts to compress metadata in share URLs (may require aggressive compression due to size limits).

// 3.4 Obsidian Integration

// Save planning metadata to Obsidian as YAML frontmatter:

// ---
// sub_agents: [Explore, Plan]
// tools_used: [Read, Grep, Bash]
// mcp_servers: [context7, memory-server]
// planning_iterations: 3
// ---
// File Change Summary
// Modified Files:

// apps/hook/server/index.ts - Parse and serve metadata
// packages/ui/types.ts - Add metadata interfaces
// packages/editor/App.tsx - Display metadata panel
// packages/ui/utils/sharing.ts - Include metadata in shares
// packages/ui/utils/parser.ts - Export with metadata context
// New Files:

// packages/ui/components/PlanningInsights.tsx - Main metadata display component
// packages/ui/components/AgentCard.tsx - Sub-agent invocation card
// packages/ui/components/ToolCallList.tsx - Tool calls visualization
// packages/ui/components/MCPList.tsx - MCP interaction list
// Open Questions
// Data Availability: Does the ExitPlanMode hook event actually contain this metadata, or does it only provide the final plan markdown? Need to inspect actual hook event structure.

// Size Limits: If metadata is large, can it still fit in URL sharing? May need server-side storage with short IDs.

// Privacy: Some tool calls may include sensitive data (file paths, command output). Need to filter or sanitize.

// Acceptance Criteria

// Hook server captures and serves planning metadata (sub-agents, tools, MCP)

// UI displays collapsible "Planning Insights" panel

// Each sub-agent invocation shows: name, purpose, status, key findings

// Tool calls are grouped by type with file/command counts

// MCP interactions show server name, tool, and success status

// Metadata is included in export diff output

// Metadata appears in Obsidian frontmatter when saved

// Panel is toggleable and collapsed by default (don't distract from plan content)

// URL sharing includes metadata OR shows warning that metadata is excluded

// Performance impact is minimal (metadata rendering < 100ms)
// Dependencies
// Claude Code Hook Event Structure: Need documentation on what data is actually available in ExitPlanMode events
// Potential Hook API Changes: May require Anthropic to expose additional metadata in hook events
// Related Issues
// Feature: Add Image Upload Support for Annotations #18 (Image Annotations) - Both issues enhance plan review with richer context


// FEATURE: Image names so I can reference them #67
// Open
// @luketych
// Description
// luketych
// opened 11 hours ago
// I want to be able to attach images as feedback, and then reference them in an annotation so that when the LLM is reading my annotation it can know to check the image for further feedback.