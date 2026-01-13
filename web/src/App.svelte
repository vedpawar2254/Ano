<script lang="ts">
  import FileViewer from './lib/FileViewer.svelte';
  import Sidebar from './lib/Sidebar.svelte';
  import Header from './lib/Header.svelte';
  import type { AnnotationFile, Annotation } from './lib/types';

  // State
  let fileContent = $state('');
  let fileName = $state('');
  let annotationData = $state<AnnotationFile | null>(null);
  let selectedAnnotation = $state<Annotation | null>(null);
  let selectedLine = $state<number | null>(null);

  // Load data from API (will be served by ano serve)
  async function loadData() {
    try {
      const response = await fetch('/api/current');
      const data = await response.json();
      fileContent = data.content;
      fileName = data.fileName;
      annotationData = data.annotations;
    } catch (e) {
      // Demo mode - load sample data
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

  // Handle line click
  function handleLineClick(line: number) {
    selectedLine = line;
    // Find annotations for this line
    const lineAnnotations = annotationData?.annotations.filter(
      a => a.anchor.line === line
    );
    if (lineAnnotations && lineAnnotations.length > 0) {
      selectedAnnotation = lineAnnotations[0];
    }
  }

  // Handle annotation click
  function handleAnnotationClick(annotation: Annotation) {
    selectedAnnotation = annotation;
    selectedLine = annotation.anchor.line;
  }

  // Load on mount
  $effect(() => {
    loadData();
  });
</script>

<div class="h-screen flex flex-col">
  <!-- Header -->
  <Header {fileName} {annotationData} />

  <!-- Main content -->
  <div class="flex-1 flex overflow-hidden">
    <!-- File viewer -->
    <div class="flex-1 overflow-auto">
      <FileViewer
        content={fileContent}
        annotations={annotationData?.annotations || []}
        {selectedLine}
        onLineClick={handleLineClick}
        onAnnotationClick={handleAnnotationClick}
      />
    </div>

    <!-- Sidebar -->
    <div class="w-96 border-l border-slate-700 overflow-auto">
      <Sidebar
        annotations={annotationData?.annotations || []}
        approvals={annotationData?.approvals || []}
        {selectedAnnotation}
        onAnnotationClick={handleAnnotationClick}
      />
    </div>
  </div>
</div>
