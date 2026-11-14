<script setup>
import { ref } from 'vue'
import StageBackground from '@/components/StageBackground.vue'
import TicketStatusBar from '@/components/TicketStatusBar.vue'
import TicketScene from '@/components/TicketScene.vue'
import TicketControls from '@/components/TicketControls.vue'
import TicketSidebar from '@/components/TicketSidebar.vue'

const isFlipped = ref(false)
const isSidebarOpen = ref(false)

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}
</script>

<template>
  <div class="relative w-full min-h-screen overflow-x-hidden bg-slate-950 select-none">
    <StageBackground />

    <!-- Main Ticket Stage: pushes smoothly when sidebar slides in -->
    <div
      class="w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 transition-[padding-right] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      :style="{ paddingRight: isSidebarOpen ? 'min(24rem, 85vw)' : '0px' }"
    >
      <TicketStatusBar :is-flipped="isFlipped" />
      <TicketScene v-model:is-flipped="isFlipped" />
    </div>

    <!-- Bottom Controls with Flip Option -->
    <div
      class="fixed bottom-4 sm:bottom-6 left-1/2 z-20 transition-[transform] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      :style="{ transform: isSidebarOpen ? 'translateX(calc(-50% - min(12rem, 42.5vw)))' : 'translateX(-50%)' }"
    >
      <TicketControls @flip="toggleFlip" />
    </div>

    <!-- Sliding Right Customizer Sidebar -->
    <TicketSidebar v-model:is-open="isSidebarOpen" />
  </div>
</template>
