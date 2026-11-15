<script setup>
import { useTicketData } from '../composables/useTicketData.js'

const {
  bgMode,
  baseColor,
  customBgImage,
  bgImageStyle,
  stubBgImageStyle,
  hasStubImage,
  bgOpacity,
  overlayOpacity,
} = useTicketData()
</script>

<template>
  <!-- Metallic & Glass Layers -->
  <div class="brushed-metal-layer" :style="{ opacity: overlayOpacity * 0.56 }"></div>
  <div class="security-pattern" :style="{ opacity: overlayOpacity * 0.28 }"></div>

  <!-- Image Mode Background -->
  <template v-if="bgMode === 'image'">
    <div
      v-if="customBgImage"
      class="custom-ticket-bg custom-ticket-bg--main"
      :class="{ 'custom-ticket-bg--split': hasStubImage }"
      :style="bgImageStyle"
    ></div>
    <div
      v-if="hasStubImage"
      class="custom-ticket-bg custom-ticket-bg--stub"
      :style="stubBgImageStyle"
    ></div>
  </template>

  <!-- Base Color Table Selection Mode Background -->
  <div
    v-else-if="bgMode === 'color'"
    class="custom-ticket-color-bg"
    :style="{ backgroundColor: baseColor, opacity: bgOpacity }"
  ></div>

  <!-- Adjustable Frosted Glass Scrim Overlay on Top of Background -->
  <div class="glass-scrim-overlay" :style="{ opacity: overlayOpacity }"></div>
  <div class="glass-glare" :style="{ opacity: overlayOpacity }"></div>
  <div class="silver-sheen" :style="{ opacity: overlayOpacity }"></div>
  <div class="specular-rim" :style="{ opacity: overlayOpacity }"></div>
</template>
