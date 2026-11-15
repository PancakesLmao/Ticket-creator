<script setup>
import { ref, computed, watch, provide, onUnmounted } from 'vue'
import { Lock } from '@lucide/vue'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'

const props = defineProps({
  blockId: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    default: 'div',
  },
})

const { interactionMode, isEditingField } = useTicketData()
const {
  layerGroups,
  selectedIds,
  activeDragId,
  hoveredLayerId,
  ensureLayerState,
  getOffset,
  getElementSize,
  setElementSize,
  getDragTargetIds,
  selectBlock,
  isSelected,
  setHoveredLayer,
  notifyDragStart,
  notifyDragEnd,
  openContextMenu,
  moveBlocksByDelta,
  registerBlockEl,
  registerBlockEditFn,
} = useCanvasDrag()

ensureLayerState(props.blockId)

const blockRef = ref(null)
const isDragging = ref(false)
let startX = 0
let startY = 0
let scaleX = 1
let scaleY = 1
let activePointerId = null
let dragTargetIds = []
let initialOffsetsMap = {}
let toggleMultiOnUp = false
let hasMoved = false
let suppressNextClick = false
let suppressTimer = null
let hasPrimaryEdit = false
let wasSelectedBeforeDown = false

provide('canvasDraggableRegisterEdit', (fn, isPrimary = false) => {
  if (!fn) {
    if (isPrimary) {
      hasPrimaryEdit = false
      registerBlockEditFn(props.blockId, null)
    }
    return
  }
  if (isPrimary || !hasPrimaryEdit) {
    hasPrimaryEdit = isPrimary
    registerBlockEditFn(props.blockId, fn)
  }
})

provide('canvasDraggableContext', {
  blockId: props.blockId,
  isSelected: () => isBlockSelected.value,
  isLocked: () => isLocked.value,
  wasSelectedBeforeDown: () => wasSelectedBeforeDown,
  didMoveDuringPointer: () => hasMoved || suppressNextClick,
})

const layer = computed(() => ensureLayerState(props.blockId))
const isVisible = computed(() => layer.value.visible !== false)
const isLocked = computed(() => Boolean(layer.value.locked))
const isEditMode = computed(() => interactionMode.value === 'edit')
const isBlockSelected = computed(() => isEditMode.value && selectedIds.value.includes(props.blockId))
const isLayerHovered = computed(() => isEditMode.value && hoveredLayerId.value === props.blockId)
const activeGroup = computed(() => {
  const gid = layer.value.groupId
  return gid ? layerGroups[gid] || null : null
})
const offset = computed(() => getOffset(props.blockId))
const elementSize = computed(() => getElementSize(props.blockId))
const ownScale = computed(() => elementSize.value.scale ?? 1)
const explicitWidth = computed(() => elementSize.value.width ?? null)

const isResizing = ref(false)
const activeResizeMode = ref(null)
let resizePointerId = null
let resizeStartX = 0
let resizeStartY = 0
let resizeStartWidth = 100
let resizeStartScale = 1
let resizeBaseW = 100
let resizeBaseH = 40
let resizeStageScaleX = 1
let resizeStageScaleY = 1
let resizeNotifyStarted = false

const blockStyle = computed(() => {
  const { x, y } = offset.value
  const baseZ = layer.value.zIndex ?? 10
  const scale = ownScale.value
  const hasScale = Math.abs(scale - 1) >= 0.001
  const hasOffset = x !== 0 || y !== 0
  const transforms = []
  if (hasOffset) transforms.push(`translate3d(${x}px, ${y}px, 0)`)
  if (hasScale) transforms.push(`scale(${scale})`)

  const style = {
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    transformOrigin: hasScale ? 'top left' : undefined,
    zIndex:
      activeDragId.value === props.blockId || isResizing.value
        ? 60
        : isBlockSelected.value
          ? baseZ + 20
          : baseZ,
  }
  if (explicitWidth.value !== null) {
    style.width = `${explicitWidth.value}px`
  }
  return style
})

watch(
  blockRef,
  (el) => {
    registerBlockEl(props.blockId, el)
  },
  { flush: 'post' }
)

watch(isVisible, (visible) => {
  if (!visible) {
    hasPrimaryEdit = false
    registerBlockEditFn(props.blockId, null)
  }
})

function onPointerMove(e) {
  if (activePointerId !== null && e.pointerId !== activePointerId) return
  if (dragTargetIds.length === 0) return

  const dx = (e.clientX - startX) / scaleX
  const dy = (e.clientY - startY) / scaleY

  if (!hasMoved && Math.hypot(dx, dy) > 3) {
    hasMoved = true
    isDragging.value = true
    activeDragId.value = props.blockId
    notifyDragStart()
    if (toggleMultiOnUp) {
      if (!isSelected(props.blockId)) {
        selectBlock(props.blockId, { multi: true })
      }
      toggleMultiOnUp = false
    }
    if (activePointerId !== null && blockRef.value?.setPointerCapture) {
      try {
        blockRef.value.setPointerCapture(activePointerId)
      } catch {
        // Ignore if element is no longer eligible
      }
    }
  }

  if (hasMoved) {
    moveBlocksByDelta(dragTargetIds, dx, dy, initialOffsetsMap)
  }
}

function cleanupListeners() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  if (activePointerId !== null && blockRef.value?.hasPointerCapture?.(activePointerId)) {
    try {
      blockRef.value.releasePointerCapture(activePointerId)
    } catch {
      // Ignore release failures after unmount
    }
  }
  activePointerId = null
}

function onPointerUp(e) {
  if (activePointerId !== null && e?.pointerId !== undefined && e.pointerId !== activePointerId) {
    return
  }
  cleanupListeners()

  if (!hasMoved) {
    if (toggleMultiOnUp) {
      selectBlock(props.blockId, { multi: true })
    } else if (!activeGroup.value && selectedIds.value.length > 1) {
      selectBlock(props.blockId, { multi: false })
    }
  }

  if (hasMoved) {
    notifyDragEnd()
    suppressNextClick = true
    clearTimeout(suppressTimer)
    suppressTimer = setTimeout(() => {
      suppressNextClick = false
    }, 50)
  }

  isDragging.value = false
  if (activeDragId.value === props.blockId) {
    activeDragId.value = null
  }
  dragTargetIds = []
  initialOffsetsMap = {}
  toggleMultiOnUp = false
  hasMoved = false
}

function onPointerDown(e) {
  if (!isEditMode.value) return
  if (!e.isPrimary || e.button !== 0) return
  if (e.target?.closest?.('[data-no-drag]')) return
  const targetTag = e.target?.tagName?.toLowerCase()
  if (targetTag === 'input' || targetTag === 'textarea') return

  if (isEditingField.value) {
    const activeEl = document.activeElement
    const activeTag = activeEl?.tagName?.toLowerCase()
    if (activeTag === 'input' || activeTag === 'textarea') {
      if (e.target === activeEl) return
      activeEl.blur()
    }
  }

  e.stopPropagation()

  const isMultiKey = e.ctrlKey || e.metaKey
  toggleMultiOnUp = isMultiKey
  wasSelectedBeforeDown = isSelected(props.blockId)

  if (!isMultiKey && !wasSelectedBeforeDown) {
    selectBlock(props.blockId, { multi: false })
  }

  dragTargetIds = isLocked.value
    ? []
    : getDragTargetIds(props.blockId, { includeExisting: isMultiKey })
  initialOffsetsMap = {}
  dragTargetIds.forEach((id) => {
    initialOffsetsMap[id] = { ...getOffset(id) }
  })

  const el = blockRef.value
  if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
    const rect = el.getBoundingClientRect()
    const curScale = ownScale.value || 1
    scaleX = rect.width / el.offsetWidth / curScale || 1
    scaleY = rect.height / el.offsetHeight / curScale || 1
  } else {
    scaleX = 1
    scaleY = 1
  }

  startX = e.clientX
  startY = e.clientY
  activePointerId = e.pointerId
  hasMoved = false

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onResizeMove(e) {
  if (resizePointerId !== null && e.pointerId !== resizePointerId) return
  const dxScreen = e.clientX - resizeStartX
  const dyScreen = e.clientY - resizeStartY
  if (!resizeNotifyStarted && Math.hypot(dxScreen, dyScreen) < 2) return
  if (!resizeNotifyStarted) {
    resizeNotifyStarted = true
    notifyDragStart()
  }

  const dx = dxScreen / resizeStageScaleX
  const dy = dyScreen / resizeStageScaleY

  if (activeResizeMode.value === 'width') {
    const nextWidth = resizeStartWidth + dx / resizeStartScale
    setElementSize(props.blockId, { width: nextWidth })
  } else if (activeResizeMode.value === 'scale') {
    const diagSq = resizeBaseW * resizeBaseW + resizeBaseH * resizeBaseH
    const deltaScale = diagSq > 0 ? (dx * resizeBaseW + dy * resizeBaseH) / diagSq : 0
    setElementSize(props.blockId, { scale: resizeStartScale + deltaScale })
  }
}

function cleanupResizeListeners() {
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', onResizeUp)
  window.removeEventListener('pointercancel', onResizeUp)
  resizePointerId = null
}

function onResizeUp(e) {
  if (resizePointerId !== null && e?.pointerId !== undefined && e.pointerId !== resizePointerId) {
    return
  }
  cleanupResizeListeners()
  if (resizeNotifyStarted) {
    notifyDragEnd()
    suppressNextClick = true
    clearTimeout(suppressTimer)
    suppressTimer = setTimeout(() => {
      suppressNextClick = false
    }, 50)
  }
  isResizing.value = false
  activeResizeMode.value = null
  resizeNotifyStarted = false
}

function startResize(mode, e) {
  if (!isEditMode.value || isLocked.value) return
  if (!e.isPrimary || e.button !== 0) return

  if (isEditingField.value) {
    const activeEl = document.activeElement
    const activeTag = activeEl?.tagName?.toLowerCase()
    if (activeTag === 'input' || activeTag === 'textarea') {
      activeEl.blur()
    }
  }

  e.stopPropagation()
  e.preventDefault()

  const el = blockRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const curSize = getElementSize(props.blockId)

  resizeStartScale = curSize.scale ?? 1
  resizeBaseW = el.offsetWidth || 100
  resizeBaseH = el.offsetHeight || 40
  resizeStartWidth = curSize.width ?? resizeBaseW
  resizeStageScaleX = resizeBaseW > 0 ? rect.width / resizeBaseW / resizeStartScale || 1 : 1
  resizeStageScaleY = resizeBaseH > 0 ? rect.height / resizeBaseH / resizeStartScale || 1 : 1
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizePointerId = e.pointerId
  resizeNotifyStarted = false
  activeResizeMode.value = mode
  isResizing.value = true

  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', onResizeUp)
  window.addEventListener('pointercancel', onResizeUp)
}

function onContextMenu(e) {
  if (!isEditMode.value) return
  const activeEl = document.activeElement
  const activeTag = activeEl?.tagName?.toLowerCase()
  if (activeTag === 'input' || activeTag === 'textarea') {
    activeEl.blur()
  }
  openContextMenu(e.clientX, e.clientY, props.blockId)
}

function onClickCapture(e) {
  if (suppressNextClick) {
    e.stopPropagation()
    e.preventDefault()
    suppressNextClick = false
  }
}

function onMouseEnter() {
  if (!isEditMode.value) return
  setHoveredLayer(props.blockId)
}

function onMouseLeave() {
  if (hoveredLayerId.value === props.blockId) {
    setHoveredLayer(null)
  }
}

onUnmounted(() => {
  cleanupListeners()
  cleanupResizeListeners()
  clearTimeout(suppressTimer)
  if (hasMoved || isDragging.value || resizeNotifyStarted) {
    notifyDragEnd()
  }
  if (hoveredLayerId.value === props.blockId) {
    setHoveredLayer(null)
  }
  registerBlockEl(props.blockId, null)
  registerBlockEditFn(props.blockId, null)
  if (activeDragId.value === props.blockId) {
    activeDragId.value = null
  }
})
</script>

<template>
  <component
    :is="tag"
    v-if="isVisible"
    ref="blockRef"
    class="relative group/drag"
    :class="[
      isEditMode ? 'canvas-draggable' : '',
      isBlockSelected ? 'is-selected' : '',
      isLayerHovered ? 'is-layer-hovered' : '',
      activeGroup && isEditMode ? 'is-grouped' : '',
      isLocked && isEditMode ? 'is-locked' : '',
      isDragging ? 'is-dragging' : '',
      isResizing ? 'is-resizing' : '',
      explicitWidth !== null ? 'is-width-resized' : '',
    ]"
    :style="blockStyle"
    @dragstart.prevent
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @pointerdown="onPointerDown"
    @contextmenu.prevent.stop="onContextMenu"
    @click.capture="onClickCapture"
  >
    <slot />

    <span
      v-if="isEditMode && isBlockSelected && (activeGroup || isLocked)"
      class="pointer-events-none absolute -top-2.5 left-0 z-30 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono-code font-bold shadow border"
      :class="
        isLocked
          ? 'bg-amber-950/95 border-amber-400/60 text-amber-200'
          : 'bg-violet-950/95 border-violet-400/60 text-violet-200'
      "
    >
      <Lock v-if="isLocked" class="w-2.5 h-2.5" />
      <span v-if="activeGroup">{{ activeGroup.name }}</span>
    </span>

    <div
      v-if="isEditMode && isBlockSelected && !isLocked"
      data-no-drag
      title="Drag right edge to resize width"
      class="absolute -right-2 top-1/2 -translate-y-1/2 z-30 w-2 h-5 rounded-full bg-cyan-400 border border-slate-950 shadow cursor-ew-resize hover:scale-110 transition-transform"
      @pointerdown.stop="startResize('width', $event)"
    ></div>

    <div
      v-if="isEditMode && isBlockSelected && !isLocked"
      data-no-drag
      title="Drag corner to scale proportionally"
      class="absolute -right-2 -bottom-2 z-30 w-3 h-3 rounded-sm bg-cyan-300 border border-slate-950 shadow cursor-nwse-resize hover:scale-125 transition-transform"
      @pointerdown.stop="startResize('scale', $event)"
    ></div>

    <span
      v-if="isEditMode && isResizing"
      class="pointer-events-none absolute -bottom-6 right-0 z-40 px-1.5 py-0.5 rounded bg-slate-950/95 border border-cyan-400/50 text-[9px] font-mono-code font-semibold text-cyan-200 whitespace-nowrap shadow"
    >
      {{
        activeResizeMode === 'width'
          ? `${explicitWidth ?? resizeStartWidth}px`
          : `${Math.round(ownScale * 100)}%`
      }}
    </span>
  </component>
</template>
