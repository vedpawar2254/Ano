/**
 * ano serve command
 *
 * Start a local web server for viewing annotations.
 *
 * Usage:
 *   ano serve <file...>           Start server for one or more files
 *   ano serve <file> --port 8080  Use custom port
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve, dirname, basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { existsSync } from 'node:fs';
import { readAnnotationFile, addAnnotation, resolveAnnotation, setApproval } from '../../core/annotations.js';
import { getAuthorString } from '../../core/config.js';
import type { AnnotationType, ApprovalStatus } from '../../core/types.js';

// Simple static file server
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

// Helper to parse JSON body from request
async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

export const serveCommand = new Command('serve')
  .description('Start web viewer for annotations')
  .argument('<files...>', 'Files to view')
  .option('-p, --port <port>', 'Port to use', '3000')
  .option('--no-open', 'Don\'t open browser automatically')
  .action(async (files: string[], options: { port: string; open: boolean }) => {
    // Resolve all file paths
    const filePaths = files.map(f => resolve(f));
    const port = parseInt(options.port, 10);

    // Check all files exist
    for (const fp of filePaths) {
      if (!existsSync(fp)) {
        console.error(chalk.red(`File not found: ${fp}`));
        process.exit(1);
      }
    }

    // Track currently selected file (default to first)
    let currentFilePath = filePaths[0];

    // Find web dist directory
    const webDistPath = resolve(dirname(new URL(import.meta.url).pathname), '../../../web/dist');
    const hasWebDist = existsSync(webDistPath);

    if (!hasWebDist) {
      console.error(chalk.yellow('Web UI not built. Building now...'));
      console.error(chalk.dim('  Run: npm run build --prefix web'));
      // For now, serve a simple HTML page
    }

    // Create HTTP server
    const server = createServer(async (req, res) => {
      const reqUrl = new URL(req.url || '/', `http://localhost:${port}`);
      const url = reqUrl.pathname;

      // API endpoint to list all available files
      if (url === '/api/files' && req.method === 'GET') {
        try {
          const fileList = await Promise.all(filePaths.map(async (fp) => {
            const annotations = await readAnnotationFile(fp);
            const openCount = annotations?.annotations.filter(a => a.status === 'open').length || 0;
            return {
              path: fp,
              name: basename(fp),
              openAnnotations: openCount,
              isCurrent: fp === currentFilePath,
            };
          }));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ files: fileList }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
        return;
      }

      // API endpoint to switch current file
      if (url === '/api/switch' && req.method === 'POST') {
        try {
          const body = await parseJsonBody(req);
          const { filePath: newPath } = body as { filePath: string };

          if (!filePaths.includes(newPath)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'File not in served files list' }));
            return;
          }

          currentFilePath = newPath;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, currentFile: basename(currentFilePath) }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
        return;
      }

      // API endpoint for current file data
      if (url === '/api/current' && req.method === 'GET') {
        try {
          const content = await readFile(currentFilePath, 'utf-8');
          const annotations = await readAnnotationFile(currentFilePath);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            fileName: basename(currentFilePath),
            filePath: currentFilePath,
            content,
            annotations: annotations || {
              version: '1.0',
              file: currentFilePath,
              fileHash: '',
              annotations: [],
              approvals: [],
            },
          }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
        return;
      }

      // API endpoint to add an annotation
      if (url === '/api/annotate' && req.method === 'POST') {
        try {
          const body = await parseJsonBody(req);
          const { line, content, type, endLine } = body as { line: number; content: string; type: AnnotationType; endLine?: number };

          if (!line || !content || !type) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required fields: line, content, type' }));
            return;
          }

          const author = await getAuthorString();
          await addAnnotation({
            file: currentFilePath,
            line,
            endLine,
            type,
            author,
            content,
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
        return;
      }

      // API endpoint to resolve an annotation
      if (url === '/api/resolve' && req.method === 'POST') {
        try {
          const body = await parseJsonBody(req);
          const { annotationId } = body as { annotationId: string };

          if (!annotationId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required field: annotationId' }));
            return;
          }

          const resolved = await resolveAnnotation(currentFilePath, annotationId);
          if (!resolved) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Annotation not found' }));
            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
        return;
      }

      // API endpoint to approve/request changes
      if (url === '/api/approve' && req.method === 'POST') {
        try {
          const body = await parseJsonBody(req);
          const { status, comment } = body as { status: ApprovalStatus; comment?: string };

          if (!status || !['approved', 'changes_requested'].includes(status)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid status. Must be "approved" or "changes_requested"' }));
            return;
          }

          const author = await getAuthorString();
          await setApproval(currentFilePath, author, status, undefined, comment);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
        return;
      }

      // API endpoint to save file content
      if (url === '/api/save' && req.method === 'POST') {
        try {
          const body = await parseJsonBody(req);
          const { content } = body as { content: string };

          if (content === undefined) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required field: content' }));
            return;
          }

          // Write the updated content to the file
          const { writeFile } = await import('node:fs/promises');
          await writeFile(currentFilePath, content, 'utf-8');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
        return;
      }

      // API endpoint to share annotations via paste service
      if (url === '/api/share' && req.method === 'POST') {
        try {
          const body = await parseJsonBody(req);
          const { fileName, content, annotations } = body as {
            fileName: string;
            content: string;
            annotations: any;
          };

          // Generate standalone HTML
          const html = generateShareableHtml(fileName, content, annotations);

          // Upload to paste.rs (simple: just POST content, get URL back)
          const response = await fetch('https://paste.rs/', {
            method: 'POST',
            headers: { 'Content-Type': 'text/html' },
            body: html
          });

          if (response.ok) {
            const pasteUrl = await response.text();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ url: pasteUrl.trim() }));
          } else {
            throw new Error('Failed to create paste: ' + response.status);
          }
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
        return;
      }

      // Serve static files from web/dist
      if (hasWebDist) {
        let staticPath = url === '/' ? '/index.html' : url;
        const fullPath = resolve(webDistPath, '.' + staticPath);

        if (existsSync(fullPath)) {
          const ext = staticPath.substring(staticPath.lastIndexOf('.'));
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';

          try {
            const content = await readFile(fullPath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
            return;
          } catch {
            // Fall through to 404
          }
        }

        // SPA fallback - serve index.html for all routes
        if (!staticPath.includes('.')) {
          try {
            const indexPath = resolve(webDistPath, 'index.html');
            const content = await readFile(indexPath);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
            return;
          } catch {
            // Fall through to 404
          }
        }
      }

      // Fallback: serve inline HTML if web dist not available
      if (url === '/' || url === '/index.html') {
        const content = await readFile(currentFilePath, 'utf-8');
        const annotations = await readAnnotationFile(currentFilePath);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(generateFallbackHtml(basename(currentFilePath), content, annotations));
        return;
      }

      // 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    });

    server.listen(port, () => {
      console.log();
      console.log(chalk.green.bold('  Ano Web Viewer'));
      console.log();
      console.log(`  ${chalk.bold('Files:')}  ${filePaths.map(fp => basename(fp)).join(', ')}`);
      console.log(`  ${chalk.bold('URL:')}    ${chalk.cyan(`http://localhost:${port}`)}`);
      console.log();
      console.log(chalk.dim('  Press Ctrl+C to stop'));
      console.log();

      // Open browser if requested
      if (options.open) {
        const openCommand = process.platform === 'darwin' ? 'open' :
          process.platform === 'win32' ? 'start' : 'xdg-open';
        import('node:child_process').then(({ exec }) => {
          exec(`${openCommand} http://localhost:${port}`);
        });
      }
    });
  });

/**
 * Generate fallback HTML when web dist is not available
 */
function generateFallbackHtml(
  fileName: string,
  content: string,
  annotations: any
): string {
  const lines = content.split('\n');
  const annotationMap = new Map<number, any[]>();

  if (annotations?.annotations) {
    for (const ann of annotations.annotations) {
      const line = ann.anchor.line;
      if (!annotationMap.has(line)) {
        annotationMap.set(line, []);
      }
      annotationMap.get(line)!.push(ann);
    }
  }

  const lineHtml = lines.map((line, i) => {
    const lineNum = i + 1;
    const lineAnnotations = annotationMap.get(lineNum) || [];
    const hasAnnotation = lineAnnotations.length > 0;
    const type = lineAnnotations[0]?.type || '';
    const bgClass = hasAnnotation ? `annotation-${type}` : '';

    return `<div class="line ${bgClass}">
      <span class="line-num">${lineNum}</span>
      <span class="line-content">${escapeHtml(line) || '&nbsp;'}</span>
      ${hasAnnotation ? `<span class="annotation-badge">${lineAnnotations.length}</span>` : ''}
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${fileName} - Ano</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
    .header { background: #1e293b; padding: 1rem 2rem; border-bottom: 1px solid #334155; }
    .header h1 { font-size: 1.25rem; color: #60a5fa; }
    .content { padding: 1rem; font-family: 'SF Mono', Monaco, monospace; font-size: 14px; }
    .line { display: flex; align-items: center; padding: 2px 0; }
    .line:hover { background: rgba(51, 65, 85, 0.5); }
    .line-num { width: 50px; text-align: right; padding-right: 1rem; color: #64748b; user-select: none; border-right: 1px solid #334155; }
    .line-content { padding-left: 1rem; white-space: pre-wrap; flex: 1; }
    .annotation-badge { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin-left: auto; }
    .annotation-blocker { background: rgba(239, 68, 68, 0.1); }
    .annotation-blocker .annotation-badge { background: #ef4444; }
    .annotation-concern { background: rgba(245, 158, 11, 0.1); }
    .annotation-concern .annotation-badge { background: #f59e0b; }
    .annotation-question { background: rgba(59, 130, 246, 0.1); }
    .annotation-suggestion { background: rgba(34, 197, 94, 0.1); }
    .annotation-suggestion .annotation-badge { background: #22c55e; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ano - ${escapeHtml(fileName)}</h1>
  </div>
  <div class="content">
    ${lineHtml}
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generate shareable HTML with all annotations visible
 */
function generateShareableHtml(
  fileName: string,
  content: string,
  annotationData: any
): string {
  const lines = content.split('\n');
  const annotationMap = new Map<number, any[]>();

  if (annotationData?.annotations) {
    for (const ann of annotationData.annotations) {
      const start = ann.anchor.line;
      const end = ann.anchor.endLine || ann.anchor.line;
      for (let i = start; i <= end; i++) {
        if (!annotationMap.has(i)) annotationMap.set(i, []);
        if (!annotationMap.get(i)!.find((a: any) => a.id === ann.id)) {
          annotationMap.get(i)!.push(ann);
        }
      }
    }
  }

  const openAnnotations = annotationData?.annotations?.filter((a: any) => a.status === 'open') || [];
  const stats = {
    open: openAnnotations.length,
    blockers: openAnnotations.filter((a: any) => a.type === 'blocker').length,
    approvals: annotationData?.approvals?.filter((a: any) => a.status === 'approved').length || 0
  };

  // Build annotation summary section
  const summaryHtml = openAnnotations.length > 0 ? `
    <div class="summary">
      <h2>Annotations Summary</h2>
      ${openAnnotations.map((a: any) => {
        const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
        return `<div class="summary-item ${a.type}">
          <span class="type-badge">${a.type}</span>
          <span class="line-ref">${lineRef}</span>
          <p>${escapeHtml(a.content)}</p>
          <span class="author">${escapeHtml(a.author.split('<')[0].trim())}</span>
        </div>`;
      }).join('')}
    </div>
  ` : '<div class="summary"><p class="no-annotations">No open annotations</p></div>';

  const lineHtml = lines.map((line, i) => {
    const lineNum = i + 1;
    const lineAnnotations = annotationMap.get(lineNum) || [];
    const hasAnnotation = lineAnnotations.length > 0;
    const type = lineAnnotations[0]?.type || '';
    const bgClass = hasAnnotation ? `annotation-${type}` : '';

    const annotationHtml = lineAnnotations.length > 0 ? `
      <div class="inline-annotations">
        ${lineAnnotations.filter((a: any) => a.anchor.line === lineNum).map((a: any) => `
          <div class="inline-ann ${a.type}">
            <span class="type">${a.type}</span>
            <span class="content">${escapeHtml(a.content)}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    return `<div class="line ${bgClass}">
      <span class="line-num">${lineNum}</span>
      <span class="line-content">${escapeHtml(line) || '&nbsp;'}</span>
      ${hasAnnotation ? `<span class="annotation-badge">${lineAnnotations.length}</span>` : ''}
    </div>${annotationHtml}`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(fileName)} - Ano Annotations</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; line-height: 1.5; }
    .header { background: #1e293b; padding: 1rem 2rem; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .header h1 { font-size: 1.25rem; color: #60a5fa; display: flex; align-items: center; gap: 0.75rem; }
    .header h1 span { color: #94a3b8; font-weight: normal; font-size: 0.875rem; }
    .stats { display: flex; gap: 1.5rem; font-size: 0.875rem; }
    .stats .stat { display: flex; align-items: center; gap: 0.5rem; }
    .stats .dot { width: 8px; height: 8px; border-radius: 50%; }
    .stats .open .dot { background: #f59e0b; }
    .stats .blocker .dot { background: #ef4444; }
    .stats .approval .dot { background: #22c55e; }
    .container { display: flex; flex-direction: column; }
    @media (min-width: 1024px) { .container { flex-direction: row; } }
    .summary { padding: 1.5rem; border-bottom: 1px solid #334155; background: #1e293b; }
    @media (min-width: 1024px) { .summary { width: 350px; border-bottom: none; border-right: 1px solid #334155; max-height: calc(100vh - 60px); overflow-y: auto; } }
    .summary h2 { font-size: 0.875rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
    .summary-item { padding: 0.75rem; background: #0f172a; border-radius: 8px; margin-bottom: 0.75rem; border-left: 3px solid; }
    .summary-item.blocker { border-color: #ef4444; }
    .summary-item.concern { border-color: #f59e0b; }
    .summary-item.question { border-color: #3b82f6; }
    .summary-item.suggestion { border-color: #22c55e; }
    .summary-item .type-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
    .summary-item.blocker .type-badge { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    .summary-item.concern .type-badge { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .summary-item.question .type-badge { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .summary-item.suggestion .type-badge { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
    .summary-item .line-ref { font-size: 11px; color: #64748b; margin-left: 0.5rem; }
    .summary-item p { font-size: 13px; margin: 0.5rem 0; }
    .summary-item .author { font-size: 11px; color: #64748b; }
    .no-annotations { color: #22c55e; text-align: center; padding: 2rem; }
    .content { flex: 1; padding: 1rem; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 14px; overflow-x: auto; }
    .line { display: flex; align-items: flex-start; padding: 2px 0; }
    .line:hover { background: rgba(51, 65, 85, 0.5); }
    .line-num { min-width: 50px; text-align: right; padding-right: 1rem; color: #64748b; user-select: none; border-right: 1px solid #334155; flex-shrink: 0; }
    .line-content { padding-left: 1rem; white-space: pre-wrap; word-break: break-all; flex: 1; }
    .annotation-badge { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 11px; margin-left: auto; flex-shrink: 0; }
    .annotation-blocker { background: rgba(239, 68, 68, 0.1); }
    .annotation-blocker .annotation-badge { background: #ef4444; }
    .annotation-concern { background: rgba(245, 158, 11, 0.1); }
    .annotation-concern .annotation-badge { background: #f59e0b; }
    .annotation-question { background: rgba(59, 130, 246, 0.1); }
    .annotation-suggestion { background: rgba(34, 197, 94, 0.1); }
    .annotation-suggestion .annotation-badge { background: #22c55e; }
    .inline-annotations { margin-left: 66px; margin-bottom: 0.5rem; }
    .inline-ann { font-size: 12px; padding: 0.5rem 0.75rem; background: #1e293b; border-radius: 6px; margin-top: 4px; border-left: 3px solid; font-family: system-ui; }
    .inline-ann.blocker { border-color: #ef4444; }
    .inline-ann.concern { border-color: #f59e0b; }
    .inline-ann.question { border-color: #3b82f6; }
    .inline-ann.suggestion { border-color: #22c55e; }
    .inline-ann .type { font-size: 10px; text-transform: uppercase; margin-right: 0.5rem; color: #94a3b8; }
    .footer { padding: 1rem 2rem; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #334155; background: #1e293b; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ano <span>${escapeHtml(fileName)}</span></h1>
    <div class="stats">
      <div class="stat open"><span class="dot"></span>${stats.open} open</div>
      ${stats.blockers > 0 ? `<div class="stat blocker"><span class="dot"></span>${stats.blockers} blocker${stats.blockers !== 1 ? 's' : ''}</div>` : ''}
      <div class="stat approval"><span class="dot"></span>${stats.approvals} approval${stats.approvals !== 1 ? 's' : ''}</div>
    </div>
  </div>
  <div class="container">
    ${summaryHtml}
    <div class="content">
      ${lineHtml}
    </div>
  </div>
  <div class="footer">
    Generated by <a href="https://github.com/anthropics/ano">ano</a> - Collaborative annotations for Claude Code
  </div>
</body>
</html>`;
}
