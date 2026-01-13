# Ano

## Vision
A Claude Code plugin enabling teams to collaboratively annotate, review, and approve Claude-generated plans and markdown files, with Claude as an active participant in the feedback loop.

## Core Features

### 1. Inline Annotations
- Add comments to specific lines/sections in plans and markdown
- Support threaded discussions on annotations
- Mark comments as resolved/unresolved

### 2. Annotation Templates
Structured comment types for clarity:
- `concern` - Risk or issue identified
- `question` - Clarification needed
- `suggestion` - Improvement idea
- `blocker` - Must resolve before proceeding

### 3. File-Based Team Sharing
- Sidecar files: `plan.md` → `plan.md.annotations.json`
- Git-friendly (commit alongside source files)
- Import/export for sharing outside git

### 4. Claude Integration
- Claude can read annotations when asked
- Claude can respond to and address feedback
- Claude can mark items as addressed

### 5. CLI Summary View
- `/annotations` command to view all open items
- Filter by file, type, author, status
- Quick overview of review state

### 6. Approval Gates
- Hook integration to block plan execution
- Require N approvals before proceeding
- Track who approved/rejected

### 7. Version Diff
- Track annotation changes across plan versions
- See what feedback was addressed between versions

### 8. Web View & Annotator
- Local web server for visual annotation interface
- Render markdown/plans with inline annotation markers
- Click-to-annotate: select text and add comments
- Real-time annotation sidebar showing all comments
- Visual approval workflow (approve/reject buttons)
- Share-able URLs for team review sessions

## Technical Approach

### Storage Format (annotations.json)
```json
{
  "version": "1.0",
  "file": "plan.md",
  "fileHash": "abc123",
  "annotations": [
    {
      "id": "uuid",
      "line": 15,
      "endLine": 20,
      "type": "concern",
      "author": "alice",
      "timestamp": "2024-01-14T10:00:00Z",
      "content": "This approach might hit rate limits",
      "status": "open",
      "replies": []
    }
  ],
  "approvals": [
    {
      "author": "bob",
      "title":"Tech Lead",
      "status": "approved",
      "timestamp": "2024-01-14T11:00:00Z"
    }
  ]
}
```

### Implementation Components
1. **Slash commands**: `/annotate`, `/annotations`, `/approve`
2. **MCP server**: For Claude to read/write annotations
3. **Hook**: Pre-execution approval check
4. **CLI tool**: Standalone for viewing/managing annotations
5. **Web server**: Local Express server for annotation UI
6. **Web client**: Svelte app for annotation interface

## Use Cases
- **Code review workflows** - Review Claude-generated plans before execution
- **Project planning** - Collaborative planning with team input
- **Documentation** - Annotating docs for knowledge sharing

## Design Decisions
- **Line drift handling**: Content anchoring - store surrounding text context to relocate annotations when files change
- **MVP scope**: Full team workflow - include approvals, templates, and sharing from start
- **Web deployment**: Local only - runs on localhost, team syncs via git
- **Frontend**: Svelte + Tailwind for lightweight, fast UI

## Annotation Anchoring Strategy
```json
{
  "anchor": {
    "line": 15,
    "contextBefore": "## Implementation Steps",
    "contextAfter": "1. First, we need to...",
    "contentHash": "abc123"
  }
}
```
When file changes, use context matching to relocate annotations to their new positions.

## Implementation Steps

### Phase 1: Core Data Model & Storage
1. Create project structure (TypeScript/Node.js)
2. Define annotation schema (JSON)
3. Implement annotation file read/write utilities
4. Build content anchoring algorithm for line drift handling

### Phase 2: CLI Commands
1. `/annotate` - Add annotation to a file:line
2. `/annotations` - List all annotations (with filters)
3. `/resolve` - Mark annotation as resolved
4. `/approve` - Approve a plan/file

### Phase 3: Claude Integration (MCP Server)
1. Create MCP server for annotation access
2. Implement tools: `read_annotations`, `add_annotation`, `resolve_annotation`
3. Enable Claude to read and respond to feedback

### Phase 4: Team Workflow
1. Approval gate hook (pre-plan-execute)
2. Author tracking in annotations
3. Export/import functionality for sharing

### Phase 5: Web View & Annotator
1. Build local web server (Express/Fastify)
2. Create web client (Svelte + Tailwind)
   - Markdown renderer with annotation highlights
   - Click-to-annotate text selection
   - Annotation sidebar with threads
   - Approval buttons and status display
3. `ano serve` command to launch web UI on localhost
4. File watcher for real-time updates when annotation files change

### Phase 6: Polish
1. Annotation templates (concern, question, suggestion, blocker)
2. Version diff tracking
3. Summary views and statistics

## Remaining Considerations
- Markdown formatting support in annotation content?
- Notification system for new annotations?
- Integration with GitHub PR reviews?
- How can we rethink and then reimplement the ways tech teams function?
