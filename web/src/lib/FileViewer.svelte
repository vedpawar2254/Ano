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
    onLineEdit?: (line: number, newContent: string) => void;
  }

  let { content, annotations, selectedLine, onLineClick, onLineDoubleClick, onAnnotationClick, onSelection, onSelectionClear, onLineEdit }: Props = $props();

  let editingLine = $state<number | null>(null);
  let editValue = $state('');

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

  function handleMouseUp(e: MouseEvent) {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      const range = selection?.getRangeAt(0);
      if (range) {
        const startLine = findLineNumber(range.startContainer);
        const endLine = findLineNumber(range.endContainer);

        if (startLine !== null && onSelection) {
          const rect = range.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top;
          const finalEndLine = endLine !== null && endLine !== startLine ? endLine : undefined;
          onSelection(startLine, finalEndLine, x, y, selectedText);
        }
      }
    } else {
      onSelectionClear?.();
    }
  }

  function handleClick() {
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (!selectedText) {
        onSelectionClear?.();
      }
    }, 10);
  }

  let lines = $derived(content.split('\n'));

  function getLineAnnotations(lineNum: number): Annotation[] {
    return annotations.filter(a => {
      const startLine = a.anchor.line;
      const endLine = a.anchor.endLine || a.anchor.line;
      return lineNum >= startLine && lineNum <= endLine;
    });
  }

  function getLineMarkerType(lineNum: number): string | null {
    const lineAnnotations = getLineAnnotations(lineNum);
    if (lineAnnotations.length === 0) return null;

    if (lineAnnotations.some(a => a.type === 'blocker' && a.status === 'open')) return 'blocker';
    if (lineAnnotations.some(a => a.type === 'concern' && a.status === 'open')) return 'concern';
    if (lineAnnotations.some(a => a.type === 'question' && a.status === 'open')) return 'question';
    if (lineAnnotations.some(a => a.type === 'suggestion' && a.status === 'open')) return 'suggestion';
    return 'resolved';
  }

  function handleMarkerClick(lineNum: number, e: MouseEvent) {
    e.stopPropagation();
    const lineAnnotations = getLineAnnotations(lineNum);
    if (lineAnnotations.length > 0) {
      onAnnotationClick(lineAnnotations[0]);
    }
  }

  function getLineBackground(type: string | null): string {
    switch (type) {
      case 'blocker': return 'bg-blocker-light';
      case 'concern': return 'bg-concern-light';
      case 'question': return 'bg-question-light';
      case 'suggestion': return 'bg-suggestion-light';
      default: return '';
    }
  }

  function startEditing(lineNum: number, currentContent: string) {
    editingLine = lineNum;
    editValue = currentContent;
  }

  function saveEdit() {
    if (editingLine !== null && onLineEdit) {
      onLineEdit(editingLine, editValue);
    }
    editingLine = null;
    editValue = '';
  }

  function cancelEdit() {
    editingLine = null;
    editValue = '';
  }

  function handleEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }

  function handleDoubleClick(lineNum: number, lineContent: string, e: MouseEvent) {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      onLineDoubleClick(lineNum);
    } else {
      e.preventDefault();
      e.stopPropagation();
      startEditing(lineNum, lineContent);
    }
  }
</script>

<div class="font-mono text-[13px] leading-6 py-2" onmouseup={handleMouseUp} onclick={handleClick}>
  {#each lines as line, i}
    {@const lineNum = i + 1}
    {@const markerType = getLineMarkerType(lineNum)}
    {@const lineAnnotations = getLineAnnotations(lineNum)}
    {@const isSelected = selectedLine === lineNum}
    {@const hasAnnotations = lineAnnotations.length > 0}
    {@const isEditing = editingLine === lineNum}

    <div
      id="line-{lineNum}"
      class="flex group cursor-pointer relative {isSelected ? 'bg-surface-800/50' : 'hover:bg-surface-900/50'} {isEditing ? 'bg-surface-800/30' : ''}"
      onclick={() => !isEditing && onLineClick(lineNum)}
      ondblclick={(e) => handleDoubleClick(lineNum, line, e)}
      onkeydown={(e) => e.key === 'Enter' && !isEditing && onLineClick(lineNum)}
      role="button"
      tabindex="0"
    >
      <!-- Line number -->
      <div class="w-12 flex-shrink-0 text-right pr-4 text-surface-600 select-none {isEditing ? 'text-surface-400' : ''}">
        {lineNum}
      </div>

      <!-- Annotation marker -->
      {#if markerType && !isEditing}
        <button
          class="annotation-marker h-full {markerType}"
          onclick={(e) => handleMarkerClick(lineNum, e)}
          aria-label="View annotations"
        ></button>
      {/if}

      <!-- Line content -->
      {#if isEditing}
        <div class="flex-1 pl-4 pr-4">
          <input
            type="text"
            bind:value={editValue}
            onkeydown={handleEditKeydown}
            onblur={saveEdit}
            class="w-full bg-transparent border-b border-surface-600 text-surface-100 font-mono text-[13px] focus:outline-none focus:border-surface-400 py-0.5"
            autofocus
          />
        </div>
      {:else}
        <div class="flex-1 pl-4 pr-4 whitespace-pre-wrap break-all {hasAnnotations && markerType !== 'resolved' ? getLineBackground(markerType) : ''} text-surface-200">
          {line || ' '}
        </div>
      {/if}

      <!-- Annotation count (on hover) -->
      {#if hasAnnotations && !isEditing}
        <div class="absolute right-3 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100">
          <span class="text-[11px] text-surface-500">{lineAnnotations.length}</span>
        </div>
      {/if}
    </div>
  {/each}
</div>
