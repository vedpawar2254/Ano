<script lang="ts">
  interface Props {
    x: number;
    y: number;
    onAnnotate: () => void;
  }

  let { x, y, onAnnotate }: Props = $props();
</script>

<button
  class="fixed z-50 bg-surface-800 hover:bg-surface-700 text-surface-300 text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg cursor-pointer transition-colors border border-surface-700"
  style="left: {x}px; top: {y}px; transform: translateX(-50%) translateY(calc(-100% - 8px));"
  onclick={onAnnotate}
>
  Annotate
</button>
