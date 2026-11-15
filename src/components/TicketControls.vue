<script setup>
import { RotateCw, Move } from '@lucide/vue'
import { useTicketData } from '../composables/useTicketData.js'

defineEmits(['flip'])

const { interactionMode } = useTicketData()
</script>

<template>
  <footer class="flex flex-col items-center gap-2 text-xs text-slate-400 w-full max-w-full">
    <div
      class="px-4 py-2 rounded-2xl sm:rounded-full bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5"
    >
      <span class="inline-flex items-center gap-1.5 text-slate-300">
        <template v-if="interactionMode === 'edit'">
          <Move class="w-3.5 h-3.5 text-cyan-400" />
          Click text to edit • Drag Move handle to reposition • Right-click for options
        </template>
        <template v-else>
          <Move class="w-3.5 h-3.5 text-cyan-400" />
          Move cursor to tilt &amp; shift reflection
        </template>
      </span>

      <span class="text-white/20">•</span>

      <!-- Flip 3D Card Button -->
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white font-medium transition-colors cursor-pointer text-xs"
        @click.stop="$emit('flip')"
      >
        <RotateCw class="w-3.5 h-3.5" />
        <span>Flip Side (180°)</span>
      </button>
    </div>
  </footer>
</template>
