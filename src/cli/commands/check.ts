/**
 * ano check command
 *
 * Check if a file has required approvals.
 * Designed to be used as a Claude Code hook.
 *
 * Usage:
 *   ano check <file> [options]
 *
 * Exit codes:
 *   0 = Has required approvals (or overridden)
 *   1 = Missing required approvals (blocks execution)
 *
 * Modes:
 *   --soft      Warn but don't block (exit 0 even if checks fail)
 *   --override  Bypass checks with a reason (logged for audit)
 *
 * Examples:
 *   ano check plan.md                              # Standard check
 *   ano check plan.md --soft                       # Warn only, don't block
 *   ano check plan.md --override --reason "hotfix" # Bypass with reason
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { appendFile } from 'node:fs/promises';
import {
  readAnnotationFile,
} from '../../core/annotations.js';
import { getAuthorString, getUser } from '../../core/config.js';
import { checkTeamMembership, readTeamConfig } from '../../core/team.js';

// Create the command
export const checkCommand = new Command('check')
  .description('Check if a file has required approvals (for hooks)')
  .argument('<file>', 'File to check')
  .option('-r, --required <count>', 'Required number of approvals (default: from team config or 1)')
  .option('--allow-blockers', 'Allow open blockers (don\'t fail on them)')
  .option('-q, --quiet', 'Suppress output (just exit code)')
  .option('--json', 'Output as JSON')
  // Title/role-based requirements
  .option('--require-title <titles...>', 'Require approval from users with specific titles (e.g., "Tech Lead" "Security")')
  .option('--require-role <roles...>', 'Require approval from team members with specific roles')
  // Soft gate mode
  .option('-s, --soft', 'Soft gate: warn but don\'t block (always exit 0)')
  // Override with reason
  .option('-o, --override', 'Override approval check (requires --reason)')
  .option('--reason <reason>', 'Reason for override (required with --override)')
  .action(async (file: string, options: {
    required?: string;
    allowBlockers: boolean;
    quiet: boolean;
    json: boolean;
    requireTitle?: string[];
    requireRole?: string[];
    soft: boolean;
    override: boolean;
    reason?: string;
  }) => {
    try {
      const filePath = resolve(file);

      // Load team config first to get default requirements
      const teamConfig = await readTeamConfig();

      // Priority: CLI flag > team config > default (1)
      let requiredCount: number;
      if (options.required !== undefined) {
        requiredCount = parseInt(options.required, 10);
      } else if (teamConfig?.requirements.minApprovals) {
        requiredCount = teamConfig.requirements.minApprovals;
      } else {
        requiredCount = 1;
      }

      // Handle override
      if (options.override) {
        if (!options.reason) {
          console.error(chalk.red('Error: --override requires --reason'));
          console.error(chalk.dim('  Example: ano check plan.md --override --reason "hotfix for prod"'));
          process.exit(1);
        }

        const author = await getAuthorString();
        await logOverride(filePath, author, options.reason);

        if (!options.quiet) {
          console.log(chalk.yellow.bold('  ⚠ OVERRIDE'));
          console.log();
          console.log(`  ${chalk.bold('Author:')} ${author}`);
          console.log(`  ${chalk.bold('Reason:')} ${options.reason}`);
          console.log();
          console.log(chalk.dim('  Override logged to .ano-overrides.log'));
        }

        if (options.json) {
          console.log(JSON.stringify({
            approved: true,
            override: true,
            author,
            reason: options.reason,
            file: filePath,
          }));
        }

        process.exit(0);
      }

      // Get current state
      const annotationFile = await readAnnotationFile(filePath);

      // If no annotation file exists, consider it "approved" (no feedback yet)
      if (!annotationFile) {
        if (options.json) {
          console.log(JSON.stringify({
            approved: true,
            reason: 'No annotations exist',
            file: filePath,
          }));
        } else if (!options.quiet) {
          console.log(chalk.dim('No annotations found - proceeding'));
        }
        process.exit(0);
      }

      // Count approvals
      const approvals = annotationFile.approvals;
      const approvedCount = approvals.filter(a => a.status === 'approved').length;
      const changesRequested = approvals.filter(a => a.status === 'changes_requested').length;

      // Check for open blockers
      const annotations = annotationFile.annotations;
      const openBlockers = annotations.filter(
        a => a.type === 'blocker' && a.status === 'open'
      );

      // Check required titles
      const requiredTitles = options.requireTitle || teamConfig?.requirements.requiredTitles || [];
      const approvedTitles = approvals
        .filter(a => a.status === 'approved' && a.title)
        .map(a => a.title!.toLowerCase());
      const missingTitles = requiredTitles.filter(
        t => !approvedTitles.includes(t.toLowerCase())
      );
      const hasRequiredTitles = missingTitles.length === 0;

      // Check team membership for each approver (needed for role checks)
      const approversWithTeam = await Promise.all(
        approvals.map(async (a) => {
          // Try multiple formats to match team membership:
          // 1. "Name <email>" format - extract email
          // 2. Plain email "user@example.com"
          // 3. Plain name "ved" - try to match against team member names
          const emailMatch = a.author.match(/<(.+?)>/);
          let membership: { isMember: boolean; member?: any; role?: any } = { isMember: false };

          if (emailMatch) {
            // Format: "Name <email>" - use email
            membership = await checkTeamMembership(emailMatch[1]);
          } else if (a.author.includes('@')) {
            // Format: plain email
            membership = await checkTeamMembership(a.author);
          } else if (teamConfig) {
            // Format: plain name - try to find by name (case-insensitive)
            const memberByName = teamConfig.members.find(
              m => m.name.toLowerCase() === a.author.toLowerCase()
            );
            if (memberByName) {
              membership = await checkTeamMembership(memberByName.email);
            }
          }

          const { isMember, member, role } = membership;
          return {
            author: a.author,
            title: a.title,
            status: a.status,
            isMember,
            role: member?.role,
            canOverride: role?.canOverride,
          };
        })
      );

      // Check required roles (from team config)
      const requiredRoles = options.requireRole || teamConfig?.requirements.requiredRoles || [];
      const approverRoles = approversWithTeam
        .filter(a => a.status === 'approved' && a.isMember && a.role)
        .map(a => a.role!.toLowerCase());
      const missingRoles = requiredRoles.filter(
        r => !approverRoles.includes(r.toLowerCase())
      );
      const hasRequiredRoles = missingRoles.length === 0;

      // Determine pass/fail
      const hasEnoughApprovals = approvedCount >= requiredCount;
      const hasNoBlockers = options.allowBlockers ? true : openBlockers.length === 0;
      const noChangesRequested = changesRequested === 0;

      const passed = hasEnoughApprovals && hasNoBlockers && noChangesRequested && hasRequiredTitles && hasRequiredRoles;

      // Build result
      const result = {
        approved: passed,
        softMode: options.soft,
        file: filePath,
        hasTeamConfig: !!teamConfig,
        approvals: {
          required: requiredCount,
          received: approvedCount,
          changesRequested,
        },
        blockers: {
          count: openBlockers.length,
          items: openBlockers.map(b => ({
            line: b.anchor.line,
            author: b.author,
            content: b.content,
          })),
        },
        titles: {
          required: requiredTitles,
          missing: missingTitles,
        },
        roles: {
          required: requiredRoles,
          missing: missingRoles,
        },
        approvers: approversWithTeam,
      };

      // Output
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else if (!options.quiet) {
        printResult(result, requiredCount, options.soft);
      }

      // Exit code - soft mode always exits 0
      if (options.soft) {
        process.exit(0);
      } else {
        process.exit(passed ? 0 : 1);
      }

    } catch (error) {
      if (options.json) {
        console.log(JSON.stringify({
          approved: false,
          error: (error as Error).message,
        }));
      } else if (!options.quiet) {
        console.error(chalk.red('Error:'), (error as Error).message);
      }
      process.exit(1);
    }
  });

/**
 * Log override to audit file
 */
async function logOverride(file: string, author: string, reason: string): Promise<void> {
  const logEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    file,
    author,
    reason,
    action: 'override',
  }) + '\n';

  const logFile = resolve(process.cwd(), '.ano-overrides.log');
  await appendFile(logFile, logEntry);
}

/**
 * Print human-readable result
 */
function printResult(result: {
  approved: boolean;
  softMode?: boolean;
  hasTeamConfig?: boolean;
  approvals: { required: number; received: number; changesRequested: number };
  blockers: { count: number; items: Array<{ line: number; author: string; content: string }> };
  titles: { required: string[]; missing: string[] };
  roles: { required: string[]; missing: string[] };
  approvers: Array<{
    author: string;
    title?: string;
    status: string;
    isMember?: boolean;
    role?: string;
    canOverride?: boolean;
  }>;
}, requiredCount: number, softMode: boolean): void {
  console.log();

  // Header
  if (result.approved) {
    console.log(chalk.green.bold('  ✓ APPROVED'));
  } else if (softMode) {
    console.log(chalk.yellow.bold('  ⚠ WARNING (soft mode - proceeding anyway)'));
  } else {
    console.log(chalk.red.bold('  ✗ NOT APPROVED'));
  }

  console.log();

  // Approval count
  const { received, changesRequested } = result.approvals;
  const approvalIcon = received >= requiredCount ? chalk.green('✓') : chalk.red('✗');
  console.log(`  ${approvalIcon} Approvals: ${received}/${requiredCount}`);

  // Changes requested
  if (changesRequested > 0) {
    console.log(`  ${chalk.red('✗')} Changes requested: ${changesRequested}`);
  }

  // Blockers
  if (result.blockers.count > 0) {
    console.log(`  ${chalk.red('✗')} Open blockers: ${result.blockers.count}`);
    for (const blocker of result.blockers.items) {
      console.log(chalk.dim(`      L${blocker.line}: ${blocker.content.slice(0, 50)}...`));
    }
  }

  // Missing titles
  if (result.titles.missing.length > 0) {
    console.log(`  ${chalk.red('✗')} Missing title approvals: ${result.titles.missing.join(', ')}`);
  } else if (result.titles.required.length > 0) {
    console.log(`  ${chalk.green('✓')} Required titles: ${result.titles.required.join(', ')}`);
  }

  // Missing roles
  if (result.roles.missing.length > 0) {
    console.log(`  ${chalk.red('✗')} Missing role approvals: ${result.roles.missing.join(', ')}`);
  } else if (result.roles.required.length > 0) {
    console.log(`  ${chalk.green('✓')} Required roles: ${result.roles.required.join(', ')}`);
  }

  // List approvers
  if (result.approvers.length > 0) {
    console.log();
    console.log('  Reviewers:');
    for (const approver of result.approvers) {
      const icon = approver.status === 'approved'
        ? chalk.green('✓')
        : chalk.red('✗');
      const title = approver.title ? ` (${approver.title})` : '';

      // Team membership info (advisory)
      let teamInfo = '';
      if (result.hasTeamConfig) {
        if (approver.isMember) {
          const overrideTag = approver.canOverride ? ', can override' : '';
          teamInfo = chalk.cyan(` [${approver.role}${overrideTag}]`);
        } else {
          teamInfo = chalk.yellow(' [not in team]');
        }
      }

      console.log(`    ${icon} ${approver.author}${chalk.dim(title)}${teamInfo}`);
    }
  }

  // Soft mode reminder
  if (softMode && !result.approved) {
    console.log();
    console.log(chalk.yellow('  ⚠ Proceeding despite issues (soft mode)'));
  }

  console.log();
}
