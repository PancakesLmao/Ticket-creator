<script setup>
import { computed, inject, watch } from 'vue'
import { Layers, Ticket } from '@lucide/vue'
import { iconMap } from '../constants/ticketIcons.js'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'

const props = defineProps({
  variant: {
    type: String,
    default: 'header',
  },
  blockId: {
    type: String,
    default: '',
  },
})

const { ticket, emblemMode, customLogoUrl, interactionMode, cycleHeaderIcon } = useTicketData()
const { isSelected } = useCanvasDrag()
const registerEditableTrigger = inject('canvasDraggableRegisterEdit', null)

const resolvedBlockId = computed(
  () => props.blockId || (props.variant === 'back' ? 'back-emblem' : 'front-emblem')
)
const isLogoActive = computed(() => emblemMode.value === 'logo' && Boolean(customLogoUrl.value))
const iconComponent = computed(() => {
  const fallback = props.variant === 'back' ? Layers : Ticket
  return iconMap[ticket.headerIcon] || fallback
})

let wasSelectedOnDown = false

function onIconPointerDown(e) {
  if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
    wasSelectedOnDown = isSelected(resolvedBlockId.value)
  }
}

function onIconClick(e) {
  if (interactionMode.value !== 'edit' || isLogoActive.value) return
  if (e.ctrlKey || e.metaKey) return
  e.stopPropagation()
  if (wasSelectedOnDown) {
    cycleHeaderIcon()
  }
  wasSelectedOnDown = false
}

watch(
  isLogoActive,
  (logoActive) => {
    registerEditableTrigger?.(logoActive ? null : cycleHeaderIcon, true)
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="isLogoActive" :class="variant === 'back' ? 'h-16 flex items-center justify-center shrink-0' : 'h-9 flex items-center shrink-0'">
    <img
      :src="customLogoUrl"
      alt="Custom ticket logo"
      draggable="false"
      :class="variant === 'back' ? 'h-full w-auto max-w-[160px] object-contain select-none' : 'h-9 w-auto max-w-[140px] object-contain select-none'"
    />
  </div>

  <button
    v-else
    type="button"
    :tabindex="interactionMode === 'edit' ? 0 : -1"
    class="bg-white/10 border border-white/25 flex items-center justify-center shadow-inner shrink-0 transition-all"
    :class="[
      variant === 'back' ? 'w-12 h-12 rounded-xl' : 'w-8 h-8 rounded-lg',
      interactionMode === 'edit' ? 'cursor-pointer hover:border-cyan-400/70 hover:bg-white/20' : 'pointer-events-none',
    ]"
    :title="interactionMode === 'edit' ? 'Click again to switch emblem icon' : undefined"
    @pointerdown="onIconPointerDown"
    @click="onIconClick"
  >
    <component
      :is="iconComponent"
      :class="variant === 'back' ? 'w-6 h-6 text-white/90' : 'w-4 h-4 text-white'"
    />
  </button>
</template>

