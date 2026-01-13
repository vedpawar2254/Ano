<script lang="ts">
  import type { Approval } from './types';

  interface Props {
    approval: Approval;
  }

  let { approval }: Props = $props();

  // Get status info
  function getStatusInfo(status: string): { icon: string; color: string; text: string } {
    switch (status) {
      case 'approved':
        return { icon: '✓', color: 'text-green-500', text: 'Approved' };
      case 'changes_requested':
        return { icon: '✗', color: 'text-red-500', text: 'Changes Requested' };
      default:
        return { icon: '○', color: 'text-slate-400', text: 'Pending' };
    }
  }

  let statusInfo = $derived(getStatusInfo(approval.status));
</script>

<div class="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
  <!-- Status icon -->
  <span class="text-lg {statusInfo.color}">{statusInfo.icon}</span>

  <!-- Info -->
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
      <span class="text-sm text-slate-200 truncate">
        {approval.author.split('<')[0].trim()}
      </span>
      {#if approval.title}
        <span class="text-xs text-slate-500">({approval.title})</span>
      {/if}
    </div>
    {#if approval.comment}
      <p class="text-xs text-slate-400 truncate mt-0.5">
        "{approval.comment}"
      </p>
    {/if}
  </div>
</div>
