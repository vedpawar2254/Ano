# Getting Started with Ano

This guide will help you get Ano up and running in your project.

## Installation

### From npm (Recommended)

```bash
npm install -g @nakedved/ano
```

### From Source

```bash
git clone https://github.com/vedpawar2254/Ano.git
cd Ano
npm install
npm run build

# Build web UI
cd web && npm install && npm run build && cd ..

# Link globally
npm link
```

### Verify Installation

```bash
ano --version
ano --help
```

## Your First Annotation

### 1. Create a Test File

Create a simple markdown file to annotate:

```bash
echo "# My Plan

## Step 1
Do something important

## Step 2
Review the changes

## Step 3
Deploy to production" > plan.md
```

### 2. Add an Annotation

```bash
ano annotate plan.md:8 "Is this safe for production?" --type concern
```

This adds a concern annotation to line 8.

### 3. View Annotations

```bash
ano list plan.md
```

You'll see:
```
Annotations for plan.md

  [open] concern L8
  "Is this safe for production?"
  — Your Name <your@email.com> • just now
```

### 4. Start the Web Viewer

```bash
ano serve plan.md
```

This opens a visual interface at `http://localhost:3000` where you can:
- See annotations inline with the code
- Add new annotations by selecting text
- Resolve, reopen, and delete annotations
- Add replies for discussions

### 5. Approve the File

When you're satisfied with the changes:

```bash
ano lgtm plan.md
```

## Annotation Types

Ano supports four annotation types:

| Type | Purpose | Example |
|------|---------|---------|
| `concern` | Risk or issue identified | "This could cause performance issues" |
| `question` | Clarification needed | "Why did we choose this approach?" |
| `suggestion` | Improvement idea | "Consider using a cache here" |
| `blocker` | Must resolve before proceeding | "Security vulnerability - do not deploy" |

Use them with the `--type` flag:

```bash
ano annotate plan.md:10 "Add error handling" --type suggestion
ano block plan.md:15 "Missing authentication"  # shortcut for blocker
ano q plan.md:20 "What's the expected response?"  # shortcut for question
```

## Multi-line Annotations

Annotate a range of lines:

```bash
ano annotate plan.md:5-10 "This entire section needs review" --type concern
```

## Threaded Replies

Add replies to existing annotations:

```bash
# Get the annotation ID from `ano list`
ano reply plan.md abc123 "Good point, I'll address this"
```

## Resolving and Reopening

```bash
# Mark as resolved
ano resolve plan.md abc123

# Reopen if needed
ano reopen plan.md abc123
```

## Next Steps

- [Claude Code Integration](./claude-integration.md) - Set up MCP and hooks
- [Team Configuration](./team-config.md) - Configure team-based approvals
- [Web Viewer Guide](./web-viewer.md) - Learn all web UI features
