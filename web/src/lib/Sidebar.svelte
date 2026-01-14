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

  let filter = $state<'all' | 'open' | 'blockers'>('all');

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

  let sortedAnnotations = $derived(
    [...filteredAnnotations()].sort((a, b) => a.anchor.line - b.anchor.line)
  );
</script>

<div class="flex flex-col h-full">
  <!-- Tabs -->
  <div class="flex border-b border-surface-800/50 px-4">
    <button
      class="px-3 py-3 text-[13px] transition-colors {filter === 'all'
        ? 'text-surface-200 border-b border-surface-400'
        : 'text-surface-500 hover:text-surface-300'}"
      onclick={() => filter = 'all'}
    >
      All
    </button>
    <button
      class="px-3 py-3 text-[13px] transition-colors {filter === 'open'
        ? 'text-surface-200 border-b border-surface-400'
        : 'text-surface-500 hover:text-surface-300'}"
      onclick={() => filter = 'open'}
    >
      Open
    </button>
    <button
      class="px-3 py-3 text-[13px] transition-colors {filter === 'blockers'
        ? 'text-blocker-text border-b border-blocker'
        : 'text-surface-500 hover:text-surface-300'}"
      onclick={() => filter = 'blockers'}
    >
      Blockers
    </button>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-auto p-4">
    <!-- Approvals -->
    {#if approvals.length > 0}
      <div class="mb-6">
        <h3 class="text-[11px] font-medium text-surface-500 uppercase tracking-wider mb-3">
          Approvals
        </h3>
        <div class="space-y-2">
          {#each approvals as approval}
            <ApprovalCard {approval} />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Annotations -->
    <div>
      {#if sortedAnnotations.length === 0}
        <p class="text-surface-600 text-[13px] text-center py-8">
          No annotations
        </p>
      {:else}
        <div class="space-y-2">
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
