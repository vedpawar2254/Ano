#!/usr/bin/env node
/**
 * Ano MCP Server
 *
 * Exposes annotation tools to Claude Code via MCP protocol.
 *
 * Tools:
 *   - read_annotations: Get annotations for a file
 *   - add_annotation: Add a new annotation
 *   - resolve_annotation: Mark annotation as resolved
 *   - list_approvals: Get approvals for a file
 *   - approve_file: Add approval to a file
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { resolve } from 'node:path';

import {
  listAnnotations,
  addAnnotation,
  resolveAnnotation,
  getApprovals,
  setApproval,
  readAnnotationFile,
} from '../core/annotations.js';
import { getAuthorString } from '../core/config.js';
import type { AnnotationType, ApprovalStatus } from '../core/types.js';

// ============================================
// Create MCP Server
// ============================================

const server = new McpServer({
  name: 'ano',
  version: '0.1.0',
});

// ============================================
// Tool: read_annotations
// ============================================

server.tool(
  'read_annotations',
  'Get all annotations for a file. Returns annotations with their line numbers, types, authors, and content.',
  {
    file: z.string().describe('Path to the file to read annotations from'),
    status: z.enum(['open', 'resolved', 'all']).optional().describe('Filter by status (default: all)'),
  },
  async ({ file, status }) => {
    try {
      const filePath = resolve(file);

      // Build filter
      const filter: { status?: 'open' | 'resolved' } = {};
      if (status && status !== 'all') {
        filter.status = status;
      }

      const annotations = await listAnnotations(filePath, filter);
      const approvals = await getApprovals(filePath);

      // Format for Claude
      const summary = {
        file: filePath,
        totalAnnotations: annotations.length,
        openCount: annotations.filter(a => a.status === 'open').length,
        resolvedCount: annotations.filter(a => a.status === 'resolved').length,
        approvalCount: approvals.filter(a => a.status === 'approved').length,
        annotations: annotations.map(a => ({
          id: a.id,
          line: a.anchor.line,
          endLine: a.anchor.endLine,
          type: a.type,
          author: a.author,
          content: a.content,
          status: a.status,
          replies: a.replies,
        })),
        approvals: approvals,
      };

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error reading annotations: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// Tool: add_annotation
// ============================================

server.tool(
  'add_annotation',
  'Add a new annotation to a specific line in a file. Use this to add feedback, questions, or concerns about code or plans.',
  {
    file: z.string().describe('Path to the file to annotate'),
    line: z.number().describe('Line number to annotate (1-indexed)'),
    content: z.string().describe('The annotation content/comment'),
    type: z.enum(['concern', 'question', 'suggestion', 'blocker']).optional()
      .describe('Type of annotation: concern (risk/issue), question (needs clarification), suggestion (improvement idea), blocker (must resolve)'),
  },
  async ({ file, line, content, type }) => {
    try {
      const filePath = resolve(file);
      const author = await getAuthorString();

      const annotation = await addAnnotation({
        file: filePath,
        line,
        type: (type || 'suggestion') as AnnotationType,
        author: `Claude (via ${author})`,
        content,
      });

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              message: 'Annotation added successfully',
              annotation: {
                id: annotation.id,
                line: annotation.anchor.line,
                type: annotation.type,
                content: annotation.content,
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error adding annotation: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// Tool: resolve_annotation
// ============================================

server.tool(
  'resolve_annotation',
  'Mark an annotation as resolved. Use this after addressing feedback or answering a question.',
  {
    file: z.string().describe('Path to the file containing the annotation'),
    annotationId: z.string().describe('The annotation ID (can be partial, e.g., first 8 characters)'),
  },
  async ({ file, annotationId }) => {
    try {
      const filePath = resolve(file);

      // Find full ID from partial
      const annotationFile = await readAnnotationFile(filePath);
      if (!annotationFile) {
        throw new Error('No annotations found for this file');
      }

      const annotation = annotationFile.annotations.find(
        a => a.id.startsWith(annotationId) || a.id === annotationId
      );

      if (!annotation) {
        throw new Error(`Annotation not found: ${annotationId}`);
      }

      const success = await resolveAnnotation(filePath, annotation.id);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success,
              message: success ? 'Annotation resolved' : 'Failed to resolve annotation',
              annotation: {
                id: annotation.id,
                line: annotation.anchor.line,
                content: annotation.content,
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error resolving annotation: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// Tool: approve_file
// ============================================

server.tool(
  'approve_file',
  'Add an approval to a file. Use this to sign off on a plan or document.',
  {
    file: z.string().describe('Path to the file to approve'),
    status: z.enum(['approved', 'changes_requested']).optional()
      .describe('Approval status (default: approved)'),
    comment: z.string().optional().describe('Optional comment with the approval'),
  },
  async ({ file, status, comment }) => {
    try {
      const filePath = resolve(file);
      const author = await getAuthorString();

      const approval = await setApproval(
        filePath,
        `Claude (via ${author})`,
        (status || 'approved') as ApprovalStatus,
        'AI Assistant',
        comment
      );

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              message: `File ${status || 'approved'}`,
              approval,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error approving file: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// Start Server
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Ano MCP server running...');
}

main().catch(console.error);
