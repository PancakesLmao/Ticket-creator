export function normalizeHex(hex) {
  if (!hex) return ''
  let clean = hex.trim().replace(/^#/, '')
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return ''
  return `#${clean.toLowerCase()}`
}

export function getHexLuminance(hex) {
  const normalized = normalizeHex(hex)
  if (!normalized) return 0
  const cleanHex = normalized.slice(1)
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export function rgbToHsl(r, g, b) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      case bn:
        h = (rn - gn) / d + 4
        break
    }
    h *= 60
  }

  return { h: (h + 360) % 360, s, l }
}

export function hslToHex(h, s, l) {
  const hue = ((h % 360) + 360) % 360
  const sat = Math.max(0, Math.min(1, s))
  const light = Math.max(0, Math.min(1, l))

  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - c / 2
  let r1 = 0
  let g1 = 0
  let b1 = 0

  if (hue < 60) {
    r1 = c
    g1 = x
  } else if (hue < 120) {
    r1 = x
    g1 = c
  } else if (hue < 180) {
    g1 = c
    b1 = x
  } else if (hue < 240) {
    g1 = x
    b1 = c
  } else if (hue < 300) {
    r1 = x
    b1 = c
  } else {
    r1 = c
    b1 = x
  }

  const toHex = (n) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`
}

export function buildAdaptivePalette(h1, s1, h2, s2, isLight) {
  const isNeutral = s1 < 0.08
  const primaryHue = isNeutral ? 195 : h1
  const secondaryHue = isNeutral ? 42 : h2
  const foilSat = isNeutral ? 0.28 : Math.max(0.45, Math.min(0.82, s1 * 0.9))
  const tag1Sat = isNeutral ? 0.72 : Math.max(0.68, Math.min(0.92, s1 * 1.05))
  const tag2Sat = isNeutral ? 0.78 : Math.max(0.68, Math.min(0.92, Math.max(s2, 0.65)))

  const foilColor = hslToHex(primaryHue, foilSat, isLight ? 0.36 : 0.74)
  const primaryTagColor = hslToHex(primaryHue, tag1Sat, isLight ? 0.28 : 0.78)
  const secondaryTagColor = hslToHex(secondaryHue, tag2Sat, isLight ? 0.3 : 0.82)

  const stop1 = hslToHex(primaryHue, Math.max(0.65, foilSat), 0.76)
  const stop2 = hslToHex((primaryHue + 38) % 360, Math.max(0.68, foilSat), 0.8)
  const stop3 = hslToHex(secondaryHue, Math.max(0.7, tag2Sat), 0.78)
  const stop4 = hslToHex((secondaryHue + 42) % 360, Math.max(0.65, foilSat), 0.75)

  const foilGradient = `linear-gradient(180deg, ${stop1} 0%, ${stop2} 28%, ${stop3} 56%, ${stop4} 82%, ${stop1} 100%)`
  const badgeGradient = `linear-gradient(125deg, ${stop1} 0%, ${stop2} 34%, ${stop3} 68%, ${stop4} 100%)`

  return {
    isLight,
    foilColor,
    primaryTagColor,
    secondaryTagColor,
    foilGradient,
    badgeGradient,
  }
}

export function derivePaletteFromHex(hex) {
  const normalized = normalizeHex(hex) || '#0f172a'
  const cleanHex = normalized.slice(1)
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  const isLight = 0.299 * r + 0.587 * g + 0.114 * b > 135
  const { h, s } = rgbToHsl(r, g, b)
  const h2 = (h + 52) % 360
  return buildAdaptivePalette(h, s, h2, Math.max(s, 0.65), isLight)
}

export function extractImagePalette(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const size = 48
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)
        const pixelCount = data.length / 4

        let totalLuminance = 0
        let avgR = 0
        let avgG = 0
        let avgB = 0

        const bucketCount = 12
        const buckets = Array.from({ length: bucketCount }, () => ({
          weight: 0,
          sinH: 0,
          cosH: 0,
          satSum: 0,
          count: 0,
        }))

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          if (a < 32) continue

          totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b
          avgR += r
          avgG += g
          avgB += b

          const { h, s, l } = rgbToHsl(r, g, b)
          if (s < 0.08 || l < 0.06 || l > 0.94) continue

          const midToneBias = 1 - Math.min(0.85, Math.abs(l - 0.52) * 1.45)
          const weight = (s * 0.75 + 0.25) * midToneBias
          const bucketIdx = Math.floor(((h % 360) / 360) * bucketCount) % bucketCount
          const rad = (h * Math.PI) / 180

          const bucket = buckets[bucketIdx]
          bucket.weight += weight
          bucket.sinH += Math.sin(rad) * weight
          bucket.cosH += Math.cos(rad) * weight
          bucket.satSum += s * weight
          bucket.count += 1
        }

        const avgLuminance = totalLuminance / Math.max(1, pixelCount)
        const isLight = avgLuminance > 135

        const ranked = buckets
          .map((b, idx) => {
            if (b.weight <= 0) return { idx, weight: 0, hue: idx * 30 + 15, sat: 0 }
            const meanAngle = (Math.atan2(b.sinH, b.cosH) * 180) / Math.PI
            return {
              idx,
              weight: b.weight,
              hue: (meanAngle + 360) % 360,
              sat: b.satSum / b.weight,
            }
          })
          .sort((a, b) => b.weight - a.weight)

        let h1 = 195
        let s1 = 0.65
        let h2 = 45
        let s2 = 0.72

        if (ranked[0] && ranked[0].weight > 0) {
          h1 = ranked[0].hue
          s1 = ranked[0].sat
          const distinctSecond = ranked.find((cand, i) => {
            if (i === 0 || cand.weight <= ranked[0].weight * 0.14) return false
            const diff = Math.abs(((cand.hue - h1 + 540) % 360) - 180)
            return diff >= 36
          })
          if (distinctSecond) {
            h2 = distinctSecond.hue
            s2 = distinctSecond.sat
          } else {
            h2 = (h1 + 52) % 360
            s2 = Math.max(0.65, s1)
          }
        } else {
          const fallbackHsl = rgbToHsl(
            avgR / Math.max(1, pixelCount),
            avgG / Math.max(1, pixelCount),
            avgB / Math.max(1, pixelCount),
          )
          h1 = fallbackHsl.h
          s1 = fallbackHsl.s
          h2 = (h1 + 52) % 360
          s2 = Math.max(0.6, s1)
        }

        resolve(buildAdaptivePalette(h1, s1, h2, s2, isLight))
      } catch {
        resolve(derivePaletteFromHex('#0f172a'))
      }
    }
    img.onerror = () => resolve(derivePaletteFromHex('#0f172a'))
    img.src = imageUrl
  })
}

export function detectLuminance(imageUrl) {
  return extractImagePalette(imageUrl).then((palette) => palette.isLight)
}
