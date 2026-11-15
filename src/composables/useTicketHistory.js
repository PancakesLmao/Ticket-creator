import { ref, computed, watch, nextTick, effectScope } from 'vue'
import { useTicketData } from './useTicketData.js'
import { useCanvasDrag } from './useCanvasDrag.js'

const MAX_HISTORY = 50
const COMMIT_DEBOUNCE_MS = 220

const undoStack = ref([])
const redoStack = ref([])

let initialized = false
let isRestoring = false
let isDraggingBatch = false
let pendingTimer = null
let currentCommitted = null

export function useTicketHistory() {
  const {
    activePresetKey,
    emblemMode,
    ticket,
    bgMode,
    baseColor,
    foilMode,
    foilColor,
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
    isLightBg,
  } = useTicketData()

  const {
    elementOffsets,
    elementSizes,
    customLayers,
    layerState,
    layerGroups,
    registerDragHistoryHooks,
    captureCanvasState,
    applyCanvasState,
  } = useCanvasDrag()

  function takeSnapshot() {
    const ticketCopy = JSON.parse(JSON.stringify(ticket))
    if (!ticketCopy.removedTextBoxes) {
      ticketCopy.removedTextBoxes = {}
    }
    if (!ticketCopy.customBoxTexts) {
      ticketCopy.customBoxTexts = {}
    }
    if (!ticketCopy.customBoxColors) {
      ticketCopy.customBoxColors = {}
    }

    return {
      ticket: ticketCopy,
      appearance: {
        activePresetKey: activePresetKey.value,
        emblemMode: emblemMode.value,
        bgMode: bgMode.value,
        baseColor: baseColor.value,
        foilMode: foilMode.value,
        foilColor: foilColor.value,
        customBgImage: customBgImage.value,
        customStubBgImage: customStubBgImage.value,
        customLogoUrl: customLogoUrl.value,
        bgOpacity: bgOpacity.value,
        stubBgOpacity: stubBgOpacity.value,
        overlayOpacity: overlayOpacity.value,
        bgPosX: bgPosX.value,
        bgPosY: bgPosY.value,
        bgZoom: bgZoom.value,
        stubBgPosX: stubBgPosX.value,
        stubBgPosY: stubBgPosY.value,
        stubBgZoom: stubBgZoom.value,
        isLightBg: isLightBg.value,
      },
      canvas: captureCanvasState(),
    }
  }

  function makeEntry(snapshot = takeSnapshot()) {
    return {
      snapshot,
      serialized: JSON.stringify(snapshot),
    }
  }

  function clearPendingTimer() {
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer)
      pendingTimer = null
    }
  }

  function commitCurrentSnapshot() {
    if (isRestoring || !currentCommitted) return
    const nextEntry = makeEntry()
    if (nextEntry.serialized === currentCommitted.serialized) return

    const nextUndo = [...undoStack.value, currentCommitted]
    if (nextUndo.length > MAX_HISTORY) {
      nextUndo.splice(0, nextUndo.length - MAX_HISTORY)
    }
    undoStack.value = nextUndo
    redoStack.value = []
    currentCommitted = nextEntry
  }

  function flushPendingSnapshot() {
    if (pendingTimer !== null) {
      clearPendingTimer()
      commitCurrentSnapshot()
    }
  }

  function scheduleCommit() {
    clearPendingTimer()
    pendingTimer = setTimeout(() => {
      pendingTimer = null
      commitCurrentSnapshot()
    }, COMMIT_DEBOUNCE_MS)
  }

  function applyEntry(entry) {
    if (!entry?.snapshot) return
    clearPendingTimer()
    isRestoring = true
    currentCommitted = entry

    const { ticket: savedTicket, appearance, canvas } = entry.snapshot

    Object.keys(ticket).forEach((key) => {
      if (!(key in savedTicket)) {
        delete ticket[key]
      }
    })
    Object.assign(ticket, savedTicket, {
      removedTextBoxes: savedTicket.removedTextBoxes
        ? { ...savedTicket.removedTextBoxes }
        : {},
      customBoxTexts: savedTicket.customBoxTexts
        ? { ...savedTicket.customBoxTexts }
        : {},
      customBoxColors: savedTicket.customBoxColors
        ? { ...savedTicket.customBoxColors }
        : {},
    })

    if (appearance) {
      activePresetKey.value = appearance.activePresetKey
      emblemMode.value = appearance.emblemMode
      bgMode.value = appearance.bgMode
      baseColor.value = appearance.baseColor
      foilMode.value = appearance.foilMode
      foilColor.value = appearance.foilColor
      customBgImage.value = appearance.customBgImage
      customStubBgImage.value = appearance.customStubBgImage ?? null
      customLogoUrl.value = appearance.customLogoUrl
      bgOpacity.value = appearance.bgOpacity
      stubBgOpacity.value = appearance.stubBgOpacity ?? appearance.bgOpacity ?? 0.85
      overlayOpacity.value = appearance.overlayOpacity
      bgPosX.value = appearance.bgPosX ?? 50
      bgPosY.value = appearance.bgPosY ?? 50
      bgZoom.value = appearance.bgZoom ?? 100
      stubBgPosX.value = appearance.stubBgPosX ?? 50
      stubBgPosY.value = appearance.stubBgPosY ?? 50
      stubBgZoom.value = appearance.stubBgZoom ?? 100
      isLightBg.value = appearance.isLightBg
    }

    applyCanvasState(canvas)

    nextTick(() => {
      isRestoring = false
    })
  }

  function undo() {
    if (isDraggingBatch) return false
    flushPendingSnapshot()
    if (undoStack.value.length === 0) return false

    const nextUndo = [...undoStack.value]
    const previousEntry = nextUndo.pop()
    undoStack.value = nextUndo

    if (currentCommitted) {
      redoStack.value = [...redoStack.value, currentCommitted]
    }
    applyEntry(previousEntry)
    return true
  }

  function redo() {
    if (isDraggingBatch) return false
    flushPendingSnapshot()
    if (redoStack.value.length === 0) return false

    const nextRedo = [...redoStack.value]
    const nextEntry = nextRedo.pop()
    redoStack.value = nextRedo

    if (currentCommitted) {
      undoStack.value = [...undoStack.value, currentCommitted]
    }
    applyEntry(nextEntry)
    return true
  }

  function clearHistory() {
    clearPendingTimer()
    undoStack.value = []
    redoStack.value = []
    currentCommitted = makeEntry()
  }

  if (!initialized) {
    initialized = true
    currentCommitted = makeEntry()

    registerDragHistoryHooks({
      onStart() {
        flushPendingSnapshot()
        isDraggingBatch = true
      },
      onEnd() {
        if (!isDraggingBatch) return
        isDraggingBatch = false
        commitCurrentSnapshot()
      },
    })

    const historyScope = effectScope(true)
    historyScope.run(() => {
      watch(
        [
          ticket,
          activePresetKey,
          emblemMode,
          bgMode,
          baseColor,
          foilMode,
          foilColor,
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
          isLightBg,
          elementOffsets,
          elementSizes,
          customLayers,
          layerState,
          layerGroups,
        ],
        () => {
          if (isRestoring || isDraggingBatch) return
          scheduleCommit()
        },
        { deep: true },
      )
    })
  }

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)
  const undoCount = computed(() => undoStack.value.length)
  const redoCount = computed(() => redoStack.value.length)

  return {
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    undo,
    redo,
    flushPendingSnapshot,
    clearHistory,
  }
}

