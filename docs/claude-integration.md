# Claude Code Integration

This guide covers integrating Ano with Claude Code for AI-assisted review workflows.

## Overview

Ano integrates with Claude Code in two ways:

1. **MCP Server** - Allows Claude to read and respond to annotations
2. **Hooks** - Gates Claude's actions based on approval status

## MCP Server Setup

### 1. Locate the MCP Server

After building Ano, the MCP server is at:

```bash
/path/to/ano/dist/mcp/server.js
```

### 2. Configure Claude Code

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

### 3. Verify Connection

Ask Claude: "What MCP tools do you have access to?"

Claude should list the Ano tools.

## Available MCP Tools

### read_annotations

Read all annotations for a file.

```
Tool: read_annotations
Parameters:
  - file: Path to the file (e.g., "plan.md")
```

Returns:
- List of annotations with type, content, author, status
- List of approvals
- Summary statistics

### add_annotation

Add a new annotation to a file.

```
Tool: add_annotation
Parameters:
  - file: Path to the file
  - line: Line number
  - content: Annotation text
  - type: "concern" | "question" | "suggestion" | "blocker"
```

### resolve_annotation

Mark an annotation as resolved.

```
Tool: resolve_annotation
Parameters:
  - file: Path to the file
  - id: Annotation ID
```

### approve_file

Add an approval to a file.

```
Tool: approve_file
Parameters:
  - file: Path to the file
  - title: Optional approval title (e.g., "Tech Lead")
```

## Hook Configuration

Hooks allow you to gate Claude's actions based on approval status.

### Basic Approval Gate

Block file writes until the plan is approved:

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

When Claude tries to write a file:
- `exit 0` = Plan approved, Claude proceeds
- `exit 1` = Not approved, Claude is blocked

### Require Specific Approvals

Require Tech Lead approval:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "ano check PLAN.md --require-title 'Tech Lead' --quiet"
      }
    ]
  }
}
```

Require 2 approvals from team leads:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "ano check PLAN.md --required 2 --require-role lead --quiet"
      }
    ]
  }
}
```

### Soft Gates

Warn but don't block:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "ano check PLAN.md --soft --quiet"
      }
    ]
  }
}
```

### Multiple File Gates

Gate different actions on different files:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "ano check PLAN.md --quiet"
      },
      {
        "matcher": "Bash",
        "command": "ano check DEPLOY.md --require-title 'DevOps' --quiet"
      }
    ]
  }
}
```

## Workflow Example

### 1. Claude Generates a Plan

You: "Create a plan to add user authentication"

Claude creates `PLAN.md` with implementation steps.

### 2. Team Reviews

```bash
# Start web viewer
ano serve PLAN.md

# Or use CLI
ano annotate PLAN.md:15 "Consider using OAuth instead" --type suggestion
ano block PLAN.md:30 "This needs rate limiting" --type blocker
```

### 3. Claude Reads Feedback

You: "Check the annotations on the plan and address them"

Claude uses `read_annotations` to see:
- 1 suggestion at line 15
- 1 blocker at line 30

Claude can then:
- Update the plan to address feedback
- Use `resolve_annotation` when issues are fixed
- Reply to questions

### 4. Team Approves

```bash
ano lgtm PLAN.md
# or
ano approve PLAN.md --title "Tech Lead"
```

### 5. Claude Executes

You: "Execute the plan"

Hook runs: `ano check PLAN.md --quiet`
- Returns exit 0 (approved)
- Claude proceeds with implementation

## Claude Prompts

### Ask Claude to Check Annotations

> "Review the annotations on PLAN.md and tell me what feedback needs to be addressed."

### Ask Claude to Address Feedback

> "Update PLAN.md to address the blocker about rate limiting, then mark it as resolved."

### Ask Claude to Summarize Status

> "What's the current approval status of PLAN.md? Are there any open blockers?"

## Best Practices

### 1. Use Descriptive Plan Files

Name your plan files clearly:
- `PLAN.md` - Main implementation plan
- `DEPLOY.md` - Deployment checklist
- `MIGRATION.md` - Data migration steps

### 2. Gate Critical Operations

Focus hooks on high-impact actions:
- File writes that modify production code
- Bash commands that deploy or migrate
- Actions that are difficult to reverse

### 3. Use Title-Based Authorization

For sensitive operations, require specific roles:

```json
{
  "command": "ano check DEPLOY.md --require-title 'DevOps' --require-title 'Tech Lead'"
}
```

### 4. Enable Claude to Self-Review

Let Claude add annotations for human review:

> "After generating the plan, add annotations for any areas you're uncertain about."

### 5. Keep Override Audit Trail

Override logs are written to `.ano-overrides.log`:

```bash
ano check PLAN.md --override --reason "Emergency hotfix for production issue"
```

This creates an audit trail for bypassed approvals.

## Troubleshooting

### Claude Can't Find MCP Tools

1. Check the path in settings.json is correct
2. Ensure the MCP server is built (`npm run build`)
3. Restart Claude Code after changing settings

### Hook Not Blocking

1. Ensure the matcher matches the tool name exactly
2. Check that `ano check` returns exit 1 when not approved
3. Test manually: `ano check PLAN.md; echo $?`

### Annotations Not Syncing

If annotations appear on wrong lines after file changes:

```bash
ano sync PLAN.md
```

This re-anchors annotations using content matching.

## Next Steps

- [Team Configuration](./team-config.md) - Set up team roles and requirements
- [Web Viewer Guide](./web-viewer.md) - Learn all web UI features
