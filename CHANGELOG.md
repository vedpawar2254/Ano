# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-17

### Added

#### Core Features
- **Annotation System**: Add inline annotations to files with 4 types (concern, question, suggestion, blocker)
- **Smart Anchoring**: Content-aware position tracking that survives file edits using Levenshtein distance algorithm
- **Team Management**: Configure team members, roles, and approval requirements
- **Approval Workflow**: Add approvals, request changes, and check approval status with blocking gates
- **Threading**: Reply to annotations for threaded discussions
- **Resolution**: Mark annotations as resolved and track their status

#### CLI Commands
- `ano annotate` - Add annotations to specific lines or ranges
- `ano list` - List and filter annotations by type or status
- `ano resolve` - Mark annotations as resolved
- `ano approve` - Approve files or request changes
- `ano check` - Check if files meet approval requirements (for hooks)
- `ano team` - Manage team configuration (init, add, remove, list, roles)
- `ano reply` - Add threaded replies to annotations
- `ano delete` - Delete annotations
- `ano sync` - Sync annotation positions after file changes
- `ano export` - Export annotations to JSON
- `ano import` - Import annotations from JSON
- `ano diff` - Compare annotations between versions
- `ano serve` - Start web viewer for annotations

#### Quick Commands
- `ano lgtm` - Quick approve with "Looks good to me"
- `ano shipit` - Strong approve with "Ship it!"
- `ano nit` - Add minor suggestion (nitpick)
- `ano block` - Add blocker annotation
- `ano q` - Quick question annotation

#### Web Viewer
- Real-time annotation viewer with Server-Sent Events (SSE)
- Multi-file support with tab switching
- Text selection for precise annotations
- Inline editing capabilities
- Keyboard shortcuts (j/k navigation, r to resolve)
- Activity feed showing chronological changes
- Diff view to compare changes
- Shareable URLs for deep linking
- Export to standalone HTML
- Copy annotations for Claude consumption

#### MCP Integration
- MCP server for Claude Code integration
- Tools: `read_annotations`, `add_annotation`, `resolve_annotation`, `approve_file`
- Approval gate hook to block Claude execution until requirements met

#### Technical
- TypeScript with strict mode
- ES2022 modules
- Zod schema validation
- Git-based authentication
- Sidecar JSON storage (`.annotations.json` files)
- Content hashing for change detection
- Fuzzy matching with ±20 line search window

### Documentation
- Comprehensive README with installation and usage instructions
- CONTRIBUTING guide for developers
- API documentation for team configuration
- Claude Code integration guide
- Web viewer documentation
- Hook examples for approval gates

### Build & Deploy
- TypeScript compilation with type definitions
- Bundled web viewer assets
- npm package `@nakedved/ano` with CLI binary
- GitHub Actions CI/CD pipeline
- Multi-Node.js version testing (20, 22)
- Published to npm registry

[0.1.0]: https://github.com/vedpawar2254/Ano/releases/tag/v0.1.0
