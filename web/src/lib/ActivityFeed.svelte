<script lang="ts">
  import type { Annotation, Approval } from './types';

  interface Props {
    annotations: Annotation[];
    approvals: Approval[];
    onAnnotationClick?: (annotation: Annotation) => void;
  }

  let { annotations, approvals, onAnnotationClick }: Props = $props();

  interface ActivityItem {
    id: string;
    type: 'annotation' | 'approval' | 'resolve' | 'reply';
    timestamp: string;
    author: string;
    content: string;
    annotationType?: string;
    line?: number;
    annotation?: Annotation;
  }

  let activityItems = $derived(() => {
    const items: ActivityItem[] = [];

    // Add annotations
    for (const ann of annotations) {
      items.push({
        id: `ann-${ann.id}`,
        type: 'annotation',
        timestamp: ann.timestamp,
        author: ann.author.split('<')[0].trim(),
        content: ann.content.slice(0, 100) + (ann.content.length > 100 ? '...' : ''),
        annotationType: ann.type,
        line: ann.anchor.line,
        annotation: ann,
      });

      // Add replies
      if (ann.replies) {
        for (const reply of ann.replies) {
          items.push({
            id: `reply-${reply.id}`,
            type: 'reply',
            timestamp: reply.timestamp,
            author: reply.author.split('<')[0].trim(),
            content: reply.content.slice(0, 100) + (reply.content.length > 100 ? '...' : ''),
            line: ann.anchor.line,
            annotation: ann,
          });
        }
      }
    }

    // Add approvals
    for (const approval of approvals) {
      items.push({
        id: `approval-${approval.author}-${approval.timestamp}`,
        type: 'approval',
        timestamp: approval.timestamp,
        author: approval.author.split('<')[0].trim(),
        content: approval.status === 'approved' ? 'Approved' : 'Requested changes',
      });
    }

    // Sort by timestamp (newest first)
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  function getTypeIcon(type: string): string {
    switch (type) {
      case 'annotation': return '+';
      case 'reply': return '↳';
      case 'approval': return '✓';
      case 'resolve': return '✓';
      default: return '•';
    }
  }

  function getTypeColor(type: string, annotationType?: string): string {
    if (type === 'approval') return 'text-suggestion-text';
    if (type === 'reply') return 'text-surface-400';
    switch (annotationType) {
      case 'blocker': return 'text-blocker-text';
      case 'concern': return 'text-concern-text';
      case 'question': return 'text-question-text';
      case 'suggestion': return 'text-suggestion-text';
      default: return 'text-surface-400';
    }
  }
</script>

<div class="space-y-2">
  {#if activityItems().length === 0}
    <p class="text-surface-600 text-[13px] text-center py-4">No recent activity</p>
  {:else}
    {#each activityItems().slice(0, 20) as item (item.id)}
      <div
        class="p-2.5 rounded-lg bg-surface-900/50 hover:bg-surface-800/50 transition-colors {item.annotation ? 'cursor-pointer' : ''}"
        onclick={() => item.annotation && onAnnotationClick?.(item.annotation)}
        onkeydown={(e) => e.key === 'Enter' && item.annotation && onAnnotationClick?.(item.annotation)}
        role={item.annotation ? 'button' : undefined}
        tabindex={item.annotation ? 0 : undefined}
      >
        <div class="flex items-start gap-2">
          <span class="text-[12px] {getTypeColor(item.type, item.annotationType)} font-mono flex-shrink-0">
            {getTypeIcon(item.type)}
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 text-[11px]">
              <span class="text-surface-300 font-medium">{item.author}</span>
              {#if item.type === 'annotation' && item.annotationType}
                <span class="text-surface-600">added</span>
                <span class="{getTypeColor(item.type, item.annotationType)}">{item.annotationType}</span>
              {:else if item.type === 'reply'}
                <span class="text-surface-600">replied</span>
              {:else if item.type === 'approval'}
                <span class="text-surface-600">{item.content.toLowerCase()}</span>
              {/if}
              {#if item.line}
                <span class="text-surface-600">L{item.line}</span>
              {/if}
            </div>
            {#if item.type !== 'approval'}
              <p class="text-[12px] text-surface-400 mt-0.5 truncate">{item.content}</p>
            {/if}
            <span class="text-[10px] text-surface-600 mt-0.5 block">{formatTime(item.timestamp)}</span>
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>
