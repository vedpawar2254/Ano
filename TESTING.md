# Ano CLI Testing Guide

This guide provides comprehensive instructions for testing all terminal features of Ano.

## Quick Start

### Automated Testing

Run the automated test script:

```bash
# Make script executable
chmod +x test-script.sh

# Run all tests
./test-script.sh
```

This will test all CLI commands systematically and provide a summary report.

---

## Manual Testing Checklist

Use this checklist to manually verify each feature works correctly.

### Prerequisites

- [ ] Ano CLI is built and linked: `npm run build && npm link`
- [ ] Git is configured with user name and email
- [ ] Test files are created (or use test-script.sh setup)

---

### 1. Team Management Commands

#### `ano team init`
- [ ] Initialize a new team configuration
  ```bash
  ano team init --name "My Team"
  ```
- [ ] Verify `.ano/config.json` is created
- [ ] Check that config has correct project name

#### `ano team show`
- [ ] Display current team configuration
  ```bash
  ano team show
  ```
- [ ] Verify output shows team name, members, roles, and requirements

#### `ano team add-member`
- [ ] Add a team member with default role
  ```bash
  ano team add-member "Alice Smith" "alice@example.com"
  ```
- [ ] Add a team member with specific role
  ```bash
  ano team add-member "Bob Jones" "bob@example.com" --role lead
  ```
- [ ] Verify members appear in `ano team show`

#### `ano team remove-member`
- [ ] Remove a team member
  ```bash
  ano team remove-member "alice@example.com"
  ```
- [ ] Verify member is removed from config

#### `ano team set-requirements`
- [ ] Set minimum approvals required
  ```bash
  ano team set-requirements --min-approvals 2
  ```
- [ ] Set required roles
  ```bash
  ano team set-requirements --required-roles "lead,senior"
  ```

---

### 2. Annotation Commands

#### `ano annotate`
- [ ] Add single-line annotation
  ```bash
  ano annotate plan.md:10 "This needs clarification" --type question
  ```
- [ ] Add multi-line annotation
  ```bash
  ano annotate plan.md:15-20 "This entire section is problematic" --type concern
  ```
- [ ] Add annotation with different types:
  - [ ] `--type concern`
  - [ ] `--type question`
  - [ ] `--type suggestion`
  - [ ] `--type blocker`
- [ ] Verify annotation appears in `.annotations.json` file

#### `ano list`
- [ ] List all annotations
  ```bash
  ano list plan.md
  ```
- [ ] Filter by type
  ```bash
  ano list plan.md --type blocker
  ```
- [ ] Filter by status
  ```bash
  ano list plan.md --status open
  ano list plan.md --status resolved
  ```
- [ ] JSON output
  ```bash
  ano list plan.md --json
  ```
- [ ] Verify output formatting is readable
- [ ] Check colors and formatting in terminal

---

### 3. Quick Annotation Commands

#### `ano nit`
- [ ] Add a minor suggestion (nit)
  ```bash
  ano nit plan.md:5 "Typo: 'teh' should be 'the'"
  ```
- [ ] Verify it creates a `suggestion` type annotation

#### `ano q`
- [ ] Add a question quickly
  ```bash
  ano q plan.md:8 "What about edge cases?"
  ```
- [ ] Verify it creates a `question` type annotation

#### `ano block`
- [ ] Add a blocker quickly
  ```bash
  ano block plan.md:12 "Security review required"
  ```
- [ ] Verify it creates a `blocker` type annotation

---

### 4. Thread and Reply Commands

#### `ano reply`
- [ ] Get annotation ID from `ano list`
- [ ] Add reply to existing annotation
  ```bash
  ano reply plan.md <annotation-id> "Here's my response"
  ```
- [ ] Add multiple replies to same annotation
- [ ] Verify replies appear in `ano list` output
- [ ] Check reply threading in web UI

---

### 5. Resolve and Reopen Commands

#### `ano resolve`
- [ ] Resolve an open annotation
  ```bash
  ano resolve plan.md <annotation-id>
  ```
- [ ] Verify status changes to `resolved`
- [ ] Check that resolved items are hidden by default in lists

#### `ano reopen`
- [ ] Reopen a resolved annotation
  ```bash
  ano reopen plan.md <annotation-id>
  ```
- [ ] Verify status changes back to `open`

---

### 6. Approval Commands

#### `ano approve`
- [ ] Add basic approval
  ```bash
  ano approve plan.md "Looks good to me"
  ```
- [ ] Add approval with title
  ```bash
  ano approve plan.md "LGTM" --title "Senior Engineer"
  ```
- [ ] Request changes
  ```bash
  ano approve plan.md "Needs work" --request-changes
  ```
- [ ] Verify approvals are stored separately from annotations

#### `ano check`
- [ ] Check approval status
  ```bash
  ano check plan.md
  ```
- [ ] Verify output shows:
  - [ ] Approval count vs requirement
  - [ ] Individual approvals with timestamps
  - [ ] Approval status (approved/changes requested/pending)
  - [ ] Exit code (0 if approved, 1 if not)
- [ ] JSON output
  ```bash
  ano check plan.md --json
  ```

---

### 7. Quick Approval Commands

#### `ano lgtm`
- [ ] Quick approve with "LGTM"
  ```bash
  ano lgtm plan.md
  ```
- [ ] Verify it adds approval

#### `ano shipit`
- [ ] Quick approve with "Ship it!"
  ```bash
  ano shipit plan.md
  ```
- [ ] With optional message
  ```bash
  ano shipit plan.md "Ready for production"
  ```

---

### 8. Sync and Anchoring

#### `ano sync`
- [ ] Modify a file (add/remove lines)
- [ ] Run sync to relocate annotations
  ```bash
  ano sync plan.md
  ```
- [ ] Verify annotations moved to correct new positions
- [ ] Test with various file modifications:
  - [ ] Insert lines before annotations
  - [ ] Delete lines before annotations
  - [ ] Modify annotated lines slightly
  - [ ] Major file restructure

#### Test Anchoring Algorithm
- [ ] Create annotation on line 10
- [ ] Insert 5 lines at top of file
- [ ] Run sync
- [ ] Verify annotation is now on line 15
- [ ] Check that context matching works correctly

---

### 9. Import and Export

#### `ano export`
- [ ] Export annotations to JSON
  ```bash
  ano export plan.md -o backup.json
  ```
- [ ] Verify JSON file is created
- [ ] Check JSON structure is valid

#### `ano import`
- [ ] Import annotations from JSON
  ```bash
  ano import plan.md backup.json
  ```
- [ ] Verify annotations are restored
- [ ] Test overwriting existing annotations

---

### 10. Diff Commands

#### `ano diff`
- [ ] Show differences in annotations
  ```bash
  ano diff plan.md
  ```
- [ ] Modify annotations and run diff again
- [ ] Verify diff shows changes correctly

---

### 11. Delete Commands

#### `ano delete`
- [ ] Delete a specific annotation
  ```bash
  ano delete plan.md <annotation-id>
  ```
- [ ] Verify annotation is removed
- [ ] Check that replies are also deleted

---

### 12. Web Server

#### `ano serve`
- [ ] Start web server
  ```bash
  ano serve plan.md
  ```
- [ ] Verify server starts on port 3000 (default)
- [ ] Custom port
  ```bash
  ano serve plan.md --port 8080
  ```
- [ ] Open browser to http://localhost:3000
- [ ] Test web UI features:
  - [ ] View annotations inline
  - [ ] Add new annotations via UI
  - [ ] Reply to annotations
  - [ ] Resolve/reopen annotations
  - [ ] Filter by type/status
  - [ ] Activity feed shows recent changes
  - [ ] Diff view works
  - [ ] Edit file content directly
  - [ ] Real-time updates via SSE
  - [ ] Keyboard shortcuts (j/k navigation, r to resolve)
  - [ ] Export HTML
  - [ ] Copy for Claude
  - [ ] Shareable URLs

---

### 13. Help and Documentation

#### `ano --help`
- [ ] Display main help
- [ ] Verify all commands are listed

#### `ano --version`
- [ ] Display version number

#### Command-specific help
- [ ] `ano annotate --help`
- [ ] `ano approve --help`
- [ ] `ano team --help`
- [ ] `ano check --help`
- [ ] `ano serve --help`
- [ ] Verify help text is clear and accurate

---

### 14. MCP Server Integration

#### `ano mcp` or `node dist/mcp/server.js`
- [ ] Start MCP server
  ```bash
  npm run mcp
  ```
- [ ] Verify server starts without errors
- [ ] Test in Claude Code (requires MCP configuration)
  - [ ] `read_annotations` tool works
  - [ ] `add_annotation` tool works
  - [ ] `resolve_annotation` tool works
  - [ ] `approve_file` tool works

---

### 15. Approval Gate Hook

#### Test with Claude Code
- [ ] Configure approval gate hook in Claude Code settings
- [ ] Create a plan file
- [ ] Try to execute without approvals
- [ ] Verify Claude is blocked
- [ ] Add required approvals
- [ ] Verify Claude can now execute

---

## Edge Cases and Error Handling

### Error Scenarios to Test

- [ ] **Missing file**: Try commands on non-existent file
  ```bash
  ano list nonexistent.md
  ```
  - Verify clear error message

- [ ] **Invalid line number**: Annotate line beyond file length
  ```bash
  ano annotate plan.md:999 "Test"
  ```
  - Verify error handling

- [ ] **Invalid annotation ID**: Use non-existent ID
  ```bash
  ano resolve plan.md invalid-id
  ```
  - Verify error message

- [ ] **No team config**: Run team commands without init
  - Verify helpful error message

- [ ] **Invalid JSON**: Corrupt annotation file manually
  - Verify graceful error handling

- [ ] **Permission errors**: Test on read-only files
  - Verify error messages

- [ ] **Port already in use**: Start server on occupied port
  ```bash
  ano serve plan.md --port 3000
  # In another terminal
  ano serve plan.md --port 3000
  ```
  - Verify error handling

---

## Performance Testing

- [ ] **Large files**: Test with 1000+ line file
- [ ] **Many annotations**: Create 100+ annotations
- [ ] **Web UI responsiveness**: Test with large datasets
- [ ] **Sync performance**: Test on files with many annotations

---

## Integration Testing

### With Git
- [ ] Commit annotation files
- [ ] Branch and merge with conflicts
- [ ] Verify annotations work across branches

### With Claude Code
- [ ] MCP server integration
- [ ] Approval gate hooks
- [ ] Auto-open web viewer

### Multi-user Workflow
- [ ] Multiple team members adding annotations
- [ ] Import/export between users
- [ ] Approval workflow with multiple reviewers

---

## Cross-platform Testing

If possible, test on multiple platforms:
- [ ] macOS
- [ ] Linux
- [ ] Windows (WSL)

---

## Browser Compatibility (Web UI)

Test web viewer in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Regression Testing

After any code changes, re-run:
1. Automated test script: `./test-script.sh`
2. Critical path tests:
   - [ ] Create annotation
   - [ ] List annotations
   - [ ] Approve file
   - [ ] Check approval
   - [ ] Serve web UI

---

## Reporting Issues

When reporting bugs, include:
- Command run
- Expected behavior
- Actual behavior
- Error messages
- Environment (OS, Node version)
- Ano version (`ano --version`)

---

## Test Data Cleanup

After testing:
```bash
# Remove test directory
rm -rf .ano-test

# Remove test artifacts
rm -f annotations-backup.json
rm -f *.annotations.json

# Reset team config if needed
rm -rf .ano
```

---

## Continuous Testing

Before each release:
1. Run automated test script
2. Complete manual testing checklist
3. Test MCP integration with Claude Code
4. Test approval gate hook
5. Cross-platform verification
6. Browser compatibility check

---

## Notes

- Some tests require manual verification (e.g., visual checks in web UI)
- Web UI tests are best done manually with browser DevTools open
- MCP tests require Claude Code to be installed and configured
- Team features require multiple git identities or team members

---

## Test Coverage Status

Current status:
- ✅ Unit tests: Not implemented yet
- ✅ Integration tests: Not implemented yet
- ✅ Manual testing: Checklist provided
- ✅ Automated CLI testing: Script provided

**Next steps**: Add unit tests with a framework like Vitest or Jest.
