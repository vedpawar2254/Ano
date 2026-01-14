/**
 * Annotation management commands
 *
 * Additional commands for managing annotations.
 *
 * Usage:
 *   ano reply <file> <id> "message"   Add a threaded reply
 *   ano delete <file> <id>            Delete an annotation
 *   ano sync <file>                   Sync annotations after file changes
 *   ano export <file> [output]        Export annotations to JSON
 *   ano import <file> <source>        Import annotations from JSON
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve, basename } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import {
  readAnnotationFile,
  writeAnnotationFile,
  getOrCreateAnnotationFile,
  addReply,
  deleteAnnotation,
  getAnnotationFilePath,
} from '../../core/annotations.js';
import { syncAnnotations } from '../../core/anchoring.js';
import { getAuthorString } from '../../core/config.js';
import type { AnnotationFile, Annotation, Approval } from '../../core/types.js';

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

// ============================================
// export - Export annotations to file
// ============================================
export const exportCommand = new Command('export')
  .description('Export annotations to a JSON file')
  .argument('<file>', 'Source file with annotations')
  .argument('[output]', 'Output file path (default: stdout)')
  .option('--pretty', 'Pretty-print JSON output', true)
  .action(async (file: string, output: string | undefined, options: { pretty: boolean }) => {
    const filePath = resolve(file);
    const annotationFile = await readAnnotationFile(filePath);

    if (!annotationFile) {
      console.error(chalk.red('No annotations found for this file'));
      process.exit(1);
    }

    // Create export object (same as annotation file but portable)
    const exportData = {
      exportedAt: new Date().toISOString(),
      sourceFile: basename(filePath),
      ...annotationFile,
    };

    const json = options.pretty
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData);

    if (output) {
      const outputPath = resolve(output);
      await writeFile(outputPath, json, 'utf-8');
      console.log(chalk.green(`Exported ${annotationFile.annotations.length} annotation(s) to ${outputPath}`));
    } else {
      console.log(json);
    }
  });

// ============================================
// import - Import annotations from file
// ============================================
export const importCommand = new Command('import')
  .description('Import annotations from a JSON file')
  .argument('<file>', 'Target file to attach annotations to')
  .argument('<source>', 'Source JSON file to import from')
  .option('--merge', 'Merge with existing annotations (default: replace)', false)
  .option('--dry-run', 'Show what would be imported without saving')
  .action(async (file: string, source: string, options: { merge: boolean; dryRun: boolean }) => {
    const filePath = resolve(file);
    const sourcePath = resolve(source);

    // Read import data
    let importData: AnnotationFile;
    try {
      const content = await readFile(sourcePath, 'utf-8');
      importData = JSON.parse(content) as AnnotationFile;
    } catch (error) {
      console.error(chalk.red(`Failed to read import file: ${sourcePath}`));
      if (error instanceof SyntaxError) {
        console.error(chalk.dim('  Invalid JSON format'));
      }
      process.exit(1);
    }

    // Validate import data
    if (!importData.annotations || !Array.isArray(importData.annotations)) {
      console.error(chalk.red('Invalid annotation file format'));
      console.error(chalk.dim('  Missing or invalid "annotations" array'));
      process.exit(1);
    }

    // Get or create target annotation file
    const targetFile = options.merge
      ? await getOrCreateAnnotationFile(filePath)
      : await getOrCreateAnnotationFile(filePath);

    // Count what we're importing
    const newAnnotations = importData.annotations.length;
    const newApprovals = importData.approvals?.length || 0;
    const existingAnnotations = targetFile.annotations.length;
    const existingApprovals = targetFile.approvals.length;

    console.log();
    console.log(chalk.bold('  Annotation Import'));
    console.log();
    console.log(`  Source: ${chalk.cyan(basename(sourcePath))}`);
    console.log(`  Target: ${chalk.cyan(basename(filePath))}`);
    console.log();

    if (options.merge) {
      console.log(`  Mode: ${chalk.yellow('merge')}`);
      console.log(`  Existing: ${existingAnnotations} annotation(s), ${existingApprovals} approval(s)`);
    } else {
      console.log(`  Mode: ${chalk.yellow('replace')}`);
      if (existingAnnotations > 0 || existingApprovals > 0) {
        console.log(chalk.dim(`  Will replace ${existingAnnotations} annotation(s) and ${existingApprovals} approval(s)`));
      }
    }

    console.log(`  Importing: ${newAnnotations} annotation(s), ${newApprovals} approval(s)`);
    console.log();

    if (options.dryRun) {
      console.log(chalk.dim('  Dry run - no changes saved'));
      console.log();

      // Show preview of annotations
      if (newAnnotations > 0) {
        console.log('  Annotations to import:');
        for (const ann of importData.annotations.slice(0, 5)) {
          console.log(`    ${chalk.dim(`#${ann.id.slice(0, 8)}`)} L${ann.anchor.line} ${ann.type}: "${ann.content.slice(0, 40)}..."`);
        }
        if (newAnnotations > 5) {
          console.log(chalk.dim(`    ... and ${newAnnotations - 5} more`));
        }
        console.log();
      }
      return;
    }

    // Perform import
    if (options.merge) {
      // Merge: add new annotations, skip duplicates by ID
      const existingIds = new Set(targetFile.annotations.map((a) => a.id));
      const toAdd = importData.annotations.filter((a) => !existingIds.has(a.id));

      targetFile.annotations.push(...toAdd);

      // Merge approvals by author (newer wins)
      for (const approval of importData.approvals || []) {
        const existingIndex = targetFile.approvals.findIndex((a) => a.author === approval.author);
        if (existingIndex >= 0) {
          // Check which is newer
          const existingDate = new Date(targetFile.approvals[existingIndex].timestamp);
          const importDate = new Date(approval.timestamp);
          if (importDate > existingDate) {
            targetFile.approvals[existingIndex] = approval;
          }
        } else {
          targetFile.approvals.push(approval);
        }
      }

      console.log(chalk.green(`  Added ${toAdd.length} new annotation(s)`));
      if (newAnnotations - toAdd.length > 0) {
        console.log(chalk.dim(`  Skipped ${newAnnotations - toAdd.length} duplicate(s)`));
      }
    } else {
      // Replace: overwrite everything
      targetFile.annotations = importData.annotations;
      targetFile.approvals = importData.approvals || [];
      console.log(chalk.green(`  Imported ${newAnnotations} annotation(s) and ${newApprovals} approval(s)`));
    }

    // Save
    await writeAnnotationFile(filePath, targetFile);
    console.log(chalk.green('  Changes saved'));
    console.log();
  });
