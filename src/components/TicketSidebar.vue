<script setup>
import { ref } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Palette,
  Calendar,
  Clock,
  Check,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
  Sliders,
} from '@lucide/vue'
import { useTicketData } from '../composables/useTicketData.js'

const isOpen = defineModel('isOpen', {
  type: Boolean,
  default: false,
})

const {
  activePresetKey,
  setPreset,
  ticket,
  bgMode,
  baseColor,
  baseColorPresets,
  setBgMode,
  setBaseColor,
  foilMode,
  foilColor,
  foilPresets,
  setFoilMode,
  setFoilColor,
  customBgImage,
  customLogoUrl,
  bgOpacity,
  overlayOpacity,
  isLightBg,
  setCustomBg,
  clearCustomBg,
  setCustomLogo,
  clearCustomLogo,
  toggleThemeMode,
  resetOpacities,
  parseDateToIso,
  formatIsoToEventDate,
  parseTimeTo24h,
  formatTimeToString,
} = useTicketData()

const bgInputRef = ref(null)
const logoInputRef = ref(null)

function onBgChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    setCustomBg(event.target.result)
    setBgMode('image')
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

function onLogoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    setCustomLogo(event.target.result)
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

function selectBaseColor(hex) {
  setBaseColor(hex)
}

function onCustomHexInput(val) {
  const clean = val.replace(/[^0-9a-fA-F]/g, '')
  if (clean.length === 6 || clean.length === 3) {
    setBaseColor('#' + clean)
  }
}

function onDateInput(value) {
  if (!value) {
    ticket.eventDate = '<EVENT DATE>'
  } else {
    ticket.eventDate = formatIsoToEventDate(value)
  }
}

function onTimeInput(value) {
  if (!value) {
    ticket.ceremonyTime = '<START TIME>'
  } else {
    ticket.ceremonyTime = formatTimeToString(value)
  }
}
</script>

<template>
  <!-- Sidebar Overlay Drawer -->
  <aside
    class="fixed top-0 right-0 h-full w-80 sm:w-96 z-40 bg-slate-950/95 border-l border-white/15 backdrop-blur-2xl flex flex-col shadow-[-14px_0_40px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-in-out select-text pointer-events-auto"
    :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    aria-label="Ticket customization sidebar"
  >
    <!-- Single Workable Left-Border Toggle Button (Open/Close with Chevron) -->
    <button
      type="button"
      class="absolute -left-10 top-6 w-10 h-10 rounded-l-xl bg-slate-900/95 hover:bg-slate-800 border-l border-t border-b border-white/20 flex items-center justify-center text-cyan-300 hover:text-white shadow-2xl transition-all cursor-pointer pointer-events-auto group"
      :title="isOpen ? 'Collapse sidebar' : 'Open customizer'"
      :aria-label="isOpen ? 'Collapse sidebar' : 'Open customizer'"
      @click="isOpen = !isOpen"
    >
      <ChevronRight v-if="isOpen" class="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      <ChevronLeft v-else class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
    </button>

    <!-- Hidden File Inputs -->
    <input
      ref="bgInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onBgChange"
    />
    <input
      ref="logoInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onLogoChange"
    />

    <!-- Sidebar Header -->
    <div class="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/40">
      <div class="min-w-0">
        <h2 class="text-xs font-display font-bold tracking-wider text-white uppercase truncate">Customize Ticket</h2>
        <p class="text-[10px] font-mono-code text-slate-400 truncate">Live 3D Spec & Content</p>
      </div>
    </div>

    <!-- Scrollable Controls Body -->
    <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
      <!-- Section: Archetype / Preset -->
      <div>
        <label class="block text-[10px] font-mono-code uppercase tracking-wider text-slate-400 mb-2">
          Template Archetype
        </label>
        <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer text-center"
            :class="activePresetKey === 'commencement' ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-white'"
            @click="setPreset('commencement')"
          >
            COMMENCEMENT
          </button>
          <button
            type="button"
            class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer text-center"
            :class="activePresetKey === 'boarding_pass' ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-white'"
            @click="setPreset('boarding_pass')"
          >
            FLIGHT PASS
          </button>
        </div>
      </div>

      <!-- Section: Logo Upload -->
      <div class="pt-4 border-t border-white/10 space-y-3">
        <label class="block text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
          Ticket Emblem / Logo (Front & Back)
        </label>

        <div class="flex items-center gap-2">
          <!-- Logo Upload Button -->
          <button
            type="button"
            class="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white transition-all cursor-pointer text-[11px] font-medium"
            @click="logoInputRef?.click()"
          >
            <Upload class="w-3.5 h-3.5 text-cyan-400" />
            <span>{{ customLogoUrl ? 'Replace Logo' : 'Upload Logo' }}</span>
          </button>

          <!-- Remove Logo Button -->
          <button
            v-if="customLogoUrl"
            type="button"
            title="Remove custom logo"
            class="py-2 px-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
            @click="clearCustomLogo"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Logo Preview Thumbnail if active -->
        <div v-if="customLogoUrl" class="flex items-center gap-2.5 bg-white/[0.03] p-2 rounded-xl border border-white/10">
          <div class="w-8 h-8 rounded-lg bg-black/40 border border-white/20 p-0.5 flex items-center justify-center shrink-0">
            <img :src="customLogoUrl" alt="Logo preview" class="w-full h-full object-contain" />
          </div>
          <span class="text-[10px] font-mono-code text-cyan-200 truncate">Custom Logo Active</span>
        </div>
      </div>

      <!-- Section: Background & Contrast -->
      <div class="pt-4 border-t border-white/10 space-y-3">
        <label class="block text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
          Glass Background & Visuals
        </label>

        <!-- Toggle: Upload Image vs Base Color Table Selection -->
        <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            :class="bgMode === 'image' ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-white'"
            @click="setBgMode('image')"
          >
            <ImageIcon class="w-3.5 h-3.5" />
            <span>IMAGE UPLOAD</span>
          </button>
          <button
            type="button"
            class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            :class="bgMode === 'color' ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-white'"
            @click="setBgMode('color')"
          >
            <Palette class="w-3.5 h-3.5" />
            <span>BASE COLOR</span>
          </button>
        </div>

        <!-- Mode A: Upload Image Mode -->
        <div v-if="bgMode === 'image'" class="space-y-3">
          <!-- Image Upload Controls -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white transition-all cursor-pointer text-[11px] font-medium"
              @click="bgInputRef?.click()"
            >
              <Upload class="w-3.5 h-3.5 text-cyan-400" />
              <span>{{ customBgImage ? 'Replace Image' : 'Upload BG Image' }}</span>
            </button>

            <button
              v-if="customBgImage"
              type="button"
              title="Remove custom background image"
              class="py-2 px-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
              @click="clearCustomBg"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Image Preview Thumbnail if active -->
          <div v-if="customBgImage" class="flex items-center gap-2.5 bg-white/[0.03] p-2 rounded-xl border border-white/10">
            <div class="w-10 h-6 rounded bg-black/40 border border-white/20 overflow-hidden shrink-0">
              <img :src="customBgImage" alt="BG Preview" class="w-full h-full object-cover" />
            </div>
            <span class="text-[10px] font-mono-code text-cyan-200 truncate">Custom BG Active</span>
          </div>
        </div>

        <!-- Mode B: Base Color Table Selection -->
        <div v-else class="space-y-2">
          <div class="overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <table class="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr class="border-b border-white/10 bg-white/5 text-[9px] font-mono-code text-slate-400 uppercase">
                  <th class="py-1.5 px-2.5 font-semibold">Swatch & Name</th>
                  <th class="py-1.5 px-2 font-semibold">Theme</th>
                  <th class="py-1.5 px-2 font-semibold text-right">HEX</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 font-mono-code">
                <tr
                  v-for="color in baseColorPresets"
                  :key="color.id"
                  class="transition-colors cursor-pointer group"
                  :class="baseColor.toLowerCase() === color.hex.toLowerCase() ? 'bg-cyan-500/20 text-cyan-200 font-bold' : 'hover:bg-white/5 text-slate-300'"
                  @click="selectBaseColor(color.hex)"
                >
                  <td class="py-2 px-2.5 flex items-center gap-2">
                    <span
                      class="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-sm"
                      :style="{ backgroundColor: color.hex }"
                    ></span>
                    <span class="text-[10px] truncate">{{ color.name }}</span>
                  </td>
                  <td class="py-2 px-2 text-[10px] text-slate-400 truncate">{{ color.desc }}</td>
                  <td class="py-2 px-2 text-[10px] text-right">
                    <span v-if="baseColor.toLowerCase() === color.hex.toLowerCase()" class="inline-flex items-center gap-1 text-cyan-300">
                      <Check class="w-3 h-3" />
                      {{ color.hex }}
                    </span>
                    <span v-else class="text-slate-400">{{ color.hex }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Custom Hex / Color Picker Row -->
            <div class="p-2 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <input
                  type="color"
                  :value="baseColor"
                  class="w-6 h-6 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                  title="Choose custom color"
                  @input="selectBaseColor($event.target.value)"
                />
                <span class="text-[9px] font-mono-code text-slate-400 uppercase">Custom Picker</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[10px] font-mono-code text-slate-500">#</span>
                <input
                  type="text"
                  :value="baseColor.replace('#', '')"
                  maxlength="6"
                  placeholder="HEX"
                  class="w-16 px-1.5 py-0.5 rounded bg-black/50 border border-white/15 text-[10px] font-mono-code text-white uppercase text-center focus:outline-none focus:border-cyan-400"
                  @input="onCustomHexInput($event.target.value)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Opacity Controls (Glass Overlay + Image/Color Opacity) -->
        <div class="space-y-3 bg-white/[0.03] p-3 rounded-xl border border-white/10">
          <!-- Glass Overlay Opacity Slider -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-center text-[10px] font-mono-code text-slate-300">
              <span class="flex items-center gap-1.5">
                <Sliders class="w-3 h-3 text-cyan-400" />
                GLASS OVERLAY
              </span>
              <span class="text-cyan-200 font-bold">{{ Math.round(overlayOpacity * 100) }}%</span>
            </div>
            <input
              v-model.number="overlayOpacity"
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              class="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <!-- Color / Image Opacity Slider -->
          <div v-if="bgMode === 'color' || customBgImage" class="space-y-1.5 pt-2 border-t border-white/10">
            <div class="flex justify-between items-center text-[10px] font-mono-code text-slate-300">
              <span class="flex items-center gap-1.5">
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="bgMode === 'color' ? 'bg-cyan-400' : 'bg-pink-400'"
                ></span>
                {{ bgMode === 'color' ? 'COLOR TINT OPACITY' : 'IMAGE OPACITY' }}
              </span>
              <span
                class="font-bold"
                :class="bgMode === 'color' ? 'text-cyan-200' : 'text-pink-200'"
              >
                {{ Math.round(bgOpacity * 100) }}%
              </span>
            </div>
            <input
              v-model.number="bgOpacity"
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              class="w-full cursor-pointer"
              :class="bgMode === 'color' ? 'accent-cyan-400' : 'accent-pink-400'"
            />
          </div>

          <!-- Reset Opacities to Default -->
          <div class="pt-2 border-t border-white/10 flex justify-end">
            <button
              type="button"
              class="text-[9px] font-mono-code text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
              @click="resetOpacities"
            >
              <RotateCcw class="w-2.5 h-2.5" />
              <span>Reset Opacities</span>
            </button>
          </div>
        </div>

        <!-- Smart Contrast Switch -->
        <button
          type="button"
          class="w-full flex items-center justify-between p-2.5 rounded-xl border text-[11px] transition-all cursor-pointer"
          :class="isLightBg ? 'bg-amber-400/15 border-amber-400/30 text-amber-200' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'"
          @click="toggleThemeMode"
        >
          <div class="flex items-center gap-2">
            <Sun v-if="isLightBg" class="w-3.5 h-3.5 text-amber-300" />
            <Moon v-else class="w-3.5 h-3.5 text-slate-400" />
            <span>Text Contrast</span>
          </div>
          <span class="font-mono-code text-[10px] uppercase font-bold">{{ isLightBg ? 'Dark Mode Text' : 'Light Mode Text' }}</span>
        </button>
      </div>

      <!-- Section: Holographic Foil & Accent -->
      <div class="pt-4 border-t border-white/10 space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
            Holographic Foil & Accent
          </label>
          <span class="text-[9px] font-mono-code uppercase text-cyan-300">
            {{ foilMode === 'rainbow' ? 'Rainbow' : (foilMode === 'transparent' ? 'Transparent' : 'Custom Color') }}
          </span>
        </div>

        <!-- 3-Way Segmented Control: Rainbow / Color / Transparent -->
        <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-center">
          <button
            type="button"
            class="py-1.5 px-1 rounded-lg font-mono-code text-[9px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            :class="foilMode === 'rainbow' ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-white'"
            @click="setFoilMode('rainbow')"
          >
            <span>🌈 RAINBOW</span>
          </button>
          <button
            type="button"
            class="py-1.5 px-1 rounded-lg font-mono-code text-[9px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            :class="foilMode === 'color' ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-white'"
            @click="setFoilMode('color')"
          >
            <span>🎨 COLOR</span>
          </button>
          <button
            type="button"
            class="py-1.5 px-1 rounded-lg font-mono-code text-[9px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            :class="foilMode === 'transparent' ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm' : 'text-slate-400 hover:text-white'"
            @click="setFoilMode('transparent')"
          >
            <span>✨ CLEAR</span>
          </button>
        </div>

        <!-- Color Palette & Custom Picker (When Color mode active) -->
        <div v-if="foilMode === 'color'" class="space-y-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/10">
          <div class="flex items-center justify-between text-[9px] font-mono-code text-slate-400">
            <span>METALLIC PRESETS</span>
            <div class="flex items-center gap-1">
              <input
                type="color"
                :value="foilColor"
                class="w-4 h-4 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                title="Pick custom foil color"
                @input="setFoilColor($event.target.value)"
              />
              <span class="text-[9px] text-white uppercase">{{ foilColor }}</span>
            </div>
          </div>

          <div class="grid grid-cols-6 gap-1.5 pt-1">
            <button
              v-for="preset in foilPresets"
              :key="preset.id"
              type="button"
              :title="preset.name"
              class="h-6 rounded-md border transition-all cursor-pointer flex items-center justify-center shadow-sm"
              :class="foilColor.toLowerCase() === preset.hex.toLowerCase() ? 'border-cyan-400 ring-2 ring-cyan-400/30 scale-105' : 'border-white/20 hover:border-white/50'"
              :style="{ backgroundColor: preset.hex }"
              @click="setFoilColor(preset.hex)"
            >
              <Check v-if="foilColor.toLowerCase() === preset.hex.toLowerCase()" class="w-3 h-3 text-slate-900" />
            </button>
          </div>
        </div>

        <div v-else-if="foilMode === 'transparent'" class="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-[10px] font-mono-code text-slate-400">
          Frosted transparent glass mode — rainbow foil strip and badge background disabled.
        </div>
      </div>

      <!-- Section: Front Content Fields -->
      <div class="pt-4 border-t border-white/10 space-y-3">
        <label class="block text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
          Main Front Credentials
        </label>

        <div class="space-y-2">
          <div>
            <label class="text-[9px] font-mono-code text-slate-400 uppercase">Institution / Issuer</label>
            <input
              v-model="ticket.institutionName"
              type="text"
              class="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div>
            <label class="text-[9px] font-mono-code text-slate-400 uppercase">Ceremony / Transit Title</label>
            <input
              v-model="ticket.ceremonyTitle"
              type="text"
              class="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div>
            <label class="text-[9px] font-mono-code text-slate-400 uppercase">Recipient / User Name</label>
            <input
              v-model="ticket.graduateName"
              type="text"
              class="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <div class="flex items-center justify-between">
                <label class="text-[9px] font-mono-code text-slate-400 uppercase">Degree / Major</label>
                <div class="flex items-center gap-1">
                  <input
                    v-model="ticket.degreeColor"
                    type="color"
                    class="w-3.5 h-3.5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                    title="Degree font color"
                  />
                  <span class="text-[8px] font-mono-code uppercase" :style="{ color: ticket.degreeColor || '#a5f3fc' }">
                    {{ ticket.degreeColor || '#a5f3fc' }}
                  </span>
                </div>
              </div>
              <input
                v-model="ticket.degreeMajor"
                type="text"
                class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                :style="{ color: ticket.degreeColor || '#a5f3fc' }"
              />
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label class="text-[9px] font-mono-code text-slate-400 uppercase">Honors / Class</label>
                <div class="flex items-center gap-1">
                  <input
                    v-model="ticket.honorsColor"
                    type="color"
                    class="w-3.5 h-3.5 rounded cursor-pointer border border-white/20 bg-transparent p-0"
                    title="Honors font color"
                  />
                  <span class="text-[8px] font-mono-code uppercase" :style="{ color: ticket.honorsColor || '#fef08a' }">
                    {{ ticket.honorsColor || '#fef08a' }}
                  </span>
                </div>
              </div>
              <input
                v-model="ticket.honors"
                type="text"
                class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                :style="{ color: ticket.honorsColor || '#fef08a' }"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <div class="flex items-center justify-between">
                <label class="text-[9px] font-mono-code text-slate-400 uppercase flex items-center gap-1">
                  <Calendar class="w-3 h-3 text-cyan-400" />
                  Event Date
                </label>
                <button
                  v-if="ticket.eventDate !== '<EVENT DATE>'"
                  type="button"
                  class="text-[8px] font-mono-code text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Reset to template token"
                  @click="ticket.eventDate = '<EVENT DATE>'"
                >
                  [Reset]
                </button>
              </div>
              <input
                type="date"
                :value="parseDateToIso(ticket.eventDate)"
                class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                @input="onDateInput($event.target.value)"
              />
              <div class="text-[9px] font-mono-code text-cyan-200/80 mt-1 truncate">
                {{ ticket.eventDate }}
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label class="text-[9px] font-mono-code text-slate-400 uppercase flex items-center gap-1">
                  <Clock class="w-3 h-3 text-cyan-400" />
                  Start Time
                </label>
                <button
                  v-if="ticket.ceremonyTime !== '<START TIME>'"
                  type="button"
                  class="text-[8px] font-mono-code text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Reset to template token"
                  @click="ticket.ceremonyTime = '<START TIME>'"
                >
                  [Reset]
                </button>
              </div>
              <input
                type="time"
                :value="parseTimeTo24h(ticket.ceremonyTime)"
                class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                @input="onTimeInput($event.target.value)"
              />
              <div class="text-[9px] font-mono-code text-cyan-200/80 mt-1 truncate">
                {{ ticket.ceremonyTime }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[9px] font-mono-code text-slate-400 uppercase">Venue Name</label>
              <input
                v-model="ticket.venueName"
                type="text"
                class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div>
              <label class="text-[9px] font-mono-code text-slate-400 uppercase">Doors Open</label>
              <input
                v-model="ticket.doorsTime"
                type="text"
                class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Stub Seating -->
      <div class="pt-4 border-t border-white/10 space-y-3">
        <label class="block text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
          Stub & Seating Pass
        </label>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="text-[9px] font-mono-code text-slate-400 uppercase">Section</label>
            <input
              v-model="ticket.section"
              type="text"
              class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <div>
            <label class="text-[9px] font-mono-code text-slate-400 uppercase">Row</label>
            <input
              v-model="ticket.row"
              type="text"
              class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <div>
            <label class="text-[9px] font-mono-code text-slate-400 uppercase">Seat</label>
            <input
              v-model="ticket.seat"
              type="text"
              class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-[9px] font-mono-code text-slate-400 uppercase">Pass Type</label>
            <input
              v-model="ticket.ticketType"
              type="text"
              class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <div>
            <label class="text-[9px] font-mono-code text-slate-400 uppercase">Ticket ID #</label>
            <input
              v-model="ticket.ticketNumber"
              type="text"
              class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>
      </div>

      <!-- Section: Security & Codes -->
      <div class="pt-4 border-t border-white/10 space-y-3">
        <label class="block text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
          Reverse Face & Security
        </label>

        <div>
          <label class="text-[9px] font-mono-code text-slate-400 uppercase">Logo Title (Back)</label>
          <input
            v-model="ticket.logoTitle"
            type="text"
            class="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div>
          <label class="text-[9px] font-mono-code text-slate-400 uppercase">Logo Subtitle (Back)</label>
          <input
            v-model="ticket.logoSubtitle"
            type="text"
            class="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div>
          <label class="text-[9px] font-mono-code text-slate-400 uppercase">Holo Status</label>
          <input
            v-model="ticket.holoStatus"
            type="text"
            class="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div>
          <label class="text-[9px] font-mono-code text-slate-400 uppercase">Barcode Serial</label>
          <input
            v-model="ticket.barcodeNumber"
            type="text"
            class="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div>
          <label class="text-[9px] font-mono-code text-slate-400 uppercase">QR Verification Code</label>
          <input
            v-model="ticket.qrPayload"
            type="text"
            class="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-mono-code text-xs focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>
    </div>
  </aside>
</template>
