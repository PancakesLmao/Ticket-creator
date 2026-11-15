import { ref, nextTick } from 'vue'
import { toPng } from 'html-to-image'
import { useTicketData } from './useTicketData.js'
import { useCanvasDrag } from './useCanvasDrag.js'

export function useTicketExport() {
  const isExporting = ref(false)
  const exportProgress = ref('')
  const { ticket } = useTicketData()
  const { isFlipped, selectedIds, clearSelection } = useCanvasDrag()

  function getCleanFileName(face) {
    const rawTitle = ticket?.ceremonyTitle || ticket?.graduateName || 'ticket'
    const slug = String(rawTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'ticket'
    return `${slug}-${face}.png`
  }

  function downloadDataUrl(dataUrl, fileName) {
    const link = document.createElement('a')
    link.download = fileName
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function captureFaceElement(element, faceName) {
    if (!element) throw new Error(`Target ticket face (${faceName}) not found.`)

    // Save current inline styles
    const prevTransform = element.style.transform
    const prevBackface = element.style.backfaceVisibility
    const prevTransition = element.style.transition
    const prevOpacity = element.style.opacity

    try {
      // Flatten 3D perspective during snapshot
      element.style.transition = 'none'
      element.style.transform = 'none'
      element.style.backfaceVisibility = 'visible'
      element.style.webkitBackfaceVisibility = 'visible'
      element.style.opacity = '1'

      await nextTick()

      return await toPng(element, {
        backgroundColor: null, // Full transparency outside ticket boundary
        pixelRatio: 2, // 2x retina crispness
        width: 860,
        height: 330,
        style: {
          transform: 'none',
          backfaceVisibility: 'visible',
          webkitBackfaceVisibility: 'visible',
          borderRadius: '22px',
          margin: '0',
          position: 'relative',
          left: '0',
          top: '0',
        },
        filter: (node) => {
          if (node?.classList?.contains('canvas-selection-bar')) return false
          if (node?.classList?.contains('resize-handle')) return false
          return true
        },
      })
    } finally {
      element.style.transform = prevTransform
      element.style.backfaceVisibility = prevBackface
      element.style.transition = prevTransition
      element.style.opacity = prevOpacity
    }
  }

  async function exportTicketPng(targetFace = 'active') {
    if (isExporting.value) return
    isExporting.value = true
    exportProgress.value = 'Preparing...'

    const savedSelectedIds = [...selectedIds.value]
    clearSelection()
    document.body.classList.add('is-exporting-ticket')

    try {
      await nextTick()
      // Give DOM moment to clear active hover / selection rings
      await new Promise((resolve) => setTimeout(resolve, 80))

      const facesToExport = []
      if (targetFace === 'active') {
        facesToExport.push(isFlipped.value ? 'back' : 'front')
      } else if (targetFace === 'both') {
        facesToExport.push('front', 'back')
      } else {
        facesToExport.push(targetFace)
      }

      for (const face of facesToExport) {
        exportProgress.value = `Exporting ${face}...`
        const selector = face === 'back' ? '.ticket-face.ticket-back' : '.ticket-face.ticket-front'
        const element = document.querySelector(selector)

        if (!element) {
          console.warn(`Could not find element for face: ${face}`)
          continue
        }

        const dataUrl = await captureFaceElement(element, face)
        downloadDataUrl(dataUrl, getCleanFileName(face))
      }
    } catch (err) {
      console.error('Failed to export ticket PNG:', err)
    } finally {
      document.body.classList.remove('is-exporting-ticket')
      selectedIds.value = savedSelectedIds
      isExporting.value = false
      exportProgress.value = ''
    }
  }

  return {
    isExporting,
    exportProgress,
    exportTicketPng,
  }
}
