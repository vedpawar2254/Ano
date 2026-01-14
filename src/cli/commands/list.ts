/**
 * ano list command
 *
 * List annotations for a file.
 *
 * Usage:
 *   ano list <file> [options]
 *
 * Examples:
 *   ano list plan.md
 *   ano list plan.md --status open
 *   ano list plan.md --type concern
 *   ano list plan.md --author ved
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { listAnnotations, getApprovals, readAnnotationFile } from '../../core/annotations.js';
import type { Annotation, AnnotationType, AnnotationStatus, Approval } from '../../core/types.js';

// Create the command
export const listCommand = new Command('list')
  .description('List annotations for a file')
  .argument('<file>', 'File to list annotations for')
  .option('-s, --status <status>', 'Filter by status: open, resolved')
  .option('-t, --type <type>', 'Filter by type: concern, question, suggestion, blocker')
  .option('-a, --author <author>', 'Filter by author')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as markdown (for Claude Code)')
  .option('--diff', 'Show file with inline annotations')
  .action(async (file: string, options: {
    status?: string;
    type?: string;
    author?: string;
    json?: boolean;
    markdown?: boolean;
    diff?: boolean;
  }) => {
    try {
      const filePath = resolve(file);

      // Build filter
      const filter: {
        status?: AnnotationStatus;
        type?: AnnotationType;
        author?: string;
      } = {};

      if (options.status) {
        filter.status = options.status as AnnotationStatus;
      }
      if (options.type) {
        filter.type = options.type as AnnotationType;
      }
      if (options.author) {
        filter.author = options.author;
      }

      // Get annotations and approvals
      const annotations = await listAnnotations(filePath, filter);
      const approvals = await getApprovals(filePath);

      // JSON output
      if (options.json) {
        console.log(JSON.stringify({ annotations, approvals }, null, 2));
        return;
      }

      // Markdown output (for Claude Code)
      if (options.markdown) {
        const content = await readFile(filePath, 'utf-8');
        printMarkdown(file, content, annotations, approvals);
        return;
      }

      // Diff output (inline annotations)
      if (options.diff) {
        const content = await readFile(filePath, 'utf-8');
        printDiff(file, content, annotations);
        return;
      }

      // Human-readable output
      printHeader(file, annotations, approvals);
      printApprovals(approvals);
      printAnnotations(annotations);

    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Print the header with summary.
 */
function printHeader(file: string, annotations: Annotation[], approvals: Approval[]): void {
  const open = annotations.filter(a => a.status === 'open').length;
  const resolved = annotations.filter(a => a.status === 'resolved').length;
  const approved = approvals.filter(a => a.status === 'approved').length;

  console.log();
  console.log(chalk.bold(`  ${file}`));
  console.log(chalk.dim(`  ${open} open, ${resolved} resolved, ${approved} approvals`));
  console.log();
}

/**
 * Print approvals section.
 */
function printApprovals(approvals: Approval[]): void {
  if (approvals.length === 0) return;

  console.log(chalk.bold('  Approvals'));
  console.log();

  for (const approval of approvals) {
    const icon = approval.status === 'approved'
      ? chalk.green('✓')
      : approval.status === 'changes_requested'
        ? chalk.red('✗')
        : chalk.dim('○');

    const title = approval.title ? chalk.dim(` (${approval.title})`) : '';
    console.log(`  ${icon} ${approval.author}${title}`);
  }

  console.log();
}

/**
 * Print annotations list.
 */
function printAnnotations(annotations: Annotation[]): void {
  if (annotations.length === 0) {
    console.log(chalk.dim('  No annotations found'));
    console.log();
    return;
  }

  console.log(chalk.bold('  Annotations'));
  console.log();

  for (const annotation of annotations) {
    printAnnotation(annotation);
  }
}

/**
 * Print a single annotation.
 */
function printAnnotation(annotation: Annotation): void {
  const { anchor, type, author, content, status, id, replies } = annotation;

  // Status icon
  const statusIcon = status === 'open' ? chalk.yellow('●') : chalk.dim('○');

  // Type badge
  const typeBadge = formatTypeBadge(type);

  // Line reference
  const lineRef = anchor.endLine
    ? `L${anchor.line}-${anchor.endLine}`
    : `L${anchor.line}`;

  // Short ID
  const shortId = chalk.dim(`#${id.slice(0, 8)}`);

  // Print annotation
  console.log(`  ${statusIcon} ${typeBadge} ${chalk.cyan(lineRef)} ${shortId}`);
  console.log(`    ${chalk.bold(author)}: ${content}`);

  // Print replies
  if (replies.length > 0) {
    for (const reply of replies) {
      console.log(`    ${chalk.dim('└─')} ${reply.author}: ${reply.content}`);
    }
  }

  console.log();
}

/**
 * Format annotation type as colored badge.
 */
function formatTypeBadge(type: AnnotationType): string {
  switch (type) {
    case 'concern':
      return chalk.bgYellow.black(' concern ');
    case 'question':
      return chalk.bgBlue.white(' question ');
    case 'suggestion':
      return chalk.bgGreen.black(' suggestion ');
    case 'blocker':
      return chalk.bgRed.white(' blocker ');
    default:
      return type;
  }
}

/**
 * Print markdown output for Claude Code integration.
 */
function printMarkdown(file: string, content: string, annotations: Annotation[], approvals: Approval[]): void {
  const lines = content.split('\n');
  const openAnnotations = annotations.filter(a => a.status === 'open');
  const blockers = openAnnotations.filter(a => a.type === 'blocker');
  const concerns = openAnnotations.filter(a => a.type === 'concern');
  const questions = openAnnotations.filter(a => a.type === 'question');
  const suggestions = openAnnotations.filter(a => a.type === 'suggestion');

  console.log(`# Annotations for ${file}\n`);

  // Summary
  const approved = approvals.filter(a => a.status === 'approved').length;
  console.log(`**Status:** ${openAnnotations.length} open, ${approved} approvals\n`);

  if (blockers.length > 0) {
    console.log(`## 🚫 Blockers (${blockers.length})\n`);
    for (const a of blockers) {
      const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
      const lineContent = lines[a.anchor.line - 1] || '';
      console.log(`### ${lineRef}: ${a.content}`);
      console.log(`> \`${lineContent.trim()}\``);
      console.log(`— ${a.author.split('<')[0].trim()}\n`);
    }
  }

  if (concerns.length > 0) {
    console.log(`## ⚠️ Concerns (${concerns.length})\n`);
    for (const a of concerns) {
      const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
      const lineContent = lines[a.anchor.line - 1] || '';
      console.log(`### ${lineRef}: ${a.content}`);
      console.log(`> \`${lineContent.trim()}\``);
      console.log(`— ${a.author.split('<')[0].trim()}\n`);
    }
  }

  if (questions.length > 0) {
    console.log(`## ❓ Questions (${questions.length})\n`);
    for (const a of questions) {
      const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
      const lineContent = lines[a.anchor.line - 1] || '';
      console.log(`### ${lineRef}: ${a.content}`);
      console.log(`> \`${lineContent.trim()}\``);
      console.log(`— ${a.author.split('<')[0].trim()}\n`);
    }
  }

  if (suggestions.length > 0) {
    console.log(`## 💡 Suggestions (${suggestions.length})\n`);
    for (const a of suggestions) {
      const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
      const lineContent = lines[a.anchor.line - 1] || '';
      console.log(`### ${lineRef}: ${a.content}`);
      console.log(`> \`${lineContent.trim()}\``);
      console.log(`— ${a.author.split('<')[0].trim()}\n`);
    }
  }

  if (openAnnotations.length === 0) {
    console.log(`No open annotations. All feedback has been addressed! ✅`);
  }
}

/**
 * Print diff-style output with inline annotations.
 */
function printDiff(file: string, content: string, annotations: Annotation[]): void {
  const lines = content.split('\n');
  const annotationMap = new Map<number, Annotation[]>();

  for (const ann of annotations.filter(a => a.status === 'open')) {
    const start = ann.anchor.line;
    const end = ann.anchor.endLine || ann.anchor.line;
    for (let i = start; i <= end; i++) {
      if (!annotationMap.has(i)) annotationMap.set(i, []);
      annotationMap.get(i)!.push(ann);
    }
  }

  console.log();
  console.log(chalk.bold(`  ${file}`));
  console.log(chalk.dim('  ─'.repeat(40)));
  console.log();

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const lineAnnotations = annotationMap.get(lineNum) || [];
    const numStr = String(lineNum).padStart(4, ' ');

    if (lineAnnotations.length > 0) {
      // Print line with highlight
      console.log(chalk.yellow(`${numStr} │ `) + lines[i]);

      // Print inline annotations
      for (const ann of lineAnnotations) {
        // Only show annotation on the first line of multi-line
        if (ann.anchor.line === lineNum) {
          const typeColor = ann.type === 'blocker' ? chalk.red :
            ann.type === 'concern' ? chalk.yellow :
            ann.type === 'question' ? chalk.blue : chalk.green;
          console.log(chalk.dim('     │ ') + typeColor(`[${ann.type.toUpperCase()}] `) + ann.content);
        }
      }
    } else {
      console.log(chalk.dim(`${numStr} │ `) + lines[i]);
    }
  }

  console.log();
}
