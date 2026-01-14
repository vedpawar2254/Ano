# Team Configuration

This guide covers setting up team-based approvals and role requirements in Ano.

## Overview

Ano supports team-based workflows where:
- Team members are tracked with roles
- Approvals can require specific roles or titles
- Role weights can be used for weighted approval thresholds

## Quick Start

```bash
# Initialize team config
ano team init "My Project"

# Add team members
ano team add alice@example.com --name "Alice" --role lead
ano team add bob@example.com --name "Bob" --role reviewer

# List team
ano team list
```

## Configuration File

Team config is stored in `.ano/config.json`:

```json
{
  "version": "1.0",
  "projectName": "My Project",
  "members": [
    {
      "name": "Alice",
      "email": "alice@example.com",
      "role": "lead"
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
    "requiredRoles": ["lead"],
    "requiredTitles": []
  }
}
```

## Team Commands

### Initialize Team

```bash
ano team init [project-name]
```

Creates `.ano/config.json` with default settings.

### Add Member

```bash
ano team add <email> [options]

Options:
  --name <name>    Display name
  --role <role>    Role (lead, reviewer, or custom)
```

Examples:
```bash
ano team add alice@example.com --name "Alice Smith" --role lead
ano team add bob@example.com --role reviewer
```

### Remove Member

```bash
ano team remove <email>
```

### List Team

```bash
ano team list
```

Shows all members with their roles.

### Show Roles

```bash
ano team roles
```

Lists available roles and their permissions.

## Roles

### Built-in Roles

| Role | Weight | Can Override |
|------|--------|--------------|
| `lead` | 2 | Yes |
| `reviewer` | 1 | No |

### Custom Roles

Add custom roles in `.ano/config.json`:

```json
{
  "roles": {
    "lead": { "canOverride": true, "weight": 2 },
    "reviewer": { "canOverride": false, "weight": 1 },
    "security": { "canOverride": true, "weight": 3 },
    "junior": { "canOverride": false, "weight": 0.5 }
  }
}
```

### Role Weights

Weights are used with `minWeight` requirement:

```json
{
  "requirements": {
    "minWeight": 3
  }
}
```

- Lead (weight 2) + Reviewer (weight 1) = 3 (passes)
- Two Reviewers (weight 1 each) = 2 (fails)

## Requirements

Configure approval requirements in `.ano/config.json`:

### Minimum Approvals

```json
{
  "requirements": {
    "minApprovals": 2
  }
}
```

Requires at least 2 approvals from any team member.

### Required Roles

```json
{
  "requirements": {
    "requiredRoles": ["lead", "security"]
  }
}
```

Requires at least one approval from each specified role.

### Required Titles

```json
{
  "requirements": {
    "requiredTitles": ["Tech Lead", "Security Review"]
  }
}
```

Requires approvals with specific titles:

```bash
ano approve plan.md --title "Tech Lead"
ano approve plan.md --title "Security Review"
```

### Minimum Weight

```json
{
  "requirements": {
    "minWeight": 4
  }
}
```

Requires total approval weight to meet threshold.

### Combined Requirements

All requirements must be met:

```json
{
  "requirements": {
    "minApprovals": 2,
    "requiredRoles": ["lead"],
    "requiredTitles": ["Security Review"],
    "minWeight": 3
  }
}
```

## CLI Check Options

Override config requirements via CLI:

```bash
# Require specific number of approvals
ano check plan.md --required 3

# Require specific role
ano check plan.md --require-role lead

# Require specific title
ano check plan.md --require-title "Tech Lead"

# Combine requirements
ano check plan.md --required 2 --require-role lead --require-title "Security"
```

## Approval Workflow

### 1. View Requirements

```bash
ano team list
```

Shows:
```
Team: My Project

Members:
  Alice <alice@example.com> [lead]
  Bob <bob@example.com> [reviewer]

Requirements:
  Min approvals: 2
  Required roles: lead
```

### 2. Check Current Status

```bash
ano check plan.md
```

Shows:
```
Approval Status: plan.md

Approvals: 1/2 required
  - Alice <alice@example.com> [lead] - approved

Missing:
  - 1 more approval needed
  - Role 'lead' requirement met

Result: NOT APPROVED
```

### 3. Approve with Title

```bash
ano approve plan.md --title "Tech Lead"
```

### 4. Override (if allowed)

```bash
ano check plan.md --override --reason "Emergency fix"
```

Only users with `canOverride: true` roles can override.

## Team Membership

### Advisory Nature

Team membership is **advisory** - anyone can approve, but:
- `ano check` shows who is/isn't in the team
- Role requirements only count team member approvals
- Non-members show as "external" in status

### Example Output

```bash
ano check plan.md
```

```
Approvals:
  - Alice <alice@example.com> [lead] (team member)
  - Charlie <charlie@other.com> (external)

Note: External approval from charlie@other.com
```

## Hook Integration

Use team config with hooks:

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

The hook uses requirements from `.ano/config.json` automatically.

Override via CLI flags if needed:

```json
{
  "command": "ano check PLAN.md --required 3 --require-role security --quiet"
}
```

## Best Practices

### 1. Start Simple

Begin with basic requirements:

```json
{
  "requirements": {
    "minApprovals": 1
  }
}
```

Add complexity as needed.

### 2. Use Roles for Expertise

Assign roles based on expertise:
- `security` - Security team members
- `backend` - Backend developers
- `frontend` - Frontend developers
- `devops` - DevOps engineers

### 3. Use Titles for Context

Use titles for situational approvals:
- "Tech Lead" - Overall technical sign-off
- "Security Review" - Security audit complete
- "Performance Review" - Performance validated

### 4. Document Requirements

Keep a README in `.ano/` explaining:
- What each role means
- When each title should be used
- Override policy

## Troubleshooting

### "Role not found"

Ensure the role exists in `config.json`:

```json
{
  "roles": {
    "custom-role": { "canOverride": false, "weight": 1 }
  }
}
```

### "External approval" warnings

The approver's email doesn't match any team member. Either:
- Add them to the team
- Ignore if external approvals are acceptable

### Requirements not loading

Check that `.ano/config.json` exists and is valid JSON:

```bash
cat .ano/config.json | jq .
```

## Next Steps

- [Claude Integration](./claude-integration.md) - Set up MCP and hooks
- [Web Viewer Guide](./web-viewer.md) - Learn all web UI features
