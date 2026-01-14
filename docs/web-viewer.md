# Web Viewer Guide

This guide covers all features of the Ano web viewer.

## Starting the Web Viewer

### Single File

```bash
ano serve plan.md
```

Opens `http://localhost:3000` in your browser.

### Multiple Files

```bash
ano serve plan.md README.md design.md
```

Files appear as tabs in the header.

### Options

```bash
# Custom port
ano serve plan.md --port 8080

# Don't open browser automatically
ano serve plan.md --no-open
```

## Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│ ano    plan.md  README.md     2 blockers  5 open  1 approved│ Header
├─────────────────────────────────┬───────────────────────────┤
│                                 │ Annotations | Activity    │
│   1  # My Plan                  │                           │
│   2                             │ ┌─────────────────────┐   │
│   3  ## Step 1                  │ │ blocker L5          │   │
│ ● 4  Do something important     │ │ "Security concern"  │   │
│   5  ...                        │ └─────────────────────┘   │
│                                 │                           │
│   File Content                  │   Sidebar                 │
└─────────────────────────────────┴───────────────────────────┘
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `↓` | Next annotation |
| `k` / `↑` | Previous annotation |
| `r` | Resolve selected annotation |
| `u` | Reopen selected annotation |
| `Shift+D` | Delete selected annotation |
| `a` | Add annotation at selected line |
| `/` | Focus search/filter |
| `?` | Show keyboard shortcuts help |
| `Esc` | Close modal / deselect |

## Viewing Annotations

### Inline Markers

Annotations appear as colored dots next to line numbers:

- Red dot = Blocker
- Orange dot = Concern
- Blue dot = Question
- Green dot = Suggestion

Click a dot to select that annotation.

### Sidebar List

The sidebar shows all annotations:
- Sorted by line number
- Color-coded by type
- Shows author and timestamp
- Shows reply count

### Filtering

Filter annotations by status:
- **All** - Show all annotations
- **Open** - Only open annotations
- **Blockers** - Only open blockers

## Adding Annotations

### Method 1: Click Line Number

1. Click on a line number
2. Click "Add annotation" button that appears
3. Type your comment
4. Select type (concern, question, suggestion, blocker)
5. Click "Add"

### Method 2: Select Text

1. Click and drag to select text across lines
2. A popup appears with "Add annotation"
3. Complete the annotation form

### Method 3: Keyboard

1. Click a line to select it
2. Press `a` to open annotation form
3. Complete and submit

## Managing Annotations

### Resolve

Mark an annotation as resolved:
- Click the checkmark icon on the annotation
- Or select and press `r`

Resolved annotations:
- Move to the bottom of the list
- Show with strikethrough
- Can be filtered out

### Reopen

Reopen a resolved annotation:
- Click the reopen icon
- Or select and press `u`

### Delete

Delete an annotation:
- Click the trash icon
- Or select and press `Shift+D`
- Confirm in the dialog

### Reply

Add a threaded reply:
1. Click an annotation to expand it
2. Click "Reply" button
3. Type your reply
4. Submit

Replies appear threaded under the annotation.

## Sidebar Views

### Annotations Tab

Default view showing all annotations.

Features:
- Filter by status (All/Open/Blockers)
- Click to navigate to annotation
- Expand for replies

### Activity Tab

Chronological feed of all changes:
- New annotations added
- Annotations resolved
- Annotations reopened
- Replies added
- Approvals given

Each entry shows:
- Action type
- Author
- Timestamp
- Link to annotation

### Changes Tab

Shows what changed since you opened the page:
- Added annotations (green)
- Resolved annotations (blue)
- Reopened annotations (orange)
- Deleted annotations (red)

Useful for seeing team activity.

## Sharing

### Copy Link to View

Share your current view state:
1. Click "Share" in header
2. Click "Copy link to view"
3. URL is copied to clipboard

The URL encodes:
- Current file (multi-file mode)
- Selected annotation
- Selected line

Example: `http://localhost:3000/#annotation=abc123`

### Copy for Claude

Get a formatted summary for Claude:
1. Click "Share" in header
2. Click "Copy for Claude"
3. Paste into Claude conversation

Format:
```markdown
# Annotations for plan.md

## Blockers (1)

### L15: Security vulnerability
> `password = user_input`
- Alice

## Concerns (2)
...
```

### Export HTML

Create a standalone HTML file:
1. Click "Share" in header
2. Click "Export HTML"
3. File downloads automatically

The HTML includes:
- Full file content
- All annotations inline
- Styling (works offline)
- No server required

## Inline Editing

Edit file content directly:

1. Double-click on any line
2. Edit the text
3. Click outside or press Enter to save
4. Changes are saved to the file

Note: Annotations auto-sync when content changes.

## Multi-File Mode

When serving multiple files:

### Switching Files

- Click file tabs in header
- Or use `#file=path` in URL

### File Indicators

Each tab shows:
- File name
- Open annotation count
- Current file highlighted

### Annotations Per File

Each file has its own:
- Annotation sidecar file
- Approval status
- Activity feed

## Real-Time Updates

The viewer uses Server-Sent Events (SSE) for live updates:

- Annotations added/changed by CLI appear instantly
- File content changes refresh automatically
- Multiple viewers stay in sync

No manual refresh needed.

## URL State

URLs encode viewer state for sharing:

| Hash Parameter | Example | Description |
|----------------|---------|-------------|
| `#annotation=<id>` | `#annotation=abc123` | Link to annotation |
| `#line=<num>` | `#line=42` | Link to line |
| `#file=<path>` | `#file=README.md` | Link to file |

Combine: `#file=plan.md&annotation=abc123`

## Approvals

### View Approvals

Approvals show in:
- Header stats ("1 approved")
- Activity feed
- Check status

### Add Approval

Use CLI:
```bash
ano approve plan.md
ano lgtm plan.md
ano approve plan.md --title "Tech Lead"
```

Approvals appear in web viewer immediately.

## Tips & Tricks

### Quick Navigation

- Use `j`/`k` to cycle through annotations
- Press `Esc` to deselect and see overview
- Click line numbers for quick selection

### Efficient Review

1. Start with "Blockers" filter
2. Resolve/address each blocker
3. Switch to "Open" for remaining items
4. Use `j`/`k` to move through quickly

### Team Collaboration

1. Open web viewer: `ano serve plan.md`
2. Share URL with team
3. Everyone adds annotations
4. Use Activity tab to track changes
5. Approve when ready

### Keyboard-Heavy Workflow

1. Open viewer
2. Press `j` to select first annotation
3. Review, press `r` to resolve
4. Press `j` for next
5. Repeat until done

## Troubleshooting

### Viewer Not Updating

1. Check terminal for SSE errors
2. Refresh the page
3. Restart: `ano serve plan.md`

### Port Already in Use

```bash
# Use different port
ano serve plan.md --port 3001
```

### Annotations on Wrong Lines

```bash
# Sync annotation positions
ano sync plan.md
```

Then refresh the viewer.

### Slow Performance

For large files:
- Filter to "Open" or "Blockers"
- Consider splitting into multiple files

## Next Steps

- [Getting Started](./getting-started.md) - Basic tutorial
- [Claude Integration](./claude-integration.md) - MCP and hooks
- [Team Configuration](./team-config.md) - Team-based approvals
