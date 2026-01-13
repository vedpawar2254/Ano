#!/usr/bin/env node
/**
 * Ano CLI
 *
 * Command-line interface for managing annotations.
 *
 * Usage:
 *   ano annotate <file>:<line> "comment"   Add an annotation
 *   ano list [file]                        List annotations
 *   ano resolve <id>                       Mark as resolved
 *   ano approve <file>                     Approve a file
 */

import { Command } from 'commander';
import { annotateCommand } from './commands/annotate.js';
import { listCommand } from './commands/list.js';
import { resolveCommand } from './commands/resolve.js';
import { approveCommand } from './commands/approve.js';
import { checkCommand } from './commands/check.js';
import {
  lgtmCommand,
  shipitCommand,
  nitCommand,
  blockCommand,
  questionCommand,
} from './commands/quick.js';

// Create the main program
const program = new Command();

program
  .name('ano')
  .description('Collaborative annotation and review for Claude Code')
  .version('0.1.0');

// Register subcommands
program.addCommand(annotateCommand);
program.addCommand(listCommand);
program.addCommand(resolveCommand);
program.addCommand(approveCommand);
program.addCommand(checkCommand);

// Quick annotation shortcuts
program.addCommand(lgtmCommand);
program.addCommand(shipitCommand);
program.addCommand(nitCommand);
program.addCommand(blockCommand);
program.addCommand(questionCommand);

// Parse arguments and run
program.parse();
