<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Group,
  Ungroup,
  ChevronsUp,
  ArrowUp,
  ArrowDown,
  ChevronsDown,
  Lock,
  Unlock,
  RotateCcw,
  Layers,
  Trash2,
  Copy,
  ClipboardPaste,
  CopyPlus,
} from '@lucide/vue'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'
import {
  CUSTOM_TEXT_PRESET_LIST,
  getTextBoxById,
  getBlockTextBoxes,
} from '../models/ticketTextBoxes.js'

const { interactionMode, ticket } = useTicketData()
const {
  layerMap,
  customLayers,
  contextMenu,
  selectedIds,
  selectedGroup,
  hasAnyGroupedInSelection,
  canGroupSelected,
  hasSelectedOffsets,
  hasClipboardLayers,
  isSelectionLocked,
  closeContextMenu,
  groupSelected,
  ungroupSelected,
  copySelectedLayers,
  pasteLayers,
  duplicateSelectedLayers,
  setCustomLayerStylePreset,
  bringToFront,
  bringForward,
  sendBackward,
  sendToBack,
  toggleSelectedLock,
  resetSelectedOffsets,
  removeSelectedFields,
  removeTextBoxById,
  openLayersPanel,
} = useCanvasDrag()

const menuRef = ref(null)
const menuWidth = ref(224)
const menuHeight = ref(380)

const isVisible = computed(() => interactionMode.value === 'edit' && contextMenu.open)

const targetTextBox = computed(() =>
  contextMenu.textBoxId ? getTextBoxById(contextMenu.textBoxId) || null : null
)

const customTargetLayer = computed(() => {
  if (selectedIds.value.length > 1 || !contextMenu.targetId) return null
  return customLayers.find((item) => item.id === contextMenu.targetId) || null
})

const hasMultipleTextBoxesInBlock = computed(() => {
  if (!targetTextBox.value?.blockId) return false
  return (
    getBlockTextBoxes(targetTextBox.value.blockId).filter(
      (box) => !box.isRemoved(ticket)
    ).length > 1
  )
})

const menuStyle = computed(() => {
  const maxX = Math.max(12, window.innerWidth - menuWidth.value - 12)
  const maxY = Math.max(12, window.innerHeight - menuHeight.value - 12)
  const x = Math.max(12, Math.min(maxX, contextMenu.x))
  const y = Math.max(12, Math.min(maxY, contextMenu.y))
  return {
    left: `${Math.round(x)}px`,
    top: `${Math.round(y)}px`,
  }
})

watch(
  [isVisible, () => contextMenu.x, () => contextMenu.y, selectedIds],
  async ([visible]) => {
    if (!visible) return
    await nextTick()
    if (menuRef.value) {
      menuWidth.value = menuRef.value.offsetWidth || 224
      menuHeight.value = menuRef.value.offsetHeight || 340
    }
  },
  { flush: 'post' }
)

function onWindowPointerDown(e) {
  if (!contextMenu.open) return
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    closeContextMenu()
  }
}

function onWindowKeydown(e) {
  if (contextMenu.open && e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closeContextMenu()
  }
}

function runAction(fn) {
  fn()
  closeContextMenu()
}

onMounted(() => {
  window.addEventListener('pointerdown', onWindowPointerDown)
  window.addEventListener('keydown', onWindowKeydown, true)
})

onUnmounted(() => {
  window.removeEventListener('pointerdown', onWindowPointerDown)
  window.removeEventListener('keydown', onWindowKeydown, true)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="menuRef"
      :style="menuStyle"
      class="fixed z-[70] w-56 py-1.5 rounded-xl bg-slate-950/95 border border-white/15 shadow-[0_16px_42px_rgba(0,0,0,0.75)] backdrop-blur-2xl text-[11px] font-mono-code text-slate-200 select-none"
      role="menu"
      aria-label="Canvas field context menu"
      @pointerdown.stop
      @contextmenu.prevent
    >
      <div class="px-3 py-1 border-b border-white/10 text-[9px] uppercase tracking-wider text-slate-400 truncate">
        {{
          selectedGroup
            ? `${selectedGroup.name} (${selectedIds.length})`
            : selectedIds.length > 1
              ? `${selectedIds.length} Layers Selected`
              : layerMap[contextMenu.targetId]?.label || 'Field Options'
        }}
      </div>

      <template v-if="customTargetLayer?.kind === 'textbox'">
        <div class="px-3 pt-1.5 pb-2 border-b border-white/10 space-y-1.5">
          <div class="text-[9px] uppercase tracking-wider text-slate-400">Text Style</div>
          <div class="grid grid-cols-2 gap-1">
            <button
              v-for="styleItem in CUSTOM_TEXT_PRESET_LIST"
              :key="styleItem.key"
              type="button"
              class="px-1.5 py-1 rounded text-[9px] text-left truncate border transition-colors cursor-pointer"
              :class="
                customTargetLayer.stylePreset === styleItem.key
                  ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              "
              @click="setCustomLayerStylePreset(customTargetLayer.id, styleItem.key)"
            >
              {{ styleItem.label }}
            </button>
          </div>
        </div>
      </template>

      <button
        type="button"
        class="w-full px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-white/10 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(() => copySelectedLayers(contextMenu.targetId))"
      >
        <span class="flex items-center gap-2">
          <Copy class="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Copy</span>
        </span>
        <span class="text-[9px] text-slate-500">Ctrl+C</span>
      </button>

      <button
        type="button"
        :disabled="!hasClipboardLayers"
        class="w-full px-3 py-1.5 flex items-center justify-between gap-2 transition-colors text-left"
        :class="
          hasClipboardLayers
            ? 'hover:bg-white/10 text-slate-200 cursor-pointer'
            : 'text-slate-600 cursor-not-allowed'
        "
        role="menuitem"
        @click="hasClipboardLayers && runAction(pasteLayers)"
      >
        <span class="flex items-center gap-2">
          <ClipboardPaste class="w-3.5 h-3.5 shrink-0" />
          <span>Paste</span>
        </span>
        <span class="text-[9px] text-slate-500">Ctrl+V</span>
      </button>

      <button
        type="button"
        class="w-full px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-white/10 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(() => duplicateSelectedLayers(contextMenu.targetId))"
      >
        <span class="flex items-center gap-2">
          <CopyPlus class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Duplicate</span>
        </span>
        <span class="text-[9px] text-slate-500">Ctrl+D</span>
      </button>

      <div class="my-1 border-t border-white/10"></div>

      <button
        v-if="canGroupSelected"
        type="button"
        class="w-full px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-violet-500/20 text-violet-200 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(groupSelected)"
      >
        <span class="flex items-center gap-2">
          <Group class="w-3.5 h-3.5 shrink-0" />
          <span>Group Selected ({{ selectedIds.length }})</span>
        </span>
      </button>

      <button
        v-if="hasAnyGroupedInSelection"
        type="button"
        class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-violet-500/20 text-violet-200 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(() => ungroupSelected())"
      >
        <Ungroup class="w-3.5 h-3.5 shrink-0" />
        <span>Ungroup</span>
      </button>

      <div v-if="canGroupSelected || hasAnyGroupedInSelection" class="my-1 border-t border-white/10"></div>

      <button
        type="button"
        class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(() => bringToFront())"
      >
        <ChevronsUp class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Bring to Front</span>
      </button>

      <button
        type="button"
        class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(() => bringForward())"
      >
        <ArrowUp class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Bring Forward</span>
      </button>

      <button
        type="button"
        class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(() => sendBackward())"
      >
        <ArrowDown class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Send Backward</span>
      </button>

      <button
        type="button"
        class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(() => sendToBack())"
      >
        <ChevronsDown class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Send to Back</span>
      </button>

      <div class="my-1 border-t border-white/10"></div>

      <button
        type="button"
        class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(toggleSelectedLock)"
      >
        <Unlock v-if="isSelectionLocked" class="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <Lock v-else class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{{ isSelectionLocked ? 'Unlock Position' : 'Lock Position' }}</span>
      </button>

      <button
        type="button"
        :disabled="!hasSelectedOffsets"
        class="w-full px-3 py-1.5 flex items-center gap-2 transition-colors text-left"
        :class="
          hasSelectedOffsets
            ? 'hover:bg-amber-500/15 text-amber-200 cursor-pointer'
            : 'text-slate-600 cursor-not-allowed'
        "
        role="menuitem"
        @click="hasSelectedOffsets && runAction(resetSelectedOffsets)"
      >
        <RotateCcw class="w-3.5 h-3.5 shrink-0" />
        <span>Reset Position &amp; Size</span>
      </button>

      <button
        type="button"
        class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(openLayersPanel)"
      >
        <Layers class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Manage in Layers</span>
      </button>

      <div class="my-1 border-t border-white/10"></div>

      <template v-if="selectedIds.length <= 1 && targetTextBox && hasMultipleTextBoxesInBlock">
        <button
          type="button"
          class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer text-left"
          role="menuitem"
          @click="runAction(() => removeTextBoxById(targetTextBox.id, ticket))"
        >
          <Trash2 class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Remove "{{ targetTextBox.label }}"</span>
        </button>

        <button
          type="button"
          class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer text-left"
          role="menuitem"
          @click="runAction(removeSelectedFields)"
        >
          <Trash2 class="w-3.5 h-3.5 shrink-0" />
          <span>Remove Entire Block</span>
        </button>
      </template>

      <button
        v-else
        type="button"
        class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer text-left"
        role="menuitem"
        @click="runAction(removeSelectedFields)"
      >
        <Trash2 class="w-3.5 h-3.5 shrink-0" />
        <span>Remove Component</span>
      </button>
    </div>
  </Teleport>
</template>

