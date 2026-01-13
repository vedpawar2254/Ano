<script lang="ts">
  import FileViewer from './lib/FileViewer.svelte';
  import Sidebar from './lib/Sidebar.svelte';
  import Header from './lib/Header.svelte';
  import AddAnnotationModal from './lib/AddAnnotationModal.svelte';
  import SelectionTooltip from './lib/SelectionTooltip.svelte';
  import type { AnnotationFile, Annotation, AnnotationType } from './lib/types';

  // State
  let fileContent = $state('');
  let fileName = $state('');
  let annotationData = $state<AnnotationFile | null>(null);
  let selectedAnnotation = $state<Annotation | null>(null);
  let selectedLine = $state<number | null>(null);
  let fileViewerContainer: HTMLDivElement;

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

  // Load data from API
  async function loadData() {
    try {
      const response = await fetch('/api/current');
      const data = await response.json();
      fileContent = data.content;
      fileName = data.fileName;
      annotationData = data.annotations;
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

  $effect(() => {
    loadData();
  });
</script>

<div class="h-screen flex flex-col">
  <Header {fileName} {annotationData} onApprove={handleApprove} onRequestChanges={handleRequestChanges} />

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
      />
    </div>

    <div class="w-96 border-l border-slate-700 overflow-auto">
      <Sidebar
        annotations={annotationData?.annotations || []}
        approvals={annotationData?.approvals || []}
        {selectedAnnotation}
        onAnnotationClick={handleAnnotationClick}
        onResolve={handleResolve}
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
