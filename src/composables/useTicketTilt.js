import { onMounted, onUnmounted, watch } from 'vue'

export function useTicketTilt(targetElementRef, isFlippedRef) {
  let animationFrameId = null
  let targetMx = 0.5
  let targetMy = 0.5
  let currentMx = 0.5
  let currentMy = 0.5

  const MAX_TILT_X = 15
  const MAX_TILT_Y = 18

  function updateCoordinatesFromPoint(clientX, clientY) {
    if (!targetElementRef.value) return
    const rect = targetElementRef.value.getBoundingClientRect()
    const padX = rect.width * 0.25
    const padY = rect.height * 0.35

    const rawX = (clientX - (rect.left - padX)) / (rect.width + padX * 2)
    const rawY = (clientY - (rect.top - padY)) / (rect.height + padY * 2)

    targetMx = Math.max(0, Math.min(1, rawX))
    targetMy = Math.max(0, Math.min(1, rawY))
  }

  function animateTilt() {
    currentMx += (targetMx - currentMx) * 0.14
    currentMy += (targetMy - currentMy) * 0.14

    const tiltX = (0.5 - currentMy) * (MAX_TILT_X * 2)
    const directionMultiplier = isFlippedRef.value ? -1 : 1
    const tiltY = (currentMx - 0.5) * (MAX_TILT_Y * 2) * directionMultiplier

    const effectiveMx = isFlippedRef.value ? 1 - currentMx : currentMx

    const root = document.documentElement
    root.style.setProperty('--mx', effectiveMx.toFixed(4))
    root.style.setProperty('--my', currentMy.toFixed(4))
    root.style.setProperty('--rx', `${tiltX.toFixed(2)}deg`)
    root.style.setProperty('--ry', `${tiltY.toFixed(2)}deg`)

    animationFrameId = requestAnimationFrame(animateTilt)
  }

  function onWindowMouseMove(e) {
    updateCoordinatesFromPoint(e.clientX, e.clientY)
  }

  function onDocumentMouseLeave() {
    targetMx = 0.5
    targetMy = 0.5
  }

  function onTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      updateCoordinatesFromPoint(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  function onTouchEnd() {
    targetMx = 0.5
    targetMy = 0.5
  }

  watch(
    isFlippedRef,
    (val) => {
      document.documentElement.style.setProperty('--flip', val ? '180deg' : '0deg')
    },
    { immediate: true }
  )

  onMounted(() => {
    window.addEventListener('mousemove', onWindowMouseMove, { passive: true })
    document.addEventListener('mouseleave', onDocumentMouseLeave)
    animationFrameId = requestAnimationFrame(animateTilt)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onWindowMouseMove)
    document.removeEventListener('mouseleave', onDocumentMouseLeave)
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
  })

  return {
    onTouchMove,
    onTouchEnd,
  }
}

