# Things I Learned

1. MCP development

# MCP Development Crash Course

## What is MCP?

**MCP (Model Context Protocol)** is a standard protocol for AI applications to connect with external tools/plugins.

- Created by Anthropic
- Works with: Claude Code, Cursor, Windsurf, and any MCP-compatible client
- **Write once, works everywhere**

## Architecture

```
┌──────────────┐                    ┌──────────────┐
│              │                    │              │
│    CLIENT    │◄────── MCP ──────►│    SERVER    │
│  (Claude)    │                    │  (Your code) │
│              │                    │              │
└──────────────┘                    └──────────────┘
```

- **Client**: The AI app (Claude Code, Cursor, etc.)
- **Server**: Your plugin (runs as separate process)
- **Communication**: JSON-RPC 2.0 over stdio

## JSON-RPC Format

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "my_tool",
    "arguments": { "key": "value" }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { "content": [...] }
}
```

## Three Types of Capabilities

### 1. Tools (Most Common)
Functions Claude can call to take actions.

```typescript
server.tool(
  'tool_name',           // Name
  'Description',         // Helps Claude know when to use it
  { param: z.string() }, // Zod schema for parameters
  async ({ param }) => { // Handler
    return { content: [{ type: 'text', text: 'result' }] };
  }
);
```

### 2. Resources
Read-only data Claude can access.

```typescript
server.resource(
  'config://app/settings',  // URI
  'Description',
  async () => ({
    contents: [{
      uri: 'config://app/settings',
      mimeType: 'application/json',
      text: JSON.stringify(data)
    }]
  })
);
```

### 3. Prompts
Pre-written templates users can invoke.

```typescript
server.prompt(
  'code-review',
  'Review code',
  async () => ({
    messages: [{
      role: 'user',
      content: { type: 'text', text: 'Review this code...' }
    }]
  })
);
```

## Tools vs Resources

| Aspect | Tools | Resources |
|--------|-------|-----------|
| Purpose | Actions | Data |
| Example | "Send email" | "Read config" |
| Parameters | Complex inputs | Just URI |
| Side effects | Can modify state | Read-only |

## Minimal MCP Server

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'my-server',
  version: '1.0.0',
});

server.tool(
  'greet',
  'Greet someone',
  { name: z.string() },
  async ({ name }) => ({
    content: [{ type: 'text', text: `Hello, ${name}!` }]
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Zod Schema → JSON Schema

```typescript
z.string()              → { "type": "string" }
z.number()              → { "type": "number" }
z.boolean()             → { "type": "boolean" }
z.array(z.string())     → { "type": "array", "items": { "type": "string" } }
z.enum(['a','b'])       → { "type": "string", "enum": ["a", "b"] }
z.optional()            → not in "required" array
.describe('...')        → "description": "..."
```

## Tool Return Format

```typescript
// Success
return {
  content: [
    { type: 'text', text: 'Result here' }
  ]
};

// Error
return {
  content: [
    { type: 'text', text: 'Error message' }
  ],
  isError: true
};

// Image
return {
  content: [
    { type: 'image', data: base64String, mimeType: 'image/png' }
  ]
};
```

## MCP Lifecycle

```
1. STARTUP     → Claude Code spawns server as child process
2. INITIALIZE  → Client sends "initialize" with capabilities
3. DISCOVERY   → Client calls "tools/list" to see available tools
4. OPERATION   → User asks → Claude calls tools → Server responds
5. SHUTDOWN    → Client closes stdin → Server exits
```

## Error Handling Best Practices

```typescript
// ✅ Log to stderr (stdout is for JSON-RPC!)
console.error('Debug message');

// ✅ Return errors gracefully
if (error) {
  return {
    content: [{ type: 'text', text: `Error: ${error.message}` }],
    isError: true
  };
}

// ❌ Don't throw - return error response instead
// ❌ Don't use console.log - breaks JSON-RPC!
```

## Testing MCP Servers

```bash
# List tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node server.js 2>/dev/null | jq

# Call a tool
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"my_tool","arguments":{"key":"value"}}}' | node server.js 2>/dev/null | jq

# See logs (don't redirect stderr)
echo '...' | node server.js
```

## Registering with Claude Code

Add to `~/.claude/settings.json` or `.claude/settings.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"]
    }
  }
}
```

## Key Takeaways

1. **MCP = JSON-RPC over stdio** - Simple request/response
2. **Tools** for actions, **Resources** for data, **Prompts** for templates
3. **Always log to stderr** - stdout is for protocol only
4. **Return errors gracefully** - Don't throw, return `{ isError: true }`
5. **Use Zod** for parameter validation - Automatic JSON Schema generation
6. **Test with raw JSON-RPC** before integrating with Claude

---

# CLI Development Notes

## How CLI Works

1. User types: `ano annotate plan.md:15 "comment"`
2. Node.js receives `process.argv` array
3. Commander.js parses into command, arguments, options
4. Your handler function runs

## Commander.js Syntax

```typescript
program
  .command('greet')                    // Subcommand name
  .description('Greet someone')        // Shows in --help
  .argument('<name>', 'Person name')   // Required argument
  .argument('[title]', 'Optional')     // Optional argument
  .option('-l, --loud', 'Shout')       // Boolean flag
  .option('-n, --name <n>', 'Name')    // Option with value
  .action((name, title, options) => {  // Handler
    // name, title are arguments
    // options is object with all flags
  });
```

## Argument vs Option

| Type | Syntax | Example |
|------|--------|---------|
| Required argument | `<name>` | Main inputs |
| Optional argument | `[name]` | Optional inputs |
| Boolean flag | `--verbose` | On/off switches |
| Value option | `--name <value>` | Modifiers |

---

# Anchoring Algorithm

## The Problem
When you annotate line 5, then someone adds lines above it, line 5 points to wrong content.

## The Solution
Store **context** around the annotation, not just line number.

```
When annotating line 5:
  Store: contextBefore = "## Steps"
         contextAfter  = "## Next"
         contentHash   = "abc123"

When file changes:
  Search for where "## Steps" and "## Next" appear together
  → Found at line 8!
  → Relocate annotation: line 5 → line 8
```

## How It Works

1. **createAnchor()**: Store line + surrounding 2 lines + hash
2. **relocateAnchor()**: Search for context pattern in updated file
3. **Fuzzy matching**: Uses Levenshtein distance for ~95% similarity matches

---

# 2. CLI Development

## What is a CLI?

A **Command Line Interface** - a program you run from the terminal:
```bash
git commit -m "message"
npm install chalk
ano annotate plan.md:15 "comment"
```

## How Node.js Sees Commands

When you type:
```bash
node script.js hello --name ved
```

Node.js gives you `process.argv`:
```javascript
[
  '/usr/local/bin/node',    // [0] Path to Node.js
  '/path/to/script.js',     // [1] Path to your script
  'hello',                  // [2] First argument
  '--name',                 // [3] Flag
  'ved'                     // [4] Flag value
]
```

## Why Use Commander.js?

Parsing `process.argv` manually gets messy. Commander.js handles:
- Short flags (`-n` vs `--name`)
- Required vs optional arguments
- Auto-generated help (`--help`)
- Subcommands (`git commit`, `git push`)
- Validation

## Commander.js Patterns

### Basic Command
```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('myapp')
  .version('1.0.0')
  .description('My CLI app');

program
  .command('greet')
  .argument('<name>', 'Name to greet')
  .option('-l, --loud', 'Shout it')
  .action((name, options) => {
    let msg = `Hello, ${name}!`;
    if (options.loud) msg = msg.toUpperCase();
    console.log(msg);
  });

program.parse();
```

### Organizing Subcommands

Split commands into separate files:
```
src/cli/
├── index.ts              # Main entry
└── commands/
    ├── annotate.ts       # ano annotate
    ├── list.ts           # ano list
    └── approve.ts        # ano approve
```

**index.ts:**
```typescript
import { annotateCommand } from './commands/annotate.js';
program.addCommand(annotateCommand);
program.parse();
```

**commands/annotate.ts:**
```typescript
export const annotateCommand = new Command('annotate')
  .description('Add annotation')
  .argument('<file:line>', 'File and line')
  .action(async (fileRef) => { ... });
```

## Chalk - Terminal Colors

```typescript
import chalk from 'chalk';

console.log(chalk.green('✓ Success'));
console.log(chalk.red('✗ Error'));
console.log(chalk.yellow('⚠ Warning'));
console.log(chalk.dim('Subtle text'));
console.log(chalk.bold('Bold text'));
console.log(chalk.bgBlue.white(' BADGE '));
```

## CLI Best Practices

1. **Exit codes**: `process.exit(0)` for success, `process.exit(1)` for error
2. **Colors**: Use chalk for visual feedback
3. **Help text**: Always add descriptions
4. **Partial matching**: Accept short IDs (first 8 chars of UUID)
5. **JSON output**: Add `--json` flag for scripting

---

# 3. System Architecture

## Ano Project Structure

```
ano/
├── src/
│   ├── core/              # Business logic (no I/O dependencies)
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── annotations.ts # CRUD operations
│   │   ├── anchoring.ts   # Position tracking
│   │   └── config.ts      # User identity
│   ├── cli/               # Command line interface
│   │   ├── index.ts       # Entry point
│   │   └── commands/      # Subcommands
│   └── mcp/               # Claude integration
│       └── server.ts      # MCP server
├── dist/                  # Compiled JavaScript
├── package.json
└── tsconfig.json
```

## Why This Structure?

### Separation of Concerns

```
┌─────────────────────────────────────────────────┐
│                  INTERFACES                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │   CLI   │  │   MCP   │  │   Web   │  (Future)│
│  └────┬────┘  └────┬────┘  └────┬────┘         │
│       │            │            │               │
│       └────────────┼────────────┘               │
│                    │                            │
│              ┌─────┴─────┐                      │
│              │   CORE    │                      │
│              │  (logic)  │                      │
│              └───────────┘                      │
└─────────────────────────────────────────────────┘
```

- **Core**: Pure business logic, no I/O
- **CLI**: One interface to core
- **MCP**: Another interface to same core
- **Web**: Future interface, reuses core

### Benefits

1. **Testable**: Core logic can be unit tested without CLI/MCP
2. **Reusable**: Add new interfaces without rewriting logic
3. **Maintainable**: Changes to CLI don't affect MCP

## Data Flow

```
User runs: ano annotate plan.md:15 "comment"

┌─────────────────────────────────────────────────┐
│ CLI Layer                                       │
│ 1. Commander parses arguments                   │
│ 2. Validates file:line format                   │
│ 3. Gets author from git config                  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Core Layer                                      │
│ 1. createAnchor() - store context               │
│ 2. Create annotation object                     │
│ 3. Read/write JSON file                         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ File System                                     │
│ plan.md.annotations.json                        │
└─────────────────────────────────────────────────┘
```

## Sidecar File Pattern

Instead of modifying the original file:
```
plan.md                    ← Original (unchanged)
plan.md.annotations.json   ← Sidecar (annotations)
```

**Benefits:**
- Original files stay clean
- Git-friendly (easy to diff)
- No special syntax in source files
- Works with any file type

## TypeScript Module System

### ESM (ECMAScript Modules)
```json
// package.json
{ "type": "module" }
```

```typescript
// Use import/export
import { foo } from './foo.js';  // Note: .js extension!
export const bar = 123;
```

### Why .js in imports?

TypeScript compiles `.ts` → `.js`. The import paths must match the **output** files:
```typescript
// In types.ts
import { Anchor } from './anchoring.js';  // ✅ Correct
import { Anchor } from './anchoring.ts';  // ❌ Won't work at runtime
import { Anchor } from './anchoring';     // ❌ Node.js ESM requires extension
```

---

# 4. Key Patterns Used

## UUID for IDs
```typescript
import { randomUUID } from 'node:crypto';
const id = randomUUID();  // "550e8400-e29b-41d4-a716-446655440000"
```

## Content Hashing
```typescript
import { createHash } from 'node:crypto';
const hash = createHash('sha256')
  .update(content)
  .digest('hex')
  .slice(0, 12);  // Short hash: "abc123def456"
```

## Git Identity (No Login)
```typescript
import { execSync } from 'node:child_process';
const name = execSync('git config user.name', { encoding: 'utf-8' }).trim();
```

## Async File Operations
```typescript
import { readFile, writeFile } from 'node:fs/promises';

// Read
const content = await readFile(path, 'utf-8');

// Write
await writeFile(path, JSON.stringify(data, null, 2));
```

## Zod Validation
```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  age: z.number().optional(),
  role: z.enum(['admin', 'user']),
});

// Validates and types the result
const data = schema.parse(input);
```

---

# Summary

| Topic | Key Takeaway |
|-------|--------------|
| **MCP** | JSON-RPC over stdio, Tools/Resources/Prompts |
| **CLI** | Commander.js parses args, Chalk colors output |
| **Architecture** | Core logic separate from interfaces |
| **Sidecar files** | Keep original files clean |
| **Anchoring** | Context-based position tracking |
| **No login** | Use git identity |