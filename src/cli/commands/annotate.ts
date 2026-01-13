/**
 * ano annotate command
 *
 * Add an annotation to a specific line in a file.
 *
 * Usage:
 *   ano annotate <file>:<line> "comment" [options]
 *
 * Examples:
 *   ano annotate plan.md:15 "Is this safe?"
 *   ano annotate plan.md:15 "Rate limit risk" --type concern
 *   ano annotate src/index.ts:42-50 "Refactor this" --type suggestion
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { access } from 'node:fs/promises';
import { addAnnotation } from '../../core/annotations.js';
import { getAuthorString } from '../../core/config.js';
import type { AnnotationType, CreateAnnotationOptions } from '../../core/types.js';

/**
 * Parse a file:line reference.
 * Supports: "file.md:15" or "file.md:15-20" (range)
 */
function parseFileLineRef(ref: string): { file: string; line: number; endLine?: number } | null {
  // Match: file.md:15 or file.md:15-20
  const match = ref.match(/^(.+):(\d+)(?:-(\d+))?$/);
  if (!match) return null;

  const [, file, lineStr, endLineStr] = match;
  return {
    file: resolve(file),
    line: parseInt(lineStr, 10),
    endLine: endLineStr ? parseInt(endLineStr, 10) : undefined,
  };
}

/**
 * Validate that an annotation type is valid.
 */
function isValidType(type: string): type is AnnotationType {
  return ['concern', 'question', 'suggestion', 'blocker'].includes(type);
}

// Create the command
export const annotateCommand = new Command('annotate')
  .description('Add an annotation to a file')
  .argument('<file:line>', 'File and line number (e.g., plan.md:15 or plan.md:15-20)')
  .argument('<comment>', 'The annotation comment')
  .option('-t, --type <type>', 'Annotation type: concern, question, suggestion, blocker', 'suggestion')
  .action(async (fileLineRef: string, comment: string, options: { type: string }) => {
    try {
      // Parse file:line reference
      const parsed = parseFileLineRef(fileLineRef);
      if (!parsed) {
        console.error(chalk.red('Error: Invalid format. Use file:line (e.g., plan.md:15)'));
        process.exit(1);
      }

      const { file, line, endLine } = parsed;

      // Check file exists
      try {
        await access(file);
      } catch {
        console.error(chalk.red(`Error: File not found: ${file}`));
        process.exit(1);
      }

      // Validate type
      if (!isValidType(options.type)) {
        console.error(chalk.red(`Error: Invalid type "${options.type}". Use: concern, question, suggestion, blocker`));
        process.exit(1);
      }

      // Get author from git config
      const author = await getAuthorString();

      // Create the annotation
      const annotationOptions: CreateAnnotationOptions = {
        file,
        line,
        endLine,
        type: options.type,
        author,
        content: comment,
      };

      const annotation = await addAnnotation(annotationOptions);

      // Success output
      console.log(chalk.green('✓ Annotation added'));
      console.log();
      console.log(`  ${chalk.bold('ID:')}     ${chalk.dim(annotation.id.slice(0, 8))}...`);
      console.log(`  ${chalk.bold('File:')}   ${file}`);
      console.log(`  ${chalk.bold('Line:')}   ${line}${endLine ? `-${endLine}` : ''}`);
      console.log(`  ${chalk.bold('Type:')}   ${formatType(options.type)}`);
      console.log(`  ${chalk.bold('Author:')} ${author}`);
      console.log();
      console.log(`  "${comment}"`);

    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Format annotation type with color.
 */
function formatType(type: string): string {
  switch (type) {
    case 'concern':
      return chalk.yellow('concern');
    case 'question':
      return chalk.blue('question');
    case 'suggestion':
      return chalk.green('suggestion');
    case 'blocker':
      return chalk.red('blocker');
    default:
      return type;
  }
}
