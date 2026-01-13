#!/usr/bin/env npx tsx
/**
 * MCP Syntax Explained - Every Line Annotated
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// ============================================
// STEP 1: Create the server
// ============================================

const server = new McpServer({
  name: 'syntax-example',    // Server identifier (for logs/debugging)
  version: '1.0.0',          // Your server version
});

// ============================================
// STEP 2: Define a tool
// ============================================

server.tool(
  // ────────────────────────────────────────
  // ARGUMENT 1: Tool Name (string)
  // ────────────────────────────────────────
  // This is what Claude uses to call the tool
  // Must be unique, use snake_case
  'calculate_tip',

  // ────────────────────────────────────────
  // ARGUMENT 2: Description (string)
  // ────────────────────────────────────────
  // Claude reads this to decide WHEN to use the tool
  // Be specific! Good descriptions = better tool selection
  'Calculate tip amount for a restaurant bill. Returns tip and total.',

  // ────────────────────────────────────────
  // ARGUMENT 3: Parameters Schema (Zod object)
  // ────────────────────────────────────────
  // Defines what inputs the tool accepts
  // Gets converted to JSON Schema for the client
  {
    // Required parameter: bill amount
    billAmount: z
      .number()                              // Must be a number
      .positive()                            // Must be > 0
      .describe('The bill amount in dollars'), // Description for Claude

    // Required parameter: tip percentage
    tipPercent: z
      .number()                              // Must be a number
      .min(0)                                // Can't be negative
      .max(100)                              // Can't exceed 100%
      .describe('Tip percentage (e.g., 15, 18, 20)'),

    // Optional parameter: round up
    roundUp: z
      .boolean()                             // Must be true/false
      .optional()                            // Not required
      .describe('Round tip up to nearest dollar'),
  },

  // ────────────────────────────────────────
  // ARGUMENT 4: Handler Function (async)
  // ────────────────────────────────────────
  // This runs when Claude calls the tool
  // Receives the validated parameters as first argument
  async ({ billAmount, tipPercent, roundUp }) => {
    // ↑ Destructure parameters (TypeScript knows the types!)

    // Your logic here
    let tip = billAmount * (tipPercent / 100);

    if (roundUp) {
      tip = Math.ceil(tip);
    }

    const total = billAmount + tip;

    // ────────────────────────────────────────
    // RETURN FORMAT: Must match MCP spec
    // ────────────────────────────────────────
    return {
      // 'content' is an array of content blocks
      content: [
        {
          type: 'text' as const,  // Content type (text, image, resource)
          text: JSON.stringify({  // The actual content
            billAmount,
            tipPercent,
            tip: tip.toFixed(2),
            total: total.toFixed(2),
          }, null, 2),
        },
      ],
      // Optional: isError: true if something went wrong
    };
  }
);

// ============================================
// STEP 3: Another tool with different patterns
// ============================================

server.tool(
  'search_items',
  'Search for items by name or category',
  {
    // String with enum (limited choices)
    category: z
      .enum(['electronics', 'clothing', 'food', 'books'])
      .describe('Category to search in'),

    // Optional string
    query: z
      .string()
      .optional()
      .describe('Search query'),

    // Array of strings
    tags: z
      .array(z.string())
      .optional()
      .describe('Filter by tags'),

    // Number with default (via .default())
    limit: z
      .number()
      .int()                    // Must be integer
      .min(1)
      .max(100)
      .optional()
      .describe('Max results (default: 10)'),
  },
  async ({ category, query, tags, limit = 10 }) => {
    // Simulated search
    const results = [
      { id: 1, name: 'Item 1', category },
      { id: 2, name: 'Item 2', category },
    ];

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ results, count: results.length }, null, 2),
      }],
    };
  }
);

// ============================================
// STEP 4: Tool with error handling
// ============================================

server.tool(
  'divide_numbers',
  'Divide two numbers',
  {
    numerator: z.number().describe('Number to divide'),
    denominator: z.number().describe('Number to divide by'),
  },
  async ({ numerator, denominator }) => {
    // Handle error case
    if (denominator === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: 'Error: Cannot divide by zero',
        }],
        isError: true,  // ← Marks response as error
      };
    }

    const result = numerator / denominator;

    return {
      content: [{
        type: 'text' as const,
        text: `${numerator} ÷ ${denominator} = ${result}`,
      }],
    };
  }
);

// ============================================
// STEP 5: Connect and start
// ============================================

async function main() {
  // Create transport (stdio = read stdin, write stdout)
  const transport = new StdioServerTransport();

  // Connect server to transport
  // This starts listening for JSON-RPC messages
  await server.connect(transport);

  // Log to stderr (NOT stdout - that's for JSON-RPC!)
  console.error('Server started and ready');
}

// Run the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
