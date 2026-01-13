# Ano

**Collaborative annotation and review for Claude Code**

Ano enables teams to annotate, review, and approve Claude-generated plans and markdown files before execution. It integrates with Claude Code via MCP and hooks, creating a human-in-the-loop workflow for AI-assisted development.

## Features

- **Inline Annotations** - Add comments to specific lines with types: `concern`, `question`, `suggestion`, `blocker`
- **Approval Gates** - Require N approvals before Claude can proceed (via hooks)
- **Team Management** - Configure team members, roles, and approval requirements
- **Web Viewer** - Visual interface to view and manage annotations
- **Claude Integration** - Claude can read and respond to annotations via MCP
- **Git-Friendly** - All data stored in sidecar JSON files alongside your code

## Quick Start

```bash
# Install
npm install -g ano

# Add an annotation
ano annotate plan.md:15 "Is this approach safe?" --type concern

# List annotations
ano list plan.md

# Approve a file
ano lgtm plan.md

# Check approval status (for hooks)
ano check plan.md

# Start web viewer
ano serve plan.md
```

## Installation

```bash
git clone https://github.com/yourusername/ano
cd ano
npm install
npm run build

# Build web UI
cd web && npm install && npm run build && cd ..

# Link globally (optional)
npm link
```

## CLI Commands

### Annotations

| Command | Description |
|---------|-------------|
| `ano annotate <file>:<line> "msg"` | Add annotation to a specific line |
| `ano list <file>` | List all annotations for a file |
| `ano resolve <file> <id>` | Mark annotation as resolved |
| `ano reply <file> <id> "msg"` | Add threaded reply |
| `ano delete <file> <id>` | Delete an annotation |
| `ano sync <file>` | Sync annotation positions after file changes |

### Quick Shortcuts

| Command | Description |
|---------|-------------|
| `ano lgtm <file>` | Quick approve ("Looks good to me") |
| `ano shipit <file>` | Strong approve ("Ship it!") |
| `ano nit <file>:<line> "msg"` | Minor nitpick (won't block) |
| `ano block <file>:<line> "msg"` | Add blocker (will block) |
| `ano q <file>:<line> "msg"` | Quick question |

### Approvals & Checks

| Command | Description |
|---------|-------------|
| `ano approve <file>` | Add approval with optional title |
| `ano check <file>` | Verify approval requirements (exit 0/1) |
| `ano check <file> --soft` | Warn but don't block |
| `ano check <file> --override --reason "msg"` | Bypass with audit trail |

### Team Management

| Command | Description |
|---------|-------------|
| `ano team init [name]` | Initialize team configuration |
| `ano team add <email>` | Add team member |
| `ano team remove <email>` | Remove team member |
| `ano team list` | List team members and requirements |
| `ano team roles` | Show available roles |

### Web Viewer

| Command | Description |
|---------|-------------|
| `ano serve <file>` | Start web viewer on localhost:3000 |
| `ano serve <file> --port 8080` | Use custom port |

## Claude Code Integration

### MCP Server

Add to your Claude Code settings (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "ano": {
      "command": "node",
      "args": ["/path/to/ano/dist/mcp/server.js"]
    }
  }
}
```

Available MCP tools:
- `read_annotations` - Read annotations for a file
- `add_annotation` - Add a new annotation
- `resolve_annotation` - Mark as resolved
- `approve_file` - Add approval

### Approval Gate Hook

Block Claude from executing plans without approval:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "ano check PLAN.md --quiet"
      }
    ]
  }
}
```

Exit codes:
- `0` = Approved, Claude proceeds
- `1` = Not approved, Claude blocked

## Team Configuration

Team config is stored in `.ano/config.json`:

```json
{
  "version": "1.0",
  "projectName": "My Project",
  "members": [
    { "name": "Alice", "email": "alice@example.com", "role": "lead" },
    { "name": "Bob", "email": "bob@example.com", "role": "reviewer" }
  ],
  "roles": {
    "lead": { "canOverride": true, "weight": 2 },
    "reviewer": { "canOverride": false, "weight": 1 }
  },
  "requirements": {
    "minApprovals": 2
  }
}
```

Team membership is **advisory only** - anyone can approve, but `ano check` shows who is/isn't in the team.

## How It Works

### Annotation Storage

Annotations are stored in sidecar files alongside your source:
- `plan.md` → `plan.md.annotations.json`

This keeps annotations git-tracked and version-controlled with your code.

### Content Anchoring

When files change, annotations can become misaligned. Ano uses **content anchoring** to relocate annotations:

1. Stores surrounding context (2 lines before/after)
2. On file change, searches for matching context
3. Uses fuzzy matching (Levenshtein distance) for tolerance

Run `ano sync <file>` to update positions after major edits.

### Authentication

**No login required.** Ano uses your git identity:

```bash
git config user.name   # Your name
git config user.email  # Your email
```

This makes Ano trust-based (same as git commits).

## Workflow Example

```
┌─────────────────────────────────────────────────────────┐
│ 1. Claude generates plan.md                             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Team reviews                                         │
│    ano annotate plan.md:15 "Security concern" --type blocker
│    ano q plan.md:30 "Why this approach?"                │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Address feedback                                     │
│    ano resolve plan.md <blocker-id>                     │
│    (update plan if needed)                              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Approve                                              │
│    ano lgtm plan.md                                     │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Execute                                              │
│    User: "Execute the plan"                             │
│    Hook: ano check plan.md → exit 0                     │
│    Claude: *proceeds with implementation*               │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
ano/
├── src/
│   ├── core/           # Core data operations
│   │   ├── annotations.ts   # CRUD for annotations
│   │   ├── anchoring.ts     # Position tracking
│   │   ├── config.ts        # User identity (git)
│   │   ├── team.ts          # Team configuration
│   │   └── types.ts         # TypeScript interfaces
│   ├── cli/            # CLI commands
│   │   ├── index.ts         # Entry point
│   │   └── commands/        # Individual commands
│   └── mcp/            # MCP server for Claude
│       └── server.ts
├── web/                # Svelte web viewer
│   ├── src/
│   │   ├── App.svelte
│   │   └── lib/            # Components
│   └── dist/               # Built assets
├── hooks/              # Example hook configurations
└── .ano/               # Team config (per-project)
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
