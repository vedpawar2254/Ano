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
export declare const listCommand: Command;
