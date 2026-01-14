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

  // Format annotations for Claude Code
  function formatForClaude(): string {
    if (!annotationData || !fileContent) return '';

    const lines = fileContent.split('\n');
    let output = `# Annotations for ${fileName}\n\n`;

    // Group by status
    const openAnnotations = annotationData.annotations.filter(a => a.status === 'open');
    const blockers = openAnnotations.filter(a => a.type === 'blocker');
    const concerns = openAnnotations.filter(a => a.type === 'concern');
    const questions = openAnnotations.filter(a => a.type === 'question');
    const suggestions = openAnnotations.filter(a => a.type === 'suggestion');

    if (blockers.length > 0) {
      output += `## 🚫 Blockers (${blockers.length})\n\n`;
      for (const a of blockers) {
        const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
        const lineContent = lines[a.anchor.line - 1] || '';
        output += `### ${lineRef}: ${a.content}\n`;
        output += `> \`${lineContent.trim()}\`\n`;
        output += `— ${a.author.split('<')[0].trim()}\n\n`;
      }
    }

    if (concerns.length > 0) {
      output += `## ⚠️ Concerns (${concerns.length})\n\n`;
      for (const a of concerns) {
        const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
        const lineContent = lines[a.anchor.line - 1] || '';
        output += `### ${lineRef}: ${a.content}\n`;
        output += `> \`${lineContent.trim()}\`\n`;
        output += `— ${a.author.split('<')[0].trim()}\n\n`;
      }
    }

    if (questions.length > 0) {
      output += `## ❓ Questions (${questions.length})\n\n`;
      for (const a of questions) {
        const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
        const lineContent = lines[a.anchor.line - 1] || '';
        output += `### ${lineRef}: ${a.content}\n`;
        output += `> \`${lineContent.trim()}\`\n`;
        output += `— ${a.author.split('<')[0].trim()}\n\n`;
      }
    }

    if (suggestions.length > 0) {
      output += `## 💡 Suggestions (${suggestions.length})\n\n`;
      for (const a of suggestions) {
        const lineRef = a.anchor.endLine ? `L${a.anchor.line}-${a.anchor.endLine}` : `L${a.anchor.line}`;
        const lineContent = lines[a.anchor.line - 1] || '';
        output += `### ${lineRef}: ${a.content}\n`;
        output += `> \`${lineContent.trim()}\`\n`;
        output += `— ${a.author.split('<')[0].trim()}\n\n`;
      }
    }

    if (openAnnotations.length === 0) {
      output += `No open annotations. All feedback has been addressed! ✅\n`;
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
    <!-- Logo and file tabs -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-xl font-bold text-blue-400">ano</span>
      </div>
      <div class="h-6 w-px bg-slate-600"></div>

      {#if files.length > 1}
        <!-- File tabs -->
        <div class="flex items-center gap-1">
          {#each files as file}
            <button
              class="px-3 py-1 text-sm font-mono rounded-t transition-colors flex items-center gap-2 {file.isCurrent ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}"
              onclick={() => onFileSwitch?.(file.path)}
            >
              {file.name}
              {#if file.openAnnotations > 0}
                <span class="px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">
                  {file.openAnnotations}
                </span>
              {/if}
            </button>
          {/each}
        </div>
      {:else}
        <span class="text-slate-300 font-mono text-sm">{fileName || 'No file loaded'}</span>
      {/if}
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

      <!-- Share menu -->
      <div class="relative">
        <button
          class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          onclick={() => showMenu = !showMenu}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Share
        </button>

        {#if showMenu}
          <div class="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-600 py-1 z-50">
            <!-- Share Link -->
            <button
              class="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-3 border-b border-slate-700"
              onclick={createShareLink}
              disabled={sharing}
            >
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              {sharing ? 'Creating...' : shareLink ? 'Link Copied!' : 'Copy Share Link'}
            </button>

            {#if shareLink}
              <div class="px-4 py-2 border-b border-slate-700">
                <input
                  type="text"
                  value={shareLink}
                  readonly
                  class="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-600 rounded text-slate-300"
                  onclick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
            {/if}

            <button
              class="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-3"
              onclick={copyForClaude}
            >
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              {copied ? 'Copied!' : 'Copy for Claude'}
            </button>
            <button
              class="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-3"
              onclick={handleExport}
            >
              <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export HTML
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>

<!-- Click outside to close menu -->
<svelte:window onclick={(e) => {
  if (showMenu && !(e.target as HTMLElement).closest('.relative')) {
    showMenu = false;
  }
}} />
