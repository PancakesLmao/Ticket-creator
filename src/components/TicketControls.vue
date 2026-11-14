<script setup>
import { RotateCw, Move } from '@lucide/vue'

defineEmits(['flip'])
</script>

<template>
  <footer class="flex flex-col items-center gap-2 text-xs text-slate-400 w-max max-w-[95vw]">
    <div
      class="px-4 py-2 rounded-full bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3"
    >
      <span class="inline-flex items-center gap-1.5 text-slate-300">
        <Move class="w-3.5 h-3.5 text-cyan-400" />
        Move cursor to tilt &amp; shift reflection
      </span>

      <span class="text-white/20">•</span>

      <!-- Flip 3D Card Button -->
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white font-medium transition-colors cursor-pointer text-xs"
        @click.stop="$emit('flip')"
      >
        <RotateCw class="w-3.5 h-3.5" />
        <span>Click ticket to flip (180°)</span>
      </button>
    </div>
  </footer>
</template>
