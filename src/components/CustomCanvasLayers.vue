<script setup>
import { computed } from 'vue'
import { getTextBoxById } from '../models/ticketTextBoxes.js'
import CanvasDraggable from './CanvasDraggable.vue'
import EditableText from './EditableText.vue'
import TicketEmblem from './TicketEmblem.vue'
import TicketDataMatrixSvg from './TicketDataMatrixSvg.vue'
import TicketRouteLine from './TicketRouteLine.vue'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'

const props = defineProps({
  face: {
    type: String,
    default: 'front',
  },
})

const { ticket, foilMode, foilStyles } = useTicketData()
const { customLayers, getElementSize } = useCanvasDrag()

const faceLayers = computed(() => customLayers.filter((layer) => layer.face === props.face))

function getBox(layer, index = 0) {
  const id = layer.boxes?.[index]?.id
  return id ? getTextBoxById(id) : null
}

function getBoxes(layer) {
  return (layer.boxes || []).map((boxDef) => getTextBoxById(boxDef.id)).filter(Boolean)
}

function isFoilBadgeLayer(layer) {
  return (
    layer.sourceType === 'foil-badge' ||
    (layer.kind === 'textbox' && layer.stylePreset === 'badge')
  )
}

function layerPositionStyle(layer) {
  const size = getElementSize(layer.id)
  const style = {
    position: 'absolute',
    left: `${layer.baseX}px`,
    top: `${layer.baseY}px`,
  }
  if (!size.width && layer.baseWidth) {
    style.width = `${layer.baseWidth}px`
  }
  return style
}
</script>

<template>
  <div class="pointer-events-none absolute inset-0">
    <CanvasDraggable
      v-for="layer in faceLayers"
      :key="layer.id"
      :block-id="layer.id"
      class="pointer-events-auto"
      :style="layerPositionStyle(layer)"
    >
      <template v-if="isFoilBadgeLayer(layer)">
        <span
          data-foil-text
          class="inline-block font-mono-code text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider shadow-sm transition-all duration-300"
          :class="[foilMode === 'rainbow' ? 'holo-badge text-slate-950' : '', foilStyles.textColor]"
          :style="foilStyles.badgeStyle"
        >
          <EditableText v-if="getBox(layer, 0)" :box="getBox(layer, 0)" />
        </span>
      </template>

      <template v-else-if="layer.kind === 'textbox'">
        <EditableText v-if="getBox(layer, 0)" :box="getBox(layer, 0)" />
      </template>

      <template v-else-if="layer.sourceType === 'emblem-header'">
        <TicketEmblem variant="header" :block-id="layer.id" />
      </template>

      <template v-else-if="layer.sourceType === 'emblem-back'">
        <TicketEmblem variant="back" :block-id="layer.id" />
      </template>

      <template v-else-if="layer.sourceType === 'price-badge'">
        <span
          class="inline-block px-2 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-white/15 border"
          :style="{
            color: ticket.degreeColor || '#a5f3fc',
            borderColor: `${ticket.degreeColor || '#a5f3fc'}55`,
          }"
        >
          <EditableText v-if="getBox(layer, 0)" :box="getBox(layer, 0)" />
        </span>
      </template>

      <template v-else-if="layer.sourceType === 'route-line'">
        <div class="flex flex-col items-center justify-center px-2 min-w-0">
          <TicketRouteLine
            :route-box="getBox(layer, 0)"
            :note-box="getBox(layer, 1)"
          />
        </div>
      </template>

      <template v-else-if="layer.sourceType === 'micro-notice'">
        <div class="pt-1.5 border-t border-white/10 micro-text-strip truncate uppercase">
          <EditableText v-if="getBox(layer, 0)" :box="getBox(layer, 0)" />
        </div>
      </template>

      <template v-else-if="layer.sourceType === 'stub-pair'">
        <div class="flex justify-between items-baseline gap-2 min-w-0">
          <EditableText v-for="box in getBoxes(layer)" :key="box.id" :box="box" />
        </div>
      </template>

      <template v-else-if="layer.sourceType === 'stub-footer'">
        <div
          class="pt-2 border-t border-white/15 flex items-baseline justify-between gap-2 text-[9px] font-mono-code text-slate-300/80"
        >
          <EditableText v-for="box in getBoxes(layer)" :key="box.id" :box="box" />
        </div>
      </template>

      <template v-else-if="layer.sourceType === 'qr'">
        <div
          class="p-2.5 rounded-xl bg-white shadow-[0_8px_25px_rgba(0,0,0,0.45)] border border-white/80 relative"
        >
          <TicketDataMatrixSvg type="qr" />
        </div>
      </template>

      <template v-else-if="layer.sourceType === 'contact-pill'">
        <div
          class="flex items-center min-w-0 px-2.5 py-0.5 rounded-md border"
          :style="{
            color: ticket.degreeColor || '#a5f3fc',
            borderColor: `${ticket.degreeColor || '#a5f3fc'}40`,
            backgroundColor: `${ticket.degreeColor || '#a5f3fc'}14`,
          }"
        >
          <EditableText v-if="getBox(layer, 0)" :box="getBox(layer, 0)" />
        </div>
      </template>

      <template v-else-if="layer.sourceType === 'terms-card'">
        <div
          class="flex flex-col justify-between p-3.5 rounded-2xl bg-white/5 border border-white/15 min-w-0"
        >
          <EditableText v-for="box in getBoxes(layer)" :key="box.id" :box="box" />
        </div>
      </template>

      <template v-else-if="layer.sourceType === 'barcode'">
        <div class="w-full h-11 rounded-lg bg-white/95 px-3 py-1.5 flex items-center shadow-md">
          <TicketDataMatrixSvg type="barcode" />
        </div>
      </template>

      <template v-else>
        <div
          class="min-w-0 flex flex-col"
          :class="
            layer.sourceId === 'front-dest' || layer.sourceId === 'back-serial' ? 'text-right' : ''
          "
        >
          <EditableText
            v-for="box in getBoxes(layer)"
            :key="box.id"
            :box="box"
            :text-class="
              layer.sourceId === 'front-foil-top' || layer.sourceId === 'front-foil-bottom'
                ? foilStyles.textColor
                : ''
            "
          />
        </div>
      </template>
    </CanvasDraggable>
  </div>
</template>
