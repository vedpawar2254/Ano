/**
 * Quick annotation commands
 *
 * Shortcuts for common annotations to speed up reviews.
 *
 * Usage:
 *   ano lgtm <file>              # Approve with "Looks good to me"
 *   ano shipit <file>            # Strong approve, ready to ship
 *   ano nit <file>:<line> "msg"  # Minor nitpick (won't block)
 *   ano block <file>:<line> "msg" # Blocker (will block execution)
 *   ano question <file>:<line> "msg"  # Quick question
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { addAnnotation, setApproval } from '../../core/annotations.js';
import { getAuthorString, getUser } from '../../core/config.js';

// Helper to parse file:line
function parseFileLineRef(ref: string): { file: string; line: number } | null {
  const match = ref.match(/^(.+):(\d+)$/);
  if (!match) return null;
  return { file: resolve(match[1]), line: parseInt(match[2], 10) };
}

// ============================================
// lgtm - Quick approve
// ============================================
export const lgtmCommand = new Command('lgtm')
  .description('Quick approve: "Looks good to me"')
  .argument('<file>', 'File to approve')
  .option('-m, --message <msg>', 'Custom message', 'Looks good to me!')
  .action(async (file: string, options: { message: string }) => {
    const filePath = resolve(file);
    const author = await getAuthorString();
    const user = await getUser();

    await setApproval(filePath, author, 'approved', user.title, options.message);

    console.log(chalk.green('✓ LGTM!'));
    console.log(chalk.dim(`  ${author} approved ${file}`));
  });

// ============================================
// shipit - Strong approve
// ============================================
export const shipitCommand = new Command('shipit')
  .description('Strong approve: Ready to ship!')
  .argument('<file>', 'File to approve')
  .action(async (file: string) => {
    const filePath = resolve(file);
    const author = await getAuthorString();
    const user = await getUser();

    await setApproval(filePath, author, 'approved', user.title, '🚀 Ship it!');

    console.log(chalk.green('🚀 SHIP IT!'));
    console.log(chalk.dim(`  ${author} approved ${file}`));
  });

// ============================================
// nit - Minor nitpick (suggestion)
// ============================================
export const nitCommand = new Command('nit')
  .description('Minor nitpick (won\'t block)')
  .argument('<file:line>', 'File and line (e.g., plan.md:15)')
  .argument('<message>', 'The nitpick')
  .action(async (fileLineRef: string, message: string) => {
    const parsed = parseFileLineRef(fileLineRef);
    if (!parsed) {
      console.error(chalk.red('Error: Use format file:line (e.g., plan.md:15)'));
      process.exit(1);
    }

    const author = await getAuthorString();
    const annotation = await addAnnotation({
      file: parsed.file,
      line: parsed.line,
      type: 'suggestion',
      author,
      content: `[nit] ${message}`,
    });

    console.log(chalk.yellow('📝 Nit added'));
    console.log(chalk.dim(`  L${parsed.line}: ${message}`));
  });

// ============================================
// block - Add blocker
// ============================================
export const blockCommand = new Command('block')
  .description('Add blocker (will block execution)')
  .argument('<file:line>', 'File and line')
  .argument('<message>', 'Why this blocks')
  .action(async (fileLineRef: string, message: string) => {
    const parsed = parseFileLineRef(fileLineRef);
    if (!parsed) {
      console.error(chalk.red('Error: Use format file:line (e.g., plan.md:15)'));
      process.exit(1);
    }

    const author = await getAuthorString();
    await addAnnotation({
      file: parsed.file,
      line: parsed.line,
      type: 'blocker',
      author,
      content: message,
    });

    console.log(chalk.red('🛑 Blocker added'));
    console.log(chalk.dim(`  L${parsed.line}: ${message}`));
  });

// ============================================
// q - Quick question
// ============================================
export const questionCommand = new Command('q')
  .description('Quick question')
  .argument('<file:line>', 'File and line')
  .argument('<message>', 'The question')
  .action(async (fileLineRef: string, message: string) => {
    const parsed = parseFileLineRef(fileLineRef);
    if (!parsed) {
      console.error(chalk.red('Error: Use format file:line (e.g., plan.md:15)'));
      process.exit(1);
    }

    const author = await getAuthorString();
    await addAnnotation({
      file: parsed.file,
      line: parsed.line,
      type: 'question',
      author,
      content: message,
    });

    console.log(chalk.blue('❓ Question added'));
    console.log(chalk.dim(`  L${parsed.line}: ${message}`));
  });
