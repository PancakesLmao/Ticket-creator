import { reactive, ref, computed } from 'vue'

export const presets = {
  commencement: {
    institutionName: '<UNIVERSITY A>',
    classYear: 'CLASS OF <YEAR>',
    ceremonyTitle: '<ANNUAL COMMENCEMENT CEREMONY>',
    eventDate: '<EVENT DATE>',
    ceremonyTime: '<START TIME>',
    doorsTime: '<DOORS>',
    venueName: '<CAMPUS AUDITORIUM>',
    venueAddress: '<HALL / SECTION LEVEL>',
    graduateName: '<USERNAME>',
    degreeMajor: '<DEGREE / MAJOR>',
    degreeColor: '#a5f3fc',
    honors: '<HONORS DISTINCTION>',
    honorsColor: '#fef08a',
    ticketType: '<GUEST PASS>',
    section: '<SEC>',
    row: '<ROW>',
    seat: '<SEAT>',
    ticketNumber: '#<0042>',
    admitCount: 'ADMIT <1>',
    barcodeNumber: '<0094-2049-8841-AX>',
    qrPayload: '<KEY // 9481-F09-LASER>',
    holoStatus: '<HOLO-SEAL // VALID>',
    securityNotice: '<NON-TRANSFERABLE • VALID ID REQUIRED AT ENTRY>',
    policyText: '<OFFICIAL CEREMONY CREDENTIAL • BAG POLICY ENFORCED>',
    logoTitle: '<YOUR LOGO HERE>',
    logoSubtitle: '<320 × 120 PX • VECTOR EMBLEM ZONE>',
  },
  boarding_pass: {
    institutionName: '<AIRLINE // SPACEWAYS>',
    classYear: 'CLASS // <S-01>',
    ceremonyTitle: 'NON-STOP • ORBITAL TRANSIT',
    eventDate: '<OCT 24, 2049>',
    ceremonyTime: '<21:45 UTC>',
    doorsTime: 'GATE <G-08>',
    venueName: '<NEO-TOKYO TERMINAL>',
    venueAddress: '<ZURICH SKYPORT>',
    graduateName: '<PASSENGER // USER>',
    degreeMajor: 'FLIGHT <AX-2049>',
    degreeColor: '#a5f3fc',
    honors: '<PRIORITY BOARDING>',
    honorsColor: '#fef08a',
    ticketType: '<BOARDING PASS>',
    section: '<ZONE 1>',
    row: '<04>',
    seat: '<04A // VIP>',
    ticketNumber: '#<0042>',
    admitCount: 'ADMIT <1>',
    barcodeNumber: '<0094-2049-8841-AX>',
    qrPayload: '<KEY // 9481-F09-LASER>',
    holoStatus: '<HOLOGRAPHIC // LASER SECURED>',
    securityNotice: '<AUTH-0994-X • BIOMETRIC VERIFICATION REQUIRED>',
    policyText: '<STANDARD ORBITAL BAGGAGE LIMITS APPLY>',
    logoTitle: '<YOUR LOGO HERE>',
    logoSubtitle: '<320 × 120 PX • VECTOR EMBLEM ZONE>',
  },
}

export const DEFAULT_BG_OPACITY = 0.35
export const DEFAULT_OVERLAY_OPACITY = 0.5

export const baseColorPresets = [
  { id: 'obsidian', name: 'Deep Obsidian', hex: '#0b0f19', desc: 'Stealth Void' },
  { id: 'sapphire', name: 'Cosmic Sapphire', hex: '#0f172a', desc: 'Deep Navy Glass' },
  { id: 'titanium', name: 'Frosted Titanium', hex: '#334155', desc: 'Industrial Slate' },
  { id: 'emerald', name: 'Bioluminescent Emerald', hex: '#064e3b', desc: 'Cyber Green' },
  { id: 'teal', name: 'Quantum Teal', hex: '#0d3d43', desc: 'Laser Cyan' },
  { id: 'amethyst', name: 'Royal Amethyst', hex: '#2e1065', desc: 'Imperial Violet' },
  { id: 'crimson', name: 'Velvet Crimson', hex: '#4c0519', desc: 'Academic Ruby' },
  { id: 'amber', name: 'Golden Amber', hex: '#451a03', desc: 'Warm Topaz' },
  { id: 'opal', name: 'Frosted Opal', hex: '#f1f5f9', desc: 'High-Key White Glass' },
]

export const foilPresets = [
  { id: 'silver', name: 'Metallic Silver', hex: '#e2e8f0' },
  { id: 'gold', name: 'Ceremony Gold', hex: '#facc15' },
  { id: 'cyan', name: 'Laser Cyan', hex: '#38bdf8' },
  { id: 'rose', name: 'Rose Gold', hex: '#f472b6' },
  { id: 'obsidian', name: 'Stealth Black', hex: '#0f172a' },
  { id: 'white', name: 'Frost White', hex: '#ffffff' },
]

const activePresetKey = ref('commencement')
const bgMode = ref('image') // 'image' | 'color'
const baseColor = ref('#0f172a')
const foilMode = ref('rainbow') // 'rainbow' | 'color' | 'transparent'
const foilColor = ref('#e2e8f0')
const customBgImage = ref(null)
const customLogoUrl = ref(null)
const bgOpacity = ref(DEFAULT_BG_OPACITY)
const overlayOpacity = ref(DEFAULT_OVERLAY_OPACITY)
const isLightBg = ref(false)

const ticket = reactive({ ...presets.commencement })

export function setPreset(key) {
  if (!presets[key]) return
  activePresetKey.value = key
  Object.assign(ticket, presets[key])
}

export function detectLuminance(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 40
        canvas.height = 40
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, 40, 40)
        const imageData = ctx.getImageData(0, 0, 40, 40)
        const data = imageData.data
        let totalLuminance = 0
        const pixelCount = data.length / 4

        for (let i = 0; i < data.length; i += 4) {
          // Standard ITU-R BT.601 perceived luminance
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b
        }

        const avgLuminance = totalLuminance / pixelCount
        // If average luminance > 135, it's a light background needing dark text
        resolve(avgLuminance > 135)
      } catch {
        resolve(false)
      }
    }
    img.onerror = () => resolve(false)
    img.src = imageUrl
  })
}

export function getHexLuminance(hex) {
  if (!hex) return 0
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('')
  }
  if (cleanHex.length !== 6) return 0
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export function setBgMode(mode) {
  bgMode.value = mode
  if (mode === 'color') {
    isLightBg.value = getHexLuminance(baseColor.value) > 135
  } else if (mode === 'image' && customBgImage.value) {
    detectLuminance(customBgImage.value).then((light) => {
      isLightBg.value = light
    })
  } else {
    isLightBg.value = false
  }
}

export function setBaseColor(hex) {
  if (!hex) return
  baseColor.value = hex
  if (bgMode.value === 'color') {
    isLightBg.value = getHexLuminance(hex) > 135
  }
}

export function parseDateToIso(str) {
  if (!str || str.includes('<')) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  const d = new Date(str)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatIsoToEventDate(iso) {
  if (!iso) return '<EVENT DATE>'
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  const monthName = d.toLocaleString('en-US', { month: 'long' }).toUpperCase()
  return `${monthName} ${Number(parts[2])}, ${parts[0]}`
}

export function parseTimeTo24h(str) {
  if (!str || str.includes('<')) return ''
  const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (!match) return ''
  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const meridiem = match[3] ? match[3].toUpperCase() : null
  if (meridiem === 'PM' && hours < 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

export function formatTimeToString(time24) {
  if (!time24) return '<START TIME>'
  const parts = time24.split(':')
  if (parts.length < 2) return time24
  let hours = parseInt(parts[0], 10)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${String(hours).padStart(2, '0')}:${parts[1]} ${ampm}`
}

export async function setCustomBg(url) {
  customBgImage.value = url
  if (url) {
    const light = await detectLuminance(url)
    isLightBg.value = light
  } else {
    isLightBg.value = false
  }
}

export function setCustomLogo(url) {
  customLogoUrl.value = url
}

export function clearCustomLogo() {
  customLogoUrl.value = null
}

export function clearCustomBg() {
  customBgImage.value = null
  isLightBg.value = false
}

export function toggleThemeMode() {
  isLightBg.value = !isLightBg.value
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
      dotColor: isLightBg.value ? 'bg-slate-900' : 'bg-cyan-400',
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
      dotColor: isFoilLight ? 'bg-slate-950' : 'bg-white',
    }
  }

  // Default: rainbow mode
  return {
    stripStyle: {},
    badgeStyle: {},
    textColor: 'text-slate-950',
    dotColor: 'bg-slate-950',
  }
})

export function resetOpacities() {
  bgOpacity.value = DEFAULT_BG_OPACITY
  overlayOpacity.value = DEFAULT_OVERLAY_OPACITY
}

export function useTicketData() {
  return {
    presets,
    activePresetKey,
    ticket,
    bgMode,
    baseColor,
    baseColorPresets,
    foilMode,
    foilColor,
    foilPresets,
    foilStyles,
    setFoilMode,
    setFoilColor,
    customBgImage,
    customLogoUrl,
    bgOpacity,
    overlayOpacity,
    DEFAULT_BG_OPACITY,
    DEFAULT_OVERLAY_OPACITY,
    isLightBg,
    setPreset,
    setBgMode,
    setBaseColor,
    getHexLuminance,
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
  }
}
