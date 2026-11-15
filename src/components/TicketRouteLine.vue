<script setup>
import { computed } from 'vue'
import { Plane } from '@lucide/vue'
import { iconMap } from '../constants/ticketIcons.js'
import EditableText from './EditableText.vue'
import { useTicketData } from '../composables/useTicketData.js'

defineProps({
  routeBox: {
    type: Object,
    default: null,
  },
  noteBox: {
    type: Object,
    default: null,
  },
})

const { ticket, interactionMode, cycleRouteIcon } = useTicketData()
const routeIconComponent = computed(() => iconMap[ticket.routeIcon] || Plane)

function onRouteIconClick(e) {
  if (interactionMode.value !== 'edit') return
  if (e.ctrlKey || e.metaKey) return
  e.stopPropagation()
  cycleRouteIcon()
}
</script>

<template>
  <EditableText v-if="routeBox" :box="routeBox" />
  <div class="w-full flex items-center gap-1.5">
    <span class="w-2 h-2 rounded-full border border-white/70 bg-white/20 shrink-0"></span>
    <div class="flex-1 h-[1.5px] bg-gradient-to-r from-white/20 via-white/80 to-white/20"></div>
    <button
      type="button"
      :tabindex="interactionMode === 'edit' ? 0 : -1"
      class="p-1 rounded-md transition-colors shrink-0"
      :class="
        interactionMode === 'edit' ? 'cursor-pointer hover:bg-white/15' : 'pointer-events-none'
      "
      :title="interactionMode === 'edit' ? 'Click to switch route icon' : undefined"
      @click="onRouteIconClick"
    >
      <component
        :is="routeIconComponent"
        class="w-4 h-4 text-white"
        :class="ticket.routeIcon === 'Plane' ? 'rotate-45' : ''"
      />
    </button>
    <div class="flex-1 h-[1.5px] bg-gradient-to-r from-white/20 via-white/80 to-white/20"></div>
    <span class="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fff] shrink-0"></span>
  </div>
  <EditableText v-if="noteBox" :box="noteBox" />
</template>
