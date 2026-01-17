### 🚨🚨 Beta release out now!! 🚨🚨
# Ano

**Collaborative annotation and review for Claude Code**

Ano enables teams to annotate, review, and approve Claude-generated plans and markdown files before execution. It integrates with Claude Code via MCP and hooks, creating a human-in-the-loop workflow for AI-assisted development.

## Features

- **Inline Annotations** - Add comments to specific lines with types: `concern`, `question`, `suggestion`, `blocker`
- **Approval Gates** - Require N approvals before Claude can proceed (via hooks)
- **Title & Role-Based Authorization** - Require approval from specific roles (e.g., "Tech Lead", "Security")
- **Team Management** - Configure team members, roles, and approval requirements
- **Web Viewer** - Visual interface with real-time updates, keyboard shortcuts, and inline editing
- **Activity Feed** - Track all annotation and approval changes chronologically
- **Version Diff** - Compare changes between versions, see what was added/removed/resolved
- **Shareable URLs** - Deep links to specific annotations or lines
- **Export** - Export annotated files as standalone HTML or copy for Claude
- **Multi-file Support** - Review multiple files in a single session
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

# Start web viewer with multiple files
ano serve plan.md README.md design.md
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
| `ano annotate <file>:<start>-<end> "msg"` | Add annotation spanning multiple lines |
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
| `ano approve <file> --title "Tech Lead"` | Approve with a title (for role-based gates) |
| `ano check <file>` | Verify approval requirements (exit 0/1) |
| `ano check <file> --required 2` | Require specific number of approvals |
| `ano check <file> --require-title "Tech Lead"` | Require approval from specific title |
| `ano check <file> --require-role lead` | Require approval from specific team role |
| `ano check <file> --soft` | Warn but don't block |
| `ano check <file> --override --reason "msg"` | Bypass with audit trail |
| `ano check <file> --json` | Output result as JSON |

### Version Comparison

| Command | Description |
|---------|-------------|
| `ano diff <file>` | Show changes from previous version |
| `ano diff <file> --json` | Output diff as JSON |

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
| `ano serve <files...>` | View multiple files with tab switching |
| `ano serve <file> --port 8080` | Use custom port |
| `ano serve <file> --no-open` | Don't open browser automatically |

## Web Viewer Features

The web viewer provides a rich interface for reviewing annotated files:

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `↓` | Next annotation |
| `k` / `↑` | Previous annotation |
| `r` | Resolve selected annotation |
| `Shift+D` | Delete selected annotation |
| `a` | Add annotation at selected line |
| `/` | Focus search |
| `?` | Show keyboard shortcuts help |
| `Esc` | Close modal / deselect |

### Views

- **Annotations** - List and filter annotations by status (all/open/blockers)
- **Activity** - Chronological feed of all annotation and approval changes
- **Changes** - Diff view showing what changed since page load (added, removed, resolved)

### Sharing

- **Copy link to view** - Deep link to current annotation/line selection
- **Copy for Claude** - Formatted markdown summary of open annotations
- **Export HTML** - Standalone HTML file with all annotations embedded

### Inline Editing

Double-click any line to edit it directly. Changes are saved automatically.

### Text Selection

Select text across lines to add annotations to specific ranges.

### Real-time Updates

The viewer uses Server-Sent Events (SSE) to automatically refresh when files or annotations change.

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

#### Advanced Hook Examples

Require Tech Lead approval:
```json
{
  "command": "ano check PLAN.md --require-title 'Tech Lead' --quiet"
}
```

Require 2 approvals from team leads:
```json
{
  "command": "ano check PLAN.md --required 2 --require-role lead --quiet"
}
```

Soft gate (warn but don't block):
```json
{
  "command": "ano check PLAN.md --soft --quiet"
}
```

Exit codes:
- `0` = Approved, Claude proceeds
- `1` = Not approved, Claude blocked

Override logs are written to `.ano-overrides.log` for audit trails.

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
    "minApprovals": 2,
    "requiredRoles": ["lead"],
    "requiredTitles": ["Tech Lead"]
  }
}
```

### Requirements Options

| Field | Description |
|-------|-------------|
| `minApprovals` | Minimum number of approvals required |
| `minWeight` | Minimum total weight of approvals (based on role weights) |
| `requiredRoles` | Roles that must approve (matches team member roles) |
| `requiredTitles` | Titles that must approve (matches approval titles) |

Team membership is **advisory only** - anyone can approve, but `ano check` shows who is/isn't in the team.

## How It Works

### Annotation Storage

Annotations are stored in sidecar files alongside your source:
- `plan.md` → `plan.md.annotations.json`

This keeps annotations git-tracked and version-controlled with your code.

### Content Anchoring

When files change, annotations can become misaligned. Ano uses **content anchoring** to relocate annotations:

1. Stores surrounding context (2 lines before/after)
2. Stores content hash for change detection
3. On file change, searches for matching context
4. Uses fuzzy matching (Levenshtein distance) for tolerance

Run `ano sync <file>` to update positions after major edits.

### Shareable URLs

URLs encode the current view state:
- `#annotation=<id>` - Link to specific annotation
- `#line=<number>` - Link to specific line
- `#file=<path>` - Link to specific file (multi-file mode)

Example: `http://localhost:3000/#annotation=abc123`

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
│ 2. Team reviews (via CLI or web viewer)                 │
│    ano serve plan.md                                    │
│    ano block plan.md:15 "Security concern"              │
│    ano q plan.md:30 "Why this approach?"                │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Address feedback                                     │
│    ano resolve plan.md <blocker-id>                     │
│    (Claude can read annotations via MCP and respond)    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Approve                                              │
│    ano approve plan.md --title "Tech Lead"              │
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
│   │       ├── annotate.ts
│   │       ├── approve.ts
│   │       ├── check.ts
│   │       ├── diff.ts
│   │       ├── list.ts
│   │       ├── serve.ts
│   │       └── ...
│   └── mcp/            # MCP server for Claude
│       └── server.ts
├── web/                # Svelte 5 web viewer
│   ├── src/
│   │   ├── App.svelte
│   │   └── lib/
│   │       ├── FileViewer.svelte
│   │       ├── Sidebar.svelte
│   │       ├── AnnotationCard.svelte
│   │       ├── ActivityFeed.svelte
│   │       ├── DiffView.svelte
│   │       └── ...
│   └── dist/               # Built assets
├── hooks/              # Example hook configurations
│   └── README.md
└── .ano/               # Team config (per-project)
    └── config.json
```

## Annotation Types

| Type | Purpose | Blocks Execution |
|------|---------|------------------|
| `blocker` | Must resolve before proceeding | Yes |
| `concern` | Risk or issue identified | No |
| `question` | Clarification needed | No |
| `suggestion` | Improvement idea | No |

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
