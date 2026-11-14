<script setup>
import { ref, onUnmounted } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Palette,
  Check,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  Move,
  Plus,
  Type,
  CopyPlus,
} from '@lucide/vue'
import { iconMap } from '../constants/ticketIcons.js'
import { CUSTOM_TEXT_PRESET_LIST } from '../models/ticketTextBoxes.js'
import { useTicketData } from '../composables/useTicketData.js'
import { useCanvasDrag } from '../composables/useCanvasDrag.js'

const isOpen = defineModel('isOpen', {
  type: Boolean,
  default: false,
})

const {
  activePresetKey,
  presetList,
  ticketIconOptions,
  emblemMode,
  setEmblemMode,
  setPreset,
  ticket,
  bgMode,
  baseColor,
  baseColorPresets,
  setBgMode,
  setBaseColor,
  getHexLuminance,
  foilMode,
  foilColor,
  foilPresets,
  smartPalette,
  autoMatchAccentToBackground,
  setFoilMode,
  setFoilColor,
  customBgImage,
  customLogoUrl,
  bgOpacity,
  overlayOpacity,
  bgPosX,
  bgPosY,
  bgZoom,
  bgImageStyle,
  hasCustomBgTransform,
  isLightBg,
  setCustomBg,
  clearCustomBg,
  setBgZoom,
  resetBgPosition,
  panBgByDelta,
  setCustomLogo,
  clearCustomLogo,
  toggleThemeMode,
  resetOpacities,
} = useTicketData()

const {
  isLayerPanelOpen,
  toggleLayerPanel,
  selectedIds,
  activeLayerFace,
  hasCustomOffsets,
  hiddenLayersCount,
  resetAllOffsets,
  addCustomTextBox,
  duplicateSelectedLayers,
  notifyDragStart,
  notifyDragEnd,
} = useCanvasDrag()

const bgInputRef = ref(null)
const logoInputRef = ref(null)
const bgPreviewRef = ref(null)
const isDraggingBgPreview = ref(false)
let bgPreviewStartX = 0
let bgPreviewStartY = 0
let bgPreviewInitPosX = 50
let bgPreviewInitPosY = 50
let bgPreviewRect = { width: 280, height: 108 }
let bgPreviewPointerId = null
let hasBgPreviewMoved = false

function onBgPreviewPointerMove(e) {
  if (bgPreviewPointerId !== null && e.pointerId !== bgPreviewPointerId) return
  const dx = e.clientX - bgPreviewStartX
  const dy = e.clientY - bgPreviewStartY
  if (!hasBgPreviewMoved && Math.hypot(dx, dy) > 2) {
    hasBgPreviewMoved = true
    isDraggingBgPreview.value = true
    notifyDragStart()
  }
  if (hasBgPreviewMoved) {
    panBgByDelta(
      bgPreviewInitPosX,
      bgPreviewInitPosY,
      dx,
      dy,
      bgPreviewRect.width,
      bgPreviewRect.height
    )
  }
}

function stopBgPreviewDrag(e) {
  if (bgPreviewPointerId !== null && e?.pointerId !== undefined && e.pointerId !== bgPreviewPointerId) {
    return
  }
  window.removeEventListener('pointermove', onBgPreviewPointerMove)
  window.removeEventListener('pointerup', stopBgPreviewDrag)
  window.removeEventListener('pointercancel', stopBgPreviewDrag)
  if (bgPreviewPointerId !== null && bgPreviewRef.value?.hasPointerCapture?.(bgPreviewPointerId)) {
    try {
      bgPreviewRef.value.releasePointerCapture(bgPreviewPointerId)
    } catch {
      // Ignore release failures after unmount
    }
  }
  if (hasBgPreviewMoved) {
    notifyDragEnd()
  }
  bgPreviewPointerId = null
  isDraggingBgPreview.value = false
  hasBgPreviewMoved = false
}

function onBgPreviewPointerDown(e) {
  if (!e.isPrimary || e.button !== 0 || !customBgImage.value) return
  e.preventDefault()
  const rect = bgPreviewRef.value?.getBoundingClientRect()
  if (!rect || rect.width <= 0 || rect.height <= 0) return
  bgPreviewRect = { width: rect.width, height: rect.height }
  bgPreviewStartX = e.clientX
  bgPreviewStartY = e.clientY
  bgPreviewInitPosX = bgPosX.value
  bgPreviewInitPosY = bgPosY.value
  bgPreviewPointerId = e.pointerId
  hasBgPreviewMoved = false
  if (bgPreviewRef.value?.setPointerCapture) {
    try {
      bgPreviewRef.value.setPointerCapture(bgPreviewPointerId)
    } catch {
      // Ignore if element is not eligible
    }
  }
  window.addEventListener('pointermove', onBgPreviewPointerMove)
  window.addEventListener('pointerup', stopBgPreviewDrag)
  window.addEventListener('pointercancel', stopBgPreviewDrag)
}

function onBgPreviewWheel(e) {
  if (!customBgImage.value) return
  const step = e.deltaY < 0 ? 5 : -5
  setBgZoom(bgZoom.value + step)
}

onUnmounted(() => {
  stopBgPreviewDrag()
})

function onBgChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    setCustomBg(event.target.result)
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
  if (clean.length === 6) {
    setBaseColor('#' + clean)
  }
}

function onCustomHexCommit(event) {
  const clean = event.target.value.replace(/[^0-9a-fA-F]/g, '')
  if (clean.length === 6 || clean.length === 3) {
    setBaseColor('#' + clean)
  } else {
    event.target.value = baseColor.value.replace('#', '')
  }
}
</script>

<template>
  <aside
    class="fixed top-0 right-0 h-full w-80 xl:w-96 z-40 bg-slate-950/95 border-l border-white/15 backdrop-blur-2xl flex flex-col shadow-[-14px_0_40px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-in-out select-text pointer-events-auto"
    :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    aria-label="Ticket customization sidebar"
  >
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

    <input ref="bgInputRef" type="file" accept="image/*" class="hidden" @change="onBgChange" />
    <input ref="logoInputRef" type="file" accept="image/*" class="hidden" @change="onLogoChange" />

    <!-- Sidebar Header & Quick Layer Panel Link -->
    <div class="p-4 sm:p-5 border-b border-white/10 space-y-2.5 shrink-0 bg-slate-900/40">
      <div class="flex items-center justify-between gap-2 min-w-0">
        <div class="min-w-0">
          <h2 class="text-xs font-display font-bold tracking-wider text-white uppercase truncate">
            Visual Style &amp; Presets
          </h2>
          <p class="text-[10px] font-mono-code text-slate-400 truncate">
            Drag unfocused boxes • Click selected to edit
          </p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            v-if="hasCustomOffsets"
            type="button"
            class="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-amber-400/35 bg-amber-500/15 hover:bg-amber-500/25 text-[10px] font-mono-code font-bold text-amber-200 transition-colors cursor-pointer"
            title="Reset custom block layout"
            @click="resetAllOffsets"
          >
            <RotateCcw class="w-3 h-3" />
            <span>Reset Pos</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono-code font-bold tracking-wider transition-all cursor-pointer shrink-0"
            :class="
              isLayerPanelOpen
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                : 'bg-white/5 border-white/15 text-slate-300 hover:text-white hover:border-cyan-400/40'
            "
            title="Toggle Left Layer Visualizer"
            @click="toggleLayerPanel"
          >
            <Layers class="w-3.5 h-3.5 text-cyan-300" />
            <span>Layers</span>
            <span
              v-if="hiddenLayersCount > 0"
              class="px-1 py-0.2 rounded bg-rose-500/30 text-rose-200 text-[8px]"
            >
              {{ hiddenLayersCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Scrollable Controls Body -->
    <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
      <!-- Section: Starter Presets -->
      <div>
        <label class="block text-[10px] font-mono-code uppercase tracking-wider text-slate-400 mb-2">
          Starter Presets
        </label>
        <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            v-for="preset in presetList"
            :key="preset.key"
            type="button"
            class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            :class="
              activePresetKey === preset.key
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            "
            @click="setPreset(preset.key)"
          >
            <component :is="iconMap[preset.icon]" class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate uppercase">{{ preset.label }}</span>
          </button>
        </div>
      </div>

      <!-- Section: Text Boxes & Elements -->
      <div class="pt-4 border-t border-white/10 space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <label class="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
            Text Boxes &amp; Elements
          </label>
          <span class="text-[9px] font-mono-code uppercase text-cyan-300">
            {{ activeLayerFace === 'front' ? 'Front Face' : 'Back Face' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            class="py-2 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            @click="addCustomTextBox('headline')"
          >
            <Plus class="w-3.5 h-3.5 shrink-0" />
            <span>Add Text Box</span>
          </button>

          <button
            type="button"
            :disabled="selectedIds.length === 0"
            class="py-2 px-2.5 rounded-lg border font-mono-code text-[10px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5"
            :class="
              selectedIds.length > 0
                ? 'bg-white/10 hover:bg-white/15 border-white/20 text-white cursor-pointer'
                : 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed'
            "
            @click="selectedIds.length > 0 && duplicateSelectedLayers()"
          >
            <CopyPlus class="w-3.5 h-3.5 shrink-0" />
            <span>Duplicate</span>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="styleItem in CUSTOM_TEXT_PRESET_LIST"
            :key="styleItem.key"
            type="button"
            class="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/35 text-slate-300 hover:text-white font-mono-code text-[10px] transition-all cursor-pointer flex items-center gap-1.5"
            @click="addCustomTextBox(styleItem.key)"
          >
            <Type class="w-3 h-3 text-cyan-300 shrink-0" />
            <span class="truncate">{{ styleItem.label }}</span>
          </button>
        </div>
      </div>

      <!-- Section: Unified Ticket Emblem / Logo Toggle -->
      <div class="pt-4 border-t border-white/10 space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
            Ticket Emblem / Logo
          </label>
          <span class="text-[9px] font-mono-code uppercase text-cyan-300">
            {{ emblemMode === 'logo' ? (customLogoUrl ? 'Custom Image' : 'Fallback Icon') : ticket.headerIcon }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            :class="
              emblemMode === 'icon'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            "
            @click="setEmblemMode('icon')"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>ICON EMBLEM</span>
          </button>
          <button
            type="button"
            class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            :class="
              emblemMode === 'logo'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            "
            @click="setEmblemMode('logo')"
          >
            <ImageIcon class="w-3.5 h-3.5" />
            <span>UPLOAD LOGO</span>
          </button>
        </div>

        <!-- Mode 1: Lucide Icon Picker -->
        <div v-if="emblemMode === 'icon'" class="grid grid-cols-5 gap-1.5">
          <button
            v-for="item in ticketIconOptions"
            :key="item.id"
            type="button"
            :title="item.label"
            class="h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer"
            :class="
              ticket.headerIcon === item.id
                ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25'
            "
            @click="ticket.headerIcon = item.id"
          >
            <component :is="iconMap[item.id]" class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Mode 2: Custom Logo Upload -->
        <div v-else class="space-y-2.5">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white transition-all cursor-pointer text-[11px] font-medium"
              @click="logoInputRef?.click()"
            >
              <Upload class="w-3.5 h-3.5 text-cyan-400" />
              <span>{{ customLogoUrl ? 'Replace Logo' : 'Upload Logo' }}</span>
            </button>

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

          <div
            v-if="customLogoUrl"
            class="flex items-center gap-2.5 bg-white/[0.03] p-2 rounded-xl border border-white/10"
          >
            <div class="w-8 h-8 rounded-lg bg-black/40 border border-white/20 p-0.5 flex items-center justify-center shrink-0">
              <img :src="customLogoUrl" alt="Logo preview" class="w-full h-full object-contain" />
            </div>
            <span class="text-[10px] font-mono-code text-cyan-200 truncate">Custom Logo Active</span>
          </div>
          <p v-else class="text-[10px] font-mono-code text-slate-400">
            No logo uploaded yet — showing fallback icon until an image is uploaded.
          </p>
        </div>
      </div>

      <!-- Section: Background & Contrast -->
      <div class="pt-4 border-t border-white/10 space-y-3">
        <label class="block text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
          Glass Background &amp; Visuals
        </label>

        <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            :class="
              bgMode === 'image'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            "
            @click="setBgMode('image')"
          >
            <ImageIcon class="w-3.5 h-3.5" />
            <span>IMAGE UPLOAD</span>
          </button>
          <button
            type="button"
            class="py-1.5 px-2 rounded-lg font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            :class="
              bgMode === 'color'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            "
            @click="setBgMode('color')"
          >
            <Palette class="w-3.5 h-3.5" />
            <span>BASE COLOR</span>
          </button>
        </div>

        <div v-if="bgMode === 'image'" class="space-y-3">
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

          <div
            v-if="customBgImage"
            class="space-y-2.5 bg-white/[0.03] p-2.5 rounded-xl border border-white/10"
          >
            <div class="flex items-center justify-between text-[9px] font-mono-code text-slate-400">
              <span class="flex items-center gap-1.5 text-cyan-200 font-semibold">
                <Move class="w-3 h-3 text-cyan-400" />
                <span>FIT &amp; POSITION</span>
              </span>
              <button
                v-if="hasCustomBgTransform"
                type="button"
                class="inline-flex items-center gap-1 text-amber-300 hover:text-white transition-colors cursor-pointer"
                @click="resetBgPosition"
              >
                <RotateCcw class="w-2.5 h-2.5" />
                <span>Reset Fit</span>
              </button>
              <span v-else class="text-slate-500">Drag frame / ticket</span>
            </div>

            <!-- Interactive Ticket-Aspect Drag Frame -->
            <div
              ref="bgPreviewRef"
              class="relative w-full aspect-[860/330] rounded-lg bg-black/60 border border-white/20 overflow-hidden touch-none select-none shadow-inner"
              :class="isDraggingBgPreview ? 'cursor-grabbing border-cyan-400/70' : 'cursor-grab hover:border-cyan-400/50'"
              title="Drag to position background · Scroll to zoom"
              @pointerdown="onBgPreviewPointerDown"
              @wheel.prevent="onBgPreviewWheel"
            >
              <div
                class="absolute inset-0 bg-no-repeat pointer-events-none"
                :style="{ ...bgImageStyle, opacity: 1 }"
              ></div>
              <div
                class="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-white/30"
                style="left: 71%"
              ></div>
              <div
                class="pointer-events-none absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/75 border border-white/10 text-[8px] font-mono-code text-slate-200 backdrop-blur-sm"
              >
                {{ Math.round(bgPosX) }}% · {{ Math.round(bgPosY) }}% · {{ bgZoom }}%
              </div>
            </div>

            <!-- Precision X / Y / Zoom Sliders -->
            <div class="space-y-2 pt-0.5">
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[9px] font-mono-code text-slate-300">
                  <span>HORIZONTAL (X)</span>
                  <span class="text-cyan-200 font-bold">{{ Math.round(bgPosX) }}%</span>
                </div>
                <input
                  v-model.number="bgPosX"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  class="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div class="space-y-1">
                <div class="flex justify-between items-center text-[9px] font-mono-code text-slate-300">
                  <span>VERTICAL (Y)</span>
                  <span class="text-cyan-200 font-bold">{{ Math.round(bgPosY) }}%</span>
                </div>
                <input
                  v-model.number="bgPosY"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  class="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div class="space-y-1">
                <div class="flex justify-between items-center text-[9px] font-mono-code text-slate-300">
                  <span>SCALE / ZOOM</span>
                  <span class="text-pink-200 font-bold">{{ bgZoom }}%</span>
                </div>
                <input
                  v-model.number="bgZoom"
                  type="range"
                  min="50"
                  max="250"
                  step="5"
                  class="w-full accent-pink-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-2">
          <div class="overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <table class="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr class="border-b border-white/10 bg-white/5 text-[9px] font-mono-code text-slate-400 uppercase">
                  <th class="py-1.5 px-2.5 font-semibold">Swatch &amp; Name</th>
                  <th class="py-1.5 px-2 font-semibold">Theme</th>
                  <th class="py-1.5 px-2 font-semibold text-right">HEX</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 font-mono-code">
                <tr
                  v-for="color in baseColorPresets"
                  :key="color.id"
                  class="transition-colors cursor-pointer group"
                  :class="
                    baseColor.toLowerCase() === color.hex.toLowerCase()
                      ? 'bg-cyan-500/20 text-cyan-200 font-bold'
                      : 'hover:bg-white/5 text-slate-300'
                  "
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
                    <span
                      v-if="baseColor.toLowerCase() === color.hex.toLowerCase()"
                      class="inline-flex items-center gap-1 text-cyan-300"
                    >
                      <Check class="w-3 h-3" />
                      {{ color.hex }}
                    </span>
                    <span v-else class="text-slate-400">{{ color.hex }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

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
                  @blur="onCustomHexCommit($event)"
                  @keydown.enter="onCustomHexCommit($event)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Opacity Controls -->
        <div class="space-y-3 bg-white/[0.03] p-3 rounded-xl border border-white/10">
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

          <div v-if="bgMode === 'color' || customBgImage" class="space-y-1.5 pt-2 border-t border-white/10">
            <div class="flex justify-between items-center text-[10px] font-mono-code text-slate-300">
              <span class="flex items-center gap-1.5">
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="bgMode === 'color' ? 'bg-cyan-400' : 'bg-pink-400'"
                ></span>
                {{ bgMode === 'color' ? 'COLOR TINT OPACITY' : 'IMAGE OPACITY' }}
              </span>
              <span class="font-bold" :class="bgMode === 'color' ? 'text-cyan-200' : 'text-pink-200'">
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
          :class="
            isLightBg
              ? 'bg-amber-400/15 border-amber-400/30 text-amber-200'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
          "
          @click="toggleThemeMode"
        >
          <div class="flex items-center gap-2">
            <Sun v-if="isLightBg" class="w-3.5 h-3.5 text-amber-300" />
            <Moon v-else class="w-3.5 h-3.5 text-slate-400" />
            <span>Text Contrast</span>
          </div>
          <span class="font-mono-code text-[10px] uppercase font-bold">
            {{ isLightBg ? 'Dark Mode Text' : 'Light Mode Text' }}
          </span>
        </button>
      </div>

      <!-- Section: Holographic Foil & Accent -->
      <div class="pt-4 border-t border-white/10 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <label class="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
            Holographic Foil &amp; Accent
          </label>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/35 text-[9px] font-mono-code font-bold uppercase text-cyan-200 transition-colors cursor-pointer"
            title="Auto-adjust Foil, Primary Tag & Secondary Tag colors to match current background"
            @click="autoMatchAccentToBackground"
          >
            <Sparkles class="w-3 h-3 text-cyan-300" />
            <span>{{ smartPalette ? 'Synced to BG' : 'Auto-Match BG' }}</span>
          </button>
        </div>

        <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-center">
          <button
            type="button"
            class="py-1.5 px-1 rounded-lg font-mono-code text-[9px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            :class="
              foilMode === 'rainbow'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            "
            @click="setFoilMode('rainbow')"
          >
            <Sparkles class="w-3 h-3" />
            <span>RAINBOW</span>
          </button>
          <button
            type="button"
            class="py-1.5 px-1 rounded-lg font-mono-code text-[9px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            :class="
              foilMode === 'color'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            "
            @click="setFoilMode('color')"
          >
            <Palette class="w-3 h-3" />
            <span>COLOR</span>
          </button>
          <button
            type="button"
            class="py-1.5 px-1 rounded-lg font-mono-code text-[9px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
            :class="
              foilMode === 'transparent'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            "
            @click="setFoilMode('transparent')"
          >
            <Layers class="w-3 h-3" />
            <span>CLEAR</span>
          </button>
        </div>

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
              :class="
                foilColor.toLowerCase() === preset.hex.toLowerCase()
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30 scale-105'
                  : 'border-white/20 hover:border-white/50'
              "
              :style="{ backgroundColor: preset.hex }"
              @click="setFoilColor(preset.hex)"
            >
              <Check
                v-if="foilColor.toLowerCase() === preset.hex.toLowerCase()"
                class="w-3 h-3"
                :class="getHexLuminance(preset.hex) > 135 ? 'text-slate-900' : 'text-white'"
              />
            </button>
          </div>
        </div>

        <div
          v-else-if="foilMode === 'transparent'"
          class="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-[10px] font-mono-code text-slate-400"
        >
          Frosted transparent glass mode — foil strip and badge background set to clear glass.
        </div>

        <!-- Tag Accent Color Pickers (No text inputs — edit text directly on canvas) -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <label
            class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 cursor-pointer hover:border-cyan-400/40 transition-colors"
            title="Primary Tag / Route ID Accent Color"
          >
            <span class="text-[9px] font-mono-code uppercase text-slate-300 truncate">
              Primary Tag
            </span>
            <input
              type="color"
              :value="ticket.degreeColor || '#a5f3fc'"
              class="w-4 h-4 rounded cursor-pointer border border-white/20 bg-transparent p-0 shrink-0"
              @input="ticket.degreeColor = $event.target.value"
            />
          </label>

          <label
            class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 cursor-pointer hover:border-cyan-400/40 transition-colors"
            title="Secondary Tag / Perk Accent Color"
          >
            <span class="text-[9px] font-mono-code uppercase text-slate-300 truncate">
              Secondary Tag
            </span>
            <input
              type="color"
              :value="ticket.honorsColor || '#fef08a'"
              class="w-4 h-4 rounded cursor-pointer border border-white/20 bg-transparent p-0 shrink-0"
              @input="ticket.honorsColor = $event.target.value"
            />
          </label>
        </div>
      </div>
    </div>
  </aside>
</template>
