<script lang="ts">
  import type { AnnotationFile } from './types';

  interface FileInfo {
    path: string;
    name: string;
    openAnnotations: number;
    isCurrent: boolean;
  }

  interface Props {
    fileName: string;
    fileContent: string;
    annotationData: AnnotationFile | null;
    files?: FileInfo[];
    onExport?: () => void;
    onFileSwitch?: (filePath: string) => void;
  }

  let { fileName, fileContent, annotationData, files = [], onExport, onFileSwitch }: Props = $props();

  let copied = $state(false);
  let shareLink = $state('');
  let sharing = $state(false);
  let showMenu = $state(false);

  function formatForClaude(): string {
    if (!annotationData || !fileContent) return '';

    const lines = fileContent.split('\n');
    let output = `# Annotations for ${fileName}\n\n`;

    const openAnnotations = annotationData.annotations.filter(a => a.status === 'open');
    const blockers = openAnnotations.filter(a => a.type === 'blocker');
    const concerns = openAnnotations.filter(a => a.type === 'concern');
    const questions = openAnnotations.filter(a => a.type === 'question');
    const suggestions = openAnnotations.filter(a => a.type === 'suggestion');

    if (blockers.length > 0) {
      output += `## Blockers (${blockers.length})\n\n`;
      for (const a of blockers) {
        const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
        const lineContent = lines[a.anchor.line - 1] || '';
        output += `### ${lineRef}: ${a.content}\n`;
        output += `> \`${lineContent.trim()}\`\n`;
        output += `— ${a.author.split('<')[0].trim()}\n\n`;
      }
    }

    if (concerns.length > 0) {
      output += `## Concerns (${concerns.length})\n\n`;
      for (const a of concerns) {
        const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
        const lineContent = lines[a.anchor.line - 1] || '';
        output += `### ${lineRef}: ${a.content}\n`;
        output += `> \`${lineContent.trim()}\`\n`;
        output += `— ${a.author.split('<')[0].trim()}\n\n`;
      }
    }

    if (questions.length > 0) {
      output += `## Questions (${questions.length})\n\n`;
      for (const a of questions) {
        const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
        const lineContent = lines[a.anchor.line - 1] || '';
        output += `### ${lineRef}: ${a.content}\n`;
        output += `> \`${lineContent.trim()}\`\n`;
        output += `— ${a.author.split('<')[0].trim()}\n\n`;
      }
    }

    if (suggestions.length > 0) {
      output += `## Suggestions (${suggestions.length})\n\n`;
      for (const a of suggestions) {
        const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
        const lineContent = lines[a.anchor.line - 1] || '';
        output += `### ${lineRef}: ${a.content}\n`;
        output += `> \`${lineContent.trim()}\`\n`;
        output += `— ${a.author.split('<')[0].trim()}\n\n`;
      }
    }

    if (openAnnotations.length === 0) {
      output += `No open annotations.\n`;
    }

    return output;
  }

  async function copyForClaude() {
    const text = formatForClaude();
    await navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => copied = false, 2000);
    showMenu = false;
  }

  async function createShareLink() {
    if (!fileContent || !annotationData) return;

    sharing = true;
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          content: fileContent,
          annotations: annotationData
        })
      });

      if (response.ok) {
        const data = await response.json();
        shareLink = data.url;
        await navigator.clipboard.writeText(data.url);
      }
    } catch (e) {
      console.error('Failed to create share link:', e);
    }
    sharing = false;
  }

  function handleExport() {
    onExport?.();
    showMenu = false;
  }

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

<header class="h-12 flex items-center justify-between px-5 border-b border-surface-800/50">
  <!-- Left: Logo and files -->
  <div class="flex items-center gap-6">
    <span class="text-sm font-medium text-surface-400 tracking-wide">ano</span>

    {#if files.length > 1}
      <div class="flex items-center">
        {#each files as file}
          <button
            class="px-3 py-1.5 text-[13px] font-mono transition-colors {file.isCurrent
              ? 'text-surface-100'
              : 'text-surface-500 hover:text-surface-300'}"
            onclick={() => onFileSwitch?.(file.path)}
          >
            {file.name}
            {#if file.openAnnotations > 0}
              <span class="ml-1.5 text-[11px] text-surface-500">{file.openAnnotations}</span>
            {/if}
          </button>
        {/each}
      </div>
    {:else}
      <span class="text-[13px] font-mono text-surface-300">{fileName || 'No file'}</span>
    {/if}
  </div>

  <!-- Right: Stats and actions -->
  <div class="flex items-center gap-5">
    <!-- Stats -->
    <div class="flex items-center gap-4 text-[13px]">
      {#if stats().blockers > 0}
        <span class="text-blocker-text">{stats().blockers} blocker{stats().blockers !== 1 ? 's' : ''}</span>
      {/if}
      <span class="text-surface-500">{stats().open} open</span>
      {#if stats().approvals > 0}
        <span class="text-suggestion-text">{stats().approvals} approved</span>
      {/if}
    </div>

    <!-- Share dropdown -->
    <div class="relative">
      <button
        class="text-[13px] text-surface-400 hover:text-surface-200 transition-colors"
        onclick={() => showMenu = !showMenu}
      >
        Share
      </button>

      {#if showMenu}
        <div class="absolute right-0 mt-2 w-48 bg-surface-900 rounded-lg border border-surface-800 py-1 z-50 shadow-xl">
          <button
            class="w-full px-3 py-2 text-left text-[13px] text-surface-300 hover:bg-surface-800 transition-colors"
            onclick={createShareLink}
            disabled={sharing}
          >
            {sharing ? 'Creating...' : shareLink ? 'Link copied' : 'Copy link'}
          </button>

          {#if shareLink}
            <div class="px-3 py-2 border-t border-surface-800">
              <input
                type="text"
                value={shareLink}
                readonly
                class="w-full px-2 py-1 text-[11px] bg-surface-950 border border-surface-800 rounded text-surface-400 font-mono"
                onclick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          {/if}

          <button
            class="w-full px-3 py-2 text-left text-[13px] text-surface-300 hover:bg-surface-800 transition-colors"
            onclick={copyForClaude}
          >
            {copied ? 'Copied' : 'Copy for Claude'}
          </button>

          <button
            class="w-full px-3 py-2 text-left text-[13px] text-surface-300 hover:bg-surface-800 transition-colors"
            onclick={handleExport}
          >
            Export HTML
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>

<svelte:window onclick={(e) => {
  if (showMenu && !(e.target as HTMLElement).closest('.relative')) {
    showMenu = false;
  }
}} />
