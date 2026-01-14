<script lang="ts">
  import type { Annotation, Reply } from './types';

  interface Props {
    annotation: Annotation;
    isSelected: boolean;
    onClick: () => void;
    onResolve?: (id: string) => void;
    onReopen?: (id: string) => void;
    onDelete?: (id: string) => void;
    onReply?: (id: string, content: string) => void;
  }

  let { annotation, isSelected, onClick, onResolve, onReopen, onDelete, onReply }: Props = $props();

  let replyContent = $state('');
  let showReplyInput = $state(false);

  function handleResolve(e: MouseEvent) {
    e.stopPropagation();
    onResolve?.(annotation.id);
  }

  function handleReopen(e: MouseEvent) {
    e.stopPropagation();
    onReopen?.(annotation.id);
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    onDelete?.(annotation.id);
  }

  function handleReplySubmit(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (replyContent.trim()) {
      onReply?.(annotation.id, replyContent.trim());
      replyContent = '';
      showReplyInput = false;
    }
  }

  function toggleReplyInput(e: MouseEvent) {
    e.stopPropagation();
    showReplyInput = !showReplyInput;
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
  class="w-full text-left rounded-lg border transition-all cursor-pointer {getBorderColor(annotation.type, annotation.status === 'resolved')} {isSelected ? 'bg-surface-800' : 'bg-surface-900/50 hover:bg-surface-800/50'} {annotation.status === 'resolved' ? 'opacity-50' : ''}"
  onclick={onClick}
  onkeydown={(e) => e.key === 'Enter' && onClick()}
  role="button"
  tabindex="0"
>
  <div class="p-3">
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
    <p class="text-[13px] text-surface-300 mb-2 {isSelected ? '' : 'line-clamp-2'}">
      {annotation.content}
    </p>

    <!-- Footer -->
    <div class="flex items-center justify-between text-[11px] text-surface-600">
      <span>{annotation.author.split('<')[0].trim()}</span>
      <span>{formatTime(annotation.timestamp)}</span>
    </div>
  </div>

  <!-- Expanded view when selected -->
  {#if isSelected}
    <!-- Replies -->
    {#if annotation.replies && annotation.replies.length > 0}
      <div class="border-t border-surface-800 px-3 py-2">
        <div class="space-y-2">
          {#each annotation.replies as reply}
            <div class="pl-3 border-l-2 border-surface-700">
              <p class="text-[12px] text-surface-300">{reply.content}</p>
              <div class="flex items-center gap-2 mt-1 text-[10px] text-surface-600">
                <span>{reply.author.split('<')[0].trim()}</span>
                <span>{formatTime(reply.timestamp)}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Reply input -->
    {#if showReplyInput}
      <div class="border-t border-surface-800 p-3" onclick={(e) => e.stopPropagation()}>
        <form onsubmit={handleReplySubmit} class="flex gap-2">
          <input
            type="text"
            bind:value={replyContent}
            class="flex-1 px-2.5 py-1.5 bg-surface-950 border border-surface-800 rounded text-[12px] text-surface-200 placeholder-surface-600 focus:outline-none focus:border-surface-600"
            placeholder="Add reply..."
            autofocus
          />
          <button
            type="submit"
            class="px-2.5 py-1.5 text-[11px] font-medium bg-surface-700 hover:bg-surface-600 text-surface-200 rounded transition-colors disabled:opacity-30"
            disabled={!replyContent.trim()}
          >
            Reply
          </button>
        </form>
      </div>
    {/if}

    <!-- Actions -->
    <div class="border-t border-surface-800 px-3 py-2 flex items-center gap-3">
      {#if onReply}
        <button
          class="text-[11px] text-surface-500 hover:text-surface-300 transition-colors"
          onclick={toggleReplyInput}
        >
          {showReplyInput ? 'Cancel' : 'Reply'}
        </button>
      {/if}

      {#if annotation.status === 'open' && onResolve}
        <button
          class="text-[11px] text-surface-500 hover:text-suggestion-text transition-colors"
          onclick={handleResolve}
        >
          Resolve
        </button>
      {/if}

      {#if annotation.status === 'resolved' && onReopen}
        <button
          class="text-[11px] text-surface-500 hover:text-concern-text transition-colors"
          onclick={handleReopen}
        >
          Reopen
        </button>
      {/if}

      {#if onDelete}
        <button
          class="text-[11px] text-surface-500 hover:text-blocker-text transition-colors ml-auto"
          onclick={handleDelete}
        >
          Delete
        </button>
      {/if}
    </div>
  {:else}
    <!-- Compact resolve button when not selected -->
    {#if annotation.status === 'open' && onResolve}
      <button
        class="w-full pt-2 pb-3 px-3 border-t border-surface-800 text-[11px] text-surface-500 hover:text-suggestion-text transition-colors text-left"
        onclick={handleResolve}
      >
        Resolve
      </button>
    {/if}
  {/if}
</div>
