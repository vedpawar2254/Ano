/**
 * ano approve command
 *
 * Add your approval to a file.
 *
 * Usage:
 *   ano approve <file> [options]
 *
 * Examples:
 *   ano approve plan.md
 *   ano approve plan.md --title "Tech Lead"
 *   ano approve plan.md --request-changes -m "Need more tests"
 */
import { Command } from 'commander';
export declare const approveCommand: Command;
