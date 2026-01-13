#!/usr/bin/env npx tsx
/**
 * MCP Example 2: Minimal MCP Server
 *
 * The simplest possible MCP server with one tool.
 *
 * Test with:
 *   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx tsx examples/mcp/02-minimal-server.ts 2>/dev/null
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Step 1: Create the server
const server = new McpServer({
  name: 'minimal-example',
  version: '1.0.0',
});

// Step 2: Add a tool
server.tool(
  'greet',                                    // Tool name
  'Greet someone by name',                    // Description (helps Claude decide when to use it)
  {
    name: z.string().describe('The name to greet'),
    excited: z.boolean().optional().describe('Add excitement'),
  },
  async ({ name, excited }) => {
    // This is the handler - runs when Claude calls the tool
    let message = `Hello, ${name}!`;
    if (excited) {
      message = message.toUpperCase() + '!!!';
    }

    // Return format is specific to MCP
    return {
      content: [
        {
          type: 'text' as const,
          text: message,
        },
      ],
    };
  }
);

// Step 3: Connect transport and start
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Minimal MCP server running...');
}

main().catch(console.error);
