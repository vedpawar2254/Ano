<script lang="ts">
  import type { Annotation } from './types';

  interface Props {
    content: string;
    annotations: Annotation[];
    selectedLine: number | null;
    onLineClick: (line: number) => void;
    onLineDoubleClick: (line: number) => void;
    onAnnotationClick: (annotation: Annotation) => void;
    onSelection?: (line: number, endLine: number | undefined, x: number, y: number, selectedText: string) => void;
    onSelectionClear?: () => void;
  }

  let { content, annotations, selectedLine, onLineClick, onLineDoubleClick, onAnnotationClick, onSelection, onSelectionClear }: Props = $props();

  // Helper to find line number from element
  function findLineNumber(node: Node): number | null {
    let element = node;
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode as Node;
    }
    let lineElement = element as HTMLElement;
    while (lineElement && !lineElement.id?.startsWith('line-')) {
      lineElement = lineElement.parentElement as HTMLElement;
    }
    if (lineElement && lineElement.id) {
      const num = parseInt(lineElement.id.replace('line-', ''), 10);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  // Handle text selection
  function handleMouseUp(e: MouseEvent) {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      const range = selection?.getRangeAt(0);
      if (range) {
        // Get start and end line numbers
        const startLine = findLineNumber(range.startContainer);
        const endLine = findLineNumber(range.endContainer);

        if (startLine !== null && onSelection) {
          // Get selection rectangle for tooltip positioning
          const rect = range.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top;

          // Only pass endLine if different from startLine
          const finalEndLine = endLine !== null && endLine !== startLine ? endLine : undefined;
          onSelection(startLine, finalEndLine, x, y, selectedText);
        }
      }
    } else {
      // No selection, clear tooltip
      onSelectionClear?.();
    }
  }

  // Handle click to clear selection
  function handleClick() {
    // Small delay to allow selection check first
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (!selectedText) {
        onSelectionClear?.();
      }
    }, 10);
  }

  // Split content into lines
  let lines = $derived(content.split('\n'));

  // Get annotations for a specific line (including multi-line ranges)
  function getLineAnnotations(lineNum: number): Annotation[] {
    return annotations.filter(a => {
      const startLine = a.anchor.line;
      const endLine = a.anchor.endLine || a.anchor.line;
      return lineNum >= startLine && lineNum <= endLine;
    });
  }

  // Get the most severe annotation type for a line (for marker color)
  function getLineMarkerType(lineNum: number): string | null {
    const lineAnnotations = getLineAnnotations(lineNum);
    if (lineAnnotations.length === 0) return null;

    // Priority: blocker > concern > question > suggestion
    if (lineAnnotations.some(a => a.type === 'blocker' && a.status === 'open')) return 'blocker';
    if (lineAnnotations.some(a => a.type === 'concern' && a.status === 'open')) return 'concern';
    if (lineAnnotations.some(a => a.type === 'question' && a.status === 'open')) return 'question';
    if (lineAnnotations.some(a => a.type === 'suggestion' && a.status === 'open')) return 'suggestion';
    return 'resolved';
  }

  // Handle marker click
  function handleMarkerClick(lineNum: number, e: MouseEvent) {
    e.stopPropagation();
    const lineAnnotations = getLineAnnotations(lineNum);
    if (lineAnnotations.length > 0) {
      onAnnotationClick(lineAnnotations[0]);
    }
  }

  // Helper functions
  function getBackgroundClass(type: string | null): string {
    switch (type) {
      case 'blocker': return 'bg-red-500';
      case 'concern': return 'bg-amber-500';
      case 'question': return 'bg-blue-500';
      case 'suggestion': return 'bg-green-500';
      default: return '';
    }
  }

  function getBadgeClass(type: string | null): string {
    switch (type) {
      case 'blocker': return 'bg-red-500/20 text-red-400';
      case 'concern': return 'bg-amber-500/20 text-amber-400';
      case 'question': return 'bg-blue-500/20 text-blue-400';
      case 'suggestion': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  }
</script>

<div class="font-mono text-sm" onmouseup={handleMouseUp} onclick={handleClick}>
  {#each lines as line, i}
    {@const lineNum = i + 1}
    {@const markerType = getLineMarkerType(lineNum)}
    {@const lineAnnotations = getLineAnnotations(lineNum)}
    {@const isSelected = selectedLine === lineNum}
    {@const hasAnnotations = lineAnnotations.length > 0}

    <div
      id="line-{lineNum}"
      class="flex group hover:bg-slate-800/50 cursor-pointer relative {isSelected ? 'bg-blue-900/30 ring-1 ring-blue-500/50' : ''}"
      onclick={() => onLineClick(lineNum)}
      ondblclick={() => onLineDoubleClick(lineNum)}
      onkeydown={(e) => e.key === 'Enter' && onLineClick(lineNum)}
      role="button"
      tabindex="0"
    >
      <!-- Line number -->
      <div class="w-12 flex-shrink-0 text-right pr-4 text-slate-500 select-none border-r border-slate-700">
        {lineNum}
      </div>

      <!-- Annotation marker -->
      {#if markerType}
        <button
          class="absolute left-12 w-1 h-full annotation-marker {markerType} border-0 p-0"
          onclick={(e) => handleMarkerClick(lineNum, e)}
          title="{lineAnnotations.length} annotation{lineAnnotations.length > 1 ? 's' : ''}"
          aria-label="View annotations for line {lineNum}"
        ></button>
      {/if}

      <!-- Line content -->
      <div class="flex-1 pl-4 pr-4 py-0.5 whitespace-pre-wrap break-all {hasAnnotations && markerType !== 'resolved' ? 'bg-opacity-10 ' + getBackgroundClass(markerType) : ''}">
        {line || ' '}
      </div>

      <!-- Annotation count badge (on hover) -->
      {#if hasAnnotations}
        <div class="absolute right-2 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="px-2 py-0.5 rounded-full text-xs {getBadgeClass(markerType)}">
            {lineAnnotations.length}
          </span>
        </div>
      {/if}

      <!-- Selection hint (on hover, no annotation) -->
      {#if !hasAnnotations}
        <div class="absolute right-2 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="text-xs text-slate-600">select text to annotate</span>
        </div>
      {/if}
    </div>
  {/each}
</div>
