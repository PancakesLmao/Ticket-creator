<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  PenLine,
  Box,
  RotateCcw,
  Layers,
  Group,
  Eye,
  Undo2,
  Redo2,
  Download,
  Loader2,
  ChevronDown,
} from '@lucide/vue'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'
import { useTicketHistory } from '../composables/useTicketHistory.js'
import { useTicketExport } from '../composables/useTicketExport.js'

const { interactionMode, setInteractionMode } = useTicketData()
const {
  isFlipped,
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
const { isExporting, exportTicketPng } = useTicketExport()

const isExportMenuOpen = ref(false)
const exportMenuRef = ref(null)

function onExportClick(target = 'active') {
  isExportMenuOpen.value = false
  exportTicketPng(target)
}

function onWindowClick(e) {
  if (exportMenuRef.value && !exportMenuRef.value.contains(e.target)) {
    isExportMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', onWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('click', onWindowClick)
})
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

    <!-- Export Transparent PNG Pill with Dropdown -->
    <div ref="exportMenuRef" class="relative inline-flex items-center">
      <div
        class="inline-flex items-center p-0.5 rounded-full bg-slate-900/80 border border-cyan-400/35 hover:border-cyan-400/60 backdrop-blur-xl shadow-lg transition-all"
      >
        <button
          type="button"
          :disabled="isExporting"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-l-full font-semibold text-cyan-200 hover:text-white hover:bg-cyan-500/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :title="`Export ${isFlipped ? 'Back' : 'Front'} Face as Transparent PNG`"
          @click="onExportClick('active')"
        >
          <Loader2 v-if="isExporting" class="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <Download v-else class="w-3.5 h-3.5 text-cyan-300" />
          <span>{{ isExporting ? 'Exporting...' : 'Export PNG' }}</span>
        </button>

        <button
          type="button"
          :disabled="isExporting"
          class="px-1.5 py-1 rounded-r-full text-cyan-300 hover:text-white hover:bg-cyan-500/20 border-l border-white/10 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          title="Export Options"
          aria-label="Export options"
          @click.stop="isExportMenuOpen = !isExportMenuOpen"
        >
          <ChevronDown
            class="w-3 h-3 transition-transform duration-200"
            :class="{ 'rotate-180': isExportMenuOpen }"
          />
        </button>
      </div>

      <!-- Export Dropdown Menu -->
      <div
        v-if="isExportMenuOpen"
        class="absolute top-full mt-2 right-0 w-52 py-1.5 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl z-50 text-[10px] font-mono-code normal-case"
        role="menu"
      >
        <div class="px-3 py-1 text-[9px] uppercase tracking-wider text-slate-400 font-semibold border-b border-white/10 mb-1">
          Transparent PNG Export
        </div>

        <button
          type="button"
          class="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          role="menuitem"
          @click="onExportClick('active')"
        >
          <span>Visible Face ({{ isFlipped ? 'Back' : 'Front' }})</span>
          <span class="text-[9px] text-cyan-400 font-mono-code">.png</span>
        </button>

        <button
          type="button"
          class="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          role="menuitem"
          @click="onExportClick('front')"
        >
          <span>Front Face</span>
          <span class="text-[9px] text-cyan-400 font-mono-code">.png</span>
        </button>

        <button
          type="button"
          class="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          role="menuitem"
          @click="onExportClick('back')"
        >
          <span>Back Face</span>
          <span class="text-[9px] text-cyan-400 font-mono-code">.png</span>
        </button>

        <div class="my-1 border-t border-white/10"></div>

        <button
          type="button"
          class="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          role="menuitem"
          @click="onExportClick('both')"
        >
          <span>Both Faces (2 PNGs)</span>
          <span class="text-[9px] text-cyan-400 font-mono-code">2x</span>
        </button>
      </div>
    </div>
  </header>
</template>
