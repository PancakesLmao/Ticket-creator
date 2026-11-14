<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Move, Lock } from '@lucide/vue'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'

const { ticket, interactionMode, isEditingField } = useTicketData()
const {
  layerMap,
  layerState,
  selectedIds,
  isSidebarOpen,
  isLayerPanelOpen,
  layoutVersion,
  selectedGroup,
  isSelectionLocked,
  getOffset,
  getBlockScale,
  getSelectionRect,
  notifyDragStart,
  notifyDragEnd,
  moveBlocksByDelta,
} = useCanvasDrag()

const barRef = ref(null)
const handleRef = ref(null)
const selectionRect = ref(null)
const barWidth = ref(140)
const barHeight = ref(28)
const isDraggingHandle = ref(false)

let dragStartX = 0
let dragStartY = 0
let dragScaleX = 1
let dragScaleY = 1
let handlePointerId = null
let sidebarTimer = null
let dragTargetIds = []
let initialOffsetsMap = {}
let hasHandleMoved = false

const isVisible = computed(
  () =>
    interactionMode.value === 'edit' &&
    selectedIds.value.length > 0 &&
    selectionRect.value !== null
)

const selectionLabel = computed(() => {
  if (selectedGroup.value) {
    return `${selectedGroup.value.name} (${selectedIds.value.length})`
  }
  if (selectedIds.value.length > 1) {
    return `${selectedIds.value.length} Selected`
  }
  const singleId = selectedIds.value[0]
  return layerMap[singleId]?.label || singleId || 'Move'
})

const barStyle = computed(() => {
  const rect = selectionRect.value
  if (!rect) return {}
  const w = barWidth.value
  const h = barHeight.value
  const maxLeft = Math.max(10, window.innerWidth - w - 10)
  const left = Math.max(10, Math.min(maxLeft, rect.right - w))
  const preferTop = rect.top - h - 6
  const maxTop = Math.max(12, window.innerHeight - h - 12)
  const top = preferTop >= 12 ? preferTop : Math.min(maxTop, rect.bottom + 6)

  return {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
  }
})

async function updateRect() {
  await nextTick()
  if (interactionMode.value !== 'edit' || selectedIds.value.length === 0) {
    selectionRect.value = null
    return
  }
  selectionRect.value = getSelectionRect()
  await nextTick()
  if (barRef.value) {
    barWidth.value = barRef.value.offsetWidth || 140
    barHeight.value = barRef.value.offsetHeight || 28
  }
}

watch([selectedIds, layoutVersion, interactionMode, isEditingField, ticket], updateRect, {
  deep: true,
  flush: 'post',
})

watch([isSidebarOpen, isLayerPanelOpen], () => {
  updateRect()
  clearTimeout(sidebarTimer)
  sidebarTimer = setTimeout(updateRect, 330)
})

function onHandlePointerMove(e) {
  if (handlePointerId !== null && e.pointerId !== handlePointerId) return
  if (!isDraggingHandle.value || dragTargetIds.length === 0) return
  const dx = (e.clientX - dragStartX) / dragScaleX
  const dy = (e.clientY - dragStartY) / dragScaleY
  if (!hasHandleMoved && (dx !== 0 || dy !== 0)) {
    hasHandleMoved = true
    notifyDragStart()
  }
  moveBlocksByDelta(dragTargetIds, dx, dy, initialOffsetsMap)
}

function stopHandleDrag(e) {
  if (handlePointerId !== null && e?.pointerId !== undefined && e.pointerId !== handlePointerId) {
    return
  }
  if (hasHandleMoved) {
    hasHandleMoved = false
    notifyDragEnd()
  }
  if (handlePointerId !== null && handleRef.value?.hasPointerCapture?.(handlePointerId)) {
    try {
      handleRef.value.releasePointerCapture(handlePointerId)
    } catch {
      // Ignore release failures after unmount
    }
  }
  handlePointerId = null
  isDraggingHandle.value = false
  dragTargetIds = []
  initialOffsetsMap = {}
  window.removeEventListener('pointermove', onHandlePointerMove)
  window.removeEventListener('pointerup', stopHandleDrag)
  window.removeEventListener('pointercancel', stopHandleDrag)
}

function onHandlePointerDown(e) {
  if (!e.isPrimary || e.button !== 0 || isSelectionLocked.value) return
  e.preventDefault()
  e.stopPropagation()

  const activeEl = document.activeElement
  const activeTag = activeEl?.tagName?.toLowerCase()
  if (activeTag === 'input' || activeTag === 'textarea') {
    activeEl.blur()
  }

  dragTargetIds = selectedIds.value.filter(
    (id) => !layerState[id]?.locked && layerState[id]?.visible !== false
  )
  if (dragTargetIds.length === 0) return

  const scale = getBlockScale(dragTargetIds[0])
  dragScaleX = scale.scaleX
  dragScaleY = scale.scaleY
  dragStartX = e.clientX
  dragStartY = e.clientY
  handlePointerId = e.pointerId
  hasHandleMoved = false
  initialOffsetsMap = {}
  dragTargetIds.forEach((id) => {
    initialOffsetsMap[id] = { ...getOffset(id) }
  })

  if (handleRef.value?.setPointerCapture) {
    try {
      handleRef.value.setPointerCapture(handlePointerId)
    } catch {
      // Ignore if element is not eligible
    }
  }

  isDraggingHandle.value = true
  window.addEventListener('pointermove', onHandlePointerMove)
  window.addEventListener('pointerup', stopHandleDrag)
  window.addEventListener('pointercancel', stopHandleDrag)
}

onMounted(() => {
  window.addEventListener('resize', updateRect)
  window.addEventListener('scroll', updateRect, true)
})

onUnmounted(() => {
  clearTimeout(sidebarTimer)
  stopHandleDrag()
  window.removeEventListener('resize', updateRect)
  window.removeEventListener('scroll', updateRect, true)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="barRef"
      :style="barStyle"
      class="fixed z-50 select-none"
      role="toolbar"
      aria-label="Move selected field"
      @pointerdown.stop
      @click.stop
    >
      <button
        ref="handleRef"
        type="button"
        class="touch-none inline-flex items-center gap-1.5 h-6 px-2 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-cyan-400/50 text-cyan-200 text-[10px] font-mono-code font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-colors"
        :class="
          isSelectionLocked
            ? 'opacity-60 cursor-not-allowed border-amber-400/50 text-amber-200'
            : isDraggingHandle
              ? 'cursor-grabbing'
              : 'cursor-grab'
        "
        :title="isSelectionLocked ? 'Locked — right-click to unlock' : 'Drag to move · Right-click component for options'"
        @pointerdown="onHandlePointerDown"
      >
        <Lock v-if="isSelectionLocked" class="w-3 h-3 shrink-0" />
        <Move v-else class="w-3 h-3 shrink-0" />
        <span>Move</span>
        <span class="text-slate-400 truncate max-w-[110px]">{{ selectionLabel }}</span>
      </button>
    </div>
  </Teleport>
</template>
