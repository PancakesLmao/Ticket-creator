<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Layers,
  X,
  Group,
  Ungroup,
  Eye,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Trash2,
  GripVertical,
} from '@lucide/vue'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'
import LayerComponentPreview from './LayerComponentPreview.vue'

const { ticket, emblemMode, interactionMode } = useTicketData()
const {
  layerDefinitions,
  layerState,
  layerGroups,
  selectedIds,
  hoveredLayerId,
  activeLayerFace,
  isFlipped,
  isLayerPanelOpen,
  layoutVersion,
  canGroupSelected,
  hasAnyGroupedInSelection,
  hasCustomOffsets,
  hiddenLayersCount,
  getOffset,
  getElementSize,
  getFaceLayerRects,
  setHoveredLayer,
  setLayerPanelOpen,
  selectBlock,
  selectGroup,
  clearSelection,
  groupSelected,
  ungroupSelected,
  removeField,
  restoreAllFields,
  toggleLayerLock,
  bringForward,
  sendBackward,
  reorderLayerByDrop,
  resetElementOffset,
  resetAllOffsets,
  setActiveLayerFace,
} = useCanvasDrag()

const minimapRects = ref({})
const draggedLayerId = ref(null)
const dragOverLayerId = ref(null)
const dragDropPosition = ref('before')
let refreshTimer = null
let isFlipTransitioning = false

const faceLayers = computed(() => {
  const list = layerDefinitions
    .filter(
      (def) =>
        def.face === activeLayerFace.value &&
        layerState[def.id]?.visible !== false,
    )
    .map((def, idx) => ({
      ...def,
      state: layerState[def.id] || { visible: true, locked: false, zIndex: 10 + idx, groupId: null },
      offset: getOffset(def.id),
      group: layerState[def.id]?.groupId ? layerGroups[layerState[def.id].groupId] : null,
    }))
    .sort((a, b) => (b.state.zIndex ?? 0) - (a.state.zIndex ?? 0))

  return list.map((item, idx) => ({
    ...item,
    stackRank: idx + 1,
  }))
})

const minimapLayers = computed(() =>
  [...faceLayers.value]
    .filter((layer) => layer.state.visible !== false && minimapRects.value[layer.id])
    .sort((a, b) => (a.state.zIndex ?? 0) - (b.state.zIndex ?? 0)),
)

function visibleGroupMemberIds(group) {
  if (!group) return []
  return (group.memberIds || []).filter((id) => layerState[id]?.visible !== false)
}

const activeFaceGroups = computed(() =>
  Object.values(layerGroups)
    .filter((group) => group.face === activeLayerFace.value)
    .map((group) => ({
      ...group,
      visibleMembers: visibleGroupMemberIds(group),
    })),
)

function refreshMinimapRects() {
  if (isFlipTransitioning) return
  nextTick(() => {
    if (isFlipTransitioning) return
    minimapRects.value = getFaceLayerRects(activeLayerFace.value)
  })
}

watch(
  isFlipped,
  () => {
    isFlipTransitioning = true
    minimapRects.value = {}
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      isFlipTransitioning = false
      refreshMinimapRects()
    }, 760)
  },
  { flush: 'sync' },
)

watch(
  [
    activeLayerFace,
    layoutVersion,
    isLayerPanelOpen,
    emblemMode,
    interactionMode,
  ],
  () => {
    refreshMinimapRects()
  },
  { immediate: true, flush: 'post' },
)

onMounted(() => {
  window.addEventListener('resize', refreshMinimapRects)
})

onUnmounted(() => {
  clearTimeout(refreshTimer)
  window.removeEventListener('resize', refreshMinimapRects)
})

function hasLayerOffset(id) {
  const o = getOffset(id)
  if (o.x !== 0 || o.y !== 0) return true
  const sz = getElementSize(id)
  return (
    Math.abs((sz.scale ?? 1) - 1) >= 0.001 ||
    (sz.width !== null && sz.width !== undefined)
  )
}

function onLayerClick(e, layer) {
  if (layer.state.visible === false) return
  if (e.ctrlKey || e.metaKey) {
    selectBlock(layer.id, { multi: true })
  } else {
    selectBlock(layer.id, { multi: false })
  }
}

function isGroupSelected(group) {
  if (!group || group.visibleMembers.length === 0) return false
  return group.visibleMembers.every((id) => selectedIds.value.includes(id))
}

function minimapBoxClass(layer) {
  const isSel = selectedIds.value.includes(layer.id)
  const isHov = hoveredLayerId.value === layer.id
  if (isSel && isHov) {
    return 'border-cyan-300 bg-cyan-400/35 text-white ring-1 ring-cyan-300/70'
  }
  if (isSel) {
    return 'border-cyan-400 bg-cyan-400/25 text-cyan-100 ring-1 ring-cyan-400/50'
  }
  if (isHov) {
    return 'border-sky-300 bg-sky-400/30 text-white shadow-[0_0_10px_rgba(56,189,248,0.45)]'
  }
  if (layer.group) {
    return 'border-violet-400/70 bg-violet-500/20 text-violet-100 hover:border-violet-300'
  }
  if (layer.state.locked) {
    return 'border-amber-400/60 bg-amber-500/15 text-amber-100 hover:border-amber-300'
  }
  return 'border-white/25 bg-white/[0.08] text-slate-300 hover:border-cyan-300/70 hover:bg-cyan-500/15'
}

function onCardDragStart(e, layer) {
  draggedLayerId.value = layer.id
  dragOverLayerId.value = null
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', layer.id)
  }
}

function onCardDragOver(e, layer) {
  if (!draggedLayerId.value || draggedLayerId.value === layer.id) {
    dragOverLayerId.value = null
    return
  }
  const rect = e.currentTarget.getBoundingClientRect()
  const midpoint = rect.top + rect.height / 2
  dragDropPosition.value = e.clientY < midpoint ? 'before' : 'after'
  dragOverLayerId.value = layer.id
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function onCardDragLeave(e, layer) {
  if (dragOverLayerId.value === layer.id && !e.currentTarget.contains(e.relatedTarget)) {
    dragOverLayerId.value = null
  }
}

function onCardDrop(e, layer) {
  const sourceId = draggedLayerId.value || e.dataTransfer?.getData('text/plain')
  if (sourceId && sourceId !== layer.id) {
    reorderLayerByDrop(sourceId, layer.id, dragDropPosition.value)
  }
  draggedLayerId.value = null
  dragOverLayerId.value = null
}

function onCardDragEnd() {
  draggedLayerId.value = null
  dragOverLayerId.value = null
}
</script>

<template>
  <aside
    class="fixed left-0 top-0 h-screen w-[calc(100vw-3rem)] sm:w-80 xl:w-96 bg-slate-900/95 border-r border-white/10 backdrop-blur-2xl z-40 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col shadow-[12px_0_40px_rgba(0,0,0,0.65)]"
    :class="isLayerPanelOpen ? 'translate-x-0' : '-translate-x-full'"
    aria-label="Layer Visualizer"
    @pointerdown.stop
  >
    <!-- Drawer Header -->
    <div class="px-4 py-3.5 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
      <div class="flex items-center gap-2 min-w-0">
        <Layers class="w-4 h-4 text-cyan-400 shrink-0" />
        <span class="font-display font-bold text-xs tracking-wider text-white uppercase truncate">
          Layer Visualizer
        </span>
        <span class="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono-code text-slate-300 shrink-0">
          {{ faceLayers.length }}
        </span>
      </div>
      <button
        type="button"
        class="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer shrink-0 transition-colors"
        title="Close Layer Visualizer"
        @click="setLayerPanelOpen(false)"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Top Fixed Controls: Face Tabs + Spatial Minimap + Quick Actions -->
    <div class="px-3.5 pt-3 pb-2.5 space-y-2.5 border-b border-white/10 shrink-0">
      <!-- Front / Back Switcher -->
      <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
        <button
          type="button"
          class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer"
          :class="
            activeLayerFace === 'front'
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          "
          @click="setActiveLayerFace('front')"
        >
          FRONT FACE
        </button>
        <button
          type="button"
          class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer"
          :class="
            activeLayerFace === 'back'
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          "
          @click="setActiveLayerFace('back')"
        >
          BACK FACE
        </button>
      </div>

      <!-- Spatial Layer Minimap -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-[9px] font-mono-code text-slate-400 px-0.5">
          <span class="uppercase tracking-wider">Spatial Z-Order Map</span>
          <span>Top = #1</span>
        </div>
        <div
          class="relative w-full aspect-[860/330] rounded-xl bg-slate-950/90 border border-white/15 overflow-hidden shadow-inner"
        >
          <!-- Perforation seam (horizontal layout) -->
          <div
            class="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-white/20"
            :style="{ left: activeLayerFace === 'front' ? '71%' : '29%' }"
          ></div>

          <button
            v-for="layer in minimapLayers"
            :key="`mini-${layer.id}`"
            type="button"
            class="absolute rounded-[3px] border text-[7px] font-mono-code font-bold leading-none flex items-center justify-center transition-colors cursor-pointer overflow-hidden px-0.5"
            :class="minimapBoxClass(layer)"
            :style="{
              left: `${minimapRects[layer.id].left}%`,
              top: `${minimapRects[layer.id].top}%`,
              width: `${minimapRects[layer.id].width}%`,
              height: `${minimapRects[layer.id].height}%`,
              zIndex: layer.state.zIndex,
            }"
            :title="`#${layer.stackRank} ${layer.label}`"
            @click="onLayerClick($event, layer)"
            @mouseenter="setHoveredLayer(layer.id)"
            @mouseleave="setHoveredLayer(null)"
          >
            <span class="truncate">#{{ layer.stackRank }}</span>
          </button>

          <div
            v-if="minimapLayers.length === 0"
            class="absolute inset-0 flex items-center justify-center text-[10px] font-mono-code text-slate-500"
          >
            Flipping ticket...
          </div>
        </div>
      </div>

      <!-- Quick Selection & Bulk Actions -->
      <div class="p-2 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
        <div class="flex items-center justify-between text-[10px] font-mono-code text-slate-300">
          <span>
            {{
              selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : 'Drag cards to reorder • Ctrl+Click to group'
            }}
          </span>
          <button
            v-if="selectedIds.length > 0"
            type="button"
            class="text-[9px] text-slate-400 hover:text-white cursor-pointer"
            @click="clearSelection"
          >
            Clear
          </button>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <button
            type="button"
            :disabled="!canGroupSelected"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-mono-code transition-colors"
            :class="
              canGroupSelected
                ? 'bg-violet-500/20 border-violet-400/45 text-violet-200 hover:bg-violet-500/35 cursor-pointer'
                : 'bg-white/[0.02] border-white/10 text-slate-600 cursor-not-allowed'
            "
            @click="groupSelected"
          >
            <Group class="w-3 h-3" />
            <span>Group</span>
          </button>

          <button
            type="button"
            :disabled="!hasAnyGroupedInSelection"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-mono-code transition-colors"
            :class="
              hasAnyGroupedInSelection
                ? 'bg-violet-500/15 border-violet-400/35 text-violet-200 hover:bg-violet-500/30 cursor-pointer'
                : 'bg-white/[0.02] border-white/10 text-slate-600 cursor-not-allowed'
            "
            @click="ungroupSelected()"
          >
            <Ungroup class="w-3 h-3" />
            <span>Ungroup</span>
          </button>

          <button
            v-if="hiddenLayersCount > 0"
            type="button"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-200 text-[10px] font-mono-code cursor-pointer transition-colors"
            @click="restoreAllFields(null, ticket)"
          >
            <Eye class="w-3 h-3" />
            <span>Restore ({{ hiddenLayersCount }})</span>
          </button>

          <button
            v-if="hasCustomOffsets"
            type="button"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-200 text-[10px] font-mono-code cursor-pointer transition-colors"
            @click="resetAllOffsets"
          >
            <RotateCcw class="w-3 h-3" />
            <span>Reset Pos</span>
          </button>
        </div>
      </div>

      <!-- Active Groups List -->
      <div v-if="activeFaceGroups.length > 0" class="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
        <div
          v-for="group in activeFaceGroups"
          :key="group.id"
          class="flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg border text-[10px] font-mono-code cursor-pointer transition-colors"
          :class="
            isGroupSelected(group)
              ? 'bg-violet-500/20 border-violet-400/55 text-violet-100'
              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-violet-400/35'
          "
          @click="selectGroup(group.id)"
        >
          <div class="flex items-center gap-1.5 min-w-0">
            <Group class="w-3 h-3 text-violet-300 shrink-0" />
            <span class="font-semibold truncate">{{ group.name }}</span>
            <span class="text-[9px] text-slate-400 shrink-0">({{ group.visibleMembers.length }})</span>
          </div>
          <button
            type="button"
            class="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer shrink-0"
            title="Ungroup"
            @click.stop="ungroupSelected(group.id)"
          >
            <Ungroup class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Scrollable Visual Layer Cards Stack -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-2.5">
      <div
        v-for="layer in faceLayers"
        :key="layer.id"
        draggable="true"
        class="group/card rounded-xl border p-2.5 space-y-2 transition-all cursor-pointer"
        :class="[
          draggedLayerId === layer.id
            ? 'opacity-45 scale-[0.98]'
            : '',
          dragOverLayerId === layer.id && dragDropPosition === 'before'
            ? 'border-t-2 border-t-cyan-400 shadow-[0_-2px_10px_rgba(34,211,238,0.28)]'
            : '',
          dragOverLayerId === layer.id && dragDropPosition === 'after'
            ? 'border-b-2 border-b-cyan-400 shadow-[0_2px_10px_rgba(34,211,238,0.28)]'
            : '',
          selectedIds.includes(layer.id)
            ? 'bg-cyan-500/12 border-cyan-400/60 shadow-[0_0_0_1px_rgba(34,211,238,0.2)]'
            : hoveredLayerId === layer.id
              ? 'bg-sky-500/10 border-sky-400/55'
              : 'bg-white/[0.03] border-white/10 hover:border-white/25',
        ]"
        @click="onLayerClick($event, layer)"
        @mouseenter="setHoveredLayer(layer.id)"
        @mouseleave="setHoveredLayer(null)"
        @dragstart="onCardDragStart($event, layer)"
        @dragover.prevent="onCardDragOver($event, layer)"
        @dragleave="onCardDragLeave($event, layer)"
        @drop.prevent="onCardDrop($event, layer)"
        @dragend="onCardDragEnd"
      >
        <!-- Layer Card Header: Drag Handle + Stack Order + Name + Controls -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 min-w-0 flex-1">
            <GripVertical
              class="w-3.5 h-3.5 text-slate-400 group-hover/card:text-cyan-300 cursor-grab active:cursor-grabbing shrink-0"
              title="Drag card up or down to reorder layer"
            />
            <span
              class="px-1.5 py-0.5 rounded font-mono-code text-[9px] font-bold shrink-0 border"
              :class="
                selectedIds.includes(layer.id)
                  ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200'
                  : 'bg-white/10 border-white/15 text-slate-300'
              "
            >
              #{{ layer.stackRank }}
            </span>

            <span class="text-[11px] font-semibold text-white truncate">
              {{ layer.label }}
            </span>

            <span
              class="text-[8px] font-mono-code uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0"
            >
              {{ layer.section }}
            </span>

            <span
              v-if="layer.group"
              class="text-[8px] font-mono-code px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-200 border border-violet-400/35 shrink-0"
            >
              {{ layer.group.name }}
            </span>
          </div>

          <!-- Inline Layer Controls -->
          <div class="flex items-center gap-0.5 shrink-0" @click.stop>
            <button
              v-if="hasLayerOffset(layer.id)"
              type="button"
              class="p-1 rounded hover:bg-amber-500/20 text-amber-300 cursor-pointer transition-colors"
              title="Reset position &amp; size"
              @click="resetElementOffset(layer.id)"
            >
              <RotateCcw class="w-3 h-3" />
            </button>

            <button
              type="button"
              class="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Bring Forward"
              @click="bringForward(layer.id)"
            >
              <ArrowUp class="w-3 h-3" />
            </button>

            <button
              type="button"
              class="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Send Backward"
              @click="sendBackward(layer.id)"
            >
              <ArrowDown class="w-3 h-3" />
            </button>

            <button
              type="button"
              class="p-1 rounded hover:bg-white/10 cursor-pointer transition-colors"
              :class="layer.state.locked ? 'text-amber-300' : 'text-slate-400 hover:text-white'"
              :title="layer.state.locked ? 'Unlock' : 'Lock'"
              @click="toggleLayerLock(layer.id)"
            >
              <Lock v-if="layer.state.locked" class="w-3 h-3" />
              <Unlock v-else class="w-3 h-3" />
            </button>

            <button
              type="button"
              class="p-1 rounded text-slate-400 hover:text-rose-300 hover:bg-rose-500/15 cursor-pointer transition-colors"
              title="Remove from ticket"
              @click="removeField(layer.id)"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>

        <!-- Live Component Appearance Preview -->
        <LayerComponentPreview :layer-id="layer.id" />
      </div>
    </div>
  </aside>
</template>

