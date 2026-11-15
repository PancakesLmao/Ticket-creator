<script setup>
import { PenLine, Box, RotateCcw, Layers, Group, Eye, Undo2, Redo2 } from '@lucide/vue'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'
import { useTicketHistory } from '../composables/useTicketHistory.js'

const { interactionMode, setInteractionMode } = useTicketData()
const {
  selectedIds,
  isLayerPanelOpen,
  canGroupSelected,
  hasCustomOffsets,
  hiddenLayersCount,
  groupSelected,
  restoreAllFields,
  resetAllOffsets,
  toggleLayerPanel,
} = useCanvasDrag()
const { canUndo, canRedo, undo, redo } = useTicketHistory()
</script>

<template>
  <header
    class="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-[11px] tracking-wider uppercase text-slate-400 font-mono-code"
  >
    <!-- Interaction Mode Switch: Canvas Edit vs 3D Review -->
    <div
      class="inline-flex items-center p-1 rounded-full bg-slate-900/75 border border-white/15 backdrop-blur-xl shadow-lg"
      role="group"
      aria-label="Interaction mode"
    >
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all cursor-pointer"
        :class="
          interactionMode === 'edit'
            ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
            : 'text-slate-400 hover:text-white border border-transparent'
        "
        :aria-pressed="interactionMode === 'edit'"
        @click="setInteractionMode('edit')"
      >
        <PenLine class="w-3.5 h-3.5" />
        <span>Edit</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all cursor-pointer"
        :class="
          interactionMode === 'preview'
            ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
            : 'text-slate-400 hover:text-white border border-transparent'
        "
        :aria-pressed="interactionMode === 'preview'"
        @click="setInteractionMode('preview')"
      >
        <Box class="w-3.5 h-3.5" />
        <span>3D Review</span>
      </button>
    </div>

    <!-- Undo / Redo Pill -->
    <div
      class="inline-flex items-center p-1 rounded-full bg-slate-900/75 border border-white/15 backdrop-blur-xl shadow-lg"
      role="group"
      aria-label="History controls"
    >
      <button
        type="button"
        :disabled="!canUndo"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold transition-all"
        :class="
          canUndo
            ? 'text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer'
            : 'text-slate-600 cursor-not-allowed'
        "
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
        @click="undo"
      >
        <Undo2 class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Undo</span>
      </button>
      <button
        type="button"
        :disabled="!canRedo"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold transition-all"
        :class="
          canRedo
            ? 'text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer'
            : 'text-slate-600 cursor-not-allowed'
        "
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
        @click="redo"
      >
        <Redo2 class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Redo</span>
      </button>
    </div>

    <!-- Left Layer Visualizer Toggle -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md transition-all cursor-pointer font-semibold shadow-lg"
      :class="
        isLayerPanelOpen
          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-100'
          : 'bg-white/5 hover:bg-white/10 border-white/15 hover:border-cyan-400/40 text-slate-200 hover:text-white'
      "
      :aria-pressed="isLayerPanelOpen"
      title="Toggle Left Layer Visualizer"
      @click="toggleLayerPanel"
    >
      <Layers class="w-3.5 h-3.5 text-cyan-300" />
      <span>Layers</span>
      <span
        v-if="hiddenLayersCount > 0"
        class="px-1.5 py-0.2 rounded-full bg-rose-500/25 border border-rose-400/40 text-[9px] text-rose-200"
      >
        {{ hiddenLayersCount }} removed
      </span>
    </button>

    <!-- Quick Group Button (visible on Ctrl+Click multi-select) -->
    <button
      v-if="interactionMode === 'edit' && canGroupSelected"
      type="button"
      class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-500/20 hover:bg-violet-500/35 border border-violet-400/45 backdrop-blur-md text-violet-100 transition-all cursor-pointer font-semibold shadow-lg"
      title="Group selected layers together"
      @click="groupSelected"
    >
      <Group class="w-3.5 h-3.5" />
      <span>Group ({{ selectedIds.length }})</span>
    </button>

    <!-- Restore Hidden Fields Quick Button -->
    <button
      v-if="hiddenLayersCount > 0"
      type="button"
      class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 backdrop-blur-md text-emerald-200 hover:text-white transition-all cursor-pointer font-semibold shadow-lg"
      title="Restore all removed fields"
      @click="restoreAllFields()"
    >
      <Eye class="w-3.5 h-3.5" />
      <span>Restore ({{ hiddenLayersCount }})</span>
    </button>

    <!-- Reset Layout Button (visible when blocks are dragged) -->
    <button
      v-if="hasCustomOffsets"
      type="button"
      class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 hover:border-amber-300/60 backdrop-blur-md text-amber-200 hover:text-white transition-all cursor-pointer font-semibold shadow-lg"
      title="Reset custom block layout"
      @click="resetAllOffsets()"
    >
      <RotateCcw class="w-3.5 h-3.5" />
      <span>Reset Layout</span>
    </button>
  </header>
</template>
