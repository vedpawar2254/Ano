# Ano Hooks for Claude Code

This folder contains example hook configurations for integrating Ano with Claude Code.

## What Are Hooks?

Hooks let you run scripts before/after Claude Code actions. Ano uses hooks to:
- **Block execution** if a plan doesn't have required approvals
- **Check for blockers** that must be resolved first

## Setup

### 1. Add to Claude Code Settings

Copy the hook configuration to your Claude Code settings:

**Project-level** (`.claude/settings.json`):
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Task",
        "command": "node /path/to/ano/dist/cli/index.js check $PLAN_FILE --required 1 --no-blockers --quiet"
      }
    ]
  }
}
```

**Or global** (`~/.claude/settings.json`) for all projects.

### 2. Environment Variables

The hook receives these variables:
- `$PLAN_FILE` - The plan file being executed

## Hook Behavior

### Exit Codes

| Code | Meaning | Effect |
|------|---------|--------|
| `0` | Approved | Claude proceeds |
| `1` | Not approved | Claude is blocked |

### What Gets Checked

1. **Approval count**: Need N approvals (default: 1)
2. **Changes requested**: Any "changes_requested" blocks
3. **Open blockers**: Any unresolved blocker annotations

## Example Workflow

```
┌────────────────────────────────────────────────────────────┐
│ 1. Team reviews plan.md                                    │
│                                                            │
│    ano annotate plan.md:15 "Looks risky" --type concern   │
│    ano annotate plan.md:30 "Need tests" --type blocker    │
└────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Author addresses feedback                               │
│                                                            │
│    - Adds tests                                            │
│    - ano resolve plan.md <blocker-id>                      │
└────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Reviewers approve                                        │
│                                                            │
│    ano approve plan.md --title "Tech Lead"                 │
│    ano approve plan.md --title "Security"                  │
└────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────┐
│ 4. User asks Claude to execute                             │
│                                                            │
│    User: "Execute the plan in plan.md"                     │
│                                                            │
│    Hook runs: ano check plan.md --required 2               │
│    Result: ✓ 2/2 approvals, no blockers                    │
│                                                            │
│    Claude: *proceeds with execution*                       │
└────────────────────────────────────────────────────────────┘
```

## Commands Reference

```bash
# Check with default (1 approval needed)
ano check plan.md

# Require 2 approvals
ano check plan.md --required 2

# Also fail if open blockers exist
ano check plan.md --no-blockers

# Quiet mode (just exit code, for hooks)
ano check plan.md --quiet

# JSON output (for scripting)
ano check plan.md --json
```
