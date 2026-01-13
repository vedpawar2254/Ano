#!/usr/bin/env npx tsx
/**
 * MCP Example 6: Error Handling & Debugging
 *
 * Best practices for handling errors in MCP servers.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'error-handling-example',
  version: '1.0.0',
});

// ============================================
// Logging (use stderr, not stdout!)
// ============================================

function log(message: string, data?: unknown) {
  // IMPORTANT: Always use console.error for logging!
  // stdout is reserved for JSON-RPC messages
  console.error(`[${new Date().toISOString()}] ${message}`, data ? JSON.stringify(data) : '');
}

// ============================================
// Graceful Error Handling
// ============================================

server.tool(
  'divide',
  'Divide two numbers',
  {
    a: z.number().describe('Numerator'),
    b: z.number().describe('Denominator'),
  },
  async ({ a, b }) => {
    log('divide called', { a, b });

    // Validate input
    if (b === 0) {
      log('Error: Division by zero attempted');

      // Return error gracefully (don't throw!)
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: Cannot divide by zero',
          },
        ],
        isError: true,
      };
    }

    const result = a / b;
    log('divide result', { result });

    return {
      content: [
        {
          type: 'text' as const,
          text: `${a} / ${b} = ${result}`,
        },
      ],
    };
  }
);

// ============================================
// Try-Catch Pattern
// ============================================

server.tool(
  'read_file',
  'Read a file from disk',
  {
    path: z.string().describe('File path'),
  },
  async ({ path }) => {
    log('read_file called', { path });

    try {
      // Simulated file read (would be real fs.readFile)
      const fs = await import('node:fs/promises');
      const content = await fs.readFile(path, 'utf-8');

      log('File read successfully', { path, size: content.length });

      return {
        content: [
          {
            type: 'text' as const,
            text: content,
          },
        ],
      };

    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      log('File read failed', { path, error: err.message, code: err.code });

      // Provide helpful error message
      let message = `Failed to read file: ${path}\n`;

      if (err.code === 'ENOENT') {
        message += 'File does not exist.';
      } else if (err.code === 'EACCES') {
        message += 'Permission denied.';
      } else {
        message += `Error: ${err.message}`;
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: message,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// Timeout Handling
// ============================================

server.tool(
  'slow_operation',
  'An operation that might take a while',
  {
    duration: z.number().describe('How long to wait (ms)'),
  },
  async ({ duration }) => {
    log('slow_operation started', { duration });

    const TIMEOUT = 5000; // 5 second timeout

    if (duration > TIMEOUT) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: Requested duration ${duration}ms exceeds maximum allowed ${TIMEOUT}ms`,
          },
        ],
        isError: true,
      };
    }

    // Simulate slow operation with timeout
    await new Promise((resolve) => setTimeout(resolve, Math.min(duration, TIMEOUT)));

    log('slow_operation completed', { duration });

    return {
      content: [
        {
          type: 'text' as const,
          text: `Operation completed after ${duration}ms`,
        },
      ],
    };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('Server started');
}

main().catch((error) => {
  log('Fatal error', { error: error.message });
  process.exit(1);
});
