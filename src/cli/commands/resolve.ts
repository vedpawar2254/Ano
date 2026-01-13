/**
 * ano resolve command
 *
 * Mark an annotation as resolved.
 *
 * Usage:
 *   ano resolve <file> <id>
 *
 * Examples:
 *   ano resolve plan.md 550e8400
 *   ano resolve plan.md 550e8400-e29b-41d4-a716-446655440000
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import {
  readAnnotationFile,
  resolveAnnotation,
  reopenAnnotation,
} from '../../core/annotations.js';

// Create the command
export const resolveCommand = new Command('resolve')
  .description('Mark an annotation as resolved')
  .argument('<file>', 'File containing the annotation')
  .argument('<id>', 'Annotation ID (full or partial)')
  .option('-r, --reopen', 'Reopen a resolved annotation instead')
  .action(async (file: string, partialId: string, options: { reopen?: boolean }) => {
    try {
      const filePath = resolve(file);

      // Find the full annotation ID from partial
      const annotationFile = await readAnnotationFile(filePath);
      if (!annotationFile) {
        console.error(chalk.red(`Error: No annotations found for ${file}`));
        process.exit(1);
      }

      // Find matching annotation
      const annotation = annotationFile.annotations.find(a =>
        a.id.startsWith(partialId) || a.id === partialId
      );

      if (!annotation) {
        console.error(chalk.red(`Error: Annotation not found: ${partialId}`));
        console.log(chalk.dim('  Use "ano list <file>" to see annotation IDs'));
        process.exit(1);
      }

      // Resolve or reopen
      let success: boolean;
      if (options.reopen) {
        success = await reopenAnnotation(filePath, annotation.id);
        if (success) {
          console.log(chalk.green('✓ Annotation reopened'));
        }
      } else {
        success = await resolveAnnotation(filePath, annotation.id);
        if (success) {
          console.log(chalk.green('✓ Annotation resolved'));
        }
      }

      if (!success) {
        console.error(chalk.red('Error: Failed to update annotation'));
        process.exit(1);
      }

      // Show annotation details
      console.log();
      console.log(`  ${chalk.bold('ID:')}   ${chalk.dim(annotation.id.slice(0, 8))}...`);
      console.log(`  ${chalk.bold('Line:')} ${annotation.anchor.line}`);
      console.log(`  "${annotation.content}"`);

    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      process.exit(1);
    }
  });
