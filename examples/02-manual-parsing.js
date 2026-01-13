#!/usr/bin/env node
/**
 * Example 2: Manual argument parsing
 *
 * Run: node examples/02-manual-parsing.js greet --name ved --loud
 */

// Get just the user's arguments (skip node and script path)
const args = process.argv.slice(2);

// Parse into command, options, and flags
let command = null;
const options = {};
const flags = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg.startsWith('--')) {
    // It's an option like --name or a flag like --loud
    const key = arg.slice(2); // Remove '--'
    const nextArg = args[i + 1];

    // Check if next arg is a value or another flag
    if (nextArg && !nextArg.startsWith('--')) {
      options[key] = nextArg;
      i++; // Skip the value in next iteration
    } else {
      flags.push(key); // It's a boolean flag
    }
  } else if (!command) {
    command = arg; // First non-flag arg is the command
  }
}

console.log('Parsed result:');
console.log('  Command:', command);
console.log('  Options:', options);
console.log('  Flags:', flags);

// Now use the parsed data
console.log('\n--- Executing ---');
if (command === 'greet') {
  const name = options.name || 'stranger';
  const message = `Hello, ${name}!`;

  if (flags.includes('loud')) {
    console.log(message.toUpperCase());
  } else {
    console.log(message);
  }
} else {
  console.log('Unknown command:', command);
}
