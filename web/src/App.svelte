<script lang="ts">
  import FileViewer from './lib/FileViewer.svelte';
  import Sidebar from './lib/Sidebar.svelte';
  import Header from './lib/Header.svelte';
  import AddAnnotationModal from './lib/AddAnnotationModal.svelte';
  import SelectionTooltip from './lib/SelectionTooltip.svelte';
  import type { AnnotationFile, Annotation, AnnotationType } from './lib/types';

  interface FileInfo {
    path: string;
    name: string;
    openAnnotations: number;
    isCurrent: boolean;
  }

  // State
  let fileContent = $state('');
  let fileName = $state('');
  let annotationData = $state<AnnotationFile | null>(null);
  let selectedAnnotation = $state<Annotation | null>(null);
  let selectedLine = $state<number | null>(null);
  let fileViewerContainer: HTMLDivElement;
  let files = $state<FileInfo[]>([]);

  // Track initial annotations for diff view
  let initialAnnotations = $state<Annotation[]>([]);
  let initialApprovals = $state<{ author: string; title?: string; status: string; timestamp: string; comment?: string }[]>([]);
  let hasStoredInitial = $state(false);

  // Modal state
  let showAddModal = $state(false);
  let addModalLine = $state(0);
  let addModalEndLine = $state<number | undefined>(undefined);

  // Selection tooltip state
  let showTooltip = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltipLine = $state(0);
  let tooltipEndLine = $state<number | undefined>(undefined);
  let selectedText = $state('');

  // Keyboard shortcuts help
  let showKeyboardHelp = $state(false);

  // URL state management
  function parseUrlState(): { file?: string; annotation?: string; line?: number } {
    const hash = window.location.hash.slice(1);
    if (!hash) return {};

    const params = new URLSearchParams(hash);
    return {
      file: params.get('file') || undefined,
      annotation: params.get('annotation') || undefined,
      line: params.get('line') ? parseInt(params.get('line')!, 10) : undefined
    };
  }

  function updateUrlState(state: { file?: string; annotation?: string; line?: number }) {
    const params = new URLSearchParams();
    if (state.file) params.set('file', state.file);
    if (state.annotation) params.set('annotation', state.annotation);
    else if (state.line) params.set('line', state.line.toString());

    const hash = params.toString();
    const newUrl = hash ? `#${hash}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }

  function getShareableUrl(): string {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    // Add file if in multi-file mode
    const currentFile = files.find(f => f.isCurrent);
    if (files.length > 1 && currentFile) {
      params.set('file', currentFile.path);
    }

    // Add annotation or line
    if (selectedAnnotation) {
      params.set('annotation', selectedAnnotation.id);
    } else if (selectedLine) {
      params.set('line', selectedLine.toString());
    }

    const hash = params.toString();
    return hash ? `${base}#${hash}` : base;
  }

  async function copyShareableUrl() {
    const url = getShareableUrl();
    try {
      await navigator.clipboard.writeText(url);
      showCopyToast = true;
      setTimeout(() => showCopyToast = false, 2000);
    } catch (e) {
      console.error('Failed to copy URL:', e);
    }
  }

  let showCopyToast = $state(false);

  // Apply URL state after data is loaded
  async function applyUrlState() {
    const state = parseUrlState();

    // Switch file if specified
    if (state.file) {
      const targetFile = files.find(f => f.path === state.file || f.name === state.file);
      if (targetFile && !targetFile.isCurrent) {
        await handleFileSwitch(targetFile.path);
      }
    }

    // Select annotation if specified
    if (state.annotation && annotationData) {
      const annotation = annotationData.annotations.find(a => a.id === state.annotation);
      if (annotation) {
        handleAnnotationClick(annotation);
        return;
      }
    }

    // Select line if specified
    if (state.line) {
      selectedLine = state.line;
      setTimeout(() => scrollToLine(state.line!), 100);
    }
  }

  // Update URL when selection changes
  $effect(() => {
    const currentFile = files.find(f => f.isCurrent);
    updateUrlState({
      file: files.length > 1 && currentFile ? currentFile.path : undefined,
      annotation: selectedAnnotation?.id,
      line: !selectedAnnotation && selectedLine ? selectedLine : undefined
    });
  });

  // Load files list from API
  async function loadFiles() {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      files = data.files || [];
    } catch (e) {
      files = [];
    }
  }

  // Switch to a different file
  async function handleFileSwitch(filePath: string) {
    try {
      const response = await fetch('/api/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      if (response.ok) {
        // Reset diff tracking for new file
        hasStoredInitial = false;
        initialAnnotations = [];
        initialApprovals = [];

        await loadData();
        await loadFiles();
        // Clear selection state when switching files
        selectedAnnotation = null;
        selectedLine = null;
      }
    } catch (e) {
      console.error('Failed to switch file:', e);
    }
  }

  // Load data from API
  async function loadData() {
    try {
      const response = await fetch('/api/current');
      const data = await response.json();
      fileContent = data.content;
      fileName = data.fileName;
      annotationData = data.annotations;

      // Store initial state for diff view (only on first load)
      if (!hasStoredInitial && annotationData) {
        initialAnnotations = [...annotationData.annotations];
        initialApprovals = [...annotationData.approvals];
        hasStoredInitial = true;
      }
    } catch (e) {
      // Demo mode
      fileContent = `# Sample Plan

## Overview
This is a sample plan file to demonstrate the annotation viewer.

## Steps
1. First step - do something important
2. Second step - review the changes
3. Third step - deploy to production

## Notes
- Remember to test thoroughly
- Get approval before deploying
`;
      fileName = 'sample-plan.md';
      annotationData = {
        version: '1.0',
        file: 'sample-plan.md',
        fileHash: 'demo',
        annotations: [
          {
            id: 'demo-1',
            anchor: { line: 7, contextBefore: '', contextAfter: '', contentHash: '' },
            type: 'concern',
            author: 'Demo User',
            timestamp: new Date().toISOString(),
            content: 'Is this step safe for production?',
            status: 'open',
            replies: []
          },
          {
            id: 'demo-2',
            anchor: { line: 10, contextBefore: '', contextAfter: '', contentHash: '' },
            type: 'blocker',
            author: 'Demo User',
            timestamp: new Date().toISOString(),
            content: 'Need security review before deployment',
            status: 'open',
            replies: []
          }
        ],
        approvals: []
      };
    }
  }

  // Scroll to line
  function scrollToLine(line: number) {
    const el = document.getElementById(`line-${line}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Handle line click
  function handleLineClick(line: number) {
    selectedLine = line;
    const lineAnnotations = annotationData?.annotations.filter(a => a.anchor.line === line);
    if (lineAnnotations && lineAnnotations.length > 0) {
      selectedAnnotation = lineAnnotations[0];
    } else {
      selectedAnnotation = null;
    }
  }

  // Handle line double-click (open annotation modal for that line)
  function handleLineDoubleClick(line: number) {
    addModalLine = line;
    addModalEndLine = undefined;
    showAddModal = true;
  }

  // Handle text selection
  function handleSelection(line: number, endLine: number | undefined, x: number, y: number, text: string) {
    tooltipLine = line;
    tooltipEndLine = endLine;
    tooltipX = x;
    tooltipY = y;
    selectedText = text;
    showTooltip = true;
  }

  function clearSelection() {
    if (!showAddModal) {
      showTooltip = false;
      selectedText = '';
    }
  }

  // Open modal from tooltip (keep selection visible)
  function handleTooltipAnnotate() {
    addModalLine = tooltipLine;
    addModalEndLine = tooltipEndLine;
    showAddModal = true;
    // Don't clear tooltip yet - keep selection visible
  }

  // Handle annotation click
  function handleAnnotationClick(annotation: Annotation) {
    selectedAnnotation = annotation;
    selectedLine = annotation.anchor.line;
    setTimeout(() => scrollToLine(annotation.anchor.line), 50);
  }

  // Add annotation via API
  async function handleAddAnnotation(line: number, content: string, type: AnnotationType, endLine?: number) {
    try {
      const response = await fetch('/api/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, content, type, endLine })
      });
      if (response.ok) {
        await loadData();
        showAddModal = false;
        showTooltip = false;
        selectedText = '';
        // Clear browser selection
        window.getSelection()?.removeAllRanges();
      }
    } catch (e) {
      console.error('Failed to add annotation:', e);
    }
  }

  function handleCancelModal() {
    showAddModal = false;
    showTooltip = false;
    selectedText = '';
    window.getSelection()?.removeAllRanges();
  }

  // Approve/Request changes
  async function handleApprove() {
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      if (response.ok) await loadData();
    } catch (e) {
      console.error('Failed to approve:', e);
    }
  }

  async function handleRequestChanges() {
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'changes_requested' })
      });
      if (response.ok) await loadData();
    } catch (e) {
      console.error('Failed to request changes:', e);
    }
  }

  // Resolve annotation
  async function handleResolve(annotationId: string) {
    try {
      const response = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotationId })
      });
      if (response.ok) await loadData();
    } catch (e) {
      console.error('Failed to resolve:', e);
    }
  }

  // Reopen annotation
  async function handleReopen(annotationId: string) {
    try {
      const response = await fetch('/api/reopen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotationId })
      });
      if (response.ok) await loadData();
    } catch (e) {
      console.error('Failed to reopen:', e);
    }
  }

  // Delete annotation
  async function handleDelete(annotationId: string) {
    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotationId })
      });
      if (response.ok) {
        if (selectedAnnotation?.id === annotationId) {
          selectedAnnotation = null;
        }
        await loadData();
      }
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  }

  // Reply to annotation
  async function handleReply(annotationId: string, content: string) {
    try {
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotationId, content })
      });
      if (response.ok) await loadData();
    } catch (e) {
      console.error('Failed to reply:', e);
    }
  }

  // Keyboard shortcuts handler
  function handleKeydown(e: KeyboardEvent) {
    // Don't handle shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    // Don't handle when modals are open (except Escape)
    if ((showAddModal || showTooltip) && e.key !== 'Escape') return;

    const annotations = annotationData?.annotations || [];
    const sortedAnnotations = [...annotations].sort((a, b) => a.anchor.line - b.anchor.line);

    switch (e.key) {
      case '?':
        e.preventDefault();
        showKeyboardHelp = !showKeyboardHelp;
        break;

      case 'Escape':
        e.preventDefault();
        if (showKeyboardHelp) {
          showKeyboardHelp = false;
        } else if (showAddModal) {
          handleCancelModal();
        } else if (showTooltip) {
          clearSelection();
        } else if (selectedAnnotation) {
          selectedAnnotation = null;
          selectedLine = null;
        }
        break;

      case 'j':
      case 'ArrowDown':
        if (sortedAnnotations.length === 0) break;
        e.preventDefault();
        if (!selectedAnnotation) {
          handleAnnotationClick(sortedAnnotations[0]);
        } else {
          const currentIndex = sortedAnnotations.findIndex(a => a.id === selectedAnnotation?.id);
          const nextIndex = Math.min(currentIndex + 1, sortedAnnotations.length - 1);
          handleAnnotationClick(sortedAnnotations[nextIndex]);
        }
        break;

      case 'k':
      case 'ArrowUp':
        if (sortedAnnotations.length === 0) break;
        e.preventDefault();
        if (!selectedAnnotation) {
          handleAnnotationClick(sortedAnnotations[sortedAnnotations.length - 1]);
        } else {
          const currentIndex = sortedAnnotations.findIndex(a => a.id === selectedAnnotation?.id);
          const prevIndex = Math.max(currentIndex - 1, 0);
          handleAnnotationClick(sortedAnnotations[prevIndex]);
        }
        break;

      case 'r':
        if (selectedAnnotation && selectedAnnotation.status === 'open') {
          e.preventDefault();
          handleResolve(selectedAnnotation.id);
        }
        break;

      case 'u':
        if (selectedAnnotation && selectedAnnotation.status === 'resolved') {
          e.preventDefault();
          handleReopen(selectedAnnotation.id);
        }
        break;

      case 'd':
        if (selectedAnnotation && e.shiftKey) {
          e.preventDefault();
          handleDelete(selectedAnnotation.id);
        }
        break;

      case 'a':
        if (selectedLine) {
          e.preventDefault();
          addModalLine = selectedLine;
          addModalEndLine = undefined;
          showAddModal = true;
        }
        break;

      case '/':
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search annotations..."]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        break;
    }
  }

  // Edit a line in the file
  async function handleLineEdit(line: number, newContent: string) {
    const lines = fileContent.split('\n');
    lines[line - 1] = newContent;
    const updatedContent = lines.join('\n');

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent })
      });
      if (response.ok) {
        // Update local state immediately for responsiveness
        fileContent = updatedContent;
      }
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }

  // Export as standalone HTML
  function handleExport() {
    if (!fileContent || !annotationData) return;

    const html = generateExportHtml(fileName, fileContent, annotationData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.annotated.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function generateExportHtml(name: string, content: string, data: AnnotationFile): string {
    const lines = content.split('\n');
    const annotationMap = new Map<number, typeof data.annotations>();

    for (const ann of data.annotations) {
      const start = ann.anchor.line;
      const end = ann.anchor.endLine || ann.anchor.line;
      for (let i = start; i <= end; i++) {
        if (!annotationMap.has(i)) annotationMap.set(i, []);
        annotationMap.get(i)!.push(ann);
      }
    }

    const lineHtml = lines.map((line, i) => {
      const lineNum = i + 1;
      const lineAnnotations = annotationMap.get(lineNum) || [];
      const hasAnnotation = lineAnnotations.length > 0;
      const type = lineAnnotations[0]?.type || '';
      const bgClass = hasAnnotation ? `annotation-${type}` : '';

      const annotationHtml = lineAnnotations.length > 0 ? `
        <div class="annotation-popup">
          ${lineAnnotations.map(a => `
            <div class="annotation-item ${a.type}">
              <span class="type-badge">${a.type}</span>
              <p>${escapeHtml(a.content)}</p>
              <span class="author">${escapeHtml(a.author.split('<')[0].trim())}</span>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `<div class="line ${bgClass}" data-line="${lineNum}">
        <span class="line-num">${lineNum}</span>
        <span class="line-content">${escapeHtml(line) || '&nbsp;'}</span>
        ${hasAnnotation ? `<span class="annotation-badge" onclick="this.parentElement.classList.toggle('show-popup')">${lineAnnotations.length}</span>` : ''}
        ${annotationHtml}
      </div>`;
    }).join('\n');

    const stats = {
      open: data.annotations.filter(a => a.status === 'open').length,
      blockers: data.annotations.filter(a => a.type === 'blocker' && a.status === 'open').length,
      approvals: data.approvals.filter(a => a.status === 'approved').length
    };

    return `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(name)} - Annotations</title>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; }
    .header { background: #1e293b; padding: 1rem 2rem; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 1.25rem; color: #60a5fa; display: flex; align-items: center; gap: 1rem; }
    .header h1 span { color: #94a3b8; font-weight: normal; font-size: 0.875rem; }
    .stats { display: flex; gap: 1.5rem; font-size: 0.875rem; }
    .stats .stat { display: flex; align-items: center; gap: 0.5rem; }
    .stats .dot { width: 8px; height: 8px; border-radius: 50%; }
    .stats .open .dot { background: #f59e0b; }
    .stats .blocker .dot { background: #ef4444; }
    .stats .approval .dot { background: #22c55e; }
    .content { padding: 1rem; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 14px; }
    .line { display: flex; align-items: flex-start; padding: 2px 0; position: relative; }
    .line:hover { background: rgba(51, 65, 85, 0.5); }
    .line-num { min-width: 50px; text-align: right; padding-right: 1rem; color: #64748b; user-select: none; border-right: 1px solid #334155; flex-shrink: 0; }
    .line-content { padding-left: 1rem; white-space: pre-wrap; word-break: break-all; flex: 1; }
    .annotation-badge { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin-left: auto; cursor: pointer; flex-shrink: 0; }
    .annotation-blocker { background: rgba(239, 68, 68, 0.1); }
    .annotation-blocker .annotation-badge { background: #ef4444; }
    .annotation-concern { background: rgba(245, 158, 11, 0.1); }
    .annotation-concern .annotation-badge { background: #f59e0b; }
    .annotation-question { background: rgba(59, 130, 246, 0.1); }
    .annotation-suggestion { background: rgba(34, 197, 94, 0.1); }
    .annotation-suggestion .annotation-badge { background: #22c55e; }
    .annotation-popup { display: none; position: absolute; left: 60px; top: 100%; background: #1e293b; border: 1px solid #475569; border-radius: 8px; padding: 0.75rem; z-index: 100; min-width: 300px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .line.show-popup .annotation-popup { display: block; }
    .annotation-item { margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #334155; }
    .annotation-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .type-badge { display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-bottom: 4px; }
    .annotation-item.blocker .type-badge { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    .annotation-item.concern .type-badge { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .annotation-item.question .type-badge { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .annotation-item.suggestion .type-badge { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
    .annotation-item p { font-size: 13px; margin: 4px 0; font-family: system-ui; }
    .annotation-item .author { font-size: 11px; color: #64748b; }
    .footer { padding: 1rem 2rem; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ano <span>${escapeHtml(name)}</span></h1>
    <div class="stats">
      <div class="stat open"><span class="dot"></span>${stats.open} open</div>
      ${stats.blockers > 0 ? `<div class="stat blocker"><span class="dot"></span>${stats.blockers} blocker${stats.blockers !== 1 ? 's' : ''}</div>` : ''}
      <div class="stat approval"><span class="dot"></span>${stats.approvals} approval${stats.approvals !== 1 ? 's' : ''}</div>
    </div>
  </div>
  <div class="content">
    ${lineHtml}
  </div>
  <div class="footer">
    Generated by <a href="https://github.com/anthropics/ano" style="color: #60a5fa;">ano</a> • Click badges to view annotations
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

  // Set up SSE connection for real-time updates
  let eventSource: EventSource | null = null;

  function setupSSE() {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource('/api/events');

    eventSource.addEventListener('connected', () => {
      console.log('Live reload connected');
    });

    eventSource.addEventListener('fileChanged', () => {
      console.log('File changed, reloading...');
      loadData();
    });

    eventSource.addEventListener('annotationsChanged', () => {
      console.log('Annotations changed, reloading...');
      loadData();
    });

    eventSource.onerror = () => {
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        if (eventSource?.readyState === EventSource.CLOSED) {
          setupSSE();
        }
      }, 3000);
    };
  }

  $effect(() => {
    // Load data and apply URL state
    Promise.all([loadData(), loadFiles()]).then(() => {
      // Apply URL state after data is loaded
      setTimeout(() => applyUrlState(), 100);
    });
    setupSSE();

    // Listen for hash changes
    const handleHashChange = () => applyUrlState();
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      window.removeEventListener('hashchange', handleHashChange);
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="h-screen flex flex-col bg-surface-950">
  <Header {fileName} {fileContent} {annotationData} {files} onExport={handleExport} onFileSwitch={handleFileSwitch} onCopyLink={copyShareableUrl} />

  <div class="flex-1 flex overflow-hidden">
    <div class="flex-1 overflow-auto" bind:this={fileViewerContainer}>
      <FileViewer
        content={fileContent}
        annotations={annotationData?.annotations || []}
        {selectedLine}
        onLineClick={handleLineClick}
        onLineDoubleClick={handleLineDoubleClick}
        onAnnotationClick={handleAnnotationClick}
        onSelection={handleSelection}
        onSelectionClear={clearSelection}
        onLineEdit={handleLineEdit}
      />
    </div>

    <div class="w-80 border-l border-surface-800/50 overflow-auto bg-surface-950">
      <Sidebar
        annotations={annotationData?.annotations || []}
        approvals={annotationData?.approvals || []}
        {selectedAnnotation}
        onAnnotationClick={handleAnnotationClick}
        onResolve={handleResolve}
        onReopen={handleReopen}
        onDelete={handleDelete}
        onReply={handleReply}
        previousAnnotations={initialAnnotations}
        previousApprovals={initialApprovals}
      />
    </div>
  </div>
</div>

{#if showTooltip}
  <SelectionTooltip x={tooltipX} y={tooltipY} onAnnotate={handleTooltipAnnotate} />
{/if}

{#if showAddModal}
  <AddAnnotationModal
    line={addModalLine}
    endLine={addModalEndLine}
    {selectedText}
    onSubmit={handleAddAnnotation}
    onCancel={handleCancelModal}
  />
{/if}

{#if showKeyboardHelp}
  <div
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    onclick={() => showKeyboardHelp = false}
    onkeydown={(e) => e.key === 'Escape' && (showKeyboardHelp = false)}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="bg-surface-900 border border-surface-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-surface-200">Keyboard Shortcuts</h2>
        <button
          class="text-surface-500 hover:text-surface-300 text-xl leading-none"
          onclick={() => showKeyboardHelp = false}
        >&times;</button>
      </div>

      <div class="space-y-4 text-[13px]">
        <div>
          <h3 class="text-[11px] font-medium text-surface-500 uppercase tracking-wider mb-2">Navigation</h3>
          <div class="space-y-1.5">
            <div class="flex justify-between">
              <span class="text-surface-400">Next annotation</span>
              <span class="text-surface-300 font-mono">j / ↓</span>
            </div>
            <div class="flex justify-between">
              <span class="text-surface-400">Previous annotation</span>
              <span class="text-surface-300 font-mono">k / ↑</span>
            </div>
            <div class="flex justify-between">
              <span class="text-surface-400">Focus search</span>
              <span class="text-surface-300 font-mono">/</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-[11px] font-medium text-surface-500 uppercase tracking-wider mb-2">Actions</h3>
          <div class="space-y-1.5">
            <div class="flex justify-between">
              <span class="text-surface-400">Add annotation at line</span>
              <span class="text-surface-300 font-mono">a</span>
            </div>
            <div class="flex justify-between">
              <span class="text-surface-400">Resolve selected</span>
              <span class="text-surface-300 font-mono">r</span>
            </div>
            <div class="flex justify-between">
              <span class="text-surface-400">Reopen selected</span>
              <span class="text-surface-300 font-mono">u</span>
            </div>
            <div class="flex justify-between">
              <span class="text-surface-400">Delete selected</span>
              <span class="text-surface-300 font-mono">Shift+D</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-[11px] font-medium text-surface-500 uppercase tracking-wider mb-2">General</h3>
          <div class="space-y-1.5">
            <div class="flex justify-between">
              <span class="text-surface-400">Show this help</span>
              <span class="text-surface-300 font-mono">?</span>
            </div>
            <div class="flex justify-between">
              <span class="text-surface-400">Close / Deselect</span>
              <span class="text-surface-300 font-mono">Esc</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showCopyToast}
  <div class="fixed bottom-4 right-4 bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 shadow-xl z-50 text-[13px] text-surface-200">
    Link copied to clipboard
  </div>
{/if}
