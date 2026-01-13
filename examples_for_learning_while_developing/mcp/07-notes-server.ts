#!/usr/bin/env npx tsx
/**
 * MCP Example 7: Complete Notes Server
 *
 * A full-featured MCP server for managing notes.
 * Demonstrates tools, resources, and real-world patterns.
 *
 * To test:
 *   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx tsx examples/mcp/07-notes-server.ts 2>/dev/null | jq
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

// ============================================
// Data Types
// ============================================

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// In-Memory Storage (would be a database in production)
// ============================================

const notes = new Map<string, Note>();

// Add some sample data
notes.set('1', {
  id: '1',
  title: 'Welcome',
  content: 'Welcome to the Notes MCP Server!',
  tags: ['welcome', 'intro'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// ============================================
// Logging Utility
// ============================================

function log(message: string, data?: unknown) {
  console.error(`[Notes] ${message}`, data ? JSON.stringify(data) : '');
}

// ============================================
// Create Server
// ============================================

const server = new McpServer({
  name: 'notes-server',
  version: '1.0.0',
});

// ============================================
// Tool: List Notes
// ============================================

server.tool(
  'list_notes',
  'List all notes, optionally filtered by tag',
  {
    tag: z.string().optional().describe('Filter by tag'),
    limit: z.number().optional().describe('Maximum notes to return'),
  },
  async ({ tag, limit }) => {
    log('list_notes', { tag, limit });

    let results = Array.from(notes.values());

    // Filter by tag
    if (tag) {
      results = results.filter(note => note.tags.includes(tag));
    }

    // Apply limit
    if (limit && limit > 0) {
      results = results.slice(0, limit);
    }

    // Format output
    const output = results.map(note => ({
      id: note.id,
      title: note.title,
      tags: note.tags,
      preview: note.content.slice(0, 100) + (note.content.length > 100 ? '...' : ''),
      updatedAt: note.updatedAt,
    }));

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          count: output.length,
          notes: output,
        }, null, 2),
      }],
    };
  }
);

// ============================================
// Tool: Get Note
// ============================================

server.tool(
  'get_note',
  'Get a note by ID',
  {
    id: z.string().describe('The note ID'),
  },
  async ({ id }) => {
    log('get_note', { id });

    const note = notes.get(id);

    if (!note) {
      return {
        content: [{
          type: 'text' as const,
          text: `Note not found: ${id}`,
        }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(note, null, 2),
      }],
    };
  }
);

// ============================================
// Tool: Create Note
// ============================================

server.tool(
  'create_note',
  'Create a new note',
  {
    title: z.string().describe('Note title'),
    content: z.string().describe('Note content'),
    tags: z.array(z.string()).optional().describe('Tags for the note'),
  },
  async ({ title, content, tags }) => {
    log('create_note', { title, tags });

    const note: Note = {
      id: randomUUID(),
      title,
      content,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.set(note.id, note);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: true,
          message: 'Note created',
          note: {
            id: note.id,
            title: note.title,
          },
        }, null, 2),
      }],
    };
  }
);

// ============================================
// Tool: Update Note
// ============================================

server.tool(
  'update_note',
  'Update an existing note',
  {
    id: z.string().describe('The note ID'),
    title: z.string().optional().describe('New title'),
    content: z.string().optional().describe('New content'),
    tags: z.array(z.string()).optional().describe('New tags'),
  },
  async ({ id, title, content, tags }) => {
    log('update_note', { id, title, tags });

    const note = notes.get(id);

    if (!note) {
      return {
        content: [{
          type: 'text' as const,
          text: `Note not found: ${id}`,
        }],
        isError: true,
      };
    }

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    note.updatedAt = new Date().toISOString();

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: true,
          message: 'Note updated',
          note: {
            id: note.id,
            title: note.title,
            updatedAt: note.updatedAt,
          },
        }, null, 2),
      }],
    };
  }
);

// ============================================
// Tool: Delete Note
// ============================================

server.tool(
  'delete_note',
  'Delete a note',
  {
    id: z.string().describe('The note ID'),
  },
  async ({ id }) => {
    log('delete_note', { id });

    if (!notes.has(id)) {
      return {
        content: [{
          type: 'text' as const,
          text: `Note not found: ${id}`,
        }],
        isError: true,
      };
    }

    notes.delete(id);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: true,
          message: 'Note deleted',
          id,
        }, null, 2),
      }],
    };
  }
);

// ============================================
// Tool: Search Notes
// ============================================

server.tool(
  'search_notes',
  'Search notes by content',
  {
    query: z.string().describe('Search query'),
  },
  async ({ query }) => {
    log('search_notes', { query });

    const queryLower = query.toLowerCase();
    const results = Array.from(notes.values()).filter(note =>
      note.title.toLowerCase().includes(queryLower) ||
      note.content.toLowerCase().includes(queryLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          query,
          count: results.length,
          results: results.map(note => ({
            id: note.id,
            title: note.title,
            preview: note.content.slice(0, 100),
          })),
        }, null, 2),
      }],
    };
  }
);

// ============================================
// Resource: All Tags
// ============================================

server.resource(
  'notes://tags',
  'Get all unique tags',
  async () => {
    const allTags = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => allTags.add(tag)));

    return {
      contents: [{
        uri: 'notes://tags',
        mimeType: 'application/json',
        text: JSON.stringify({
          tags: Array.from(allTags).sort(),
          count: allTags.size,
        }, null, 2),
      }],
    };
  }
);

// ============================================
// Resource: Stats
// ============================================

server.resource(
  'notes://stats',
  'Get notes statistics',
  async () => {
    const totalNotes = notes.size;
    const allTags = new Set<string>();
    let totalContentLength = 0;

    notes.forEach(note => {
      note.tags.forEach(tag => allTags.add(tag));
      totalContentLength += note.content.length;
    });

    return {
      contents: [{
        uri: 'notes://stats',
        mimeType: 'application/json',
        text: JSON.stringify({
          totalNotes,
          uniqueTags: allTags.size,
          averageContentLength: totalNotes > 0 ? Math.round(totalContentLength / totalNotes) : 0,
        }, null, 2),
      }],
    };
  }
);

// ============================================
// Start Server
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('Server started');
}

main().catch(error => {
  log('Fatal error', { error: error.message });
  process.exit(1);
});
