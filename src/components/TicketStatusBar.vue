<script setup>
defineProps({
  isFlipped: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <header
    class="relative z-10 mb-6 sm:mb-8 flex flex-wrap items-center justify-center gap-3 text-xs tracking-widest uppercase text-slate-400 font-mono-code"
  >
    <span class="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-slate-300">
      {{ isFlipped ? 'SIDE: BACK' : 'SIDE: FRONT' }}
    </span>
  </header>
</template>
