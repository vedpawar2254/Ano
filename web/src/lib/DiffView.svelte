<script lang="ts">
  import type { Annotation, Approval } from './types';

  interface Props {
    annotations: Annotation[];
    approvals: Approval[];
    previousAnnotations?: Annotation[];
    previousApprovals?: Approval[];
    onAnnotationClick?: (annotation: Annotation) => void;
  }

  let { annotations, approvals, previousAnnotations = [], previousApprovals = [], onAnnotationClick }: Props = $props();

  interface DiffResult {
    added: Annotation[];
    removed: Annotation[];
    resolved: Annotation[];
    reopened: Annotation[];
    newApprovals: Approval[];
  }

  let diff = $derived(() => {
    const oldById = new Map(previousAnnotations.map((a) => [a.id, a]));
    const newById = new Map(annotations.map((a) => [a.id, a]));

    const result: DiffResult = {
      added: [],
      removed: [],
      resolved: [],
      reopened: [],
      newApprovals: [],
    };

    // Find added and status-changed annotations
    for (const ann of annotations) {
      const old = oldById.get(ann.id);
      if (!old) {
        result.added.push(ann);
      } else {
        if (old.status === 'open' && ann.status === 'resolved') {
          result.resolved.push(ann);
        } else if (old.status === 'resolved' && ann.status === 'open') {
          result.reopened.push(ann);
        }
      }
    }

    // Find removed annotations
    for (const ann of previousAnnotations) {
      if (!newById.has(ann.id)) {
        result.removed.push(ann);
      }
    }

    // Find new approvals
    const oldApprovalsByAuthor = new Map(previousApprovals.map((a) => [a.author, a]));
    for (const approval of approvals) {
      const old = oldApprovalsByAuthor.get(approval.author);
      if (!old || old.status !== approval.status || old.timestamp !== approval.timestamp) {
        result.newApprovals.push(approval);
      }
    }

    return result;
  });

  let hasChanges = $derived(() => {
    const d = diff();
    return d.added.length > 0 || d.removed.length > 0 || d.resolved.length > 0 || d.reopened.length > 0 || d.newApprovals.length > 0;
  });

  function getTypeColor(type: string): string {
    switch (type) {
      case 'blocker': return 'text-blocker-text';
      case 'concern': return 'text-concern-text';
      case 'question': return 'text-question-text';
      case 'suggestion': return 'text-suggestion-text';
      default: return 'text-surface-400';
    }
  }
</script>

<div class="space-y-4">
  {#if !hasChanges()}
    <p class="text-surface-600 text-[13px] text-center py-4">
      {previousAnnotations.length === 0 ? 'No previous version to compare' : 'No changes from previous version'}
    </p>
  {:else}
    <!-- Stats Summary -->
    <div class="grid grid-cols-2 gap-2 text-[12px]">
      {#if diff().added.length > 0}
        <div class="bg-suggestion/10 rounded-lg p-2 text-center">
          <div class="text-suggestion-text font-medium">+{diff().added.length}</div>
          <div class="text-surface-500">Added</div>
        </div>
      {/if}
      {#if diff().removed.length > 0}
        <div class="bg-blocker/10 rounded-lg p-2 text-center">
          <div class="text-blocker-text font-medium">-{diff().removed.length}</div>
          <div class="text-surface-500">Removed</div>
        </div>
      {/if}
      {#if diff().resolved.length > 0}
        <div class="bg-surface-800 rounded-lg p-2 text-center">
          <div class="text-suggestion-text font-medium">{diff().resolved.length}</div>
          <div class="text-surface-500">Resolved</div>
        </div>
      {/if}
      {#if diff().reopened.length > 0}
        <div class="bg-concern/10 rounded-lg p-2 text-center">
          <div class="text-concern-text font-medium">{diff().reopened.length}</div>
          <div class="text-surface-500">Reopened</div>
        </div>
      {/if}
    </div>

    <!-- Added Annotations -->
    {#if diff().added.length > 0}
      <div>
        <h4 class="text-[11px] font-medium text-suggestion-text uppercase tracking-wider mb-2">
          + Added ({diff().added.length})
        </h4>
        <div class="space-y-1.5">
          {#each diff().added as ann (ann.id)}
            <button
              class="w-full text-left p-2 rounded-lg bg-suggestion/5 border border-suggestion/20 hover:bg-suggestion/10 transition-colors"
              onclick={() => onAnnotationClick?.(ann)}
            >
              <div class="flex items-center gap-2 text-[11px]">
                <span class="{getTypeColor(ann.type)}">{ann.type}</span>
                <span class="text-surface-600">L{ann.anchor.line}</span>
              </div>
              <p class="text-[12px] text-surface-300 mt-0.5 truncate">{ann.content}</p>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Removed Annotations -->
    {#if diff().removed.length > 0}
      <div>
        <h4 class="text-[11px] font-medium text-blocker-text uppercase tracking-wider mb-2">
          - Removed ({diff().removed.length})
        </h4>
        <div class="space-y-1.5">
          {#each diff().removed as ann (ann.id)}
            <div class="p-2 rounded-lg bg-blocker/5 border border-blocker/20 opacity-60">
              <div class="flex items-center gap-2 text-[11px]">
                <span class="{getTypeColor(ann.type)}">{ann.type}</span>
                <span class="text-surface-600">L{ann.anchor.line}</span>
              </div>
              <p class="text-[12px] text-surface-400 mt-0.5 truncate line-through">{ann.content}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Resolved Annotations -->
    {#if diff().resolved.length > 0}
      <div>
        <h4 class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">
          Resolved ({diff().resolved.length})
        </h4>
        <div class="space-y-1.5">
          {#each diff().resolved as ann (ann.id)}
            <button
              class="w-full text-left p-2 rounded-lg bg-surface-800/50 border border-surface-700 hover:bg-surface-800 transition-colors"
              onclick={() => onAnnotationClick?.(ann)}
            >
              <div class="flex items-center gap-2 text-[11px]">
                <span class="text-suggestion-text">resolved</span>
                <span class="{getTypeColor(ann.type)}">{ann.type}</span>
                <span class="text-surface-600">L{ann.anchor.line}</span>
              </div>
              <p class="text-[12px] text-surface-400 mt-0.5 truncate">{ann.content}</p>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Reopened Annotations -->
    {#if diff().reopened.length > 0}
      <div>
        <h4 class="text-[11px] font-medium text-concern-text uppercase tracking-wider mb-2">
          Reopened ({diff().reopened.length})
        </h4>
        <div class="space-y-1.5">
          {#each diff().reopened as ann (ann.id)}
            <button
              class="w-full text-left p-2 rounded-lg bg-concern/5 border border-concern/20 hover:bg-concern/10 transition-colors"
              onclick={() => onAnnotationClick?.(ann)}
            >
              <div class="flex items-center gap-2 text-[11px]">
                <span class="text-concern-text">reopened</span>
                <span class="{getTypeColor(ann.type)}">{ann.type}</span>
                <span class="text-surface-600">L{ann.anchor.line}</span>
              </div>
              <p class="text-[12px] text-surface-300 mt-0.5 truncate">{ann.content}</p>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- New Approvals -->
    {#if diff().newApprovals.length > 0}
      <div>
        <h4 class="text-[11px] font-medium text-suggestion-text uppercase tracking-wider mb-2">
          New Approvals ({diff().newApprovals.length})
        </h4>
        <div class="space-y-1.5">
          {#each diff().newApprovals as approval}
            <div class="p-2 rounded-lg bg-suggestion/5 border border-suggestion/20">
              <div class="flex items-center gap-2 text-[12px]">
                <span class="text-surface-300 font-medium">{approval.author.split('<')[0].trim()}</span>
                <span class="{approval.status === 'approved' ? 'text-suggestion-text' : 'text-concern-text'}">
                  {approval.status === 'approved' ? 'approved' : 'requested changes'}
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
