<script setup>
import { ref } from 'vue'
import StageBackground from '@/components/StageBackground.vue'
import TicketStatusBar from '@/components/TicketStatusBar.vue'
import TicketScene from '@/components/TicketScene.vue'
import TicketControls from '@/components/TicketControls.vue'

const isFlipped = ref(false)

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}
</script>

<template>
  <div class="relative w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 select-none">
    <StageBackground />
    <TicketStatusBar :is-flipped="isFlipped" />
    <TicketScene v-model:is-flipped="isFlipped" />
    <TicketControls @flip="toggleFlip" />
  </div>
</template>
