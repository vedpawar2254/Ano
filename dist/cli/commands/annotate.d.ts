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
export declare const annotateCommand: Command;
