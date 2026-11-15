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
  customStubBgImage,
  customLogoUrl,
  bgOpacity,
  stubBgOpacity,
  overlayOpacity,
  bgPosX,
  bgPosY,
  bgZoom,
  stubBgPosX,
  stubBgPosY,
  stubBgZoom,
  bgImageStyle,
  stubBgImageStyle,
  hasCustomBgTransform,
  hasCustomStubBgTransform,
  isLightBg,
  setCustomBg,
  setCustomStubBg,
  clearCustomBg,
  clearCustomStubBg,
  clearAllCustomBg,
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
  activeLayerFace,
  hasCustomOffsets,
  hiddenLayersCount,
  resetAllOffsets,
  addCustomTextBox,
  notifyDragStart,
  notifyDragEnd,
} = useCanvasDrag()

const mainBgInputRef = ref(null)
const stubBgInputRef = ref(null)
const logoInputRef = ref(null)
const bgPreviewRef = ref(null)
const isDraggingBgPreview = ref(false)
const selectedBgTarget = ref('main') // 'main' | 'stub'

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
      bgPreviewRect.height,
      selectedBgTarget.value
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
  if (!e.isPrimary || e.button !== 0) return
  const isStub = selectedBgTarget.value === 'stub'
  const activeImage = isStub ? customStubBgImage.value : customBgImage.value
  if (!activeImage) return

  e.preventDefault()
  const rect = bgPreviewRef.value?.getBoundingClientRect()
  if (!rect || rect.width <= 0 || rect.height <= 0) return
  bgPreviewRect = { width: rect.width, height: rect.height }
  bgPreviewStartX = e.clientX
  bgPreviewStartY = e.clientY
  bgPreviewInitPosX = isStub ? stubBgPosX.value : bgPosX.value
  bgPreviewInitPosY = isStub ? stubBgPosY.value : bgPosY.value
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
  const isStub = selectedBgTarget.value === 'stub'
  const activeImage = isStub ? customStubBgImage.value : customBgImage.value
  if (!activeImage) return
  const step = e.deltaY < 0 ? 5 : -5
  const currentZoom = isStub ? stubBgZoom.value : bgZoom.value
  setBgZoom(currentZoom + step, selectedBgTarget.value)
}

onUnmounted(() => {
  stopBgPreviewDrag()
})

function onMainBgChange(e) {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  if (files.length >= 2) {
    const reader1 = new FileReader()
    reader1.onload = (event) => {
      setCustomBg(event.target.result)
    }
    reader1.readAsDataURL(files[0])

    const reader2 = new FileReader()
    reader2.onload = (event) => {
      setCustomStubBg(event.target.result)
    }
    reader2.readAsDataURL(files[1])
  } else {
    const reader = new FileReader()
    reader.onload = (event) => {
      setCustomBg(event.target.result)
    }
    reader.readAsDataURL(files[0])
  }
  e.target.value = ''
}

function onStubBgChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    setCustomStubBg(event.target.result)
    selectedBgTarget.value = 'stub'
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

    <input ref="mainBgInputRef" type="file" accept="image/*" multiple class="hidden" @change="onMainBgChange" />
    <input ref="stubBgInputRef" type="file" accept="image/*" class="hidden" @change="onStubBgChange" />
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

        <div>
          <button
            type="button"
            class="w-full py-2 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-mono-code text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            @click="addCustomTextBox('headline')"
          >
            <Plus class="w-3.5 h-3.5 shrink-0" />
            <span>Add Text Box</span>
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
          <!-- Header with Clear Both Action when images exist -->
          <div
            v-if="customBgImage || customStubBgImage"
            class="flex items-center justify-between text-[10px] font-mono-code text-slate-400"
          >
            <span class="tracking-wider uppercase">Background Images</span>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-[9px] text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
              title="Remove all uploaded background images"
              @click="clearAllCustomBg"
            >
              <Trash2 class="w-2.5 h-2.5" />
              <span>Clear Both</span>
            </button>
          </div>

          <!-- Dual Slot Cards: Main Body and Detachable Stub -->
          <div class="space-y-2">
            <!-- Slot 1: Main Body Background -->
            <div
              class="p-2.5 rounded-xl bg-white/[0.03] border transition-all"
              :class="customBgImage ? 'border-cyan-500/30' : 'border-white/10'"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div
                    v-if="customBgImage"
                    class="w-8 h-8 rounded-lg bg-cover bg-center border border-white/20 shrink-0"
                    :style="{ backgroundImage: `url(${customBgImage})` }"
                  ></div>
                  <div
                    v-else
                    class="w-8 h-8 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-slate-500 shrink-0"
                  >
                    <ImageIcon class="w-3.5 h-3.5" />
                  </div>

                  <div class="min-w-0">
                    <div class="text-[11px] font-semibold text-slate-200 truncate flex items-center gap-1.5">
                      <span>Image 1: Main Body</span>
                      <span
                        class="text-[9px] font-mono-code px-1.5 py-0.2 rounded"
                        :class="customStubBgImage ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'"
                      >
                        {{ customStubBgImage ? 'Main 71%' : 'Full 100%' }}
                      </span>
                    </div>
                    <div class="text-[9px] font-mono-code text-slate-400 truncate">
                      {{ customStubBgImage ? 'Main body & tear boundary' : 'Covers entire ticket' }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono-code text-slate-300 hover:text-white transition-all cursor-pointer"
                    @click="mainBgInputRef?.click()"
                  >
                    <Upload class="w-3 h-3 text-cyan-400" />
                    <span>{{ customBgImage ? 'Replace' : 'Upload' }}</span>
                  </button>
                  <button
                    v-if="customBgImage"
                    type="button"
                    title="Remove main background image"
                    class="p-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                    @click="clearCustomBg"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Dedicated Opacity Slider for Image 1 -->
              <div
                v-if="customBgImage"
                class="mt-2.5 pt-2 border-t border-white/10 space-y-1"
              >
                <div class="flex justify-between items-center text-[9px] font-mono-code text-slate-300">
                  <span class="flex items-center gap-1 text-slate-400">
                    <Sliders class="w-2.5 h-2.5 text-cyan-400" />
                    <span>MAIN OPACITY</span>
                  </span>
                  <span class="text-cyan-200 font-bold">{{ Math.round(bgOpacity * 100) }}%</span>
                </div>
                <input
                  v-model.number="bgOpacity"
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  class="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <!-- Slot 2: Detachable Stub Background -->
            <div
              class="p-2.5 rounded-xl bg-white/[0.03] border transition-all"
              :class="customStubBgImage ? 'border-pink-500/30' : 'border-white/10'"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div
                    v-if="customStubBgImage"
                    class="w-8 h-8 rounded-lg bg-cover bg-center border border-white/20 shrink-0"
                    :style="{ backgroundImage: `url(${customStubBgImage})` }"
                  ></div>
                  <div
                    v-else
                    class="w-8 h-8 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-slate-500 shrink-0"
                  >
                    <Plus class="w-3.5 h-3.5" />
                  </div>

                  <div class="min-w-0">
                    <div class="text-[11px] font-semibold text-slate-200 truncate flex items-center gap-1.5">
                      <span>Image 2: Detachable Stub</span>
                      <span
                        v-if="customStubBgImage"
                        class="text-[9px] font-mono-code px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300"
                      >
                        Stub 29%
                      </span>
                    </div>
                    <div class="text-[9px] font-mono-code text-slate-400 truncate">
                      {{ customStubBgImage ? 'Active on detachable stub' : 'Optional (stub uses Image 1)' }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono-code text-slate-300 hover:text-white transition-all cursor-pointer"
                    @click="stubBgInputRef?.click()"
                  >
                    <Upload v-if="customStubBgImage" class="w-3 h-3 text-pink-400" />
                    <Plus v-else class="w-3 h-3 text-pink-400" />
                    <span>{{ customStubBgImage ? 'Replace' : 'Upload' }}</span>
                  </button>
                  <button
                    v-if="customStubBgImage"
                    type="button"
                    title="Remove detachable area image"
                    class="p-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                    @click="clearCustomStubBg"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Dedicated Opacity Slider for Image 2 -->
              <div
                v-if="customStubBgImage"
                class="mt-2.5 pt-2 border-t border-white/10 space-y-1"
              >
                <div class="flex justify-between items-center text-[9px] font-mono-code text-slate-300">
                  <span class="flex items-center gap-1 text-slate-400">
                    <Sliders class="w-2.5 h-2.5 text-pink-400" />
                    <span>STUB OPACITY</span>
                  </span>
                  <span class="text-pink-200 font-bold">{{ Math.round(stubBgOpacity * 100) }}%</span>
                </div>
                <input
                  v-model.number="stubBgOpacity"
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  class="w-full accent-pink-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <!-- Fit & Position Controls (if either image uploaded) -->
          <div
            v-if="customBgImage || customStubBgImage"
            class="space-y-2.5 bg-white/[0.03] p-2.5 rounded-xl border border-white/10"
          >
            <!-- Target Selector & Reset Header -->
            <div class="flex items-center justify-between text-[9px] font-mono-code text-slate-400">
              <span class="flex items-center gap-1.5 text-cyan-200 font-semibold">
                <Move class="w-3 h-3 text-cyan-400" />
                <span>FIT &amp; POSITION</span>
              </span>
              <button
                v-if="selectedBgTarget === 'main' ? hasCustomBgTransform : hasCustomStubBgTransform"
                type="button"
                class="inline-flex items-center gap-1 text-amber-300 hover:text-white transition-colors cursor-pointer"
                @click="resetBgPosition(selectedBgTarget)"
              >
                <RotateCcw class="w-2.5 h-2.5" />
                <span>Reset Fit</span>
              </button>
              <span v-else class="text-slate-500">Drag frame / ticket</span>
            </div>

            <!-- Target Selection Tabs (when both images present) -->
            <div
              v-if="customBgImage && customStubBgImage"
              class="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-black/40 border border-white/10 text-[9px] font-mono-code"
            >
              <button
                type="button"
                class="py-1 px-2 rounded font-semibold transition-all cursor-pointer text-center"
                :class="
                  selectedBgTarget === 'main'
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white'
                "
                @click="selectedBgTarget = 'main'"
              >
                Main Area (71%)
              </button>
              <button
                type="button"
                class="py-1 px-2 rounded font-semibold transition-all cursor-pointer text-center"
                :class="
                  selectedBgTarget === 'stub'
                    ? 'bg-pink-500/25 text-pink-200 border border-pink-400/30'
                    : 'text-slate-400 hover:text-white'
                "
                @click="selectedBgTarget = 'stub'"
              >
                Detachable Stub (29%)
              </button>
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
              <!-- Main Image Preview -->
              <div
                v-if="selectedBgTarget === 'main' && customBgImage"
                class="absolute inset-0 bg-no-repeat pointer-events-none"
                :style="{ ...bgImageStyle, opacity: 1 }"
              ></div>
              <!-- Stub Image Preview -->
              <div
                v-else-if="selectedBgTarget === 'stub' && customStubBgImage"
                class="absolute inset-0 bg-no-repeat pointer-events-none"
                :style="{ ...stubBgImageStyle, opacity: 1 }"
              ></div>

              <!-- Ticket Perforation Line Indicator -->
              <div
                class="pointer-events-none absolute top-0 bottom-0 border-l border-dashed border-white/30"
                style="left: 71%"
              ></div>
              <div
                class="pointer-events-none absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/75 border border-white/10 text-[8px] font-mono-code text-slate-200 backdrop-blur-sm"
              >
                <template v-if="selectedBgTarget === 'main'">
                  {{ Math.round(bgPosX) }}% · {{ Math.round(bgPosY) }}% · {{ bgZoom }}%
                </template>
                <template v-else>
                  {{ Math.round(stubBgPosX) }}% · {{ Math.round(stubBgPosY) }}% · {{ stubBgZoom }}%
                </template>
              </div>
            </div>

            <!-- Precision X / Y / Zoom Sliders for Main Body -->
            <div v-if="selectedBgTarget === 'main'" class="space-y-2 pt-0.5">
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[9px] font-mono-code text-slate-300">
                  <span>MAIN HORIZONTAL (X)</span>
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
                  <span>MAIN VERTICAL (Y)</span>
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
                  <span>MAIN SCALE / ZOOM</span>
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

            <!-- Precision X / Y / Zoom Sliders for Detachable Stub -->
            <div v-else class="space-y-2 pt-0.5">
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[9px] font-mono-code text-slate-300">
                  <span>STUB HORIZONTAL (X)</span>
                  <span class="text-pink-200 font-bold">{{ Math.round(stubBgPosX) }}%</span>
                </div>
                <input
                  v-model.number="stubBgPosX"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  class="w-full accent-pink-400 cursor-pointer"
                />
              </div>

              <div class="space-y-1">
                <div class="flex justify-between items-center text-[9px] font-mono-code text-slate-300">
                  <span>STUB VERTICAL (Y)</span>
                  <span class="text-pink-200 font-bold">{{ Math.round(stubBgPosY) }}%</span>
                </div>
                <input
                  v-model.number="stubBgPosY"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  class="w-full accent-pink-400 cursor-pointer"
                />
              </div>

              <div class="space-y-1">
                <div class="flex justify-between items-center text-[9px] font-mono-code text-slate-300">
                  <span>STUB SCALE / ZOOM</span>
                  <span class="text-pink-200 font-bold">{{ stubBgZoom }}%</span>
                </div>
                <input
                  v-model.number="stubBgZoom"
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

          <div
            v-if="bgMode === 'color'"
            class="space-y-1.5 pt-2 border-t border-white/10"
          >
            <div class="flex justify-between items-center text-[10px] font-mono-code text-slate-300">
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                COLOR TINT OPACITY
              </span>
              <span class="font-bold text-cyan-200">
                {{ Math.round(bgOpacity * 100) }}%
              </span>
            </div>
            <input
              v-model.number="bgOpacity"
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              class="w-full cursor-pointer accent-cyan-400"
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
      </div>
    </div>
  </aside>
</template>
