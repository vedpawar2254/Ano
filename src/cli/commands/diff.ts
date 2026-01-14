/**
 * Version Diff Command
 *
 * Compare annotations between two versions of a file.
 *
 * Usage:
 *   ano diff <file1.annotations.json> <file2.annotations.json>
 *   ano diff --git <file>   Compare against last committed version
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve, basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import type { AnnotationFile, Annotation, Approval } from '../../core/types.js';
import { getAnnotationFilePath, readAnnotationFile } from '../../core/annotations.js';

interface DiffResult {
  added: Annotation[];
  removed: Annotation[];
  resolved: Annotation[];
  reopened: Annotation[];
  modified: { old: Annotation; new: Annotation }[];
  newApprovals: Approval[];
  removedApprovals: Approval[];
}

/**
 * Compare two annotation files and return the differences
 */
function compareAnnotations(oldFile: AnnotationFile | null, newFile: AnnotationFile | null): DiffResult {
  const oldAnnotations = oldFile?.annotations || [];
  const newAnnotations = newFile?.annotations || [];
  const oldApprovals = oldFile?.approvals || [];
  const newApprovals = newFile?.approvals || [];

  const oldById = new Map(oldAnnotations.map((a) => [a.id, a]));
  const newById = new Map(newAnnotations.map((a) => [a.id, a]));

  const result: DiffResult = {
    added: [],
    removed: [],
    resolved: [],
    reopened: [],
    modified: [],
    newApprovals: [],
    removedApprovals: [],
  };

  // Find added and modified annotations
  for (const ann of newAnnotations) {
    const old = oldById.get(ann.id);
    if (!old) {
      result.added.push(ann);
    } else {
      // Check if status changed
      if (old.status === 'open' && ann.status === 'resolved') {
        result.resolved.push(ann);
      } else if (old.status === 'resolved' && ann.status === 'open') {
        result.reopened.push(ann);
      }
      // Check if content or other properties changed
      else if (
        old.content !== ann.content ||
        old.anchor.line !== ann.anchor.line ||
        old.replies.length !== ann.replies.length
      ) {
        result.modified.push({ old, new: ann });
      }
    }
  }

  // Find removed annotations
  for (const ann of oldAnnotations) {
    if (!newById.has(ann.id)) {
      result.removed.push(ann);
    }
  }

  // Compare approvals
  const oldApprovalsByAuthor = new Map(oldApprovals.map((a) => [a.author, a]));
  const newApprovalsByAuthor = new Map(newApprovals.map((a) => [a.author, a]));

  for (const approval of newApprovals) {
    const old = oldApprovalsByAuthor.get(approval.author);
    if (!old || old.status !== approval.status || old.timestamp !== approval.timestamp) {
      result.newApprovals.push(approval);
    }
  }

  for (const approval of oldApprovals) {
    if (!newApprovalsByAuthor.has(approval.author)) {
      result.removedApprovals.push(approval);
    }
  }

  return result;
}

function formatAnnotation(ann: Annotation, prefix: string = ''): string {
  const shortId = ann.id.slice(0, 8);
  return `${prefix}#${shortId} L${ann.anchor.line} ${ann.type}: "${ann.content.slice(0, 50)}${ann.content.length > 50 ? '...' : ''}"`;
}

export const diffCommand = new Command('diff')
  .description('Compare annotations between versions')
  .argument('[file1]', 'First annotation file (older version)')
  .argument('[file2]', 'Second annotation file (newer version)')
  .option('--git', 'Compare current annotations against last committed version')
  .option('--stats', 'Show statistics only')
  .action(async (file1: string | undefined, file2: string | undefined, options: { git: boolean; stats: boolean }) => {
    let oldFile: AnnotationFile | null = null;
    let newFile: AnnotationFile | null = null;
    let sourceLabel1 = 'old';
    let sourceLabel2 = 'new';

    if (options.git) {
      // Compare against git HEAD
      if (!file1) {
        console.error(chalk.red('Please specify a file when using --git'));
        process.exit(1);
      }

      const filePath = resolve(file1);
      const annotationPath = filePath.endsWith('.annotations.json') ? filePath : getAnnotationFilePath(filePath);

      // Read current file
      newFile = await readAnnotationFile(filePath.replace('.annotations.json', ''));
      if (!newFile) {
        try {
          const content = await readFile(annotationPath, 'utf-8');
          newFile = JSON.parse(content) as AnnotationFile;
        } catch {
          console.log(chalk.dim('No current annotations found'));
        }
      }

      // Get from git HEAD
      try {
        const gitContent = execSync(`git show HEAD:"${annotationPath}"`, {
          encoding: 'utf-8',
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        oldFile = JSON.parse(gitContent) as AnnotationFile;
      } catch {
        // File doesn't exist in git or not a git repo
        console.log(chalk.dim('No committed annotations found'));
      }

      sourceLabel1 = 'HEAD';
      sourceLabel2 = 'working tree';
    } else {
      // Compare two files
      if (!file1 || !file2) {
        console.error(chalk.red('Please specify two annotation files to compare'));
        console.error(chalk.dim('  Usage: ano diff <old.annotations.json> <new.annotations.json>'));
        console.error(chalk.dim('  Or:    ano diff --git <file>'));
        process.exit(1);
      }

      const path1 = resolve(file1);
      const path2 = resolve(file2);

      try {
        const content1 = await readFile(path1, 'utf-8');
        oldFile = JSON.parse(content1) as AnnotationFile;
        sourceLabel1 = basename(path1);
      } catch (error) {
        console.error(chalk.red(`Failed to read ${path1}`));
        process.exit(1);
      }

      try {
        const content2 = await readFile(path2, 'utf-8');
        newFile = JSON.parse(content2) as AnnotationFile;
        sourceLabel2 = basename(path2);
      } catch (error) {
        console.error(chalk.red(`Failed to read ${path2}`));
        process.exit(1);
      }
    }

    // Compare
    const diff = compareAnnotations(oldFile, newFile);

    // Check if there are any changes
    const hasChanges =
      diff.added.length > 0 ||
      diff.removed.length > 0 ||
      diff.resolved.length > 0 ||
      diff.reopened.length > 0 ||
      diff.modified.length > 0 ||
      diff.newApprovals.length > 0 ||
      diff.removedApprovals.length > 0;

    if (!hasChanges) {
      console.log(chalk.dim('No changes between versions'));
      return;
    }

    // Print header
    console.log();
    console.log(chalk.bold('  Annotation Diff'));
    console.log(chalk.dim(`  ${sourceLabel1} → ${sourceLabel2}`));
    console.log();

    // Statistics mode
    if (options.stats) {
      console.log(`  Added:    ${chalk.green(`+${diff.added.length}`)}`);
      console.log(`  Removed:  ${chalk.red(`-${diff.removed.length}`)}`);
      console.log(`  Resolved: ${chalk.cyan(`${diff.resolved.length}`)}`);
      console.log(`  Reopened: ${chalk.yellow(`${diff.reopened.length}`)}`);
      console.log(`  Modified: ${chalk.magenta(`${diff.modified.length}`)}`);
      if (diff.newApprovals.length > 0 || diff.removedApprovals.length > 0) {
        console.log();
        console.log(`  New approvals:     ${chalk.green(`+${diff.newApprovals.length}`)}`);
        console.log(`  Removed approvals: ${chalk.red(`-${diff.removedApprovals.length}`)}`);
      }
      console.log();
      return;
    }

    // Detailed output
    if (diff.added.length > 0) {
      console.log(chalk.green.bold(`  + Added (${diff.added.length})`));
      for (const ann of diff.added) {
        console.log(chalk.green(formatAnnotation(ann, '    ')));
      }
      console.log();
    }

    if (diff.removed.length > 0) {
      console.log(chalk.red.bold(`  - Removed (${diff.removed.length})`));
      for (const ann of diff.removed) {
        console.log(chalk.red(formatAnnotation(ann, '    ')));
      }
      console.log();
    }

    if (diff.resolved.length > 0) {
      console.log(chalk.cyan.bold(`  ✓ Resolved (${diff.resolved.length})`));
      for (const ann of diff.resolved) {
        console.log(chalk.cyan(formatAnnotation(ann, '    ')));
      }
      console.log();
    }

    if (diff.reopened.length > 0) {
      console.log(chalk.yellow.bold(`  ↺ Reopened (${diff.reopened.length})`));
      for (const ann of diff.reopened) {
        console.log(chalk.yellow(formatAnnotation(ann, '    ')));
      }
      console.log();
    }

    if (diff.modified.length > 0) {
      console.log(chalk.magenta.bold(`  ~ Modified (${diff.modified.length})`));
      for (const { old, new: newAnn } of diff.modified) {
        console.log(chalk.dim(`    #${old.id.slice(0, 8)}`));
        if (old.anchor.line !== newAnn.anchor.line) {
          console.log(chalk.dim(`      Line: ${old.anchor.line} → ${newAnn.anchor.line}`));
        }
        if (old.content !== newAnn.content) {
          console.log(chalk.dim(`      Content changed`));
        }
        if (old.replies.length !== newAnn.replies.length) {
          console.log(chalk.dim(`      Replies: ${old.replies.length} → ${newAnn.replies.length}`));
        }
      }
      console.log();
    }

    if (diff.newApprovals.length > 0) {
      console.log(chalk.green.bold(`  + New Approvals (${diff.newApprovals.length})`));
      for (const approval of diff.newApprovals) {
        const status = approval.status === 'approved' ? chalk.green('approved') : chalk.yellow('changes_requested');
        console.log(`    ${approval.author.split('<')[0].trim()}: ${status}`);
      }
      console.log();
    }

    if (diff.removedApprovals.length > 0) {
      console.log(chalk.red.bold(`  - Removed Approvals (${diff.removedApprovals.length})`));
      for (const approval of diff.removedApprovals) {
        console.log(chalk.red(`    ${approval.author.split('<')[0].trim()}`));
      }
      console.log();
    }
  });
