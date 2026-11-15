<script setup>
import { computed } from 'vue'
import { ticketTextBoxes } from '../models/ticketTextBoxes.js'
import TicketGlassLayers from './TicketGlassLayers.vue'
import EditableText from './EditableText.vue'
import CanvasDraggable from './CanvasDraggable.vue'
import TicketEmblem from './TicketEmblem.vue'
import TicketDataMatrixSvg from './TicketDataMatrixSvg.vue'
import CustomCanvasLayers from './CustomCanvasLayers.vue'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'

defineProps({
  isFlipped: {
    type: Boolean,
    default: false,
  },
})

const { ticket, isLightBg } = useTicketData()
const { isAnyLayerVisible } = useCanvasDrag()

const BACK_BRAND_LAYER_IDS = ['back-emblem', 'back-brand-title', 'back-brand-subtitle']
const showBackBrandZone = computed(() => isAnyLayerVisible(BACK_BRAND_LAYER_IDS))
</script>

<template>
  <section
    class="ticket-face ticket-back flex flex-row"
    :class="{ 'ticket-light-mode': isLightBg, 'pointer-events-none': !isFlipped }"
    :inert="!isFlipped"
  >
    <TicketGlassLayers />
    <div class="perforation-line-back"></div>

    <!-- Back Left Scan Section (~29% width, aligns with Front Right Stub) -->
    <div
      class="relative flex flex-col items-center justify-center p-6 pr-7 bg-white/[0.03] min-w-0"
      style="flex-basis: 29%;"
    >
      <div class="my-auto py-2 flex flex-col items-center w-full min-w-0 gap-2">
        <CanvasDraggable
          block-id="back-qr"
          class="p-2.5 rounded-xl bg-white shadow-[0_8px_25px_rgba(0,0,0,0.45)] border border-white/80 relative"
        >
          <TicketDataMatrixSvg type="qr" />
        </CanvasDraggable>

        <CanvasDraggable block-id="back-qr-payload" class="max-w-full min-w-0">
          <EditableText :box="ticketTextBoxes.qrPayload" />
        </CanvasDraggable>
      </div>
    </div>

    <!-- Back Right Main Section (~71% width) -->
    <div class="relative flex-1 flex flex-col justify-between p-6 pl-8 min-w-0">
      <!-- Top Bar: Venue Address & Organizer Contact -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3 min-w-0">
        <CanvasDraggable block-id="back-address" class="flex items-center min-w-0 flex-1">
          <EditableText :box="ticketTextBoxes.venueAddress" />
        </CanvasDraggable>

        <CanvasDraggable
          block-id="back-contact"
          class="flex items-center min-w-0 max-w-[44%] shrink-0 px-2.5 py-0.5 rounded-md border"
          :style="{
            color: ticket.degreeColor || '#a5f3fc',
            borderColor: `${ticket.degreeColor || '#a5f3fc'}40`,
            backgroundColor: `${ticket.degreeColor || '#a5f3fc'}14`,
          }"
        >
          <EditableText :box="ticketTextBoxes.organizerContact" />
        </CanvasDraggable>
      </div>

      <!-- Center Zone: Granular Brand Logo/Title/Subtitle + Entry Policy & Terms -->
      <div class="my-auto py-3 flex flex-row items-stretch gap-3.5 min-w-0">
        <div
          v-if="showBackBrandZone"
          class="logo-template-zone flex-1 rounded-2xl p-4 flex flex-row items-center justify-center gap-3.5 text-left min-w-0"
        >
          <CanvasDraggable block-id="back-emblem" class="shrink-0">
            <TicketEmblem variant="back" />
          </CanvasDraggable>

          <div class="min-w-0 flex-1 flex flex-col gap-0.5">
            <CanvasDraggable block-id="back-brand-title" class="min-w-0">
              <EditableText :box="ticketTextBoxes.logoTitle" />
            </CanvasDraggable>
            <CanvasDraggable block-id="back-brand-subtitle" class="min-w-0">
              <EditableText :box="ticketTextBoxes.logoSubtitle" />
            </CanvasDraggable>
          </div>
        </div>

        <CanvasDraggable
          block-id="back-terms"
          class="flex flex-col justify-between p-3.5 rounded-2xl bg-white/5 border border-white/15 min-w-0"
          :class="showBackBrandZone ? 'w-56 shrink-0' : 'flex-1'"
        >
          <EditableText :box="ticketTextBoxes.termsLabel" />
          <EditableText :box="ticketTextBoxes.policyText" />
        </CanvasDraggable>
      </div>

      <!-- Bottom Full-Width Single Functional 1D Barcode + Serial -->
      <div class="pt-3 border-t border-white/15 flex flex-row items-center justify-between gap-3">
        <CanvasDraggable
          block-id="back-barcode"
          class="flex-1 h-11 rounded-lg bg-white/95 px-3 py-1.5 flex items-center shadow-md"
        >
          <TicketDataMatrixSvg type="barcode" />
        </CanvasDraggable>

        <CanvasDraggable block-id="back-serial" class="text-right shrink-0">
          <EditableText :box="ticketTextBoxes.barcodeNumber" />
        </CanvasDraggable>
      </div>
    </div>

    <CustomCanvasLayers face="back" />
  </section>
</template>
