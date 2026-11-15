import { onMounted, onUnmounted, watch } from 'vue'
import { useTicketData } from './useTicketData.js'

export function useTicketTilt(targetElementRef, isFlippedRef) {
  const { interactionMode, isEditingField } = useTicketData()
  let animationFrameId = null
  let targetMx = 0.5
  let targetMy = 0.5
  let currentMx = 0.5
  let currentMy = 0.5

  const MAX_TILT_X = 15
  const MAX_TILT_Y = 18
  const SETTLE_EPSILON = 0.0005

  function writeTiltVars(mx, my) {
    const tiltX = (0.5 - my) * (MAX_TILT_X * 2)
    const tiltY = (mx - 0.5) * (MAX_TILT_Y * 2)
    const root = document.documentElement
    root.style.setProperty('--mx', mx.toFixed(4))
    root.style.setProperty('--my', my.toFixed(4))
    root.style.setProperty('--rx', `${tiltX.toFixed(2)}deg`)
    root.style.setProperty('--ry', `${tiltY.toFixed(2)}deg`)
  }

  function animateTilt() {
    if (interactionMode.value === 'edit' || isEditingField.value) {
      targetMx = 0.5
      targetMy = 0.5
    }

    const dx = targetMx - currentMx
    const dy = targetMy - currentMy

    if (Math.abs(dx) < SETTLE_EPSILON && Math.abs(dy) < SETTLE_EPSILON) {
      currentMx = targetMx
      currentMy = targetMy
      writeTiltVars(currentMx, currentMy)
      animationFrameId = null
      return
    }

    currentMx += dx * 0.14
    currentMy += dy * 0.14
    writeTiltVars(currentMx, currentMy)
    animationFrameId = requestAnimationFrame(animateTilt)
  }

  function ensureAnimating() {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animateTilt)
    }
  }

  function updateCoordinatesFromPoint(clientX, clientY) {
    if (!targetElementRef.value) return
    const rect = targetElementRef.value.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const padX = rect.width * 0.25
    const padY = rect.height * 0.35

    const rawX = (clientX - (rect.left - padX)) / (rect.width + padX * 2)
    const rawY = (clientY - (rect.top - padY)) / (rect.height + padY * 2)

    targetMx = Math.max(0, Math.min(1, rawX))
    targetMy = Math.max(0, Math.min(1, rawY))
    ensureAnimating()
  }

  function onWindowMouseMove(e) {
    if (interactionMode.value === 'edit' || isEditingField.value) return
    updateCoordinatesFromPoint(e.clientX, e.clientY)
  }

  function onDocumentMouseLeave() {
    targetMx = 0.5
    targetMy = 0.5
    ensureAnimating()
  }

  function onTouchMove(e) {
    if (interactionMode.value === 'edit' || isEditingField.value) return
    if (e.touches && e.touches.length > 0) {
      updateCoordinatesFromPoint(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  function onTouchEnd() {
    targetMx = 0.5
    targetMy = 0.5
    ensureAnimating()
  }

  watch([interactionMode, isEditingField], ([mode, editing]) => {
    if (mode === 'edit' || editing) {
      targetMx = 0.5
      targetMy = 0.5
      ensureAnimating()
    }
  })

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
    writeTiltVars(currentMx, currentMy)
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
