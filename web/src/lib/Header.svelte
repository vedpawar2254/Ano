<script lang="ts">
  import type { AnnotationFile } from './types';

  interface Props {
    fileName: string;
    annotationData: AnnotationFile | null;
  }

  let { fileName, annotationData }: Props = $props();

  // Compute stats
  let stats = $derived(() => {
    if (!annotationData) return { open: 0, resolved: 0, blockers: 0, approvals: 0 };
    const annotations = annotationData.annotations;
    return {
      open: annotations.filter(a => a.status === 'open').length,
      resolved: annotations.filter(a => a.status === 'resolved').length,
      blockers: annotations.filter(a => a.type === 'blocker' && a.status === 'open').length,
      approvals: annotationData.approvals.filter(a => a.status === 'approved').length
    };
  });
</script>

<header class="bg-slate-800 border-b border-slate-700 px-4 py-3">
  <div class="flex items-center justify-between">
    <!-- Logo and file name -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-xl font-bold text-blue-400">ano</span>
      </div>
      <div class="h-6 w-px bg-slate-600"></div>
      <span class="text-slate-300 font-mono text-sm">{fileName || 'No file loaded'}</span>
    </div>

    <!-- Stats -->
    <div class="flex items-center gap-6">
      <!-- Open annotations -->
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        <span class="text-sm text-slate-400">
          <span class="text-slate-200 font-medium">{stats().open}</span> open
        </span>
      </div>

      <!-- Blockers -->
      {#if stats().blockers > 0}
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-500"></span>
          <span class="text-sm text-red-400">
            <span class="font-medium">{stats().blockers}</span> blocker{stats().blockers !== 1 ? 's' : ''}
          </span>
        </div>
      {/if}

      <!-- Approvals -->
      <div class="flex items-center gap-2">
        <span class="text-green-500">✓</span>
        <span class="text-sm text-slate-400">
          <span class="text-slate-200 font-medium">{stats().approvals}</span> approval{stats().approvals !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  </div>
</header>
