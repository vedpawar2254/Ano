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

  // Format timestamp
  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'just now';
  }

  // Get type badge class
  function getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'blocker': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'concern': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'question': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'suggestion': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  }

  // Get border class
  function getBorderClass(type: string, isResolved: boolean): string {
    if (isResolved) return 'border-slate-600';
    switch (type) {
      case 'blocker': return 'border-red-500/50';
      case 'concern': return 'border-amber-500/50';
      case 'question': return 'border-blue-500/50';
      case 'suggestion': return 'border-green-500/50';
      default: return 'border-slate-600';
    }
  }
</script>

<div
  class="w-full text-left p-3 rounded-lg border transition-all cursor-pointer {getBorderClass(annotation.type, annotation.status === 'resolved')} {isSelected ? 'ring-2 ring-blue-500 bg-slate-800' : 'bg-slate-800/50 hover:bg-slate-800'} {annotation.status === 'resolved' ? 'opacity-60' : ''}"
  onclick={onClick}
  onkeydown={(e) => e.key === 'Enter' && onClick()}
  role="button"
  tabindex="0"
>
  <!-- Header -->
  <div class="flex items-center justify-between mb-2">
    <div class="flex items-center gap-2">
      <!-- Type badge -->
      <span class="px-2 py-0.5 text-xs font-medium rounded border {getTypeBadgeClass(annotation.type)}">
        {annotation.type}
      </span>
      <!-- Line number -->
      <span class="text-xs text-slate-500">
        L{annotation.anchor.line}
      </span>
    </div>
    <!-- Status -->
    {#if annotation.status === 'resolved'}
      <span class="text-xs text-green-500">✓ resolved</span>
    {/if}
  </div>

  <!-- Content -->
  <p class="text-sm text-slate-300 mb-2 line-clamp-3">
    {annotation.content}
  </p>

  <!-- Footer -->
  <div class="flex items-center justify-between text-xs text-slate-500">
    <span>{annotation.author.split('<')[0].trim()}</span>
    <span>{formatTime(annotation.timestamp)}</span>
  </div>

  <!-- Replies count -->
  {#if annotation.replies.length > 0}
    <div class="mt-2 pt-2 border-t border-slate-700">
      <span class="text-xs text-slate-400">
        {annotation.replies.length} repl{annotation.replies.length === 1 ? 'y' : 'ies'}
      </span>
    </div>
  {/if}

  <!-- Resolve button (for open annotations) -->
  {#if annotation.status === 'open' && onResolve}
    <div class="mt-2 pt-2 border-t border-slate-700">
      <button
        class="w-full px-3 py-1.5 text-xs font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition-colors border border-green-600/30"
        onclick={handleResolve}
      >
        Mark as Resolved
      </button>
    </div>
  {/if}
</div>
