<script setup>
import { computed } from 'vue'
import { Image as ImageIcon } from '@lucide/vue'
import { useTicketData } from '../composables/useTicketData.js'
import TicketDataMatrixSvg from './TicketDataMatrixSvg.vue'

const props = defineProps({
  box: {
    type: Object,
    required: true,
  },
  imageClass: {
    type: String,
    default: 'w-full h-full object-contain select-none pointer-events-none',
  },
})

const { ticket } = useTicketData()

const customUrl = computed(() => {
  if (!props.box) return null
  return typeof props.box.getUrl === 'function' ? props.box.getUrl(ticket) : null
})

const isRemoved = computed(() => {
  if (!props.box) return false
  return typeof props.box.isRemoved === 'function' ? props.box.isRemoved(ticket) : false
})

const templateType = computed(() => props.box?.templateType || 'image')
</script>

<template>
  <template v-if="!isRemoved">
    <!-- Custom uploaded image -->
    <img
      v-if="customUrl"
      :src="customUrl"
      :alt="box?.label || 'Image'"
      :class="[imageClass, 'bg-transparent']"
    />

    <!-- Built-in 2D QR Code template -->
    <TicketDataMatrixSvg
      v-else-if="templateType === 'qr'"
      type="qr"
      svg-class="w-full h-full text-slate-950 select-none pointer-events-none"
    />

    <!-- Built-in 1D Barcode template -->
    <TicketDataMatrixSvg
      v-else-if="templateType === 'barcode'"
      type="barcode"
      svg-class="w-full h-full select-none pointer-events-none"
    />

    <!-- Blank custom image placeholder slot -->
    <div
      v-else
      class="w-full h-full border border-dashed border-cyan-400/50 rounded-lg flex flex-col items-center justify-center p-2 text-cyan-200/90 bg-transparent select-none"
    >
      <ImageIcon class="w-5 h-5 mb-1 text-cyan-300 opacity-80 shrink-0" />
      <span class="text-[9px] font-mono-code font-bold uppercase tracking-wider text-center">
        {{ box?.label || 'Upload Image' }}
      </span>
    </div>
  </template>
</template>
