<script setup>
defineProps({
  type: {
    type: String,
    required: true,
    validator: (val) => ['qr', 'barcode'].includes(val),
  },
  svgClass: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <svg
    v-if="type === 'qr'"
    :class="svgClass || 'w-32 h-32 text-slate-950'"
    viewBox="0 0 100 100"
    fill="currentColor"
  >
    <path d="M8,8 h26 v26 h-26 z M13,13 v16 h16 v-16 z M17,17 h8 v8 h-8 z" />
    <path d="M66,8 h26 v26 h-26 z M71,13 v16 h16 v-16 z M75,17 h8 v8 h-8 z" />
    <path d="M8,66 h26 v26 h-26 z M13,71 v16 h16 v-16 z M17,75 h8 v8 h-8 z" />
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

  <svg
    v-else
    :class="svgClass || 'w-full h-full'"
    viewBox="0 0 360 32"
    preserveAspectRatio="none"
  >
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
</template>

