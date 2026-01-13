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

// Create the command
export const checkCommand = new Command('check')
  .description('Check if a file has required approvals (for hooks)')
  .argument('<file>', 'File to check')
  .option('-r, --required <count>', 'Required number of approvals', '1')
  .option('-b, --no-blockers', 'Fail if there are open blockers')
  .option('-q, --quiet', 'Suppress output (just exit code)')
  .option('--json', 'Output as JSON')
  // NEW: Soft gate mode
  .option('-s, --soft', 'Soft gate: warn but don\'t block (always exit 0)')
  // NEW: Override with reason
  .option('-o, --override', 'Override approval check (requires --reason)')
  .option('--reason <reason>', 'Reason for override (required with --override)')
  .action(async (file: string, options: {
    required: string;
    blockers: boolean;
    quiet: boolean;
    json: boolean;
    soft: boolean;
    override: boolean;
    reason?: string;
  }) => {
    try {
      const filePath = resolve(file);
      const requiredCount = parseInt(options.required, 10);

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

      // Determine pass/fail
      const hasEnoughApprovals = approvedCount >= requiredCount;
      const hasNoBlockers = options.blockers ? true : openBlockers.length === 0;
      const noChangesRequested = changesRequested === 0;

      const passed = hasEnoughApprovals && hasNoBlockers && noChangesRequested;

      // Build result
      const result = {
        approved: passed,
        softMode: options.soft,
        file: filePath,
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
        approvers: approvals.map(a => ({
          author: a.author,
          title: a.title,
          status: a.status,
        })),
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
  approvals: { required: number; received: number; changesRequested: number };
  blockers: { count: number; items: Array<{ line: number; author: string; content: string }> };
  approvers: Array<{ author: string; title?: string; status: string }>;
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

  // List approvers
  if (result.approvers.length > 0) {
    console.log();
    console.log('  Reviewers:');
    for (const approver of result.approvers) {
      const icon = approver.status === 'approved'
        ? chalk.green('✓')
        : chalk.red('✗');
      const title = approver.title ? chalk.dim(` (${approver.title})`) : '';
      console.log(`    ${icon} ${approver.author}${title}`);
    }
  }

  // Soft mode reminder
  if (softMode && !result.approved) {
    console.log();
    console.log(chalk.yellow('  ⚠ Proceeding despite issues (soft mode)'));
  }

  console.log();
}
