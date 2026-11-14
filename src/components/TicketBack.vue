<script setup>
import TicketGlassLayers from './TicketGlassLayers.vue'
import { useTicketData } from '../composables/useTicketData.js'

defineProps({
  qrStandard: { type: String, default: 'ISO/IEC 18004' },
  foilSpec: { type: String, default: 'AG-999' },
})

const { ticket, isLightBg, customLogoUrl, foilMode, foilStyles } = useTicketData()
</script>

<template>
  <section class="ticket-face ticket-back flex flex-col-reverse sm:flex-row" :class="{ 'ticket-light-mode': isLightBg }">
    <TicketGlassLayers />
    <div class="perforation-line-back"></div>

    <!-- Back Left Section (~29% width, aligns with Front Right Stub) -->
    <div
      class="relative z-10 flex flex-col items-center justify-between p-5 sm:p-6 sm:pr-7 bg-white/[0.03]"
      style="flex-basis: 29%;"
    >
      <!-- High-Contrast Laser QR Code -->
      <div class="my-auto py-2 flex flex-col items-center">
        <div class="p-2.5 rounded-xl bg-white shadow-[0_8px_25px_rgba(0,0,0,0.45)] border border-white/80 relative">
          <svg class="w-28 h-28 sm:w-32 sm:h-32 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
            <!-- Finder Pattern Top-Left -->
            <path d="M8,8 h26 v26 h-26 z M13,13 v16 h16 v-16 z M17,17 h8 v8 h-8 z" />
            <!-- Finder Pattern Top-Right -->
            <path d="M66,8 h26 v26 h-26 z M71,13 v16 h16 v-16 z M75,17 h8 v8 h-8 z" />
            <!-- Finder Pattern Bottom-Left -->
            <path d="M8,66 h26 v26 h-26 z M13,71 v16 h16 v-16 z M17,75 h8 v8 h-8 z" />
            <!-- Alignment & Data Matrix Modules -->
            <rect x="40" y="8" width="5" height="5" />
            <rect x="50" y="8" width="5" height="10" />
            <rect x="40" y="18" width="10" height="5" />
            <rect x="55" y="23" width="5" height="5" />
            <rect x="38" y="30" width="6" height="6" />
            <rect x="48" y="34" width="12" height="5" />
            <rect x="8" y="40" width="10" height="5" />
            <rect x="24" y="40" width="5" height="12" />
            <rect x="34" y="44" width="8" height="8" />
            <rect x="46" y="44" width="10" height="10" />
            <rect x="62" y="40" width="6" height="14" />
            <rect x="74" y="40" width="10" height="5" />
            <rect x="86" y="46" width="6" height="12" />
            <rect x="12" y="52" width="8" height="6" />
            <rect x="38" y="58" width="12" height="5" />
            <rect x="54" y="58" width="6" height="12" />
            <rect x="66" y="60" width="16" height="6" />
            <rect x="40" y="68" width="8" height="8" />
            <rect x="40" y="82" width="14" height="10" />
            <rect x="60" y="74" width="8" height="18" />
            <rect x="72" y="70" width="12" height="12" />
            <rect x="77" y="75" width="4" height="4" fill="#fff" />
            <rect x="86" y="68" width="6" height="24" />
          </svg>
        </div>
        <div class="text-[9px] font-mono-code tracking-[0.22em] text-slate-200 mt-2 truncate max-w-full text-center px-1">
          {{ ticket.qrPayload }}
        </div>
      </div>

      <div class="w-full pt-2 border-t border-white/15 flex items-center justify-between text-[9px] font-mono-code text-slate-300/75">
        <span>VERIFIED</span>
        <span>{{ qrStandard }}</span>
      </div>
    </div>

    <!-- Back Right Main Section (~71% width) -->
    <div class="relative z-10 flex-1 flex flex-col justify-between p-5 sm:p-6 sm:pl-8" style="flex-basis: 71%;">
      <!-- Back Header + Iridescent Strip -->
      <div class="flex items-center justify-end border-b border-white/15 pb-3">
        <!-- Holographic Security Seal Pill -->
        <div
          class="px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/40 transition-all duration-300"
          :class="foilMode === 'rainbow' ? 'holo-foil-strip' : ''"
          :style="foilStyles.stripStyle"
        >
          <span class="w-2 h-2 rounded-full" :class="foilStyles.dotColor"></span>
          <span class="font-mono-code text-[9px] font-bold tracking-[0.2em]" :class="foilStyles.textColor">
            {{ ticket.holoStatus }}
          </span>
        </div>
      </div>

      <!-- Center Prominent Template Area for Logo -->
      <div class="my-auto py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <!-- Dashed Glassmorphic Logo Placeholder Box -->
        <div
          class="logo-template-zone flex-1 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left"
        >
          <!-- Metallic Placeholder Emblem or Custom Logo -->
          <div
            v-if="customLogoUrl"
            class="h-16 sm:h-20 flex items-center justify-center shrink-0"
          >
            <img
              :src="customLogoUrl"
              alt="Logo"
              class="h-full w-auto max-w-[180px] sm:max-w-[220px] object-contain"
            />
          </div>
          <div
            v-else
            class="w-14 h-14 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center shrink-0 shadow-inner overflow-hidden"
          >
            <svg class="w-8 h-8 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2" stroke-linecap="round" stroke-linejoin="round" />
              <polyline points="2 17 12 22 22 17" stroke-linecap="round" stroke-linejoin="round" />
              <polyline points="2 12 12 17 22 12" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div>
            <div class="text-base sm:text-lg font-display font-bold tracking-wider silver-text-emboss">
              {{ ticket.logoTitle }}
            </div>
            <div class="text-[11px] text-slate-300/75 font-mono-code mt-0.5">
              {{ ticket.logoSubtitle }}
            </div>
          </div>
        </div>

        <!-- Secondary Laser Security Stamp -->
        <div class="hidden md:flex flex-col justify-between p-3.5 rounded-2xl bg-white/5 border border-white/15 w-44 shrink-0">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-mono-code tracking-widest text-slate-300/75">FOIL SPEC</span>
            <span class="text-[9px] font-mono-code text-cyan-200">{{ foilSpec }}</span>
          </div>
          <div class="my-2 text-[10px] font-mono-code text-slate-200/90 leading-relaxed">
            METALLIC SILVER GLASS<br />
            REFRACTIVE INDEX: 1.52
          </div>
          <div class="text-[8px] font-mono-code tracking-[0.2em] text-slate-400 uppercase border-t border-white/10 pt-1.5 truncate">
            {{ ticket.securityNotice }}
          </div>
        </div>
      </div>

      <!-- Bottom Full-Width High-Contrast Laser Barcode -->
      <div class="pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="w-full sm:flex-1 h-11 rounded-lg bg-white/95 px-3 py-1.5 flex items-center shadow-md">
          <svg class="w-full h-full" viewBox="0 0 360 32" preserveAspectRatio="none">
            <g fill="#090d16">
              <rect x="0" y="0" width="4" height="32" />
              <rect x="7" y="0" width="2" height="32" />
              <rect x="12" y="0" width="6" height="32" />
              <rect x="21" y="0" width="2" height="32" />
              <rect x="26" y="0" width="4" height="32" />
              <rect x="34" y="0" width="8" height="32" />
              <rect x="46" y="0" width="2" height="32" />
              <rect x="51" y="0" width="4" height="32" />
              <rect x="59" y="0" width="3" height="32" />
              <rect x="65" y="0" width="7" height="32" />
              <rect x="76" y="0" width="2" height="32" />
              <rect x="81" y="0" width="5" height="32" />
              <rect x="90" y="0" width="2" height="32" />
              <rect x="95" y="0" width="6" height="32" />
              <rect x="105" y="0" width="3" height="32" />
              <rect x="111" y="0" width="8" height="32" />
              <rect x="123" y="0" width="2" height="32" />
              <rect x="128" y="0" width="4" height="32" />
              <rect x="136" y="0" width="6" height="32" />
              <rect x="145" y="0" width="2" height="32" />
              <rect x="150" y="0" width="5" height="32" />
              <rect x="159" y="0" width="3" height="32" />
              <rect x="165" y="0" width="7" height="32" />
              <rect x="176" y="0" width="2" height="32" />
              <rect x="181" y="0" width="4" height="32" />
              <rect x="189" y="0" width="8" height="32" />
              <rect x="201" y="0" width="2" height="32" />
              <rect x="206" y="0" width="5" height="32" />
              <rect x="215" y="0" width="3" height="32" />
              <rect x="221" y="0" width="6" height="32" />
              <rect x="231" y="0" width="2" height="32" />
              <rect x="236" y="0" width="7" height="32" />
              <rect x="247" y="0" width="3" height="32" />
              <rect x="253" y="0" width="4" height="32" />
              <rect x="261" y="0" width="8" height="32" />
              <rect x="273" y="0" width="2" height="32" />
              <rect x="278" y="0" width="5" height="32" />
              <rect x="287" y="0" width="3" height="32" />
              <rect x="293" y="0" width="6" height="32" />
              <rect x="303" y="0" width="2" height="32" />
              <rect x="308" y="0" width="7" height="32" />
              <rect x="319" y="0" width="4" height="32" />
              <rect x="326" y="0" width="2" height="32" />
              <rect x="331" y="0" width="8" height="32" />
              <rect x="343" y="0" width="3" height="32" />
              <rect x="349" y="0" width="5" height="32" />
              <rect x="357" y="0" width="3" height="32" />
            </g>
          </svg>
        </div>

        <div class="text-right shrink-0">
          <div class="text-[10px] font-mono-code font-bold tracking-[0.2em] text-white">
            {{ ticket.barcodeNumber }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
