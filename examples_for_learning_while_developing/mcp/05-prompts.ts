#!/usr/bin/env npx tsx
/**
 * MCP Example 5: Prompts
 *
 * Prompts are pre-written templates that users can invoke.
 * Think of them as "macros" or "shortcuts" for common tasks.
 *
 * Users can invoke: /prompt:code-review or similar
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'prompts-example',
  version: '1.0.0',
});

// ============================================
// Simple Prompt
// ============================================

server.prompt(
  'explain-code',
  'Explain what code does in simple terms',
  async () => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'Please explain the following code in simple terms that a beginner could understand. Focus on what it does, not how it works technically.',
        },
      },
    ],
  })
);

// ============================================
// Prompt with Arguments
// ============================================

server.prompt(
  'code-review',
  'Review code for issues and improvements',
  {
    language: z.string().optional().describe('Programming language'),
    focus: z.enum(['security', 'performance', 'readability', 'all']).optional()
      .describe('What to focus on'),
  },
  async ({ language, focus }) => {
    let focusText = '';
    switch (focus) {
      case 'security':
        focusText = 'Focus specifically on security vulnerabilities and best practices.';
        break;
      case 'performance':
        focusText = 'Focus specifically on performance optimizations and efficiency.';
        break;
      case 'readability':
        focusText = 'Focus specifically on code readability and maintainability.';
        break;
      default:
        focusText = 'Review all aspects: security, performance, and readability.';
    }

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please review the following ${language || ''} code.

${focusText}

Provide:
1. A summary of what the code does
2. Issues found (if any)
3. Specific suggestions for improvement
4. Code examples for fixes where applicable`,
          },
        },
      ],
    };
  }
);

// ============================================
// Multi-turn Prompt
// ============================================

server.prompt(
  'debug-assistant',
  'Help debug an issue step by step',
  {
    errorMessage: z.string().describe('The error message you are seeing'),
  },
  async ({ errorMessage }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `I'm encountering this error:\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\nPlease help me debug this step by step.`,
        },
      },
      {
        role: 'assistant',
        content: {
          type: 'text',
          text: `I'll help you debug this error. Let me analyze it step by step.

First, let me understand the error message and identify potential causes.`,
        },
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: 'What information do you need from me to help diagnose this?',
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
