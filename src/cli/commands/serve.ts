/**
 * ano serve command
 *
 * Start a local web server for viewing annotations.
 *
 * Usage:
 *   ano serve <file>           Start server for a specific file
 *   ano serve <file> --port 8080  Use custom port
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve, dirname, basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readAnnotationFile } from '../../core/annotations.js';

// Simple static file server
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

export const serveCommand = new Command('serve')
  .description('Start web viewer for annotations')
  .argument('<file>', 'File to view')
  .option('-p, --port <port>', 'Port to use', '3000')
  .option('--no-open', 'Don\'t open browser automatically')
  .action(async (file: string, options: { port: string; open: boolean }) => {
    const filePath = resolve(file);
    const port = parseInt(options.port, 10);

    // Check file exists
    if (!existsSync(filePath)) {
      console.error(chalk.red(`File not found: ${filePath}`));
      process.exit(1);
    }

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
      const url = req.url || '/';

      // API endpoint for current file data
      if (url === '/api/current') {
        try {
          const content = await readFile(filePath, 'utf-8');
          const annotations = await readAnnotationFile(filePath);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            fileName: basename(filePath),
            filePath,
            content,
            annotations: annotations || {
              version: '1.0',
              file: filePath,
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
        const content = await readFile(filePath, 'utf-8');
        const annotations = await readAnnotationFile(filePath);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(generateFallbackHtml(basename(filePath), content, annotations));
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
      console.log(`  ${chalk.bold('File:')}   ${basename(filePath)}`);
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
