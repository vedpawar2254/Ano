#!/usr/bin/env npx tsx
/**
 * MCP Example 3: Different Return Formats
 *
 * Shows all the ways tools can return data to Claude.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'return-formats-example',
  version: '1.0.0',
});

// ============================================
// Return Format 1: Simple Text
// ============================================
server.tool(
  'simple_text',
  'Returns plain text',
  {},
  async () => ({
    content: [
      {
        type: 'text' as const,
        text: 'This is a simple text response.',
      },
    ],
  })
);

// ============================================
// Return Format 2: JSON Data
// ============================================
server.tool(
  'json_data',
  'Returns structured JSON data',
  {},
  async () => {
    const data = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
      total: 2,
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(data, null, 2),  // Pretty print for Claude
        },
      ],
    };
  }
);

// ============================================
// Return Format 3: Multiple Content Blocks
// ============================================
server.tool(
  'multi_content',
  'Returns multiple content blocks',
  {},
  async () => ({
    content: [
      {
        type: 'text' as const,
        text: '## Summary\nHere is the data:',
      },
      {
        type: 'text' as const,
        text: '```json\n{"key": "value"}\n```',
      },
      {
        type: 'text' as const,
        text: 'End of response.',
      },
    ],
  })
);

// ============================================
// Return Format 4: Image (Base64)
// ============================================
server.tool(
  'image_example',
  'Returns an image',
  {},
  async () => {
    // This would be real base64 image data
    const fakeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    return {
      content: [
        {
          type: 'image' as const,
          data: fakeBase64,
          mimeType: 'image/png',
        },
      ],
    };
  }
);

// ============================================
// Return Format 5: Error Response
// ============================================
server.tool(
  'error_example',
  'Shows how to return an error',
  {
    shouldFail: z.boolean().describe('If true, returns an error'),
  },
  async ({ shouldFail }) => {
    if (shouldFail) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Something went wrong: File not found',
          },
        ],
        isError: true,  // Marks this as an error
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: 'Success!',
        },
      ],
    };
  }
);

// ============================================
// Return Format 6: Embedded Resource
// ============================================
server.tool(
  'with_resource',
  'Returns data with an embedded resource reference',
  {},
  async () => ({
    content: [
      {
        type: 'text' as const,
        text: 'Here is the file content:',
      },
      {
        type: 'resource' as const,
        resource: {
          uri: 'file:///path/to/file.txt',
          mimeType: 'text/plain',
          text: 'File contents here...',
        },
      },
    ],
  })
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
