<script setup>
import { computed } from 'vue'
import { Plane, Ticket, Layers } from '@lucide/vue'
import { iconMap } from '../constants/ticketIcons.js'
import { CUSTOM_TEXT_STYLE_PRESETS } from '../models/ticketTextBoxes.js'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'
import TicketDataMatrixSvg from './TicketDataMatrixSvg.vue'

const props = defineProps({
  layerId: {
    type: String,
    required: true,
  },
})

const {
  ticket,
  emblemMode,
  customLogoUrl,
  bgMode,
  baseColor,
  isLightBg,
  foilMode,
  foilStyles,
} = useTicketData()
const { customLayers } = useCanvasDrag()

const customLayer = computed(
  () => customLayers.find((layer) => layer.id === props.layerId) || null
)
const effectiveId = computed(() => customLayer.value?.sourceId || props.layerId)
const isCustomTextbox = computed(() => customLayer.value?.kind === 'textbox')
const customPreset = computed(() => {
  const key = customLayer.value?.stylePreset || 'headline'
  return CUSTOM_TEXT_STYLE_PRESETS[key] || CUSTOM_TEXT_STYLE_PRESETS.headline
})

function resolvedText(boxIndex, fieldKey, placeholderFallback = '') {
  if (customLayer.value) {
    const boxDef = customLayer.value.boxes?.[boxIndex]
    const customVal = boxDef ? ticket.customBoxTexts?.[boxDef.id] : undefined
    return customVal || placeholderFallback
  }
  return ticket[fieldKey] || placeholderFallback
}

const customBoxText = computed(() => {
  const boxDef = customLayer.value?.boxes?.[0]
  const val = boxDef ? ticket.customBoxTexts?.[boxDef.id] : ''
  return val || customPreset.value.placeholder
})

const isLogoActive = computed(() => emblemMode.value === 'logo' && Boolean(customLogoUrl.value))
const headerIconComponent = computed(
  () => iconMap[ticket.headerIcon] || (effectiveId.value === 'back-emblem' ? Layers : Ticket)
)
const routeIconComponent = computed(() => iconMap[ticket.routeIcon] || Plane)

const surfaceStyle = computed(() => {
  if (bgMode.value === 'color') {
    return {
      background: isLightBg.value
        ? `linear-gradient(135deg, ${baseColor.value}f0, rgba(255,255,255,0.72))`
        : `linear-gradient(135deg, ${baseColor.value}e6, rgba(15,23,42,0.92))`,
    }
  }
  return {
    background: isLightBg.value
      ? 'linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(226, 232, 240, 0.9))'
      : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.88))',
  }
})

const metaPair = computed(() => {
  const map = {
    'front-meta-venue': {
      label: resolvedText(0, 'meta1Label', 'LABEL'),
      value: resolvedText(1, 'venueName', 'Venue'),
    },
    'front-meta-date': {
      label: resolvedText(0, 'meta2Label', 'LABEL'),
      value: resolvedText(1, 'eventDate', 'Date'),
    },
    'front-meta-time': {
      label: resolvedText(0, 'meta3Label', 'LABEL'),
      value: resolvedText(1, 'ceremonyTime', 'Time'),
    },
    'front-meta-doors': {
      label: resolvedText(0, 'meta4Label', 'LABEL'),
      value: resolvedText(1, 'doorsTime', 'Doors'),
    },
  }
  return map[effectiveId.value] || null
})

const stubPair = computed(() => {
  const map = {
    'stub-section': {
      label: resolvedText(0, 'sectionLabel', 'SECTION'),
      value: resolvedText(1, 'section', 'SEC'),
      accent: false,
    },
    'stub-row': {
      label: resolvedText(0, 'rowLabel', 'ROW'),
      value: resolvedText(1, 'row', 'ROW'),
      accent: false,
    },
    'stub-seat': {
      label: resolvedText(0, 'seatLabel', 'SEAT'),
      value: resolvedText(1, 'seat', 'SEAT'),
      accent: false,
    },
    'stub-ticket-no': {
      label: resolvedText(0, 'ticketNoLabel', 'TICKET NO.'),
      value: resolvedText(1, 'ticketNumber', '#0001'),
      accent: true,
    },
  }
  return map[effectiveId.value] || null
})
</script>

<template>
  <div
    class="w-full rounded-lg px-2.5 py-2 border transition-colors overflow-hidden min-h-[34px] flex items-center"
    :class="[
      isLightBg
        ? 'ticket-light-mode border-slate-300/70'
        : 'border-white/15',
    ]"
    :style="surfaceStyle"
  >
    <!-- Custom User-Added Text Box -->
    <template v-if="isCustomTextbox">
      <div v-if="customLayer.stylePreset === 'badge'" class="flex items-center">
        <span
          data-foil-text
          class="font-mono-code text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider shadow-sm truncate max-w-full"
          :class="[foilMode === 'rainbow' ? 'holo-badge text-slate-950' : '', foilStyles.textColor]"
          :style="foilStyles.badgeStyle"
        >
          {{ customBoxText }}
        </span>
      </div>
      <div
        v-else-if="customLayer.stylePreset === 'tag'"
        class="w-full text-[11px] font-mono-code font-medium truncate"
        :style="{ color: ticket.degreeColor || '#a5f3fc' }"
      >
        {{ customBoxText }}
      </div>
      <div
        v-else-if="customLayer.stylePreset === 'label'"
        class="w-full text-[9px] font-mono-code uppercase tracking-widest text-slate-300/85 truncate"
      >
        {{ customBoxText }}
      </div>
      <div
        v-else-if="customLayer.stylePreset === 'multiline'"
        class="w-full text-[9px] text-slate-200/90 truncate"
      >
        {{ customBoxText }}
      </div>
      <div
        v-else
        class="w-full text-sm font-display font-bold tracking-tight silver-text-emboss truncate"
      >
        {{ customBoxText }}
      </div>
    </template>

    <!-- Foil Strip Text Layers -->
    <div
      v-else-if="effectiveId === 'front-foil-top' || effectiveId === 'front-foil-bottom'"
      class="flex items-center w-full min-w-0"
    >
      <span
        data-foil-text
        class="px-2 py-0.5 rounded text-[9px] font-mono-code font-bold tracking-[0.2em] uppercase truncate max-w-full"
        :class="[foilMode === 'rainbow' ? 'holo-badge text-slate-950' : '', foilStyles.textColor]"
        :style="foilStyles.badgeStyle"
      >
        {{
          effectiveId === 'front-foil-top'
            ? resolvedText(0, 'holoStatus', 'HOLO-SEAL')
            : resolvedText(0, 'foilSubStatus', 'VERIFIED')
        }}
      </span>
    </div>

    <!-- Front & Back Emblems / Custom Logos -->
    <template v-else-if="effectiveId === 'front-emblem' || effectiveId === 'back-emblem'">
      <div class="flex items-center gap-2 min-w-0 w-full">
        <img
          v-if="isLogoActive"
          :src="customLogoUrl"
          alt="Logo preview"
          class="h-7 w-auto max-w-[90px] object-contain shrink-0"
        />
        <span
          v-else
          class="bg-white/10 border border-white/25 flex items-center justify-center shrink-0"
          :class="effectiveId === 'back-emblem' ? 'w-7 h-7 rounded-lg' : 'w-6 h-6 rounded-md'"
        >
          <component
            :is="headerIconComponent"
            class="text-cyan-200"
            :class="effectiveId === 'back-emblem' ? 'w-4 h-4' : 'w-3.5 h-3.5'"
          />
        </span>
        <span class="text-[9px] font-mono-code text-slate-300/80 truncate">
          {{ isLogoActive ? 'Custom Uploaded Logo' : `Icon: ${ticket.headerIcon || 'GraduationCap'}` }}
        </span>
      </div>
    </template>

    <!-- Issuer -->
    <div
      v-else-if="effectiveId === 'front-issuer'"
      class="w-full text-[9px] font-mono-code tracking-[0.2em] text-slate-300/85 uppercase truncate"
    >
      {{ resolvedText(0, 'institutionName', 'ORGANIZATION NAME') }}
    </div>

    <!-- Header Title -->
    <div
      v-else-if="effectiveId === 'front-title'"
      class="w-full text-xs font-display font-bold tracking-wider text-white truncate"
    >
      {{ resolvedText(0, 'ceremonyTitle', 'EVENT TITLE') }}
    </div>

    <!-- Foil Header Badge -->
    <div v-else-if="effectiveId === 'front-badge'" class="flex items-center">
      <span
        data-foil-text
        class="font-mono-code text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider shadow-sm truncate max-w-full"
        :class="[foilMode === 'rainbow' ? 'holo-badge text-slate-950' : '', foilStyles.textColor]"
        :style="foilStyles.badgeStyle"
      >
        {{ resolvedText(0, 'classYear', 'BADGE') }}
      </span>
    </div>

    <!-- Hero Label -->
    <div
      v-else-if="effectiveId === 'front-hero-label'"
      class="w-full text-[9px] font-mono-code uppercase tracking-widest text-slate-300/80 truncate"
    >
      {{ resolvedText(0, 'heroLabel', 'HOLDER LABEL') }}
    </div>

    <!-- Headline / Recipient Name -->
    <div
      v-else-if="effectiveId === 'front-headline-name'"
      class="w-full text-sm font-display font-bold tracking-tight silver-text-emboss truncate"
    >
      {{ resolvedText(0, 'graduateName', 'RECIPIENT OR EVENT NAME') }}
    </div>

    <!-- Subtitle -->
    <div
      v-else-if="effectiveId === 'front-subtitle'"
      class="w-full text-[11px] font-mono-code font-medium truncate"
      :style="{ color: ticket.degreeColor || '#a5f3fc' }"
    >
      {{ resolvedText(0, 'degreeMajor', 'SUBTITLE / ROLE') }}
    </div>

    <!-- Honors / Perk -->
    <div
      v-else-if="effectiveId === 'front-honors'"
      class="w-full text-[11px] font-mono-code font-medium truncate"
      :style="{ color: ticket.honorsColor || '#fef08a' }"
    >
      {{ resolvedText(0, 'honors', 'DISTINCTION / PERK') }}
    </div>

    <!-- Route Origin -->
    <div v-else-if="effectiveId === 'front-origin'" class="w-full min-w-0">
      <div class="text-[7px] font-mono-code uppercase tracking-widest text-slate-300/75 truncate">
        {{ resolvedText(0, 'originLabel', 'FROM') }}
      </div>
      <div class="flex items-baseline gap-1.5 min-w-0">
        <span class="text-sm font-display font-bold silver-text-emboss uppercase leading-none">
          {{ resolvedText(1, 'originCode', 'ORG') }}
        </span>
        <span class="text-[9px] text-slate-300/80 truncate">
          {{ resolvedText(2, 'originName', 'Origin Terminal') }}
        </span>
      </div>
    </div>

    <!-- Route Connector Line -->
    <div
      v-else-if="effectiveId === 'front-route-line'"
      class="w-full flex flex-col items-center gap-0.5 min-w-0"
    >
      <div
        class="text-[8px] font-mono-code tracking-[0.18em] truncate max-w-full"
        :style="{ color: ticket.degreeColor || '#a5f3fc' }"
      >
        {{ resolvedText(0, 'degreeMajor', 'ROUTE ID') }}
      </div>
      <div class="w-full flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full border border-white/70 bg-white/20 shrink-0"></span>
        <div class="flex-1 h-[1.5px] bg-gradient-to-r from-white/20 via-white/80 to-white/20"></div>
        <component
          :is="routeIconComponent"
          class="w-3.5 h-3.5 text-white shrink-0"
          :class="ticket.routeIcon === 'Plane' ? 'rotate-45' : ''"
        />
        <div class="flex-1 h-[1.5px] bg-gradient-to-r from-white/20 via-white/80 to-white/20"></div>
        <span class="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
      </div>
      <div class="text-[7px] font-mono-code tracking-[0.18em] text-slate-300/70 truncate max-w-full">
        {{ resolvedText(1, 'routeTransitNote', 'TRANSIT NOTE') }}
      </div>
    </div>

    <!-- Route Destination -->
    <div v-else-if="effectiveId === 'front-dest'" class="w-full min-w-0 text-right">
      <div class="text-[7px] font-mono-code uppercase tracking-widest text-slate-300/75 truncate">
        {{ resolvedText(0, 'destLabel', 'TO') }}
      </div>
      <div class="flex items-baseline justify-end gap-1.5 min-w-0">
        <span class="text-[9px] text-slate-300/80 truncate">
          {{ resolvedText(2, 'destName', 'Destination') }}
        </span>
        <span class="text-sm font-display font-bold silver-text-emboss uppercase leading-none">
          {{ resolvedText(1, 'destCode', 'DST') }}
        </span>
      </div>
    </div>

    <!-- Metadata Fields -->
    <div v-else-if="metaPair" class="w-full min-w-0">
      <div class="text-[7px] font-mono-code uppercase tracking-widest text-slate-300/70 truncate">
        {{ metaPair.label }}
      </div>
      <div class="text-[11px] font-mono-code font-semibold text-white truncate">
        {{ metaPair.value }}
      </div>
    </div>

    <!-- Security Notice -->
    <div
      v-else-if="effectiveId === 'front-notice'"
      class="w-full micro-text-strip uppercase truncate"
    >
      {{ resolvedText(0, 'securityNotice', 'ENTRY & ID NOTICE') }}
    </div>

    <!-- Stub Header Label -->
    <div
      v-else-if="effectiveId === 'stub-header-label'"
      class="w-full text-[8px] font-mono-code tracking-[0.2em] text-slate-300/80 uppercase truncate"
    >
      {{ resolvedText(0, 'stubHeaderLabel', 'PASS STUB') }}
    </div>

    <!-- Stub Pass Title -->
    <div
      v-else-if="effectiveId === 'stub-pass-title'"
      class="w-full text-xs font-display font-bold tracking-wider text-white truncate"
    >
      {{ resolvedText(0, 'ticketType', 'PASS TYPE') }}
    </div>

    <!-- Stub Price / Admit Badge -->
    <div v-else-if="effectiveId === 'stub-price-badge'" class="flex items-center">
      <span
        class="inline-block px-2 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-white/15 border truncate max-w-full"
        :style="{
          color: ticket.degreeColor || '#a5f3fc',
          borderColor: `${ticket.degreeColor || '#a5f3fc'}55`,
        }"
      >
        {{ resolvedText(0, 'admitCount', 'ADMIT 1') }}
      </span>
    </div>

    <!-- Stub Section / Row / Seat / Ticket No -->
    <div v-else-if="stubPair" class="w-full flex items-baseline justify-between gap-2 min-w-0">
      <span class="text-[8px] font-mono-code text-slate-300/75 uppercase truncate">
        {{ stubPair.label }}
      </span>
      <span
        class="text-[11px] font-mono-code font-semibold truncate text-right"
        :class="stubPair.accent ? '' : 'text-white'"
        :style="stubPair.accent ? { color: ticket.degreeColor || '#a5f3fc' } : undefined"
      >
        {{ stubPair.value }}
      </span>
    </div>

    <!-- Stub Footer -->
    <div
      v-else-if="effectiveId === 'stub-footer'"
      class="w-full flex items-baseline justify-between gap-2 text-[8px] font-mono-code text-slate-300/85"
    >
      <span class="tracking-widest uppercase truncate">
        {{ resolvedText(0, 'stubFooterLeft', 'RETAIN STUB') }}
      </span>
      <span class="text-slate-400 uppercase tracking-wider shrink-0">
        {{ resolvedText(1, 'stubFooterRight', 'DETACHABLE') }}
      </span>
    </div>

    <!-- Back QR Code -->
    <div v-else-if="effectiveId === 'back-qr'" class="flex items-center gap-2.5 min-w-0 w-full">
      <div class="p-1 rounded-md bg-white border border-white/80 shadow shrink-0">
        <TicketDataMatrixSvg type="qr" svg-class="w-9 h-9 text-slate-950" />
      </div>
      <div class="min-w-0">
        <div class="text-[9px] font-mono-code font-bold text-white uppercase">QR PASS CODE</div>
        <div class="text-[8px] font-mono-code text-slate-300/75 truncate">
          {{ ticket.qrPayload || 'SCAN TO VERIFY' }}
        </div>
      </div>
    </div>

    <!-- Back QR Payload -->
    <div
      v-else-if="effectiveId === 'back-qr-payload'"
      class="w-full text-[9px] font-mono-code tracking-wider text-slate-300 uppercase truncate"
    >
      {{ resolvedText(0, 'qrPayload', 'PAYLOAD STRING') }}
    </div>

    <!-- Back Venue Address -->
    <div v-else-if="effectiveId === 'back-address'" class="w-full flex items-center min-w-0">
      <span class="text-[9px] font-mono-code font-semibold text-white truncate">
        {{ resolvedText(0, 'venueAddress', 'STREET ADDRESS') }}
      </span>
    </div>

    <!-- Back Organizer Contact -->
    <div v-else-if="effectiveId === 'back-contact'" class="w-full flex items-center min-w-0">
      <span
        class="inline-block px-2 py-0.5 rounded text-[9px] font-mono-code border truncate max-w-full"
        :style="{
          color: ticket.degreeColor || '#a5f3fc',
          borderColor: `${ticket.degreeColor || '#a5f3fc'}40`,
          backgroundColor: `${ticket.degreeColor || '#a5f3fc'}14`,
        }"
      >
        {{ resolvedText(0, 'organizerContact', 'WEBSITE / CONTACT') }}
      </span>
    </div>

    <!-- Back Brand Title -->
    <div
      v-else-if="effectiveId === 'back-brand-title'"
      class="w-full text-xs font-display font-bold tracking-wider silver-text-emboss truncate"
    >
      {{ resolvedText(0, 'logoTitle', 'BRAND OR PARTNER TITLE') }}
    </div>

    <!-- Back Brand Subtitle -->
    <div
      v-else-if="effectiveId === 'back-brand-subtitle'"
      class="w-full text-[9px] font-mono-code text-slate-300/80 truncate"
    >
      {{ resolvedText(0, 'logoSubtitle', 'TAGLINE OR UPLOAD NOTE') }}
    </div>

    <!-- Back Terms Card -->
    <div
      v-else-if="effectiveId === 'back-terms'"
      class="w-full rounded px-2 py-1 bg-white/5 border border-white/15 min-w-0"
    >
      <div class="text-[8px] font-mono-code tracking-wider text-slate-300/85 uppercase truncate">
        {{ resolvedText(0, 'termsLabel', 'TERMS & RULES') }}
      </div>
      <div class="text-[9px] text-slate-200/90 truncate mt-0.5">
        {{ resolvedText(1, 'policyText', 'Entry policy and special instructions.') }}
      </div>
    </div>

    <!-- Back 1D Barcode -->
    <div
      v-else-if="effectiveId === 'back-barcode'"
      class="w-full h-7 rounded bg-white/95 px-2 py-1 flex items-center shadow-sm"
    >
      <TicketDataMatrixSvg type="barcode" svg-class="w-full h-full" />
    </div>

    <!-- Back Serial -->
    <div
      v-else-if="effectiveId === 'back-serial'"
      class="w-full text-[10px] font-mono-code font-bold tracking-[0.18em] text-white truncate text-right"
    >
      {{ resolvedText(0, 'barcodeNumber', '0000-0000-0000') }}
    </div>
  </div>
</template>

