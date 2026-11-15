import { reactive, ref, computed, watch } from 'vue'
import { ticketIconOptions } from '../constants/ticketIcons.js'
import {
  DEFAULT_BG_OPACITY,
  DEFAULT_OVERLAY_OPACITY,
  presetList,
  baseColorPresets,
  foilPresets,
  presets,
} from '../constants/ticketPresets.js'
import {
  normalizeHex,
  getHexLuminance,
  derivePaletteFromHex,
  extractImagePalette,
} from '../utils/ticketFormatters.js'
import {
  clearSelection,
  registerTicketAccessor,
  resetAllLayerState,
} from './useCanvasDrag.js'

const TICKET_ASPECT = 860 / 330
const MAIN_ASPECT = (860 * 0.71) / 330
const STUB_ASPECT = (860 * 0.29) / 330

function extractPresetFields(preset) {
  const copy = { ...preset }
  delete copy.hiddenLayers
  return copy
}

function measureImageAspect(url) {
  return new Promise((resolve) => {
    if (!url || typeof Image === 'undefined') {
      resolve(null)
      return
    }
    const img = new Image()
    img.onload = () => {
      resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : null)
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

const activePresetKey = ref('commencement')
const interactionMode = ref('edit') // 'edit' | 'preview'
const isEditingField = ref(false)
const emblemMode = ref('icon') // 'icon' | 'logo'
const bgMode = ref('image') // 'image' | 'color'
const baseColor = ref('#0f172a')
const foilMode = ref('rainbow') // 'rainbow' | 'color' | 'transparent'
const foilColor = ref('#e2e8f0')
const customBgImage = ref(null)
const customStubBgImage = ref(null)
const customLogoUrl = ref(null)
const bgOpacity = ref(DEFAULT_BG_OPACITY)
const stubBgOpacity = ref(DEFAULT_BG_OPACITY)
const overlayOpacity = ref(DEFAULT_OVERLAY_OPACITY)
const bgPosX = ref(50)
const bgPosY = ref(50)
const bgZoom = ref(100)
const bgImageAspect = ref(null)
const stubBgPosX = ref(50)
const stubBgPosY = ref(50)
const stubBgZoom = ref(100)
const stubBgImageAspect = ref(null)
const isLightBg = ref(false)
const smartPalette = ref(null)
const isAutoAccentEnabled = ref(true)

watch(customBgImage, (url) => {
  if (!url) {
    bgImageAspect.value = null
    return
  }
  measureImageAspect(url).then((aspect) => {
    if (customBgImage.value === url) {
      bgImageAspect.value = aspect
    }
  })
})

watch(customStubBgImage, (url) => {
  if (!url) {
    stubBgImageAspect.value = null
    return
  }
  measureImageAspect(url).then((aspect) => {
    if (customStubBgImage.value === url) {
      stubBgImageAspect.value = aspect
    }
  })
})

const ticket = reactive({
  ...extractPresetFields(presets.commencement),
  removedTextBoxes: {},
  customBoxTexts: {},
  customBoxColors: {},
})
let bgDetectionToken = 0

registerTicketAccessor(() => ticket)
resetAllLayerState(presets.commencement.hiddenLayers || [])

function applySmartPalette(palette, { syncColors = true } = {}) {
  if (!palette) return
  smartPalette.value = palette
  isLightBg.value = Boolean(palette.isLight)
  if (syncColors) {
    foilColor.value = palette.foilColor
    ticket.degreeColor = palette.primaryTagColor
    ticket.honorsColor = palette.secondaryTagColor
  }
}

export async function autoMatchAccentToBackground() {
  isAutoAccentEnabled.value = true
  const token = ++bgDetectionToken
  if (bgMode.value === 'image' && customBgImage.value) {
    const targetUrl = customBgImage.value
    const palette = await extractImagePalette(targetUrl)
    if (token === bgDetectionToken && bgMode.value === 'image' && customBgImage.value === targetUrl) {
      applySmartPalette(palette, { syncColors: true })
    }
    return
  }
  if (bgMode.value === 'color') {
    const palette = derivePaletteFromHex(baseColor.value)
    applySmartPalette(palette, { syncColors: true })
    return
  }
  smartPalette.value = null
  isLightBg.value = false
  const preset = presets[activePresetKey.value] || presets.commencement
  ticket.degreeColor = preset.degreeColor
  ticket.honorsColor = preset.honorsColor
}

export function setPreset(key) {
  if (!presets[key]) return
  activePresetKey.value = key
  Object.assign(ticket, extractPresetFields(presets[key]), {
    removedTextBoxes: {},
    customBoxTexts: {},
    customBoxColors: {},
  })
  resetAllLayerState(presets[key].hiddenLayers || [])
  if (isAutoAccentEnabled.value && ((bgMode.value === 'image' && customBgImage.value) || bgMode.value === 'color')) {
    if (smartPalette.value) {
      ticket.degreeColor = smartPalette.value.primaryTagColor
      ticket.honorsColor = smartPalette.value.secondaryTagColor
    }
  }
}

export function setInteractionMode(mode) {
  if (mode !== 'edit' && mode !== 'preview') return
  interactionMode.value = mode
  if (mode === 'preview') {
    isEditingField.value = false
    clearSelection()
  }
}

export function setEditingField(val) {
  isEditingField.value = Boolean(val)
}

export function setEmblemMode(mode) {
  if (mode === 'icon' || mode === 'logo') {
    emblemMode.value = mode
  }
}

export function cycleHeaderIcon() {
  const idx = ticketIconOptions.findIndex((i) => i.id === ticket.headerIcon)
  const next = ticketIconOptions[(idx + 1) % ticketIconOptions.length]
  ticket.headerIcon = next.id
}

export function cycleRouteIcon() {
  const idx = ticketIconOptions.findIndex((i) => i.id === ticket.routeIcon)
  const next = ticketIconOptions[(idx + 1) % ticketIconOptions.length]
  ticket.routeIcon = next.id
}

export function setBgMode(mode) {
  bgMode.value = mode
  const token = ++bgDetectionToken
  if (mode === 'color') {
    const palette = derivePaletteFromHex(baseColor.value)
    applySmartPalette(palette, { syncColors: isAutoAccentEnabled.value })
  } else if (mode === 'image' && customBgImage.value) {
    const targetUrl = customBgImage.value
    extractImagePalette(targetUrl).then((palette) => {
      if (token === bgDetectionToken && bgMode.value === 'image' && customBgImage.value === targetUrl) {
        applySmartPalette(palette, { syncColors: isAutoAccentEnabled.value })
      }
    })
  } else {
    smartPalette.value = null
    isLightBg.value = false
  }
}

export function setBaseColor(hex) {
  const normalized = normalizeHex(hex)
  if (!normalized) return
  baseColor.value = normalized
  if (bgMode.value === 'color') {
    const palette = derivePaletteFromHex(normalized)
    applySmartPalette(palette, { syncColors: isAutoAccentEnabled.value })
  }
}

export function setBgPosition(x, y, target = 'main') {
  if (target === 'stub') {
    if (Number.isFinite(x)) {
      stubBgPosX.value = Math.max(0, Math.min(100, Math.round(x * 10) / 10))
    }
    if (Number.isFinite(y)) {
      stubBgPosY.value = Math.max(0, Math.min(100, Math.round(y * 10) / 10))
    }
    return
  }
  if (Number.isFinite(x)) {
    bgPosX.value = Math.max(0, Math.min(100, Math.round(x * 10) / 10))
  }
  if (Number.isFinite(y)) {
    bgPosY.value = Math.max(0, Math.min(100, Math.round(y * 10) / 10))
  }
}

export function setBgZoom(zoom, target = 'main') {
  if (Number.isFinite(zoom)) {
    const val = Math.max(50, Math.min(250, Math.round(zoom)))
    if (target === 'stub') {
      stubBgZoom.value = val
    } else {
      bgZoom.value = val
    }
  }
}

export function resetBgPosition(target = 'all') {
  if (target === 'main' || target === 'all') {
    bgPosX.value = 50
    bgPosY.value = 50
    bgZoom.value = 100
  }
  if (target === 'stub' || target === 'all') {
    stubBgPosX.value = 50
    stubBgPosY.value = 50
    stubBgZoom.value = 100
  }
}

const hasStubImage = computed(() => Boolean(customStubBgImage.value))

export function panBgByDelta(startPosX, startPosY, dx, dy, width, height, target = 'main') {
  const isStub = target === 'stub'
  const w = Math.max(width || 1, 1)
  const h = Math.max(height || 1, 1)
  const aspect = (isStub ? stubBgImageAspect.value : bgImageAspect.value) || 1
  const zoom = isStub ? stubBgZoom.value : bgZoom.value
  const zoomRatio = zoom / 100
  const containerAspect = isStub ? STUB_ASPECT : (hasStubImage.value ? MAIN_ASPECT : TICKET_ASPECT)
  let imgW
  let imgH

  if (zoom === 100) {
    if (aspect >= w / h) {
      imgH = h
      imgW = h * aspect
    } else {
      imgW = w
      imgH = w / aspect
    }
  } else if (aspect >= containerAspect) {
    imgH = h * zoomRatio
    imgW = imgH * aspect
  } else {
    imgW = w * zoomRatio
    imgH = imgW / aspect
  }

  const travelX = w - imgW
  const travelY = h - imgH
  const divisorX = Math.abs(travelX) >= 12 ? travelX : -w
  const divisorY = Math.abs(travelY) >= 12 ? travelY : -h

  setBgPosition(
    startPosX + (dx / divisorX) * 100,
    startPosY + (dy / divisorY) * 100,
    target
  )
}

const hasCustomBgTransform = computed(
  () => bgPosX.value !== 50 || bgPosY.value !== 50 || bgZoom.value !== 100
)

const hasCustomStubBgTransform = computed(
  () => stubBgPosX.value !== 50 || stubBgPosY.value !== 50 || stubBgZoom.value !== 100
)

const bgImageStyle = computed(() => {
  if (!customBgImage.value) return {}
  const zoom = bgZoom.value
  let backgroundSize = 'cover'
  if (zoom !== 100) {
    const aspect = bgImageAspect.value || 1
    const targetAspect = hasStubImage.value ? MAIN_ASPECT : TICKET_ASPECT
    backgroundSize = aspect >= targetAspect ? `auto ${zoom}%` : `${zoom}% auto`
  }
  return {
    backgroundImage: `url(${customBgImage.value})`,
    backgroundPosition: `${bgPosX.value}% ${bgPosY.value}%`,
    backgroundSize,
    opacity: bgOpacity.value,
  }
})

const stubBgImageStyle = computed(() => {
  if (!customStubBgImage.value) return {}
  const zoom = stubBgZoom.value
  let backgroundSize = 'cover'
  if (zoom !== 100) {
    const aspect = stubBgImageAspect.value || 1
    backgroundSize = aspect >= STUB_ASPECT ? `auto ${zoom}%` : `${zoom}% auto`
  }
  return {
    backgroundImage: `url(${customStubBgImage.value})`,
    backgroundPosition: `${stubBgPosX.value}% ${stubBgPosY.value}%`,
    backgroundSize,
    opacity: stubBgOpacity.value,
  }
})

export async function setCustomBg(url) {
  customBgImage.value = url
  bgMode.value = 'image'
  resetBgPosition('main')
  const token = ++bgDetectionToken
  if (url) {
    const [palette, aspect] = await Promise.all([
      extractImagePalette(url),
      measureImageAspect(url),
    ])
    if (token === bgDetectionToken && bgMode.value === 'image' && customBgImage.value === url) {
      bgImageAspect.value = aspect
      isAutoAccentEnabled.value = true
      applySmartPalette(palette, { syncColors: true })
    }
  } else {
    bgImageAspect.value = null
    if (!customStubBgImage.value) {
      smartPalette.value = null
      isLightBg.value = false
    }
  }
}

export async function setCustomStubBg(url) {
  customStubBgImage.value = url
  bgMode.value = 'image'
  resetBgPosition('stub')
  if (url) {
    const aspect = await measureImageAspect(url)
    if (customStubBgImage.value === url) {
      stubBgImageAspect.value = aspect
    }
  } else {
    stubBgImageAspect.value = null
  }
}

export function clearCustomStubBg() {
  customStubBgImage.value = null
  stubBgImageAspect.value = null
  stubBgOpacity.value = DEFAULT_BG_OPACITY
  resetBgPosition('stub')
}

export function clearAllCustomBg() {
  clearCustomBg()
  clearCustomStubBg()
}

export function setCustomLogo(url) {
  customLogoUrl.value = url
  if (url) {
    emblemMode.value = 'logo'
  }
}

export function clearCustomLogo() {
  customLogoUrl.value = null
  emblemMode.value = 'icon'
}

export function clearCustomBg() {
  bgDetectionToken++
  customBgImage.value = null
  bgImageAspect.value = null
  resetBgPosition('main')
  if (!customStubBgImage.value) {
    smartPalette.value = null
    isLightBg.value = false
    const preset = presets[activePresetKey.value] || presets.commencement
    ticket.degreeColor = preset.degreeColor
    ticket.honorsColor = preset.honorsColor
  }
}

export function toggleThemeMode() {
  const nextLight = !isLightBg.value
  isLightBg.value = nextLight
  if (bgMode.value === 'image' && customBgImage.value && smartPalette.value) {
    const baseHex = smartPalette.value.foilColor
    const palette = derivePaletteFromHex(baseHex)
    palette.isLight = nextLight
    if (isAutoAccentEnabled.value) {
      ticket.degreeColor = nextLight
        ? derivePaletteFromHex(ticket.degreeColor || '#0284c7').primaryTagColor
        : smartPalette.value.primaryTagColor
      ticket.honorsColor = nextLight
        ? derivePaletteFromHex(ticket.honorsColor || '#ca8a04').secondaryTagColor
        : smartPalette.value.secondaryTagColor
    }
  }
}

export function setFoilMode(mode) {
  foilMode.value = mode
}

export function setFoilColor(hex) {
  foilColor.value = hex
  foilMode.value = 'color'
}

const foilStyles = computed(() => {
  if (foilMode.value === 'transparent') {
    return {
      stripStyle: {
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(8px)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: 'none',
      },
      badgeStyle: {
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
      },
      textColor: isLightBg.value ? 'text-slate-900' : 'text-slate-200',
    }
  }

  if (foilMode.value === 'color') {
    const isFoilLight = getHexLuminance(foilColor.value) > 135
    return {
      stripStyle: {
        backgroundColor: foilColor.value,
        boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.35)',
      },
      badgeStyle: {
        backgroundColor: foilColor.value,
        border: '1px solid rgba(255, 255, 255, 0.3)',
      },
      textColor: isFoilLight ? 'text-slate-950 font-bold' : 'text-white font-bold',
    }
  }

  if (smartPalette.value?.foilGradient && smartPalette.value?.badgeGradient) {
    return {
      stripStyle: {
        backgroundImage: smartPalette.value.foilGradient,
      },
      badgeStyle: {
        backgroundImage: smartPalette.value.badgeGradient,
      },
      textColor: 'text-slate-950 font-bold',
    }
  }

  return {
    stripStyle: {},
    badgeStyle: {},
    textColor: 'text-slate-950',
  }
})

export function resetOpacities() {
  bgOpacity.value = DEFAULT_BG_OPACITY
  stubBgOpacity.value = DEFAULT_BG_OPACITY
  overlayOpacity.value = DEFAULT_OVERLAY_OPACITY
}

export function useTicketData() {
  return {
    presets,
    presetList,
    ticketIconOptions,
    activePresetKey,
    interactionMode,
    isEditingField,
    emblemMode,
    setInteractionMode,
    setEditingField,
    setEmblemMode,
    cycleHeaderIcon,
    cycleRouteIcon,
    ticket,
    bgMode,
    baseColor,
    baseColorPresets,
    foilMode,
    foilColor,
    foilPresets,
    foilStyles,
    smartPalette,
    isAutoAccentEnabled,
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
    hasStubImage,
    hasCustomBgTransform,
    hasCustomStubBgTransform,
    DEFAULT_BG_OPACITY,
    DEFAULT_OVERLAY_OPACITY,
    isLightBg,
    setPreset,
    setBgMode,
    setBaseColor,
    getHexLuminance,
    setCustomBg,
    setCustomStubBg,
    clearCustomBg,
    clearCustomStubBg,
    clearAllCustomBg,
    setBgPosition,
    setBgZoom,
    resetBgPosition,
    panBgByDelta,
    setCustomLogo,
    clearCustomLogo,
    toggleThemeMode,
    resetOpacities,
  }
}
