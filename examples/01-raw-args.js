#!/usr/bin/env node
/**
 * Example 1: Raw process.argv
 *
 * Run: node examples/01-raw-args.js hello --name ved
 */

console.log('Raw process.argv:');
console.log(process.argv);

console.log('\n--- Breakdown ---');
console.log('Node path:', process.argv[0]);
console.log('Script path:', process.argv[1]);
console.log('Your arguments:', process.argv.slice(2));
