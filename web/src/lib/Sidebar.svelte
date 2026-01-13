<script lang="ts">
  import type { Annotation, Approval } from './types';
  import AnnotationCard from './AnnotationCard.svelte';
  import ApprovalCard from './ApprovalCard.svelte';

  interface Props {
    annotations: Annotation[];
    approvals: Approval[];
    selectedAnnotation: Annotation | null;
    onAnnotationClick: (annotation: Annotation) => void;
    onResolve: (annotationId: string) => void;
  }

  let { annotations, approvals, selectedAnnotation, onAnnotationClick, onResolve }: Props = $props();

  // Filter state
  let filter = $state<'all' | 'open' | 'blockers'>('all');

  // Filtered annotations
  let filteredAnnotations = $derived(() => {
    switch (filter) {
      case 'open':
        return annotations.filter(a => a.status === 'open');
      case 'blockers':
        return annotations.filter(a => a.type === 'blocker' && a.status === 'open');
      default:
        return annotations;
    }
  });

  // Sort by line number
  let sortedAnnotations = $derived(
    [...filteredAnnotations()].sort((a, b) => a.anchor.line - b.anchor.line)
  );
</script>

<div class="flex flex-col h-full">
  <!-- Tabs / Filters -->
  <div class="flex border-b border-slate-700">
    <button
      class="flex-1 px-4 py-3 text-sm font-medium transition-colors {filter === 'all' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}"
      onclick={() => filter = 'all'}
    >
      All ({annotations.length})
    </button>
    <button
      class="flex-1 px-4 py-3 text-sm font-medium transition-colors {filter === 'open' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}"
      onclick={() => filter = 'open'}
    >
      Open ({annotations.filter(a => a.status === 'open').length})
    </button>
    <button
      class="flex-1 px-4 py-3 text-sm font-medium transition-colors {filter === 'blockers' ? 'text-red-400 border-b-2 border-red-400' : 'text-slate-400 hover:text-slate-200'}"
      onclick={() => filter = 'blockers'}
    >
      Blockers ({annotations.filter(a => a.type === 'blocker' && a.status === 'open').length})
    </button>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-auto">
    <!-- Approvals Section -->
    {#if approvals.length > 0}
      <div class="p-4 border-b border-slate-700">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Approvals
        </h3>
        <div class="space-y-2">
          {#each approvals as approval}
            <ApprovalCard {approval} />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Annotations Section -->
    <div class="p-4">
      <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Annotations
      </h3>

      {#if sortedAnnotations.length === 0}
        <p class="text-slate-500 text-sm text-center py-8">
          No annotations{filter !== 'all' ? ' matching filter' : ''}
        </p>
      {:else}
        <div class="space-y-3">
          {#each sortedAnnotations as annotation (annotation.id)}
            <AnnotationCard
              {annotation}
              isSelected={selectedAnnotation?.id === annotation.id}
              onClick={() => onAnnotationClick(annotation)}
              onResolve={onResolve}
            />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
