<script lang="ts">
  import type { AnnotationType } from './types';

  interface Props {
    line: number;
    endLine?: number;
    onSubmit: (line: number, content: string, type: AnnotationType, endLine?: number) => void;
    onCancel: () => void;
  }

  let { line, endLine, onSubmit, onCancel }: Props = $props();

  let content = $state('');
  let type = $state<AnnotationType>('concern');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(line, content.trim(), type, endLine);
    }
  }

  const types: { value: AnnotationType; label: string; color: string }[] = [
    { value: 'concern', label: 'C', color: 'bg-amber-500' },
    { value: 'question', label: 'Q', color: 'bg-blue-500' },
    { value: 'suggestion', label: 'S', color: 'bg-green-500' },
    { value: 'blocker', label: 'B', color: 'bg-red-500' },
  ];

  // Line display
  let lineDisplay = $derived(endLine && endLine !== line ? `${line}-${endLine}` : `${line}`);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onCancel()} />

<!-- Backdrop -->
<div
  class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
  onclick={onCancel}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
  onkeydown={(e) => e.key === 'Escape' && onCancel()}
>
  <!-- Modal -->
  <div
    class="bg-slate-800/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-600/50 w-72"
    onclick={(e) => e.stopPropagation()}
    role="presentation"
  >
    <div class="p-3">
      <!-- Header row -->
      <div class="flex items-center gap-2 mb-2.5">
        <span class="text-[11px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">L{lineDisplay}</span>
        <div class="flex gap-1 flex-1">
          {#each types as t}
            <button
              type="button"
              class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all {type === t.value
                ? t.color + ' text-white shadow-lg scale-110'
                : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'}"
              onclick={() => type = t.value}
              title={t.label === 'C' ? 'Concern' : t.label === 'Q' ? 'Question' : t.label === 'S' ? 'Suggestion' : 'Blocker'}
            >
              {t.label}
            </button>
          {/each}
        </div>
        <button type="button" class="text-slate-500 hover:text-slate-300 w-5 h-5 flex items-center justify-center rounded hover:bg-slate-700/50" onclick={onCancel}>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Input -->
      <form onsubmit={handleSubmit} class="flex gap-2">
        <input
          type="text"
          bind:value={content}
          class="flex-1 px-2.5 py-1.5 bg-slate-900/80 border border-slate-600/50 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          placeholder="Add comment..."
        />
        <button
          type="submit"
          class="px-2.5 py-1.5 text-[10px] font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-30"
          disabled={!content.trim()}
        >
          +
        </button>
      </form>
    </div>
  </div>
</div>
