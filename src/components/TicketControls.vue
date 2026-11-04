<script setup>
defineEmits(['flip'])
</script>

<template>
  <footer
    class="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col sm:flex-row items-center gap-3 text-xs text-slate-400 w-max max-w-[92vw]"
  >
    <div
      class="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-center gap-2 sm:gap-3"
    >
      <span class="inline-flex items-center gap-1.5 text-slate-300">
        <svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Move cursor to tilt &amp; shift glass reflection
      </span>
      <span class="text-white/20">•</span>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white font-medium transition-colors cursor-pointer"
        @click.stop="$emit('flip')"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 1l4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M7 23l-4-4 4-4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Click ticket to flip (180°)
      </button>
    </div>
  </footer>
</template>
