<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useTicketTilt } from '@/composables/useTicketTilt'
import { useTicketData } from '@/composables/useTicketData'
import { useCanvasDrag } from '@/composables/useCanvasDrag'
import { useTicketHistory } from '@/composables/useTicketHistory'
import TicketFront from './TicketFront.vue'
import TicketBack from './TicketBack.vue'
import CanvasSelectionBar from './CanvasSelectionBar.vue'
import CanvasContextMenu from './CanvasContextMenu.vue'

const isFlipped = defineModel('isFlipped', {
  type: Boolean,
  default: false,
})

const { interactionMode, isEditingField, bgMode, customBgImage, bgPosX, bgPosY, panBgByDelta } =
  useTicketData()
const {
  selectedIds,
  hasClipboardLayers,
  setFlipped,
  clearSelection,
  closeContextMenu,
  removeSelectedFields,
  copySelectedLayers,
  pasteLayers,
  duplicateSelectedLayers,
  nudgeSelected,
  notifyDragStart,
  notifyDragEnd,
  bumpLayout,
} = useCanvasDrag()
const { undo, redo } = useTicketHistory()

const sceneElement = ref(null)
const isFlipping = ref(false)
const isDraggingSceneBg = ref(false)
let flipTimeout = null
let sceneBgStartX = 0
let sceneBgStartY = 0
let sceneBgInitPosX = 50
let sceneBgInitPosY = 50
let sceneBgRect = { width: 860, height: 330 }
let sceneBgPointerId = null
let hasSceneBgMoved = false

const { onTouchMove, onTouchEnd } = useTicketTilt(sceneElement, isFlipped)

watch(isFlipped, () => {
  isFlipping.value = true
  clearTimeout(flipTimeout)
  flipTimeout = setTimeout(() => {
    isFlipping.value = false
    bumpLayout()
  }, 740)
})

function toggleFlip() {
  setFlipped(!isFlipped.value)
}

function onSceneBgPointerMove(e) {
  if (sceneBgPointerId !== null && e.pointerId !== sceneBgPointerId) return
  const dx = e.clientX - sceneBgStartX
  const dy = e.clientY - sceneBgStartY
  if (!hasSceneBgMoved && Math.hypot(dx, dy) > 3) {
    hasSceneBgMoved = true
    isDraggingSceneBg.value = true
    notifyDragStart()
  }
  if (hasSceneBgMoved) {
    const effectiveDx = isFlipped.value ? -dx : dx
    panBgByDelta(
      sceneBgInitPosX,
      sceneBgInitPosY,
      effectiveDx,
      dy,
      sceneBgRect.width,
      sceneBgRect.height
    )
  }
}

function stopSceneBgDrag(e) {
  if (sceneBgPointerId !== null && e?.pointerId !== undefined && e.pointerId !== sceneBgPointerId) {
    return
  }
  window.removeEventListener('pointermove', onSceneBgPointerMove)
  window.removeEventListener('pointerup', stopSceneBgDrag)
  window.removeEventListener('pointercancel', stopSceneBgDrag)
  if (hasSceneBgMoved) {
    notifyDragEnd()
  }
  isDraggingSceneBg.value = false
  hasSceneBgMoved = false
  sceneBgPointerId = null
}

function onScenePointerDown(e) {
  if (interactionMode.value !== 'edit') return
  const target = e.target
  if (!target?.closest?.('.canvas-draggable, .canvas-editable, button, input, textarea')) {
    clearSelection()
    if (e.isPrimary && e.button === 0 && bgMode.value === 'image' && customBgImage.value) {
      const rect = sceneElement.value?.getBoundingClientRect()
      if (!rect || rect.width <= 0 || rect.height <= 0) return
      sceneBgRect = { width: rect.width, height: rect.height }
      sceneBgStartX = e.clientX
      sceneBgStartY = e.clientY
      sceneBgInitPosX = bgPosX.value
      sceneBgInitPosY = bgPosY.value
      sceneBgPointerId = e.pointerId
      hasSceneBgMoved = false
      window.addEventListener('pointermove', onSceneBgPointerMove)
      window.addEventListener('pointerup', stopSceneBgDrag)
      window.addEventListener('pointercancel', stopSceneBgDrag)
    }
  } else {
    closeContextMenu()
  }
}

function onSceneClick() {
  if (interactionMode.value === 'preview') {
    toggleFlip()
  }
}

function onKeydown(e) {
  if (interactionMode.value !== 'preview' || e.target !== sceneElement.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggleFlip()
  }
}

const NON_TEXT_INPUT_TYPES = new Set([
  'range',
  'color',
  'checkbox',
  'radio',
  'button',
  'submit',
  'reset',
  'file',
  'image',
  'hidden',
  'date',
  'time',
])

function onWindowKeydown(e) {
  if (isEditingField.value) return

  const activeEl = document.activeElement
  const activeTag = activeEl?.tagName?.toLowerCase()
  const inputType = (activeEl?.type || 'text').toLowerCase()
  const isTextInput =
    (activeTag === 'input' && !NON_TEXT_INPUT_TYPES.has(inputType)) ||
    activeTag === 'textarea' ||
    activeTag === 'select' ||
    Boolean(activeEl?.isContentEditable)
  if (isTextInput) return

  if ((e.ctrlKey || e.metaKey) && !e.altKey) {
    const key = e.key.toLowerCase()
    if (key === 'z') {
      e.preventDefault()
      if (e.shiftKey) {
        redo()
      } else {
        undo()
      }
      return
    }
    if (key === 'y' && !e.shiftKey) {
      e.preventDefault()
      redo()
      return
    }
  }

  if (interactionMode.value !== 'edit') return
  if (activeEl?.closest?.('aside, [role="toolbar"], [role="menu"]')) return

  if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
    const key = e.key.toLowerCase()
    if (key === 'c' && selectedIds.value.length > 0 && !window.getSelection?.()?.toString()) {
      e.preventDefault()
      copySelectedLayers()
      return
    }
    if (key === 'v' && hasClipboardLayers.value) {
      e.preventDefault()
      pasteLayers()
      return
    }
    if (key === 'd' && selectedIds.value.length > 0) {
      e.preventDefault()
      duplicateSelectedLayers()
      return
    }
  }

  if (selectedIds.value.length === 0) return

  if (e.key === 'Escape') {
    clearSelection()
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    removeSelectedFields()
  } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    const step = e.shiftKey ? 8 : 1
    if (e.key === 'ArrowUp') nudgeSelected(0, -step)
    if (e.key === 'ArrowDown') nudgeSelected(0, step)
    if (e.key === 'ArrowLeft') nudgeSelected(-step, 0)
    if (e.key === 'ArrowRight') nudgeSelected(step, 0)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown)
})

onUnmounted(() => {
  if (flipTimeout) clearTimeout(flipTimeout)
  stopSceneBgDrag()
  window.removeEventListener('keydown', onWindowKeydown)
})

defineExpose({
  toggleFlip,
})
</script>

<template>
  <main
    ref="sceneElement"
    class="ticket-scene"
    :class="{
      'is-canvas-mode': interactionMode === 'edit',
      'has-custom-bg': interactionMode === 'edit' && bgMode === 'image' && Boolean(customBgImage),
      'is-dragging-bg': isDraggingSceneBg,
    }"
    :role="interactionMode === 'preview' ? 'button' : 'region'"
    :tabindex="interactionMode === 'preview' ? 0 : undefined"
    :aria-label="
      interactionMode === 'preview'
        ? 'Interactive 3D Ticket. Click or press Enter to flip.'
        : 'Interactive Ticket Canvas Editor.'
    "
    @pointerdown="onScenePointerDown"
    @click="onSceneClick"
    @keydown="onKeydown"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="ticket-3d-rig" :class="{ 'is-flipping': isFlipping }">
      <!-- Front Side -->
      <TicketFront :is-flipped="isFlipped" />

      <!-- Back Side -->
      <TicketBack :is-flipped="isFlipped" />
    </div>

    <CanvasSelectionBar />
    <CanvasContextMenu />
  </main>
</template>
