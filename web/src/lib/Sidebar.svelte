<script lang="ts">
  import type { Annotation, Approval } from './types';
  import AnnotationCard from './AnnotationCard.svelte';
  import ApprovalCard from './ApprovalCard.svelte';
  import ActivityFeed from './ActivityFeed.svelte';
  import DiffView from './DiffView.svelte';

  interface Props {
    annotations: Annotation[];
    approvals: Approval[];
    selectedAnnotation: Annotation | null;
    onAnnotationClick: (annotation: Annotation) => void;
    onResolve: (annotationId: string) => void;
    onReopen?: (annotationId: string) => void;
    onDelete?: (annotationId: string) => void;
    onReply?: (annotationId: string, content: string) => void;
    previousAnnotations?: Annotation[];
    previousApprovals?: Approval[];
  }

  let { annotations, approvals, selectedAnnotation, onAnnotationClick, onResolve, onReopen, onDelete, onReply, previousAnnotations = [], previousApprovals = [] }: Props = $props();

  let filter = $state<'all' | 'open' | 'blockers'>('all');
  let searchQuery = $state('');
  let viewMode = $state<'annotations' | 'activity' | 'changes'>('annotations');

  let filteredAnnotations = $derived(() => {
    let result = annotations;

    // Filter by status/type
    switch (filter) {
      case 'open':
        result = result.filter(a => a.status === 'open');
        break;
      case 'blockers':
        result = result.filter(a => a.type === 'blocker' && a.status === 'open');
        break;
    }

    // Filter by search query (author or content)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.author.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query)
      );
    }

    return result;
  });

  let sortedAnnotations = $derived(
    [...filteredAnnotations()].sort((a, b) => a.anchor.line - b.anchor.line)
  );

  let stats = $derived({
    total: annotations.length,
    open: annotations.filter(a => a.status === 'open').length,
    blockers: annotations.filter(a => a.type === 'blocker' && a.status === 'open').length
  });
</script>

<div class="flex flex-col h-full">
  <!-- View Mode Toggle -->
  <div class="px-4 pt-4 pb-2 flex gap-1">
    <button
      class="flex-1 py-1.5 text-[12px] font-medium rounded-lg transition-colors {viewMode === 'annotations'
        ? 'bg-surface-800 text-surface-200'
        : 'text-surface-500 hover:text-surface-300'}"
      onclick={() => viewMode = 'annotations'}
    >
      Annotations
    </button>
    <button
      class="flex-1 py-1.5 text-[12px] font-medium rounded-lg transition-colors {viewMode === 'activity'
        ? 'bg-surface-800 text-surface-200'
        : 'text-surface-500 hover:text-surface-300'}"
      onclick={() => viewMode = 'activity'}
    >
      Activity
    </button>
    <button
      class="flex-1 py-1.5 text-[12px] font-medium rounded-lg transition-colors {viewMode === 'changes'
        ? 'bg-surface-800 text-surface-200'
        : 'text-surface-500 hover:text-surface-300'}"
      onclick={() => viewMode = 'changes'}
    >
      Changes
    </button>
  </div>

  {#if viewMode === 'annotations'}
  <!-- Search -->
  <div class="px-4 pt-2 pb-3">
    <input
      type="text"
      bind:value={searchQuery}
      class="w-full px-3 py-2 bg-surface-900 border border-surface-800 rounded-lg text-[13px] text-surface-200 placeholder-surface-600 focus:outline-none focus:border-surface-600"
      placeholder="Search annotations..."
    />
  </div>

  <!-- Tabs -->
  <div class="flex border-b border-surface-800/50 px-4">
    <button
      class="px-3 py-3 text-[13px] transition-colors {filter === 'all'
        ? 'text-surface-200 border-b border-surface-400'
        : 'text-surface-500 hover:text-surface-300'}"
      onclick={() => filter = 'all'}
    >
      All <span class="text-surface-600 ml-1">{stats.total}</span>
    </button>
    <button
      class="px-3 py-3 text-[13px] transition-colors {filter === 'open'
        ? 'text-surface-200 border-b border-surface-400'
        : 'text-surface-500 hover:text-surface-300'}"
      onclick={() => filter = 'open'}
    >
      Open <span class="text-surface-600 ml-1">{stats.open}</span>
    </button>
    <button
      class="px-3 py-3 text-[13px] transition-colors {filter === 'blockers'
        ? 'text-blocker-text border-b border-blocker'
        : 'text-surface-500 hover:text-surface-300'}"
      onclick={() => filter = 'blockers'}
    >
      Blockers <span class="text-surface-600 ml-1">{stats.blockers}</span>
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
          {searchQuery ? 'No matches' : 'No annotations'}
        </p>
      {:else}
        <div class="space-y-2">
          {#each sortedAnnotations as annotation (annotation.id)}
            <AnnotationCard
              {annotation}
              isSelected={selectedAnnotation?.id === annotation.id}
              onClick={() => onAnnotationClick(annotation)}
              onResolve={onResolve}
              onReopen={onReopen}
              onDelete={onDelete}
              onReply={onReply}
            />
          {/each}
        </div>
      {/if}
    </div>
  </div>
  {:else if viewMode === 'activity'}
  <!-- Activity Feed View -->
  <div class="flex-1 overflow-auto p-4">
    <h3 class="text-[11px] font-medium text-surface-500 uppercase tracking-wider mb-3">
      Recent Activity
    </h3>
    <ActivityFeed {annotations} {approvals} onAnnotationClick={onAnnotationClick} />
  </div>
  {:else}
  <!-- Changes/Diff View -->
  <div class="flex-1 overflow-auto p-4">
    <h3 class="text-[11px] font-medium text-surface-500 uppercase tracking-wider mb-3">
      Changes Since Load
    </h3>
    <DiffView
      {annotations}
      {approvals}
      {previousAnnotations}
      {previousApprovals}
      onAnnotationClick={onAnnotationClick}
    />
  </div>
  {/if}
</div>
