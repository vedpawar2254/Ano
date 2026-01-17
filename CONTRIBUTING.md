# Contributing to Ano

Thanks for your interest in contributing to Ano! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/vedpawar2254/Ano.git
cd Ano

# Install dependencies
npm install

# Build the CLI
npm run build

# Build the web UI
cd web && npm install && npm run build && cd ..

# Link for local development
npm link
```

### Development Workflow

```bash
# Watch mode for CLI development
npm run dev

# Run the web UI in dev mode (hot reload)
cd web && npm run dev

# Build everything
npm run build && cd web && npm run build && cd ..
```

## Project Structure

```
ano/
├── src/                    # TypeScript source
│   ├── core/               # Core business logic
│   │   ├── annotations.ts  # Annotation CRUD operations
│   │   ├── anchoring.ts    # Content anchoring algorithm
│   │   ├── config.ts       # User/git configuration
│   │   ├── team.ts         # Team management
│   │   └── types.ts        # TypeScript interfaces
│   ├── cli/                # CLI implementation
│   │   ├── index.ts        # Entry point
│   │   └── commands/       # Individual commands
│   └── mcp/                # MCP server for Claude
│       └── server.ts
├── web/                    # Svelte 5 web application
│   ├── src/
│   │   ├── App.svelte      # Main application
│   │   └── lib/            # Components
│   ├── public/
│   └── vite.config.ts
├── dist/                   # Compiled output
├── hooks/                  # Hook configuration examples
└── tests/                  # Test files (if any)
```

## Making Changes

### Code Style

- TypeScript strict mode enabled
- Use ES modules (import/export)
- Prefer async/await over callbacks
- Use meaningful variable names
- Add JSDoc comments for public functions

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(cli): add --json flag to check command
fix(anchoring): handle empty files gracefully
docs(readme): add web viewer keyboard shortcuts
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Build and test locally
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

### PR Checklist

- [ ] Code builds without errors (`npm run build`)
- [ ] Web UI builds without errors (`cd web && npm run build`)
- [ ] Changes are documented (if user-facing)
- [ ] Commit messages follow conventions
- [ ] PR description explains the changes

## Architecture Overview

### Core Concepts

**Annotations** are the primary data model:
```typescript
interface Annotation {
  id: string;           // UUID
  anchor: Anchor;       // Position tracking
  type: AnnotationType; // concern, question, suggestion, blocker
  author: string;       // Git identity
  timestamp: string;    // ISO timestamp
  content: string;      // The comment text
  status: AnnotationStatus; // open, resolved
  replies: Reply[];     // Threaded discussion
}
```

**Anchors** track position even when files change:
```typescript
interface Anchor {
  line: number;         // Current line number
  endLine?: number;     // For multi-line selections
  contextBefore: string; // Text before for relocation
  contextAfter: string;  // Text after for relocation
  contentHash: string;   // Change detection
}
```

**Storage**: Annotations are stored in sidecar JSON files:
- `plan.md` → `plan.md.annotations.json`

### Key Modules

| Module | Purpose |
|--------|---------|
| `annotations.ts` | Read/write annotation files |
| `anchoring.ts` | Content anchoring and sync |
| `team.ts` | Team config and membership |
| `config.ts` | Git identity resolution |

### Web Architecture

The web UI is built with:
- **Svelte 5** with runes (`$state`, `$derived`, `$effect`)
- **Tailwind CSS** for styling
- **Vite** for bundling

Key components:
- `App.svelte` - Main app, state management, API calls
- `FileViewer.svelte` - Code display with annotations
- `Sidebar.svelte` - Annotation list, activity feed, diff view
- `AnnotationCard.svelte` - Individual annotation display

### API Endpoints

The `serve` command starts an Express server:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/current` | GET | Get current file and annotations |
| `/api/files` | GET | List available files |
| `/api/switch` | POST | Switch to different file |
| `/api/annotate` | POST | Add annotation |
| `/api/resolve` | POST | Resolve annotation |
| `/api/reopen` | POST | Reopen annotation |
| `/api/delete` | POST | Delete annotation |
| `/api/reply` | POST | Add reply |
| `/api/approve` | POST | Add approval |
| `/api/save` | POST | Save file content |
| `/api/events` | GET | SSE for real-time updates |

## Adding a New CLI Command

1. Create the command file:
```typescript
// src/cli/commands/mycommand.ts
import { Command } from 'commander';

export const myCommand = new Command('mycommand')
  .description('What this command does')
  .argument('<file>', 'File to operate on')
  .option('-f, --flag', 'Some option')
  .action(async (file: string, options: { flag: boolean }) => {
    // Implementation
  });
```

2. Register in index.ts:
```typescript
import { myCommand } from './commands/mycommand.js';
program.addCommand(myCommand);
```

3. Add documentation to README.md

## Adding a New Web Feature

1. Create/modify components in `web/src/lib/`
2. Update `App.svelte` if needed
3. Add API endpoint in `src/cli/commands/serve.ts` if needed
4. Test with `cd web && npm run dev`

## Testing

Currently, testing is manual:

```bash
# Test CLI commands
ano annotate test.md:5 "Test annotation" --type concern
ano list test.md
ano check test.md

# Test web UI
ano serve test.md
# Open http://localhost:3000

# Test MCP server
node dist/mcp/server.js
```

## Areas for Contribution

### Good First Issues

- Add more annotation types
- Improve error messages
- Add command aliases
- Write unit tests

### Feature Ideas

- Notification system for new annotations
- GitHub PR integration
- Slack/Discord webhooks
- Annotation templates
- Bulk operations
- Search across files

### Documentation

- Add more examples
- Create video tutorials
- Translate to other languages

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
