<script setup>
import { computed } from 'vue'
import { ticketTextBoxes } from '../models/ticketTextBoxes.js'
import TicketGlassLayers from './TicketGlassLayers.vue'
import EditableText from './EditableText.vue'
import CanvasDraggable from './CanvasDraggable.vue'
import TicketEmblem from './TicketEmblem.vue'
import TicketRouteLine from './TicketRouteLine.vue'
import CustomCanvasLayers from './CustomCanvasLayers.vue'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'

defineProps({
  isFlipped: {
    type: Boolean,
    default: false,
  },
})

const { ticket, isLightBg, foilMode, foilStyles } = useTicketData()
const { layerState, isAnyLayerVisible } = useCanvasDrag()

const FOIL_LAYER_IDS = ['front-foil-top', 'front-foil-bottom']
const HEADLINE_LAYER_IDS = [
  'front-hero-label',
  'front-headline-name',
  'front-subtitle',
  'front-honors',
]
const ROUTE_LAYER_IDS = ['front-origin', 'front-route-line', 'front-dest']
const INFO_GRID_LAYER_IDS = [
  'front-meta-venue',
  'front-meta-date',
  'front-meta-time',
  'front-meta-doors',
]

const showFoilStrip = computed(() => isAnyLayerVisible(FOIL_LAYER_IDS))
const showHeadlineZone = computed(() => isAnyLayerVisible(HEADLINE_LAYER_IDS))
const showRouteZone = computed(() => isAnyLayerVisible(ROUTE_LAYER_IDS))
const showInfoGrid = computed(() => isAnyLayerVisible(INFO_GRID_LAYER_IDS))
</script>

<template>
  <section
    class="ticket-face ticket-front flex flex-col sm:flex-row"
    :class="{ 'ticket-light-mode': isLightBg, 'pointer-events-none': isFlipped }"
    :inert="isFlipped"
  >
    <TicketGlassLayers />
    <div class="perforation-line-front"></div>

    <!-- Left Holographic Foil Strip (Auto-collapses when all foil layers removed) -->
    <div
      v-if="showFoilStrip"
      class="w-full h-5 sm:w-7 sm:h-full shrink-0 flex sm:flex-col items-center justify-between py-1 px-3 sm:py-4 sm:px-0 z-[9] border-b sm:border-b-0 sm:border-r border-white/30 transition-all duration-300"
      :class="foilMode === 'rainbow' ? 'holo-foil-strip' : ''"
      :style="foilStyles.stripStyle"
    >
      <CanvasDraggable block-id="front-foil-top" class="min-w-0 flex items-center justify-center">
        <EditableText
          :box="ticketTextBoxes.holoStatus"
          :text-class="foilStyles.textColor"
        />
      </CanvasDraggable>
      <CanvasDraggable block-id="front-foil-bottom" class="min-w-0 flex items-center justify-center">
        <EditableText
          :box="ticketTextBoxes.foilSubStatus"
          :text-class="foilStyles.textColor"
        />
      </CanvasDraggable>
    </div>

    <!-- Main Body (~68% width) -->
    <div class="relative flex-1 flex flex-col justify-between p-5 sm:p-6 sm:pr-7 min-w-0">
      <!-- Header Row -->
      <div class="h-12 flex items-center justify-between gap-2 border-b border-white/15 pb-3">
        <div class="flex items-center gap-2.5 min-w-0 flex-1 h-full">
          <CanvasDraggable block-id="front-emblem" class="h-full flex items-center shrink-0">
            <TicketEmblem variant="header" />
          </CanvasDraggable>

          <div class="min-w-0 flex-1 flex flex-col">
            <CanvasDraggable block-id="front-issuer" class="min-w-0">
              <EditableText :box="ticketTextBoxes.institutionName" />
            </CanvasDraggable>
            <CanvasDraggable block-id="front-title" class="min-w-0">
              <EditableText :box="ticketTextBoxes.ceremonyTitle" />
            </CanvasDraggable>
          </div>
        </div>

        <CanvasDraggable
          block-id="front-badge"
          class="flex items-center gap-2 shrink-0"
        >
          <span
            data-foil-text
            class="font-mono-code text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider shadow-sm transition-all duration-300"
            :class="[foilMode === 'rainbow' ? 'holo-badge text-slate-950' : '', foilStyles.textColor]"
            :style="foilStyles.badgeStyle"
          >
            <EditableText :box="ticketTextBoxes.classYear" />
          </span>
        </CanvasDraggable>
      </div>

      <!-- Center Zone: Granular Headline & Route Blocks -->
      <div
        v-if="showHeadlineZone || showRouteZone"
        class="my-auto flex flex-col justify-center min-h-0 min-w-0"
        :class="showHeadlineZone && showRouteZone ? 'gap-1 py-0.5' : 'py-2'"
      >
        <div v-if="showHeadlineZone" class="min-w-0">
          <CanvasDraggable block-id="front-hero-label" class="min-w-0">
            <EditableText :box="ticketTextBoxes.heroLabel" />
          </CanvasDraggable>
          <CanvasDraggable block-id="front-headline-name" class="min-w-0">
            <EditableText :box="ticketTextBoxes.graduateName" />
          </CanvasDraggable>
          <div class="text-xs sm:text-sm font-mono-code font-medium mt-1 flex items-center gap-1.5 min-w-0">
            <CanvasDraggable block-id="front-subtitle" class="min-w-0">
              <EditableText :box="ticketTextBoxes.degreeMajor" />
            </CanvasDraggable>
            <span
              v-if="
                layerState['front-subtitle']?.visible !== false &&
                layerState['front-honors']?.visible !== false
              "
              class="text-slate-400 shrink-0"
            >•</span>
            <CanvasDraggable block-id="front-honors" class="min-w-0">
              <EditableText :box="ticketTextBoxes.honors" />
            </CanvasDraggable>
          </div>
        </div>

        <div v-if="showRouteZone" class="grid grid-cols-7 items-center gap-2 min-w-0">
          <CanvasDraggable block-id="front-origin" class="col-span-2 min-w-0">
            <EditableText :box="ticketTextBoxes.originLabel" />
            <EditableText :box="ticketTextBoxes.originCode" />
            <EditableText :box="ticketTextBoxes.originName" />
          </CanvasDraggable>

          <CanvasDraggable block-id="front-route-line" class="col-span-3 flex flex-col items-center justify-center px-2 min-w-0">
            <TicketRouteLine
              :route-box="ticketTextBoxes.routeId"
              :note-box="ticketTextBoxes.routeTransitNote"
            />
          </CanvasDraggable>

          <CanvasDraggable block-id="front-dest" class="col-span-2 text-right min-w-0">
            <EditableText :box="ticketTextBoxes.destLabel" />
            <EditableText :box="ticketTextBoxes.destCode" />
            <EditableText :box="ticketTextBoxes.destName" />
          </CanvasDraggable>
        </div>
      </div>

      <!-- 4-Column Event Metadata Grid (Each Field Independently Draggable & Removable) -->
      <div
        v-if="showInfoGrid"
        class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/15"
      >
        <CanvasDraggable block-id="front-meta-venue" class="min-w-0">
          <EditableText :box="ticketTextBoxes.meta1Label" />
          <EditableText :box="ticketTextBoxes.venueName" />
        </CanvasDraggable>

        <CanvasDraggable block-id="front-meta-date" class="min-w-0">
          <EditableText :box="ticketTextBoxes.meta2Label" />
          <EditableText :box="ticketTextBoxes.eventDate" />
        </CanvasDraggable>

        <CanvasDraggable block-id="front-meta-time" class="min-w-0">
          <EditableText :box="ticketTextBoxes.meta3Label" />
          <EditableText :box="ticketTextBoxes.ceremonyTime" />
        </CanvasDraggable>

        <CanvasDraggable block-id="front-meta-doors" class="min-w-0">
          <EditableText :box="ticketTextBoxes.meta4Label" />
          <EditableText :box="ticketTextBoxes.doorsTime" />
        </CanvasDraggable>
      </div>

      <!-- Footer: Security Notice -->
      <CanvasDraggable block-id="front-notice" class="mt-2.5 pt-1.5 border-t border-white/10">
        <div class="micro-text-strip truncate uppercase">
          <EditableText :box="ticketTextBoxes.securityNotice" />
        </div>
      </CanvasDraggable>
    </div>

    <!-- Tear-Off Stub (~29% width) -->
    <div
      class="relative flex flex-col justify-between p-5 sm:p-6 sm:pl-7 bg-white/[0.03] min-w-0"
      style="flex-basis: 29%;"
    >
      <div class="h-12 flex items-center justify-between gap-2 border-b border-white/15 pb-3">
        <div class="min-w-0 flex-1">
          <CanvasDraggable block-id="stub-header-label" class="min-w-0">
            <EditableText :box="ticketTextBoxes.stubHeaderLabel" />
          </CanvasDraggable>
          <CanvasDraggable block-id="stub-pass-title" class="min-w-0">
            <EditableText :box="ticketTextBoxes.ticketType" />
          </CanvasDraggable>
        </div>

        <CanvasDraggable
          block-id="stub-price-badge"
          class="shrink-0"
        >
          <span
            class="inline-block px-2 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-white/15 border"
            :style="{
              color: ticket.degreeColor || '#a5f3fc',
              borderColor: `${ticket.degreeColor || '#a5f3fc'}55`,
            }"
          >
            <EditableText :box="ticketTextBoxes.admitCount" />
          </span>
        </CanvasDraggable>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-1 gap-2 my-auto py-2">
        <CanvasDraggable block-id="stub-section" class="flex justify-between items-baseline gap-2 min-w-0">
          <EditableText :box="ticketTextBoxes.sectionLabel" />
          <EditableText :box="ticketTextBoxes.section" />
        </CanvasDraggable>

        <CanvasDraggable block-id="stub-row" class="flex justify-between items-baseline gap-2 min-w-0">
          <EditableText :box="ticketTextBoxes.rowLabel" />
          <EditableText :box="ticketTextBoxes.row" />
        </CanvasDraggable>

        <CanvasDraggable block-id="stub-seat" class="flex justify-between items-baseline gap-2 min-w-0">
          <EditableText :box="ticketTextBoxes.seatLabel" />
          <EditableText :box="ticketTextBoxes.seat" />
        </CanvasDraggable>

        <CanvasDraggable block-id="stub-ticket-no" class="flex justify-between items-baseline gap-2 min-w-0">
          <EditableText :box="ticketTextBoxes.ticketNoLabel" />
          <EditableText :box="ticketTextBoxes.ticketNumber" />
        </CanvasDraggable>
      </div>

      <!-- Clean Stub Verification Footer -->
      <CanvasDraggable block-id="stub-footer" class="pt-2 border-t border-white/15 flex items-baseline justify-between gap-2 text-[9px] font-mono-code text-slate-300/80">
        <EditableText :box="ticketTextBoxes.stubFooterLeft" />
        <EditableText :box="ticketTextBoxes.stubFooterRight" />
      </CanvasDraggable>
    </div>

    <CustomCanvasLayers face="front" />
  </section>
</template>
