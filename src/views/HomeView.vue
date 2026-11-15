<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Layers, ChevronRight } from '@lucide/vue'
import StageBackground from '@/components/StageBackground.vue'
import TicketStatusBar from '@/components/TicketStatusBar.vue'
import TicketScene from '@/components/TicketScene.vue'
import TicketControls from '@/components/TicketControls.vue'
import TicketSidebar from '@/components/TicketSidebar.vue'
import LayerVisualizerSidebar from '@/components/LayerVisualizerSidebar.vue'
import { useCanvasDrag } from '@/composables/useCanvasDrag.js'
import { useTicketHistory } from '@/composables/useTicketHistory.js'

const {
  isFlipped,
  toggleFlip,
  isSidebarOpen,
  isLayerPanelOpen,
  toggleLayerPanel,
  clearSelection,
} = useCanvasDrag()

useTicketHistory()

const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1440)

function onResize() {
  viewportWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

const drawerPx = computed(() => (viewportWidth.value >= 1280 ? 384 : 320))
const basePadX = computed(() => (viewportWidth.value >= 640 ? 32 : 16))
const leftPushPx = computed(() =>
  isLayerPanelOpen.value && viewportWidth.value >= 1024 ? drawerPx.value : 0,
)
const rightPushPx = computed(() =>
  isSidebarOpen.value && viewportWidth.value >= 1024 ? drawerPx.value : 0,
)
const stageScale = computed(() => {
  const innerAvailable =
    viewportWidth.value - (leftPushPx.value + basePadX.value) - (rightPushPx.value + basePadX.value)
  if (innerAvailable >= 860) return 1
  return Math.max(0.28, innerAvailable / 860)
})
</script>

<template>
  <div class="relative w-full min-h-screen overflow-x-hidden bg-slate-950 select-none">
    <StageBackground />

    <!-- Left Floating Opener Handle when Layer Visualizer is Closed -->
    <button
      v-if="!isLayerPanelOpen"
      type="button"
      class="fixed left-0 top-6 z-30 h-10 pl-2.5 pr-3 rounded-r-xl bg-slate-900/95 hover:bg-slate-800 border-r border-t border-b border-white/20 flex items-center gap-1.5 text-cyan-300 hover:text-white shadow-2xl transition-all cursor-pointer group"
      title="Open Layer Visualizer"
      aria-label="Open Layer Visualizer"
      @click="toggleLayerPanel"
    >
      <Layers class="w-4 h-4 shrink-0" />
      <ChevronRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
    </button>

    <!-- Top-Level Status & Action Bar (Edit/3D Review, Undo/Redo, Layers, Restore, Reset) -->
    <div
      class="fixed top-3.5 sm:top-5 left-1/2 z-20 transition-[transform] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none w-max max-w-[calc(100vw-24px)]"
      :style="{
        maxWidth: `calc(100vw - ${leftPushPx + rightPushPx + 24}px)`,
        transform: `translateX(calc(-50% + ${(leftPushPx - rightPushPx) / 2}px))`,
      }"
    >
      <div class="pointer-events-auto">
        <TicketStatusBar />
      </div>
    </div>

    <!-- Main Ticket Stage: shifts smoothly as Left/Right drawers open -->
    <div
      class="w-full min-h-screen flex flex-col items-center justify-center pt-20 sm:pt-24 pb-24 transition-[padding] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      :style="{
        paddingLeft: `${leftPushPx + basePadX}px`,
        paddingRight: `${rightPushPx + basePadX}px`,
      }"
      @pointerdown.self="clearSelection"
    >
      <div
        class="transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        :style="stageScale < 1 ? { transform: `scale(${stageScale})`, transformOrigin: 'center center' } : undefined"
      >
        <TicketScene v-model:is-flipped="isFlipped" />
      </div>
    </div>

    <!-- Bottom Controls centered within active visible stage -->
    <div
      class="fixed bottom-4 sm:bottom-6 left-1/2 z-20 transition-[transform] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      :style="{
        maxWidth: `calc(100vw - ${leftPushPx + rightPushPx + 24}px)`,
        transform: `translateX(calc(-50% + ${(leftPushPx - rightPushPx) / 2}px))`,
      }"
    >
      <TicketControls @flip="toggleFlip" />
    </div>

    <!-- Left-Side Layer Visualizer & Spatial Map -->
    <LayerVisualizerSidebar />

    <!-- Right-Side Design & Content Customizer Sidebar -->
    <TicketSidebar v-model:is-open="isSidebarOpen" />
  </div>
</template>
