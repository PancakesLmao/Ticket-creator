<script setup>
import TicketGlassLayers from './TicketGlassLayers.vue'

defineProps({
  originCode: { type: String, default: 'TYO' },
  originName: { type: String, default: 'NEO-TOKYO TERMINAL' },
  destCode: { type: String, default: 'ZRH' },
  destName: { type: String, default: 'ZURICH SKYPORT' },
  flightNumber: { type: String, default: 'AX-2049' },
  flightTransit: { type: String, default: 'NON-STOP • ORBITAL TRANSIT' },
  ticketClass: { type: String, default: 'CLASS // S-01' },
  passengerName: { type: String, default: 'TEMPLATE // USER' },
  gate: { type: String, default: 'G-08' },
  boardingTime: { type: String, default: '21:45 UTC' },
  seat: { type: String, default: '04A // VIP' },
  seatStub: { type: String, default: '04A' },
  seqNumber: { type: String, default: '#0042' },
  authCode: { type: String, default: 'AUTH-0994-X' },
})
</script>

<template>
  <section class="ticket-face ticket-front flex flex-col sm:flex-row">
    <TicketGlassLayers />
    <div class="perforation-line-front"></div>

    <!-- Left Rainbow Holographic Foil Strip (Horizontal Desktop / Top Mobile) -->
    <div
      class="holo-foil-strip w-full h-5 sm:w-7 sm:h-full shrink-0 flex sm:flex-col items-center justify-between py-1 px-3 sm:py-4 sm:px-0 z-10 border-b sm:border-b-0 sm:border-r border-white/30"
    >
      <span
        class="font-mono-code text-[8px] font-bold tracking-[0.25em] text-slate-950/80 sm:[writing-mode:vertical-rl] sm:rotate-180"
      >
        HOLOGRAPHIC // LASER SECURED
      </span>
      <svg class="w-3.5 h-3.5 text-slate-950/80" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
      </svg>
      <span
        class="font-mono-code text-[8px] font-bold tracking-[0.25em] text-slate-950/80 sm:[writing-mode:vertical-rl] sm:rotate-180"
      >
        {{ authCode }}
      </span>
    </div>

    <!-- Main Boarding Pass Body (Left ~68% width) -->
    <div class="relative z-10 flex-1 flex flex-col justify-between p-5 sm:p-6 sm:pr-7" style="flex-basis: 68%;">
      <!-- Header Row -->
      <div class="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
        <div class="flex items-center gap-2.5">
          <!-- Etched Silver Vector Emblem -->
          <div
            class="w-8 h-8 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center shadow-inner"
          >
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div>
            <div class="text-[10px] font-mono-code tracking-[0.25em] text-slate-300/80 uppercase">
              AERO // LASER PASS
            </div>
            <div class="text-sm font-display font-bold tracking-wider text-white">SILVER EDITION • PRIORITY</div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="holo-badge text-slate-950 font-mono-code text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider shadow-sm"
          >
            {{ ticketClass }}
          </span>
        </div>
      </div>

      <!-- Route & Flight Origin / Destination -->
      <div class="my-auto py-3 grid grid-cols-7 items-center gap-2">
        <div class="col-span-2">
          <div class="text-[10px] font-mono-code uppercase tracking-widest text-slate-300/75">ORIGIN // SECTOR</div>
          <div class="text-3xl sm:text-4xl font-display font-bold tracking-tight silver-text-emboss leading-none mt-0.5">
            {{ originCode }}
          </div>
          <div class="text-[11px] text-slate-300/80 font-medium mt-1 truncate">{{ originName }}</div>
        </div>

        <!-- Laser Flight Path Graphic -->
        <div class="col-span-3 flex flex-col items-center justify-center px-2">
          <div class="text-[10px] font-mono-code tracking-[0.22em] text-cyan-200/90 mb-1">
            FLIGHT // {{ flightNumber }}
          </div>
          <div class="w-full flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full border border-white/70 bg-white/20"></span>
            <div class="flex-1 h-[1.5px] bg-gradient-to-r from-white/20 via-white/80 to-white/20 relative"></div>
            <svg class="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                transform="rotate(90 12 12)"
              />
            </svg>
            <div class="flex-1 h-[1.5px] bg-gradient-to-r from-white/20 via-white/80 to-white/20"></div>
            <span class="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fff]"></span>
          </div>
          <div class="text-[9px] font-mono-code tracking-[0.2em] text-slate-300/70 mt-1">
            {{ flightTransit }}
          </div>
        </div>

        <div class="col-span-2 text-right">
          <div class="text-[10px] font-mono-code uppercase tracking-widest text-slate-300/75">DEST // SECTOR</div>
          <div class="text-3xl sm:text-4xl font-display font-bold tracking-tight silver-text-emboss leading-none mt-0.5">
            {{ destCode }}
          </div>
          <div class="text-[11px] text-slate-300/80 font-medium mt-1 truncate">{{ destName }}</div>
        </div>
      </div>

      <!-- Passenger & Gate Metadata Grid -->
      <div class="grid grid-cols-4 gap-3 pt-3 border-t border-white/15">
        <div class="col-span-2 sm:col-span-1">
          <div class="text-[9px] font-mono-code uppercase tracking-widest text-slate-300/70">PASSENGER</div>
          <div class="text-xs sm:text-sm font-mono-code font-semibold text-white truncate mt-0.5">
            {{ passengerName }}
          </div>
        </div>
        <div>
          <div class="text-[9px] font-mono-code uppercase tracking-widest text-slate-300/70">GATE</div>
          <div class="text-xs sm:text-sm font-mono-code font-semibold text-white mt-0.5">{{ gate }}</div>
        </div>
        <div>
          <div class="text-[9px] font-mono-code uppercase tracking-widest text-slate-300/70">BOARDING</div>
          <div class="text-xs sm:text-sm font-mono-code font-semibold text-cyan-200 mt-0.5">{{ boardingTime }}</div>
        </div>
        <div>
          <div class="text-[9px] font-mono-code uppercase tracking-widest text-slate-300/70">SEAT</div>
          <div class="text-xs sm:text-sm font-mono-code font-bold text-white mt-0.5">{{ seat }}</div>
        </div>
      </div>

      <!-- Laser Etched Micro-Text Security Footer -->
      <div class="micro-text-strip mt-2.5 pt-1.5 border-t border-white/10">
        LASER-ETCHED SILVER GLASS PASS • TEMPLATE CREDENTIAL • UNAUTHORIZED DUPLICATION PROHIBITED • SERIES 884-AERO-X •
      </div>
    </div>

    <!-- Tear-Off Boarding Stub (Right ~29% width) -->
    <div
      class="relative z-10 flex flex-col justify-between p-5 sm:p-6 sm:pl-7 bg-white/[0.03]"
      style="flex-basis: 29%;"
    >
      <div class="flex items-center justify-between border-b border-white/15 pb-2.5">
        <div>
          <div class="text-[9px] font-mono-code tracking-[0.22em] text-slate-300/75 uppercase">BOARDING STUB</div>
          <div class="text-xs font-display font-bold tracking-wider text-white">{{ originCode }} → {{ destCode }}</div>
        </div>
        <span
          class="px-2 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-white/15 text-white border border-white/20"
        >
          {{ seatStub }}
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-1 gap-2 my-auto py-2">
        <div class="flex justify-between items-baseline">
          <span class="text-[9px] font-mono-code text-slate-300/70 uppercase">PASSENGER</span>
          <span class="text-[11px] font-mono-code font-semibold text-white">{{ passengerName }}</span>
        </div>
        <div class="flex justify-between items-baseline">
          <span class="text-[9px] font-mono-code text-slate-300/70 uppercase">FLIGHT</span>
          <span class="text-[11px] font-mono-code font-semibold text-white">{{ flightNumber }}</span>
        </div>
        <div class="flex justify-between items-baseline">
          <span class="text-[9px] font-mono-code text-slate-300/70 uppercase">SEQ NO.</span>
          <span class="text-[11px] font-mono-code font-semibold text-cyan-200">{{ seqNumber }}</span>
        </div>
      </div>

      <!-- Mini Laser Barcode on Front Stub -->
      <div class="pt-2 border-t border-white/15">
        <div class="w-full h-8 rounded bg-white/90 px-2 py-1 flex items-center justify-between shadow-inner">
          <svg class="w-full h-full" viewBox="0 0 180 28" preserveAspectRatio="none">
            <g fill="#0f172a">
              <rect x="0" y="0" width="3" height="28" />
              <rect x="6" y="0" width="1.5" height="28" />
              <rect x="10" y="0" width="4" height="28" />
              <rect x="17" y="0" width="2" height="28" />
              <rect x="22" y="0" width="1.5" height="28" />
              <rect x="27" y="0" width="5" height="28" />
              <rect x="35" y="0" width="2" height="28" />
              <rect x="40" y="0" width="3" height="28" />
              <rect x="46" y="0" width="1.5" height="28" />
              <rect x="51" y="0" width="4" height="28" />
              <rect x="58" y="0" width="2.5" height="28" />
              <rect x="64" y="0" width="1.5" height="28" />
              <rect x="69" y="0" width="5" height="28" />
              <rect x="77" y="0" width="2" height="28" />
              <rect x="82" y="0" width="3.5" height="28" />
              <rect x="89" y="0" width="1.5" height="28" />
              <rect x="94" y="0" width="4" height="28" />
              <rect x="101" y="0" width="2" height="28" />
              <rect x="106" y="0" width="3" height="28" />
              <rect x="112" y="0" width="5" height="28" />
              <rect x="120" y="0" width="1.5" height="28" />
              <rect x="125" y="0" width="3" height="28" />
              <rect x="131" y="0" width="2" height="28" />
              <rect x="136" y="0" width="4.5" height="28" />
              <rect x="144" y="0" width="1.5" height="28" />
              <rect x="149" y="0" width="3" height="28" />
              <rect x="155" y="0" width="2" height="28" />
              <rect x="160" y="0" width="5" height="28" />
              <rect x="168" y="0" width="1.5" height="28" />
              <rect x="173" y="0" width="3" height="28" />
              <rect x="178" y="0" width="2" height="28" />
            </g>
          </svg>
        </div>
        <div class="text-[8px] font-mono-code text-center tracking-[0.28em] text-slate-300/75 mt-1">
          CLICK TO FLIP // BACK
        </div>
      </div>
    </div>
  </section>
</template>

