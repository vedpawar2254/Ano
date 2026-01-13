#!/usr/bin/env node
/**
 * MCP Example 1: Raw JSON-RPC
 *
 * This shows the raw protocol WITHOUT the SDK.
 * This is what happens under the hood.
 *
 * Run: echo '{"jsonrpc":"2.0","id":1,"method":"ping"}' | node examples/mcp/01-raw-jsonrpc.js
 */

import * as readline from 'readline';

// Read from stdin line by line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  try {
    // Parse the JSON-RPC request
    const request = JSON.parse(line);

    console.error('[SERVER] Received:', JSON.stringify(request));

    // Handle different methods
    let result;

    switch (request.method) {
      case 'ping':
        result = { pong: true, timestamp: Date.now() };
        break;

      case 'add':
        const { a, b } = request.params || {};
        result = { sum: a + b };
        break;

      case 'greet':
        const { name } = request.params || {};
        result = { message: `Hello, ${name || 'stranger'}!` };
        break;

      default:
        // JSON-RPC error response
        const errorResponse = {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`
          }
        };
        console.log(JSON.stringify(errorResponse));
        return;
    }

    // JSON-RPC success response
    const response = {
      jsonrpc: '2.0',
      id: request.id,
      result: result
    };

    console.log(JSON.stringify(response));

  } catch (error) {
    // JSON-RPC parse error
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error'
      }
    };
    console.log(JSON.stringify(errorResponse));
  }
});

console.error('[SERVER] Raw JSON-RPC server started. Waiting for input...');
