#!/usr/bin/env node
/**
 * Example 3: Basic Commander.js
 *
 * Run: node examples/03-commander-basic.js greet --name ved --loud
 * Run: node examples/03-commander-basic.js --help
 */

import { Command } from 'commander';

// Create the program
const program = new Command();

program
  .name('myapp')
  .description('A simple CLI example')
  .version('1.0.0');

// Add the "greet" command
program
  .command('greet')                              // Command name
  .description('Greet someone')                  // Shows in --help
  .option('-n, --name <name>', 'Name to greet', 'stranger')  // Option with default
  .option('-l, --loud', 'Shout the greeting')    // Boolean flag
  .action((options) => {
    // This function runs when user types: myapp greet
    const message = `Hello, ${options.name}!`;

    if (options.loud) {
      console.log(message.toUpperCase());
    } else {
      console.log(message);
    }
  });

// Parse and run
program.parse();
