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
 *   0 = Has required approvals (or no annotations exist)
 *   1 = Missing required approvals (blocks execution)
 *
 * Examples:
 *   ano check plan.md                    # Need at least 1 approval
 *   ano check plan.md --required 2       # Need at least 2 approvals
 *   ano check plan.md --no-blockers      # Also check no open blockers
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import {
  readAnnotationFile,
  getApprovals,
  listAnnotations,
} from '../../core/annotations.js';

// Create the command
export const checkCommand = new Command('check')
  .description('Check if a file has required approvals (for hooks)')
  .argument('<file>', 'File to check')
  .option('-r, --required <count>', 'Required number of approvals', '1')
  .option('-b, --no-blockers', 'Fail if there are open blockers')
  .option('-q, --quiet', 'Suppress output (just exit code)')
  .option('--json', 'Output as JSON')
  .action(async (file: string, options: {
    required: string;
    blockers: boolean;
    quiet: boolean;
    json: boolean;
  }) => {
    try {
      const filePath = resolve(file);
      const requiredCount = parseInt(options.required, 10);

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
        printResult(result, requiredCount);
      }

      // Exit code
      process.exit(passed ? 0 : 1);

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
 * Print human-readable result
 */
function printResult(result: {
  approved: boolean;
  approvals: { required: number; received: number; changesRequested: number };
  blockers: { count: number; items: Array<{ line: number; author: string; content: string }> };
  approvers: Array<{ author: string; title?: string; status: string }>;
}, requiredCount: number): void {
  console.log();

  // Header
  if (result.approved) {
    console.log(chalk.green.bold('  ✓ APPROVED'));
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

  console.log();
}
