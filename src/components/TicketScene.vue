<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useTicketTilt } from '@/composables/useTicketTilt'
import TicketFront from './TicketFront.vue'
import TicketBack from './TicketBack.vue'

const isFlipped = defineModel('isFlipped', {
  type: Boolean,
  default: false,
})

const sceneElement = ref(null)
const isFlipping = ref(false)
let flipTimeout = null

const { onTouchMove, onTouchEnd } = useTicketTilt(sceneElement, isFlipped)

watch(isFlipped, () => {
  isFlipping.value = true
  clearTimeout(flipTimeout)
  flipTimeout = setTimeout(() => {
    isFlipping.value = false
  }, 740)
})

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}

function onKeydown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggleFlip()
  }
}

onUnmounted(() => {
  if (flipTimeout) clearTimeout(flipTimeout)
})

defineExpose({
  toggleFlip,
})
</script>

<template>
  <main
    ref="sceneElement"
    class="ticket-scene"
    role="button"
    tabindex="0"
    aria-label="Interactive 3D Boarding Pass Ticket. Click or press Enter to flip."
    @click="toggleFlip"
    @keydown="onKeydown"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="ticket-3d-rig" :class="{ 'is-flipping': isFlipping }">
      <!-- Dynamic Floating Shadow -->
      <div class="ticket-shadow"></div>

      <!-- Front Side -->
      <TicketFront />

      <!-- Back Side -->
      <TicketBack />
    </div>
  </main>
</template>

