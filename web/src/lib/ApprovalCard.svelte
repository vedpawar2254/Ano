<script lang="ts">
  import type { Approval } from './types';

  interface Props {
    approval: Approval;
  }

  let { approval }: Props = $props();

  function getStatusInfo(status: string): { color: string; text: string } {
    switch (status) {
      case 'approved':
        return { color: 'text-suggestion-text', text: 'Approved' };
      case 'changes_requested':
        return { color: 'text-blocker-text', text: 'Changes requested' };
      default:
        return { color: 'text-surface-500', text: 'Pending' };
    }
  }

  let statusInfo = $derived(getStatusInfo(approval.status));
</script>

<div class="flex items-center gap-3 p-2.5 rounded-lg bg-surface-900/50 border border-surface-800/50">
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
      <span class="text-[13px] text-surface-300 truncate">
        {approval.author.split('<')[0].trim()}
      </span>
      <span class="text-[11px] {statusInfo.color}">{statusInfo.text}</span>
    </div>
    {#if approval.comment}
      <p class="text-[11px] text-surface-500 truncate mt-0.5">
        {approval.comment}
      </p>
    {/if}
  </div>
</div>
