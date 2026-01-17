# Complete Installation and Usage Guide

## 📦 Installation

### Option 1: Install from npm (Recommended)

```bash
npm install -g @nakedved/ano
```

### Option 2: Install from source

```bash
git clone https://github.com/vedpawar2254/Ano.git
cd Ano
npm install
npm run build:all
npm link
```

## ✅ Verify Installation

```bash
ano --version
# Should output: 0.1.0

ano --help
# Shows all available commands
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Create a test file

```bash
echo "# My Plan

## Step 1: Setup database
We'll use PostgreSQL for this project.

## Step 2: Create API
RESTful API with Express.

## Step 3: Deploy
Deploy to production." > plan.md
```

### Step 2: Add your first annotation

```bash
ano annotate plan.md:4 "Should we consider MongoDB instead?" --type question
```

### Step 3: View annotations

```bash
ano list plan.md
```

Output:
```
Annotations for plan.md

  [open] question L4
  "Should we consider MongoDB instead?"
  — Your Name <your@email.com> • just now
```

### Step 4: Open the web viewer

```bash
ano serve plan.md
```

Your browser will open at `http://localhost:3000` with:
- Interactive file viewer
- Inline annotations
- Keyboard shortcuts (j/k to navigate)
- Add/edit/resolve annotations visually

### Step 5: Approve the plan

```bash
ano lgtm plan.md
```

## 📚 Common Use Cases

### Use Case 1: Code Review Workflow

```bash
# Reviewer adds concerns
ano block file.ts:15 "Security: SQL injection risk"
ano concern file.ts:42 "This could cause memory leak"
ano nit file.ts:78 "Consider renaming this variable"

# Developer addresses issues
ano resolve file.ts abc123  # Resolve the blocker
ano reply file.ts def456 "Fixed in latest commit"

# Approver signs off
ano approve file.ts --title "Tech Lead"
```

### Use Case 2: Claude Code Integration

Add annotation approval gate to block Claude until approved:

**1. Create `.claude/settings.json`:**

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

**2. Workflow:**

```bash
# Claude generates PLAN.md
# You review it
ano serve PLAN.md  # Visual review
ano block PLAN.md:20 "This approach won't scale"

# Claude is blocked from proceeding until you approve
ano lgtm PLAN.md

# Now Claude can execute the plan
```

### Use Case 3: Team Collaboration

```bash
# Initialize team
ano team init "MyProject Team"

# Add members
ano team add alice@example.com --role lead
ano team add bob@example.com --role reviewer

# Set requirements (needs 2 approvals from team leads)
# Edit .ano/config.json to set:
{
  "requirements": {
    "minApprovals": 2,
    "requiredRoles": ["lead"]
  }
}

# Team reviews
ano approve plan.md --title "Tech Lead"  # Alice
ano approve plan.md --title "Security Lead"  # Bob

# Check if approved
ano check plan.md --required 2
# Exit code 0 = approved, 1 = not approved
```

### Use Case 4: Multi-file Review

```bash
# Review multiple related files
ano serve api.ts routes.ts schema.ts

# Navigate between files with tabs
# Add annotations to any file
# Export all annotations
ano export api.ts api-review.json
```

## 🎯 Command Reference

### Annotation Commands

| Command | Description | Example |
|---------|-------------|---------|
| `ano annotate <file>:<line> "msg"` | Add annotation | `ano annotate app.ts:15 "Fix this" --type concern` |
| `ano list <file>` | List all annotations | `ano list app.ts` |
| `ano resolve <file> <id>` | Mark as resolved | `ano resolve app.ts abc123` |
| `ano reply <file> <id> "msg"` | Add reply | `ano reply app.ts abc123 "Done"` |
| `ano delete <file> <id>` | Delete annotation | `ano delete app.ts abc123` |

### Quick Shortcuts

| Command | Same as | Example |
|---------|---------|---------|
| `ano lgtm <file>` | Approve with "Looks good to me" | `ano lgtm plan.md` |
| `ano shipit <file>` | Strong approval | `ano shipit plan.md` |
| `ano nit <file>:<line> "msg"` | Minor suggestion | `ano nit app.ts:42 "Rename var"` |
| `ano block <file>:<line> "msg"` | Blocker annotation | `ano block app.ts:15 "Security issue"` |
| `ano q <file>:<line> "msg"` | Quick question | `ano q app.ts:20 "Why?"` |

### Approval Commands

| Command | Description | Example |
|---------|-------------|---------|
| `ano approve <file>` | Approve file | `ano approve plan.md` |
| `ano approve <file> --title "X"` | Approve with title | `ano approve plan.md --title "Tech Lead"` |
| `ano check <file>` | Check approval status | `ano check plan.md` |
| `ano check <file> --required 2` | Require N approvals | `ano check plan.md --required 2` |

### Team Commands

| Command | Description | Example |
|---------|-------------|---------|
| `ano team init [name]` | Initialize team | `ano team init "MyTeam"` |
| `ano team add <email>` | Add member | `ano team add alice@example.com` |
| `ano team remove <email>` | Remove member | `ano team remove alice@example.com` |
| `ano team list` | List team | `ano team list` |

### Utility Commands

| Command | Description | Example |
|---------|-------------|---------|
| `ano serve <file>` | Start web viewer | `ano serve plan.md` |
| `ano diff <file>` | Show changes | `ano diff plan.md` |
| `ano sync <file>` | Sync positions | `ano sync plan.md` |
| `ano export <file> <out>` | Export to JSON | `ano export plan.md out.json` |
| `ano import <file> <in>` | Import from JSON | `ano import plan.md in.json` |

## ⌨️ Web Viewer Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` or `↓` | Next annotation |
| `k` or `↑` | Previous annotation |
| `r` | Resolve selected annotation |
| `Shift+D` | Delete selected annotation |
| `a` | Add annotation at selected line |
| `/` | Focus search |
| `?` | Show help |
| `Esc` | Close modal / deselect |

## 🔧 Advanced Configuration

### Team Configuration (`.ano/config.json`)

```json
{
  "version": "1.0",
  "projectName": "My Project",
  "members": [
    {
      "name": "Alice",
      "email": "alice@example.com",
      "role": "lead",
      "title": "Tech Lead"
    },
    {
      "name": "Bob",
      "email": "bob@example.com",
      "role": "reviewer"
    }
  ],
  "roles": {
    "lead": {
      "canOverride": true,
      "weight": 2
    },
    "reviewer": {
      "canOverride": false,
      "weight": 1
    }
  },
  "requirements": {
    "minApprovals": 2,
    "minWeight": 3,
    "requiredRoles": ["lead"],
    "requiredTitles": ["Tech Lead", "Security Lead"]
  }
}
```

### Claude Code MCP Integration

Add to `.claude/settings.json`:

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

Claude can now:
- Read annotations: `read_annotations(file.md)`
- Add annotations: `add_annotation(file.md, line, message)`
- Resolve annotations: `resolve_annotation(file.md, id)`
- Approve files: `approve_file(file.md)`

## 🐛 Troubleshooting

### "Command not found: ano"

```bash
# Make sure it's installed globally
npm list -g @nakedved/ano

# If not, reinstall
npm install -g @nakedved/ano

# Or use npx
npx @nakedved/ano --version
```

### "Permission denied" on macOS/Linux

```bash
# Use sudo for global install
sudo npm install -g @nakedved/ano

# Or use npx (no install needed)
npx @nakedved/ano serve plan.md
```

### "Port 3000 already in use"

```bash
# Use different port
ano serve plan.md --port 8080
```

### Annotations out of sync after file edits

```bash
# Re-sync annotation positions
ano sync plan.md
```

## 📖 More Resources

- **Documentation**: [/docs](/docs)
- **GitHub**: https://github.com/vedpawar2254/Ano
- **npm Package**: https://www.npmjs.com/package/@nakedved/ano
- **Issues**: https://github.com/vedpawar2254/Ano/issues

## 💡 Tips

1. **Use the web viewer** for visual review - it's much easier than CLI for complex files
2. **Set up Claude hooks** to enforce approval gates
3. **Use keyboard shortcuts** in web viewer for faster navigation (j/k/r)
4. **Export to HTML** to share reviews with non-technical stakeholders
5. **Sync regularly** if you're editing files while annotating

## 🎉 You're Ready!

Start using Ano in your workflow:

```bash
# Quick test
echo "# Test" > test.md
ano serve test.md
```

Happy annotating! 🚀
