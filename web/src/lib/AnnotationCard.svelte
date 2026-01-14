<script lang="ts">
  import type { Annotation } from './types';

  interface Props {
    annotation: Annotation;
    isSelected: boolean;
    onClick: () => void;
    onResolve?: (id: string) => void;
  }

  let { annotation, isSelected, onClick, onResolve }: Props = $props();

  function handleResolve(e: MouseEvent) {
    e.stopPropagation();
    onResolve?.(annotation.id);
  }

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'now';
  }

  function getTypeColor(type: string): string {
    switch (type) {
      case 'blocker': return 'text-blocker-text';
      case 'concern': return 'text-concern-text';
      case 'question': return 'text-question-text';
      case 'suggestion': return 'text-suggestion-text';
      default: return 'text-surface-400';
    }
  }

  function getBorderColor(type: string, isResolved: boolean): string {
    if (isResolved) return 'border-surface-800';
    switch (type) {
      case 'blocker': return 'border-blocker/30';
      case 'concern': return 'border-concern/30';
      case 'question': return 'border-question/30';
      case 'suggestion': return 'border-suggestion/30';
      default: return 'border-surface-800';
    }
  }
</script>

<div
  class="w-full text-left p-3 rounded-lg border transition-all cursor-pointer {getBorderColor(annotation.type, annotation.status === 'resolved')} {isSelected ? 'bg-surface-800' : 'bg-surface-900/50 hover:bg-surface-800/50'} {annotation.status === 'resolved' ? 'opacity-50' : ''}"
  onclick={onClick}
  onkeydown={(e) => e.key === 'Enter' && onClick()}
  role="button"
  tabindex="0"
>
  <!-- Header -->
  <div class="flex items-center justify-between mb-1.5">
    <div class="flex items-center gap-2">
      <span class="text-[11px] font-medium {getTypeColor(annotation.type)}">
        {annotation.type}
      </span>
      <span class="text-[11px] text-surface-600">
        L{annotation.anchor.line}{annotation.anchor.endLine && annotation.anchor.endLine !== annotation.anchor.line ? `-${annotation.anchor.endLine}` : ''}
      </span>
    </div>
    {#if annotation.status === 'resolved'}
      <span class="text-[11px] text-suggestion-text">resolved</span>
    {/if}
  </div>

  <!-- Content -->
  <p class="text-[13px] text-surface-300 mb-2 line-clamp-2">
    {annotation.content}
  </p>

  <!-- Footer -->
  <div class="flex items-center justify-between text-[11px] text-surface-600">
    <span>{annotation.author.split('<')[0].trim()}</span>
    <span>{formatTime(annotation.timestamp)}</span>
  </div>

  <!-- Resolve button -->
  {#if annotation.status === 'open' && onResolve}
    <button
      class="w-full mt-2 pt-2 border-t border-surface-800 text-[11px] text-surface-500 hover:text-suggestion-text transition-colors text-left"
      onclick={handleResolve}
    >
      Resolve
    </button>
  {/if}
</div>
