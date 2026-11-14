<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, inject } from 'vue'
import { TextBox } from '../models/TextBox.js'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'

const props = defineProps({
  box: { type: Object, default: null },
  modelValue: { type: String, default: undefined },
  tag: { type: String, default: 'span' },
  placeholder: { type: String, default: 'CLICK TO EDIT' },
  textClass: { type: String, default: '' },
  inputClass: { type: String, default: '' },
  textStyle: { type: [Object, String], default: () => ({}) },
  multiline: { type: Boolean, default: false },
  editable: { type: Boolean, default: true },
  popover: { type: Boolean, default: false },
  foilText: { type: Boolean, default: false },
  primaryEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const { ticket, interactionMode, isLightBg, setEditingField } = useTicketData()
const { openContextMenu, removeTextBoxById } = useCanvasDrag()
const registerEditableTrigger = inject('canvasDraggableRegisterEdit', null)
const canvasDraggableContext = inject('canvasDraggableContext', null)

const isEditing = ref(false)
const inputRef = ref(null)
const triggerRef = ref(null)
const popoverStyle = ref({})

let downX = 0
let downY = 0
let wasSelectedOnDown = false

const textBoxInstance = computed(() => (props.box instanceof TextBox ? props.box : null))
const isBoxRemoved = computed(() =>
  textBoxInstance.value ? textBoxInstance.value.isRemoved(ticket) : false
)

const currentValue = computed(() => {
  if (props.modelValue !== undefined) return props.modelValue ?? ''
  if (textBoxInstance.value) return textBoxInstance.value.getValue(ticket)
  return ''
})

const localValue = ref(currentValue.value)

const resolvedTag = computed(() => textBoxInstance.value?.tag || props.tag)
const resolvedPlaceholder = computed(() => textBoxInstance.value?.placeholder || props.placeholder)
const resolvedTextClass = computed(() =>
  textBoxInstance.value
    ? textBoxInstance.value.resolveTextClass(ticket, props.textClass)
    : props.textClass
)
const resolvedInputClass = computed(() =>
  [textBoxInstance.value?.inputClass, props.inputClass].filter(Boolean).join(' ')
)
const resolvedTextStyle = computed(() =>
  textBoxInstance.value
    ? textBoxInstance.value.resolveTextStyle(ticket, props.textStyle)
    : props.textStyle
)
const resolvedMultiline = computed(() => Boolean(textBoxInstance.value?.multiline || props.multiline))
const resolvedEditable = computed(() =>
  textBoxInstance.value ? textBoxInstance.value.editable && props.editable : props.editable
)
const resolvedPopover = computed(() => Boolean(textBoxInstance.value?.popover || props.popover))
const resolvedFoilText = computed(() => Boolean(textBoxInstance.value?.foilText || props.foilText))
const resolvedPrimaryEdit = computed(() =>
  Boolean(textBoxInstance.value?.primaryEdit || props.primaryEdit)
)

const isEditableActive = computed(() => interactionMode.value === 'edit' && resolvedEditable.value)

const canDragNow = computed(() => {
  const isLocked = Boolean(canvasDraggableContext?.isLocked?.())
  if (textBoxInstance.value) {
    return textBoxInstance.value.canDrag({ isFocused: isEditing.value, isLocked })
  }
  return !isEditing.value && !isLocked
})

const hoverTitle = computed(() => {
  if (!isEditableActive.value) return undefined
  if (!canvasDraggableContext) return 'Click to edit text'
  return canvasDraggableContext.isSelected?.()
    ? 'Click to edit text · Drag to move · Right-click for options'
    : 'Drag to move · Click to select · Click again to edit'
})

const computedInputStyle = computed(() => {
  const styleObj = resolvedTextStyle.value
  if (!isLightBg.value) return styleObj
  if (typeof styleObj === 'object' && styleObj !== null) {
    const copy = { ...styleObj }
    delete copy.color
    return copy
  }
  return {}
})

watch(currentValue, (val) => {
  if (!isEditing.value) {
    localValue.value = val ?? ''
  }
})

watch(isEditableActive, (active) => {
  if (!active && isEditing.value) {
    cancelEdit()
  }
})

watch(isBoxRemoved, (removed) => {
  if (removed && isEditing.value) {
    isEditing.value = false
    setEditingField(false)
  }
})

onMounted(() => {
  if (resolvedEditable.value) {
    registerEditableTrigger?.(startEditing, resolvedPrimaryEdit.value)
  }
})

onUnmounted(() => {
  if (isEditing.value) {
    setEditingField(false)
  }
})

function updatePopoverPosition() {
  const el = triggerRef.value
  if (!el || typeof el.getBoundingClientRect !== 'function') return
  const rect = el.getBoundingClientRect()
  const boxWidth = 220
  const maxLeft = Math.max(12, window.innerWidth - boxWidth - 12)
  const left = Math.min(maxLeft, Math.max(12, rect.right + 10))
  const top = Math.min(window.innerHeight - 56, Math.max(12, rect.top + rect.height / 2 - 20))
  popoverStyle.value = {
    position: 'fixed',
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    width: `${boxWidth}px`,
  }
}

function onPointerDown(e) {
  downX = e.clientX
  downY = e.clientY
  wasSelectedOnDown = canvasDraggableContext ? Boolean(canvasDraggableContext.isSelected?.()) : true
}

async function startEditing(e) {
  if (isBoxRemoved.value || !isEditableActive.value) return
  if (e) e.stopPropagation()
  if (resolvedPopover.value) {
    updatePopoverPosition()
  }
  localValue.value = currentValue.value
  isEditing.value = true
  setEditingField(true)
  await nextTick()
  if (inputRef.value) {
    inputRef.value.focus()
    inputRef.value.select?.()
  }
}

function onTextClick(e) {
  if (!isEditableActive.value) return
  const movedDist = Math.hypot(e.clientX - downX, e.clientY - downY)
  const hasMoved = movedDist > 3 || Boolean(canvasDraggableContext?.didMoveDuringPointer?.())
  const hasParentBlock = Boolean(canvasDraggableContext)
  const wasBlockSelected = hasParentBlock
    ? wasSelectedOnDown || Boolean(canvasDraggableContext.wasSelectedBeforeDown?.())
    : true
  const isMultiKey = Boolean(e.ctrlKey || e.metaKey)

  const shouldFocus = textBoxInstance.value
    ? textBoxInstance.value.shouldEnterFocus({
        isEditableActive: isEditableActive.value,
        hasParentBlock,
        wasBlockSelected,
        hasMoved,
        isMultiKey,
      })
    : !hasMoved && !isMultiKey && (!hasParentBlock || wasBlockSelected)

  if (!shouldFocus) return
  startEditing(e)
}

function onTextDblClick(e) {
  if (isBoxRemoved.value || !isEditableActive.value) return
  if (e.ctrlKey || e.metaKey) return
  startEditing(e)
}

function onTextContextMenu(e) {
  if (isBoxRemoved.value || !isEditableActive.value) return
  const activeEl = document.activeElement
  const activeTag = activeEl?.tagName?.toLowerCase()
  if (activeTag === 'input' || activeTag === 'textarea') {
    activeEl.blur()
  }
  const blockId = canvasDraggableContext?.blockId || textBoxInstance.value?.blockId || null
  const textBoxId = textBoxInstance.value?.id || null
  openContextMenu(e.clientX, e.clientY, blockId, textBoxId)
}

function commitEdit() {
  if (!isEditing.value) return
  const trimmed = String(localValue.value ?? '').trim()
  if (trimmed === '' && textBoxInstance.value) {
    textBoxInstance.value.setValue(ticket, '')
    emit('update:modelValue', '')
    isEditing.value = false
    setEditingField(false)
    removeTextBoxById(textBoxInstance.value.id, ticket)
    return
  }
  if (textBoxInstance.value) {
    textBoxInstance.value.setValue(ticket, trimmed)
  }
  emit('update:modelValue', trimmed)
  isEditing.value = false
  setEditingField(false)
}

function cancelEdit() {
  localValue.value = currentValue.value
  isEditing.value = false
  setEditingField(false)
}

function onKeydown(e) {
  e.stopPropagation()
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
  } else if (e.key === 'Enter' && !resolvedMultiline.value) {
    e.preventDefault()
    commitEdit()
  }
}
</script>

<template>
  <template v-if="!isBoxRemoved">
    <span v-if="resolvedPopover" ref="triggerRef" class="relative inline-flex items-center">
      <component
        :is="resolvedTag"
        :data-foil-text="resolvedFoilText ? '' : undefined"
        :data-can-drag="canDragNow ? 'true' : 'false'"
        :class="[resolvedTextClass, isEditableActive ? 'canvas-editable' : '']"
        :style="resolvedTextStyle"
        :title="hoverTitle"
        @pointerdown="onPointerDown"
        @click="onTextClick"
        @dblclick="onTextDblClick"
        @contextmenu.prevent.stop="onTextContextMenu"
      >
        {{ currentValue || resolvedPlaceholder }}
      </component>

      <Teleport to="body">
        <div
          v-if="isEditing"
          :style="popoverStyle"
          class="z-50 p-1.5 rounded-lg bg-slate-900/95 border border-cyan-400/70 shadow-2xl backdrop-blur-xl"
          @click.stop
          @mousedown.stop
          @pointerdown.stop
        >
          <input
            ref="inputRef"
            v-model="localValue"
            type="text"
            :placeholder="resolvedPlaceholder"
            class="canvas-editable-input text-xs font-mono-code text-white px-2 py-1"
            @keydown="onKeydown"
            @blur="commitEdit"
          />
        </div>
      </Teleport>
    </span>

    <component
      :is="resolvedTag"
      v-else-if="!isEditing"
      :data-foil-text="resolvedFoilText ? '' : undefined"
      :data-can-drag="canDragNow ? 'true' : 'false'"
      :class="[resolvedTextClass, isEditableActive ? 'canvas-editable' : '']"
      :style="resolvedTextStyle"
      :title="hoverTitle"
      @pointerdown="onPointerDown"
      @click="onTextClick"
      @dblclick="onTextDblClick"
      @contextmenu.prevent.stop="onTextContextMenu"
    >
      {{ currentValue || resolvedPlaceholder }}
    </component>

    <textarea
      v-else-if="resolvedMultiline"
      ref="inputRef"
      v-model="localValue"
      rows="3"
      :placeholder="resolvedPlaceholder"
      :class="['canvas-editable-input resize-none', resolvedInputClass]"
      :style="computedInputStyle"
      @click.stop
      @mousedown.stop
      @pointerdown.stop
      @keydown="onKeydown"
      @blur="commitEdit"
    />

    <input
      v-else
      ref="inputRef"
      v-model="localValue"
      type="text"
      :placeholder="resolvedPlaceholder"
      :class="['canvas-editable-input', resolvedInputClass]"
      :style="computedInputStyle"
      @click.stop
      @mousedown.stop
      @pointerdown.stop
      @keydown="onKeydown"
      @blur="commitEdit"
    />
  </template>
</template>
