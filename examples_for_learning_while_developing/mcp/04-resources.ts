#!/usr/bin/env npx tsx
/**
 * MCP Example 4: Resources
 *
 * Resources expose read-only data to Claude.
 * Unlike tools, resources are for data Claude reads, not actions it takes.
 *
 * Use cases:
 *   - Config files
 *   - Database schemas
 *   - Documentation
 *   - API specs
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: 'resources-example',
  version: '1.0.0',
});

// ============================================
// Static Resource
// ============================================

// A static resource with fixed content
server.resource(
  'config://app/settings',              // URI (unique identifier)
  'Application configuration settings', // Description
  async () => ({
    contents: [
      {
        uri: 'config://app/settings',
        mimeType: 'application/json',
        text: JSON.stringify({
          theme: 'dark',
          language: 'en',
          apiVersion: '2.0',
        }, null, 2),
      },
    ],
  })
);

// ============================================
// Dynamic Resource
// ============================================

// A resource that reads current state
server.resource(
  'status://server/health',
  'Current server health status',
  async () => ({
    contents: [
      {
        uri: 'status://server/health',
        mimeType: 'application/json',
        text: JSON.stringify({
          status: 'healthy',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage().heapUsed,
          timestamp: new Date().toISOString(),
        }, null, 2),
      },
    ],
  })
);

// ============================================
// Resource Template (Dynamic URIs)
// ============================================

// Users database simulation
const users: Record<string, { name: string; email: string }> = {
  '1': { name: 'Alice', email: 'alice@example.com' },
  '2': { name: 'Bob', email: 'bob@example.com' },
  '3': { name: 'Charlie', email: 'charlie@example.com' },
};

// Resource template - one resource pattern, multiple instances
server.resource(
  'users://db/{userId}',  // {userId} is a template variable
  'Get user by ID',
  async (uri) => {
    // Parse the user ID from the URI
    const match = uri.href.match(/users:\/\/db\/(\w+)/);
    const userId = match?.[1];

    if (!userId || !users[userId]) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({ error: 'User not found' }),
          },
        ],
      };
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(users[userId], null, 2),
        },
      ],
    };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
