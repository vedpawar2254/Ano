/**
 * Annotation management commands
 *
 * Additional commands for managing annotations.
 *
 * Usage:
 *   ano reply <file> <id> "message"   Add a threaded reply
 *   ano delete <file> <id>            Delete an annotation
 *   ano sync <file>                   Sync annotations after file changes
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import {
  readAnnotationFile,
  addReply,
  deleteAnnotation,
} from '../../core/annotations.js';
import { syncAnnotations } from '../../core/anchoring.js';
import { getAuthorString } from '../../core/config.js';

// ============================================
// reply - Add threaded reply
// ============================================
export const replyCommand = new Command('reply')
  .description('Add a threaded reply to an annotation')
  .argument('<file>', 'File containing the annotation')
  .argument('<id>', 'Annotation ID (partial OK)')
  .argument('<message>', 'Reply message')
  .action(async (file: string, id: string, message: string) => {
    const filePath = resolve(file);
    const annotationFile = await readAnnotationFile(filePath);

    if (!annotationFile) {
      console.error(chalk.red('No annotations found for this file'));
      process.exit(1);
    }

    // Find annotation by partial ID
    const annotation = annotationFile.annotations.find(
      (a) => a.id.startsWith(id) || a.id.includes(id)
    );

    if (!annotation) {
      console.error(chalk.red(`Annotation not found: ${id}`));
      console.error(chalk.dim('  Use "ano list <file>" to see available IDs'));
      process.exit(1);
    }

    const author = await getAuthorString();
    const reply = await addReply(filePath, annotation.id, author, message);

    console.log(chalk.green('Reply added'));
    console.log(chalk.dim(`  To: #${annotation.id.slice(0, 8)}`));
    console.log(chalk.dim(`  "${message}"`));
  });

// ============================================
// delete - Delete annotation
// ============================================
export const deleteCommand = new Command('delete')
  .description('Delete an annotation')
  .argument('<file>', 'File containing the annotation')
  .argument('<id>', 'Annotation ID (partial OK)')
  .option('-f, --force', 'Skip confirmation')
  .action(async (file: string, id: string, options: { force: boolean }) => {
    const filePath = resolve(file);
    const annotationFile = await readAnnotationFile(filePath);

    if (!annotationFile) {
      console.error(chalk.red('No annotations found for this file'));
      process.exit(1);
    }

    // Find annotation by partial ID
    const annotation = annotationFile.annotations.find(
      (a) => a.id.startsWith(id) || a.id.includes(id)
    );

    if (!annotation) {
      console.error(chalk.red(`Annotation not found: ${id}`));
      process.exit(1);
    }

    // Show what will be deleted
    if (!options.force) {
      console.log(chalk.yellow('Will delete:'));
      console.log(`  ${chalk.dim(`#${annotation.id.slice(0, 8)}`)} L${annotation.anchor.line}`);
      console.log(`  ${annotation.type}: "${annotation.content.slice(0, 50)}..."`);
      console.log();
      console.log(chalk.dim('Use --force to skip this confirmation'));
      // In a real CLI you'd prompt for confirmation
      // For now, require --force flag
      process.exit(1);
    }

    await deleteAnnotation(filePath, annotation.id);

    console.log(chalk.green('Annotation deleted'));
    console.log(chalk.dim(`  #${annotation.id.slice(0, 8)}`));
  });

// ============================================
// sync - Sync annotations after file changes
// ============================================
export const syncCommand = new Command('sync')
  .description('Sync annotation positions after file changes')
  .argument('<file>', 'File to sync annotations for')
  .option('--dry-run', 'Show what would change without saving')
  .action(async (file: string, options: { dryRun: boolean }) => {
    const filePath = resolve(file);
    const annotationFile = await readAnnotationFile(filePath);

    if (!annotationFile) {
      console.log(chalk.dim('No annotations to sync'));
      return;
    }

    // Read current file content
    const content = await readFile(filePath, 'utf-8');

    // Sync annotations
    const { synced, orphaned } = syncAnnotations(
      annotationFile.annotations,
      content
    );

    // Report results
    console.log();
    console.log(chalk.bold('  Annotation Sync'));
    console.log();

    // Relocated annotations
    const relocated = synced.filter(
      (s, i) => s.anchor.line !== annotationFile.annotations[i]?.anchor.line
    );

    if (relocated.length > 0) {
      console.log(`  ${chalk.green('Relocated:')} ${relocated.length} annotation(s)`);
      for (const ann of relocated) {
        const original = annotationFile.annotations.find((a) => a.id === ann.id);
        if (original) {
          console.log(
            chalk.dim(`    #${ann.id.slice(0, 8)}: L${original.anchor.line} → L${ann.anchor.line}`)
          );
        }
      }
    } else {
      console.log(chalk.dim('  No annotations needed relocation'));
    }

    // Orphaned annotations
    if (orphaned.length > 0) {
      console.log();
      console.log(`  ${chalk.yellow('Orphaned:')} ${orphaned.length} annotation(s)`);
      console.log(chalk.dim('  (Could not find matching content in file)'));
      for (const ann of orphaned) {
        console.log(chalk.yellow(`    #${ann.id.slice(0, 8)}: "${ann.content.slice(0, 40)}..."`));
      }
    }

    // Save if not dry run
    if (!options.dryRun && (relocated.length > 0 || orphaned.length > 0)) {
      // Update the annotation file with synced positions
      // Keep orphaned ones but they'll have stale positions
      const { writeAnnotationFile } = await import('../../core/annotations.js');
      annotationFile.annotations = [...synced, ...orphaned];
      await writeAnnotationFile(filePath, annotationFile);
      console.log();
      console.log(chalk.green('  Changes saved'));
    } else if (options.dryRun) {
      console.log();
      console.log(chalk.dim('  Dry run - no changes saved'));
    }

    console.log();
  });
