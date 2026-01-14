<script lang="ts">
  import { marked } from 'marked';

  interface Props {
    content: string;
    class?: string;
  }

  let { content, class: className = '' }: Props = $props();

  // Configure marked for inline rendering (no block elements for short content)
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  let html = $derived(marked.parse(content, { async: false }) as string);
</script>

<div class="markdown {className}">
  {@html html}
</div>

<style>
  .markdown :global(p) {
    margin: 0;
  }
  .markdown :global(p + p) {
    margin-top: 0.5em;
  }
  .markdown :global(code) {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.1em 0.3em;
    border-radius: 3px;
    font-size: 0.9em;
  }
  .markdown :global(pre) {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.5em;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.5em 0;
  }
  .markdown :global(pre code) {
    background: none;
    padding: 0;
  }
  .markdown :global(a) {
    color: #60a5fa;
    text-decoration: underline;
  }
  .markdown :global(ul), .markdown :global(ol) {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }
  .markdown :global(blockquote) {
    border-left: 3px solid #475569;
    padding-left: 0.75em;
    margin: 0.5em 0;
    color: #94a3b8;
  }
  .markdown :global(strong) {
    font-weight: 600;
  }
  .markdown :global(em) {
    font-style: italic;
  }
</style>
