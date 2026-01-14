<script lang="ts">
  import type { AnnotationType } from './types';

  interface Props {
    line: number;
    endLine?: number;
    selectedText?: string;
    onSubmit: (line: number, content: string, type: AnnotationType, endLine?: number) => void;
    onCancel: () => void;
  }

  let { line, endLine, selectedText, onSubmit, onCancel }: Props = $props();

  let content = $state('');
  let type = $state<AnnotationType>('concern');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(line, content.trim(), type, endLine);
    }
  }

  const types: { value: AnnotationType; label: string }[] = [
    { value: 'concern', label: 'C' },
    { value: 'question', label: 'Q' },
    { value: 'suggestion', label: 'S' },
    { value: 'blocker', label: 'B' },
  ];

  function getTypeColor(t: AnnotationType): string {
    switch (t) {
      case 'blocker': return 'bg-blocker text-white';
      case 'concern': return 'bg-concern text-white';
      case 'question': return 'bg-question text-white';
      case 'suggestion': return 'bg-suggestion text-white';
    }
  }

  let lineDisplay = $derived(endLine && endLine !== line ? `${line}-${endLine}` : `${line}`);

  let displayText = $derived(() => {
    if (!selectedText) return '';
    const text = selectedText.trim();
    if (text.length > 50) return text.slice(0, 47) + '...';
    return text;
  });
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onCancel()} />

<div
  class="fixed z-50 bg-surface-900 rounded-xl border border-surface-800 w-72 shadow-2xl"
  style="left: 50%; top: 40%; transform: translate(-50%, -50%);"
  role="dialog"
  aria-modal="true"
>
  <div class="p-4">
    <!-- Selected text preview -->
    {#if selectedText}
      <div class="mb-3 px-2.5 py-2 bg-surface-950 rounded-lg border-l-2 border-surface-600">
        <p class="text-[11px] text-surface-500 truncate">"{displayText()}"</p>
      </div>
    {/if}

    <!-- Header -->
    <div class="flex items-center gap-2 mb-3">
      <span class="text-[11px] text-surface-500 font-mono">L{lineDisplay}</span>
      <div class="flex gap-1.5 flex-1">
        {#each types as t}
          <button
            type="button"
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all {type === t.value
              ? getTypeColor(t.value)
              : 'bg-surface-800 text-surface-500 hover:bg-surface-700'}"
            onclick={() => type = t.value}
          >
            {t.label}
          </button>
        {/each}
      </div>
      <button
        type="button"
        class="text-surface-600 hover:text-surface-400 transition-colors"
        onclick={onCancel}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Input -->
    <form onsubmit={handleSubmit} class="flex gap-2">
      <input
        type="text"
        bind:value={content}
        class="flex-1 px-3 py-2 bg-surface-950 border border-surface-800 rounded-lg text-[13px] text-surface-200 placeholder-surface-600 focus:outline-none focus:border-surface-600"
        placeholder="Add comment..."
        autofocus
      />
      <button
        type="submit"
        class="px-3 py-2 text-[13px] font-medium bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={!content.trim()}
      >
        Add
      </button>
    </form>
  </div>
</div>
