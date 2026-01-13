<script lang="ts">
  interface Props {
    x: number;
    y: number;
    onAnnotate: () => void;
  }

  let { x, y, onAnnotate }: Props = $props();
</script>

<button
  class="fixed z-50 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium px-2 py-1 rounded shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
  style="left: {x}px; top: {y}px; transform: translateX(-50%) translateY(calc(-100% - 6px));"
  onclick={onAnnotate}
>
  +
</button>
