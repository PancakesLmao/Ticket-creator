import { reactive, ref, computed, watch } from 'vue'
import { CANVAS_LAYER_DEFINITIONS, CANVAS_LAYER_MAP } from '../constants/canvasLayers.js'
import {
  CUSTOM_TEXT_STYLE_PRESETS,
  registerDynamicTextBox,
  unregisterDynamicTextBox,
  clearDynamicTextBoxes,
  getTextBoxById,
  getBlockTextBoxes,
} from '../models/ticketTextBoxes.js'

const presetHiddenIds = ref(new Set(['front-origin', 'front-route-line', 'front-dest']))

function createInitialLayerState() {
  const state = {}
  CANVAS_LAYER_DEFINITIONS.forEach((def, index) => {
    state[def.id] = {
      visible: !presetHiddenIds.value.has(def.id),
      locked: false,
      zIndex: 10 + index,
      groupId: null,
    }
  })
  return state
}

const customLayers = reactive([])
const layerDefinitions = reactive([...CANVAS_LAYER_DEFINITIONS])
const layerMap = reactive({ ...CANVAS_LAYER_MAP })
const elementOffsets = reactive({})
const elementSizes = reactive({})
const clipboardLayers = ref([])
const layerState = reactive(createInitialLayerState())
const layerGroups = reactive({})
const selectedIds = ref([])
const activeDragId = ref(null)
const hoveredLayerId = ref(null)
const isFlipped = ref(false)
const isSidebarOpen = ref(false)
const isLayerPanelOpen = ref(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true)

watch(isSidebarOpen, (open) => {
  if (open && typeof window !== 'undefined' && window.innerWidth < 1024) {
    isLayerPanelOpen.value = false
  }
})

watch(isLayerPanelOpen, (open) => {
  if (open && typeof window !== 'undefined' && window.innerWidth < 1024) {
    isSidebarOpen.value = false
  }
})
const layoutVersion = ref(0)
const editRegistryVersion = ref(0)
const contextMenu = reactive({
  open: false,
  x: 0,
  y: 0,
  targetId: null,
  textBoxId: null,
})

let groupCounter = 0
let customCounter = 0
let ticketAccessor = () => null
let dragHistoryHooks = { onStart: null, onEnd: null }
const blockEls = new Map()
const blockEditFns = new Map()

let pasteCascadeCount = 0

const SOURCE_TYPE_BY_BLOCK_ID = {
  'front-emblem': 'emblem-header',
  'back-emblem': 'emblem-back',
  'front-badge': 'foil-badge',
  'stub-price-badge': 'price-badge',
  'front-route-line': 'route-line',
  'front-notice': 'micro-notice',
  'stub-section': 'stub-pair',
  'stub-row': 'stub-pair',
  'stub-seat': 'stub-pair',
  'stub-ticket-no': 'stub-pair',
  'stub-footer': 'stub-footer',
  'back-qr': 'qr',
  'back-contact': 'contact-pill',
  'back-terms': 'terms-card',
  'back-barcode': 'barcode',
}

const FIXED_WIDTH_SOURCE_TYPES = new Set([
  'route-line',
  'micro-notice',
  'stub-pair',
  'stub-footer',
  'terms-card',
  'barcode',
])

function syncDynamicLayerDefs() {
  layerDefinitions.splice(0, layerDefinitions.length, ...CANVAS_LAYER_DEFINITIONS, ...customLayers)
  const validIds = new Set(layerDefinitions.map((d) => d.id))
  Object.keys(layerMap).forEach((key) => {
    if (!validIds.has(key)) {
      delete layerMap[key]
    }
  })
  layerDefinitions.forEach((def) => {
    layerMap[def.id] = def
  })
}

function buildDynamicBoxConfig(layer, boxDef) {
  const sourceBox = boxDef.sourceBoxId ? getTextBoxById(boxDef.sourceBoxId) : null
  if (sourceBox && !sourceBox.isCustom) {
    return {
      id: boxDef.id,
      blockId: layer.id,
      fieldKey: boxDef.id,
      label: boxDef.label || sourceBox.label,
      section: layer.section || sourceBox.section,
      face: layer.face,
      placeholder: sourceBox.placeholder,
      tag: sourceBox.tag,
      textClass: sourceBox.textClass,
      inputClass: sourceBox.inputClass,
      multiline: sourceBox.multiline,
      editable: sourceBox.editable,
      popover: sourceBox.popover,
      foilText: sourceBox.foilText,
      primaryEdit: sourceBox.primaryEdit,
      colorKey: sourceBox.colorKey,
      defaultColor: sourceBox.defaultColor,
      stylePreset: boxDef.stylePreset || 'headline',
    }
  }
  const preset =
    CUSTOM_TEXT_STYLE_PRESETS[boxDef.stylePreset || layer.stylePreset || 'headline'] ||
    CUSTOM_TEXT_STYLE_PRESETS.headline
  return {
    id: boxDef.id,
    blockId: layer.id,
    fieldKey: boxDef.id,
    label: boxDef.label || layer.label || preset.label,
    section: 'Custom',
    face: layer.face,
    placeholder: preset.placeholder,
    tag: preset.tag,
    textClass: preset.textClass,
    inputClass: preset.inputClass,
    multiline: Boolean(preset.multiline),
    foilText: Boolean(preset.foilText),
    primaryEdit: true,
    colorKey: preset.colorKey || null,
    defaultColor: preset.defaultColor || null,
    stylePreset: preset.key,
  }
}

function syncLayerBoxes(layer) {
  if (!layer?.boxes) return
  layer.boxes.forEach((boxDef) => {
    registerDynamicTextBox(buildDynamicBoxConfig(layer, boxDef))
  })
}

function syncAllCustomLayerBoxes() {
  clearDynamicTextBoxes()
  customLayers.forEach((layer) => {
    syncLayerBoxes(layer)
  })
}

const activeLayerFace = computed(() => (isFlipped.value ? 'back' : 'front'))

function bumpLayout() {
  layoutVersion.value++
}

export function registerTicketAccessor(fn) {
  if (typeof fn === 'function') {
    ticketAccessor = fn
  }
}

export function isAnyLayerVisible(ids = []) {
  return ids.some((id) => layerState[id]?.visible !== false)
}

export function setFlipped(val) {
  const next = Boolean(val)
  if (isFlipped.value !== next) {
    isFlipped.value = next
    clearSelection()
  }
}

export function toggleFlip() {
  setFlipped(!isFlipped.value)
}

export function setActiveLayerFace(face) {
  if (face === 'front') setFlipped(false)
  else if (face === 'back') setFlipped(true)
}

export function ensureLayerState(blockId) {
  if (!layerState[blockId]) {
    layerState[blockId] = {
      visible: true,
      locked: false,
      zIndex: 20,
      groupId: null,
    }
  }
  return layerState[blockId]
}

export function ensureOffset(blockId) {
  if (!elementOffsets[blockId]) {
    elementOffsets[blockId] = { x: 0, y: 0 }
  }
  return elementOffsets[blockId]
}

export function getOffset(blockId) {
  return elementOffsets[blockId] || { x: 0, y: 0 }
}

function isSizeCustomized(size) {
  return Boolean(
    size &&
      (Math.abs((size.scale ?? 1) - 1) >= 0.001 ||
        (size.width !== null && size.width !== undefined))
  )
}

export function ensureElementSize(blockId) {
  if (!elementSizes[blockId]) {
    elementSizes[blockId] = { scale: 1, width: null }
  }
  return elementSizes[blockId]
}

export function getElementSize(blockId) {
  return elementSizes[blockId] || { scale: 1, width: null }
}

export function setElementSize(blockId, nextSize = {}) {
  const current = getElementSize(blockId)
  const rawScale = nextSize.scale !== undefined ? nextSize.scale : current.scale
  const scale = Number.isFinite(Number(rawScale))
    ? Math.round(Math.min(3, Math.max(0.5, Number(rawScale))) * 100) / 100
    : 1
  const rawWidth = nextSize.width !== undefined ? nextSize.width : current.width
  const width =
    rawWidth !== null && rawWidth !== undefined && Number.isFinite(Number(rawWidth))
      ? Math.round(Math.min(820, Math.max(40, Number(rawWidth))))
      : null

  if (Math.abs(scale - 1) < 0.001 && width === null) {
    delete elementSizes[blockId]
  } else {
    elementSizes[blockId] = { scale, width }
  }
  bumpLayout()
}

export function resetElementSize(blockId) {
  delete elementSizes[blockId]
  bumpLayout()
}

export function registerBlockEl(blockId, el) {
  if (el) {
    blockEls.set(blockId, el)
  } else {
    blockEls.delete(blockId)
  }
  bumpLayout()
}

export function registerBlockEditFn(blockId, fn) {
  if (fn) {
    blockEditFns.set(blockId, fn)
  } else {
    blockEditFns.delete(blockId)
  }
  editRegistryVersion.value++
}

export const hasCustomOffsets = computed(
  () =>
    Object.values(elementOffsets).some((o) => o && (o.x !== 0 || o.y !== 0)) ||
    Object.values(elementSizes).some((s) => isSizeCustomized(s))
)

export const hasSelectedOffsets = computed(() =>
  selectedIds.value.some((id) => {
    const o = elementOffsets[id]
    return (o && (o.x !== 0 || o.y !== 0)) || isSizeCustomized(elementSizes[id])
  })
)

export const hasClipboardLayers = computed(() => clipboardLayers.value.length > 0)

export const hiddenLayersCount = computed(() => {
  const hiddenBlocks = CANVAS_LAYER_DEFINITIONS.filter(
    (def) => !presetHiddenIds.value.has(def.id) && layerState[def.id]?.visible === false
  ).length
  const ticket = ticketAccessor()
  const removedBoxes = ticket?.removedTextBoxes
    ? Object.keys(ticket.removedTextBoxes).filter((boxId) => {
        const box = getTextBoxById(boxId)
        if (!box) return false
        if (!box.blockId) return true
        return layerState[box.blockId]?.visible !== false
      }).length
    : 0
  return hiddenBlocks + removedBoxes
})

export const activeSelectedEditable = computed(() => {
  void editRegistryVersion.value
  if (selectedIds.value.length !== 1) return false
  return blockEditFns.has(selectedIds.value[0])
})

export const selectedGroup = computed(() => {
  if (selectedIds.value.length === 0) return null
  const groupIds = new Set(
    selectedIds.value.map((id) => layerState[id]?.groupId).filter(Boolean)
  )
  if (groupIds.size === 1) {
    const [gid] = [...groupIds]
    return layerGroups[gid] || null
  }
  return null
})

export const hasAnyGroupedInSelection = computed(() =>
  selectedIds.value.some((id) => Boolean(layerState[id]?.groupId))
)

function getVisibleMembers(group) {
  if (!group) return []
  return group.memberIds.filter((id) => layerState[id]?.visible !== false)
}

export const canGroupSelected = computed(() => {
  const validSelected = selectedIds.value.filter((id) => layerState[id]?.visible !== false)
  if (validSelected.length < 2) return false
  const faces = new Set(validSelected.map((id) => layerMap[id]?.face || 'front'))
  if (faces.size > 1) return false
  const gids = new Set(validSelected.map((id) => layerState[id]?.groupId))
  if (gids.size === 1) {
    const [only] = [...gids]
    if (only && getVisibleMembers(layerGroups[only]).length === validSelected.length) {
      return false
    }
  }
  return true
})

export const isSelectionLocked = computed(() => {
  if (selectedIds.value.length === 0) return false
  return selectedIds.value.every((id) => Boolean(layerState[id]?.locked))
})

export function isSelected(blockId) {
  return selectedIds.value.includes(blockId)
}

export function getGroupMemberIds(blockId) {
  if (layerState[blockId]?.visible === false) {
    return []
  }
  const gid = layerState[blockId]?.groupId
  if (gid && layerGroups[gid]) {
    return getVisibleMembers(layerGroups[gid])
  }
  return [blockId]
}

export function getDragTargetIds(blockId, { includeExisting = false } = {}) {
  const unitIds = getGroupMemberIds(blockId)
  const baseIds = selectedIds.value.includes(blockId)
    ? selectedIds.value
    : includeExisting
      ? [...new Set([...selectedIds.value, ...unitIds])]
      : unitIds
  return baseIds.filter((id) => !layerState[id]?.locked && layerState[id]?.visible !== false)
}

export function selectBlock(blockId, { multi = false } = {}) {
  if (!layerMap[blockId] || layerState[blockId]?.visible === false) {
    return
  }
  const targetFace = layerMap[blockId]?.face || 'front'
  if (targetFace !== activeLayerFace.value) {
    setActiveLayerFace(targetFace)
  }

  const unitIds = getGroupMemberIds(blockId)
  if (unitIds.length === 0) return

  if (multi && selectedIds.value.length > 0) {
    const currentFace = layerMap[selectedIds.value[0]]?.face || 'front'
    if (currentFace === targetFace) {
      const next = new Set(selectedIds.value)
      const allPresent = unitIds.every((id) => next.has(id))
      if (allPresent) {
        unitIds.forEach((id) => next.delete(id))
      } else {
        unitIds.forEach((id) => next.add(id))
      }
      selectedIds.value = [...next]
      bumpLayout()
      return
    }
  }

  selectedIds.value = [...unitIds]
  bumpLayout()
}

export function selectGroup(groupId) {
  const group = layerGroups[groupId]
  if (!group) return
  if (group.face !== activeLayerFace.value) {
    setActiveLayerFace(group.face)
  }
  selectedIds.value = getVisibleMembers(group)
  bumpLayout()
}

export function clearSelection() {
  selectedIds.value = []
  contextMenu.open = false
  contextMenu.targetId = null
  contextMenu.textBoxId = null
}

export function openContextMenu(x, y, targetId = null, textBoxId = null) {
  if (targetId && (!layerMap[targetId] || layerState[targetId]?.visible === false)) {
    return
  }
  if (targetId && !selectedIds.value.includes(targetId)) {
    selectBlock(targetId, { multi: false })
  }
  if (targetId && !selectedIds.value.includes(targetId)) {
    return
  }
  contextMenu.open = true
  contextMenu.x = x
  contextMenu.y = y
  contextMenu.targetId = targetId || selectedIds.value[0] || null
  contextMenu.textBoxId = textBoxId || null
}

export function closeContextMenu() {
  contextMenu.open = false
  contextMenu.targetId = null
  contextMenu.textBoxId = null
}

export function triggerSelectedEdit() {
  if (selectedIds.value.length !== 1) return false
  const fn = blockEditFns.get(selectedIds.value[0])
  if (typeof fn === 'function') {
    closeContextMenu()
    fn()
    return true
  }
  return false
}

function detachMemberFromGroup(memberId) {
  const oldGid = layerState[memberId]?.groupId
  if (!oldGid || !layerGroups[oldGid]) return
  layerGroups[oldGid].memberIds = layerGroups[oldGid].memberIds.filter((id) => id !== memberId)
  layerState[memberId].groupId = null
  if (layerGroups[oldGid].memberIds.length < 2) {
    layerGroups[oldGid].memberIds.forEach((remainingId) => {
      if (layerState[remainingId]) {
        layerState[remainingId].groupId = null
      }
    })
    delete layerGroups[oldGid]
  }
}

export function groupSelected() {
  const validSelected = selectedIds.value.filter((id) => layerState[id]?.visible !== false)
  if (validSelected.length < 2) return null
  const primaryFace = layerMap[validSelected[0]]?.face || 'front'
  const members = validSelected.filter(
    (id) => (layerMap[id]?.face || 'front') === primaryFace
  )
  if (members.length < 2) return null

  members.forEach((id) => detachMemberFromGroup(id))

  const gid = `group-${++groupCounter}`
  layerGroups[gid] = {
    id: gid,
    name: `Group ${groupCounter}`,
    face: primaryFace,
    memberIds: [...members],
  }
  members.forEach((id) => {
    ensureLayerState(id).groupId = gid
  })
  selectedIds.value = [...members]
  closeContextMenu()
  bumpLayout()
  return layerGroups[gid]
}

export function ungroupSelected(targetGroupId = null) {
  const groupIds = targetGroupId
    ? [targetGroupId]
    : [...new Set(selectedIds.value.map((id) => layerState[id]?.groupId).filter(Boolean))]

  groupIds.forEach((gid) => {
    const group = layerGroups[gid]
    if (!group) return
    group.memberIds.forEach((memberId) => {
      if (layerState[memberId]) {
        layerState[memberId].groupId = null
      }
    })
    delete layerGroups[gid]
  })
  closeContextMenu()
  bumpLayout()
}

export function moveBlocksByDelta(blockIds, dx, dy, initialOffsetsMap) {
  blockIds.forEach((id) => {
    const init = initialOffsetsMap[id] || { x: 0, y: 0 }
    const target = ensureOffset(id)
    target.x = Math.round(init.x + dx)
    target.y = Math.round(init.y + dy)
  })
  bumpLayout()
}

export function nudgeSelected(dx, dy) {
  const targets = selectedIds.value.filter(
    (id) => !layerState[id]?.locked && layerState[id]?.visible !== false
  )
  if (targets.length === 0) return
  targets.forEach((id) => {
    const target = ensureOffset(id)
    target.x += dx
    target.y += dy
  })
  bumpLayout()
}

function removeCustomLayerRecord(blockId, ticketArg = null) {
  const idx = customLayers.findIndex((item) => item.id === blockId)
  if (idx === -1) return false
  const [removed] = customLayers.splice(idx, 1)
  const ticket = ticketArg || ticketAccessor()
  removed.boxes?.forEach((boxDef) => {
    unregisterDynamicTextBox(boxDef.id)
    if (ticket?.customBoxTexts) {
      delete ticket.customBoxTexts[boxDef.id]
    }
    if (ticket?.customBoxColors) {
      delete ticket.customBoxColors[boxDef.id]
    }
    if (ticket?.removedTextBoxes) {
      delete ticket.removedTextBoxes[boxDef.id]
    }
  })
  delete layerState[blockId]
  delete elementOffsets[blockId]
  delete elementSizes[blockId]
  syncDynamicLayerDefs()
  return true
}

export function removeField(blockId) {
  detachMemberFromGroup(blockId)
  if (layerMap[blockId]?.isCustom) {
    removeCustomLayerRecord(blockId)
  } else {
    ensureLayerState(blockId).visible = false
  }
  selectedIds.value = selectedIds.value.filter((id) => id !== blockId)
  closeContextMenu()
  bumpLayout()
}

export function removeSelectedFields() {
  const targets = [...selectedIds.value]
  if (targets.length === 0) return
  targets.forEach((id) => {
    detachMemberFromGroup(id)
    if (layerMap[id]?.isCustom) {
      removeCustomLayerRecord(id)
    } else {
      ensureLayerState(id).visible = false
    }
  })
  selectedIds.value = []
  closeContextMenu()
  bumpLayout()
}

export function removeTextBoxById(textBoxId, ticketArg = null) {
  const ticket = ticketArg || ticketAccessor()
  const box = getTextBoxById(textBoxId)
  if (!box || !ticket) return false
  box.remove(ticket)
  if (box.blockId) {
    const siblingBoxes = getBlockTextBoxes(box.blockId)
    if (siblingBoxes.length > 0 && siblingBoxes.every((b) => b.isRemoved(ticket))) {
      removeField(box.blockId)
      return true
    }
  }
  closeContextMenu()
  bumpLayout()
  return true
}

export function toggleLayerVisibility(blockId) {
  const state = ensureLayerState(blockId)
  state.visible = !state.visible
  if (!state.visible) {
    detachMemberFromGroup(blockId)
    selectedIds.value = selectedIds.value.filter((id) => id !== blockId)
  }
  bumpLayout()
}

export function restoreAllFields(face = null, ticketArg = null) {
  const ticket = ticketArg || ticketAccessor()
  layerDefinitions.forEach((def) => {
    if (!face || def.face === face) {
      ensureLayerState(def.id).visible = def.isCustom ? true : !presetHiddenIds.value.has(def.id)
      if (ticket?.removedTextBoxes) {
        getBlockTextBoxes(def.id).forEach((box) => box.restore(ticket))
      }
    }
  })
  if (!face && ticket?.removedTextBoxes) {
    Object.keys(ticket.removedTextBoxes).forEach((id) => {
      delete ticket.removedTextBoxes[id]
    })
  }
  bumpLayout()
}

export function toggleLayerLock(blockId) {
  const state = ensureLayerState(blockId)
  state.locked = !state.locked
  bumpLayout()
}

export function toggleSelectedLock() {
  if (selectedIds.value.length === 0) return
  const nextLocked = !isSelectionLocked.value
  selectedIds.value.forEach((id) => {
    ensureLayerState(id).locked = nextLocked
  })
  closeContextMenu()
  bumpLayout()
}

function getOrderedFaceIds(face) {
  return layerDefinitions
    .filter((def) => def.face === face)
    .map((def, idx) => ({
      id: def.id,
      zIndex: layerState[def.id]?.zIndex ?? 10 + idx,
      idx,
    }))
    .sort((a, b) => a.zIndex - b.zIndex || a.idx - b.idx)
    .map((item) => item.id)
}

function applyFaceOrder(orderedIds) {
  orderedIds.forEach((id, idx) => {
    ensureLayerState(id).zIndex = 10 + idx
  })
  bumpLayout()
}

function isLayerRenderActive(id) {
  return layerState[id]?.visible !== false
}

function resolveOrderTargets(blockId = null) {
  if (blockId && !selectedIds.value.includes(blockId)) {
    return getGroupMemberIds(blockId)
  }
  if (selectedIds.value.length > 0) {
    return selectedIds.value.filter(isLayerRenderActive)
  }
  return blockId && isLayerRenderActive(blockId) ? [blockId] : []
}

function groupTargetsByFace(targets) {
  const byFace = {}
  targets.forEach((id) => {
    const face = layerMap[id]?.face || 'front'
    if (!byFace[face]) byFace[face] = []
    byFace[face].push(id)
  })
  return byFace
}

export function bringForward(blockId = null) {
  const targets = resolveOrderTargets(blockId)
  Object.entries(groupTargetsByFace(targets)).forEach(([face, faceTargets]) => {
    const ordered = getOrderedFaceIds(face)
    const activeOrdered = ordered.filter(isLayerRenderActive)
    const inactive = ordered.filter((id) => !isLayerRenderActive(id))
    const targetSet = new Set(faceTargets)
    for (let i = activeOrdered.length - 2; i >= 0; i--) {
      if (targetSet.has(activeOrdered[i]) && !targetSet.has(activeOrdered[i + 1])) {
        ;[activeOrdered[i], activeOrdered[i + 1]] = [activeOrdered[i + 1], activeOrdered[i]]
      }
    }
    applyFaceOrder([...inactive, ...activeOrdered])
  })
}

export function sendBackward(blockId = null) {
  const targets = resolveOrderTargets(blockId)
  Object.entries(groupTargetsByFace(targets)).forEach(([face, faceTargets]) => {
    const ordered = getOrderedFaceIds(face)
    const activeOrdered = ordered.filter(isLayerRenderActive)
    const inactive = ordered.filter((id) => !isLayerRenderActive(id))
    const targetSet = new Set(faceTargets)
    for (let i = 1; i < activeOrdered.length; i++) {
      if (targetSet.has(activeOrdered[i]) && !targetSet.has(activeOrdered[i - 1])) {
        ;[activeOrdered[i], activeOrdered[i - 1]] = [activeOrdered[i - 1], activeOrdered[i]]
      }
    }
    applyFaceOrder([...inactive, ...activeOrdered])
  })
}

export function bringToFront(blockId = null) {
  const targets = resolveOrderTargets(blockId)
  Object.entries(groupTargetsByFace(targets)).forEach(([face, faceTargets]) => {
    const ordered = getOrderedFaceIds(face)
    const targetSet = new Set(faceTargets)
    const rest = ordered.filter((id) => !targetSet.has(id))
    const moving = ordered.filter((id) => targetSet.has(id))
    applyFaceOrder([...rest, ...moving])
  })
  closeContextMenu()
}

export function sendToBack(blockId = null) {
  const targets = resolveOrderTargets(blockId)
  Object.entries(groupTargetsByFace(targets)).forEach(([face, faceTargets]) => {
    const ordered = getOrderedFaceIds(face)
    const targetSet = new Set(faceTargets)
    const rest = ordered.filter((id) => !targetSet.has(id))
    const moving = ordered.filter((id) => targetSet.has(id))
    applyFaceOrder([...moving, ...rest])
  })
  closeContextMenu()
}

export function reorderLayerByDrop(draggedId, targetId, position = 'before') {
  if (!draggedId || !targetId || draggedId === targetId) return false
  const draggedFace = layerMap[draggedId]?.face
  const targetFace = layerMap[targetId]?.face
  if (!draggedFace || draggedFace !== targetFace) return false
  if (!isLayerRenderActive(draggedId) || !isLayerRenderActive(targetId)) return false

  const orderedBottomUp = getOrderedFaceIds(draggedFace)
  const inactive = orderedBottomUp.filter((id) => !isLayerRenderActive(id))
  const activeTopDown = orderedBottomUp.filter(isLayerRenderActive).reverse()

  const remaining = activeTopDown.filter((id) => id !== draggedId)
  const targetIdx = remaining.indexOf(targetId)
  if (targetIdx === -1) return false

  const insertIdx = position === 'after' ? targetIdx + 1 : targetIdx
  const reorderedTopDown = [
    ...remaining.slice(0, insertIdx),
    draggedId,
    ...remaining.slice(insertIdx),
  ]

  const changed = reorderedTopDown.some((id, idx) => id !== activeTopDown[idx])
  if (!changed) return false

  notifyDragStart()
  applyFaceOrder([...inactive, ...reorderedTopDown.reverse()])
  notifyDragEnd()
  return true
}

function getNextFaceZIndex(face) {
  const maxZ = layerDefinitions
    .filter((d) => d.face === face)
    .reduce((max, d) => Math.max(max, layerState[d.id]?.zIndex ?? 10), 19)
  return maxZ + 1
}

export function setTextBoxColor(textBoxId, color = null, ticketArg = null) {
  const ticket = ticketArg || ticketAccessor()
  if (!ticket || !textBoxId) return false
  if (!ticket.customBoxColors) {
    ticket.customBoxColors = {}
  }
  const cleanColor = color ? String(color).trim() : null
  if (!cleanColor) {
    delete ticket.customBoxColors[textBoxId]
  } else {
    ticket.customBoxColors[textBoxId] = cleanColor
  }
  bumpLayout()
  return true
}

export function resetTextBoxColor(textBoxId, ticketArg = null) {
  return setTextBoxColor(textBoxId, null, ticketArg)
}

export function addCustomTextBox(presetKey = 'headline', options = {}) {
  const preset = CUSTOM_TEXT_STYLE_PRESETS[presetKey] || CUSTOM_TEXT_STYLE_PRESETS.headline
  const face = options.face || activeLayerFace.value
  if (face !== activeLayerFace.value) {
    setActiveLayerFace(face)
  }
  const ticket = options.ticket || ticketAccessor()
  const num = ++customCounter
  const layerId = `custom-layer-${num}`
  const boxId = `${layerId}__text`

  const existingCustomCount = customLayers.filter((l) => l.face === face).length
  const cascade = existingCustomCount % 6
  const baseX = Number.isFinite(options.baseX) ? Math.round(options.baseX) : 300 + cascade * 16
  const baseY = Number.isFinite(options.baseY) ? Math.round(options.baseY) : 132 + cascade * 16

  const layerRecord = {
    id: layerId,
    label: preset.label,
    section: 'Custom',
    face,
    isCustom: true,
    kind: 'textbox',
    stylePreset: preset.key,
    baseX,
    baseY,
    baseWidth: preset.multiline ? 240 : null,
    boxes: [
      {
        id: boxId,
        sourceBoxId: null,
        stylePreset: preset.key,
        label: preset.label,
      },
    ],
  }

  customLayers.push(layerRecord)
  syncDynamicLayerDefs()
  syncLayerBoxes(layerRecord)

  if (ticket) {
    if (!ticket.customBoxTexts) ticket.customBoxTexts = {}
    ticket.customBoxTexts[boxId] =
      options.initialText !== undefined ? String(options.initialText) : preset.placeholder
  }

  layerState[layerId] = {
    visible: true,
    locked: false,
    zIndex: getNextFaceZIndex(face),
    groupId: null,
  }

  selectedIds.value = [layerId]
  closeContextMenu()
  bumpLayout()
  return layerId
}

export function setCustomLayerStylePreset(layerId, presetKey) {
  const preset = CUSTOM_TEXT_STYLE_PRESETS[presetKey]
  const layer = customLayers.find((item) => item.id === layerId)
  if (!preset || !layer || layer.kind !== 'textbox') return false

  layer.stylePreset = preset.key
  layer.label = preset.label
  if (preset.multiline && !layer.baseWidth && !elementSizes[layerId]?.width) {
    layer.baseWidth = 240
  }
  if (layer.boxes?.[0]) {
    layer.boxes[0].stylePreset = preset.key
    layer.boxes[0].label = preset.label
    registerDynamicTextBox(buildDynamicBoxConfig(layer, layer.boxes[0]))
  }
  syncDynamicLayerDefs()
  bumpLayout()
  return true
}

function measureBuiltInGeometry(sourceId, sourceType) {
  const el = blockEls.get(sourceId)
  const faceEl = el?.closest?.('.ticket-face')
  let baseX = 48
  let baseY = 48
  let baseWidth = null

  if (el && faceEl && faceEl.offsetWidth > 0) {
    const faceRect = faceEl.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const scaleX = faceRect.width / faceEl.offsetWidth
    const scaleY = faceRect.height / (faceEl.offsetHeight || 1)
    if (faceRect.width >= 180 && scaleX > 0.2 && scaleY > 0.2) {
      baseX = Math.round((elRect.left - faceRect.left) / scaleX)
      baseY = Math.round((elRect.top - faceRect.top) / scaleY)
    }
  }

  const currentSize = getElementSize(sourceId)
  if (
    FIXED_WIDTH_SOURCE_TYPES.has(sourceType) &&
    !currentSize.width &&
    el &&
    el.offsetWidth > 0
  ) {
    baseWidth = Math.round(el.offsetWidth)
  }

  return { baseX, baseY, baseWidth }
}

function resolveActionTargets(blockId = null) {
  if (selectedIds.value.length > 0 && (!blockId || selectedIds.value.includes(blockId))) {
    return selectedIds.value.filter((id) => layerState[id]?.visible !== false && layerMap[id])
  }
  if (blockId && layerMap[blockId] && layerState[blockId]?.visible !== false) {
    return getGroupMemberIds(blockId)
  }
  return []
}

function buildLayerCloneSpec(sourceId) {
  const ticket = ticketAccessor()
  const def = layerMap[sourceId]
  if (!def) return null

  const size = getElementSize(sourceId)
  const copiedSize = isSizeCustomized(size)
    ? { scale: size.scale ?? 1, width: size.width ?? null }
    : null

  const customSrc = customLayers.find((item) => item.id === sourceId)
  if (customSrc) {
    const srcOffset = getOffset(sourceId)
    return {
      face: customSrc.face,
      label: customSrc.label.endsWith(' (Copy)')
        ? customSrc.label
        : `${customSrc.label} (Copy)`,
      section: customSrc.section || 'Custom',
      kind: customSrc.kind,
      stylePreset: customSrc.stylePreset || null,
      sourceType: customSrc.sourceType || null,
      sourceId: customSrc.sourceId || null,
      baseX: customSrc.baseX + (srcOffset.x || 0),
      baseY: customSrc.baseY + (srcOffset.y || 0),
      baseWidth: customSrc.baseWidth ?? null,
      size: copiedSize,
      groupId: layerState[sourceId]?.groupId || null,
      boxes: (customSrc.boxes || []).map((boxDef, index) => {
        const liveBox = getTextBoxById(boxDef.id)
        return {
          keySuffix: boxDef.sourceBoxId || `box-${index}`,
          sourceBoxId: boxDef.sourceBoxId || null,
          stylePreset: boxDef.stylePreset || customSrc.stylePreset || null,
          label: boxDef.label,
          value: liveBox
            ? liveBox.getValue(ticket)
            : ticket?.customBoxTexts?.[boxDef.id] ?? '',
          color: ticket?.customBoxColors?.[boxDef.id] || null,
          removed: liveBox ? liveBox.isRemoved(ticket) : false,
        }
      }),
    }
  }

  const sourceType = SOURCE_TYPE_BY_BLOCK_ID[sourceId] || 'text-stack'
  const geom = measureBuiltInGeometry(sourceId, sourceType)
  const builtInBoxes = getBlockTextBoxes(sourceId).filter((b) => !b.isCustom)

  return {
    face: def.face || 'front',
    label: `${def.label} (Copy)`,
    section: 'Custom',
    kind: 'clone',
    stylePreset: null,
    sourceType,
    sourceId,
    baseX: geom.baseX,
    baseY: geom.baseY,
    baseWidth: geom.baseWidth,
    size: copiedSize,
    groupId: layerState[sourceId]?.groupId || null,
    boxes: builtInBoxes.map((b) => ({
      keySuffix: b.id,
      sourceBoxId: b.id,
      stylePreset: null,
      label: b.label,
      value: b.getValue(ticket),
      color: ticket?.customBoxColors?.[b.id] || null,
      removed: b.isRemoved(ticket),
    })),
  }
}

function spawnClonedLayers(specs, deltaX, deltaY, { targetFace = null } = {}) {
  if (!Array.isArray(specs) || specs.length === 0) return []
  const ticket = ticketAccessor()
  const spawnedByGroup = new Map()
  const newIds = []
  const destinationFace = targetFace || specs[0].face || activeLayerFace.value
  let primaryFace = destinationFace

  specs.forEach((spec) => {
    const layerId = `custom-layer-${++customCounter}`
    const clonedBoxes = (spec.boxes || []).map((b, idx) => ({
      id: `${layerId}__${b.keySuffix || idx}`,
      sourceBoxId: b.sourceBoxId || null,
      stylePreset: b.stylePreset || spec.stylePreset || null,
      label: b.label,
    }))

    const layerFace = targetFace || spec.face || destinationFace

    const layerRecord = {
      id: layerId,
      label: spec.label,
      section: spec.section || 'Custom',
      face: layerFace,
      isCustom: true,
      kind: spec.kind,
      stylePreset: spec.stylePreset || null,
      sourceType: spec.sourceType || null,
      sourceId: spec.sourceId || null,
      baseX: Math.round(spec.baseX + deltaX),
      baseY: Math.round(spec.baseY + deltaY),
      baseWidth: spec.baseWidth ?? null,
      boxes: clonedBoxes,
    }

    customLayers.push(layerRecord)
    syncDynamicLayerDefs()
    syncLayerBoxes(layerRecord)

    if (ticket) {
      if (!ticket.customBoxTexts) ticket.customBoxTexts = {}
      if (!ticket.customBoxColors) ticket.customBoxColors = {}
      if (!ticket.removedTextBoxes) ticket.removedTextBoxes = {}
      clonedBoxes.forEach((boxDef, idx) => {
        const srcBox = spec.boxes[idx]
        ticket.customBoxTexts[boxDef.id] = srcBox?.value ?? ''
        if (srcBox?.color) {
          ticket.customBoxColors[boxDef.id] = srcBox.color
        }
        if (srcBox?.removed) {
          ticket.removedTextBoxes[boxDef.id] = true
        }
      })
    }

    layerState[layerId] = {
      visible: true,
      locked: false,
      zIndex: getNextFaceZIndex(layerFace),
      groupId: null,
    }

    if (spec.size && isSizeCustomized(spec.size)) {
      elementSizes[layerId] = {
        scale: spec.size.scale ?? 1,
        width: spec.size.width ?? null,
      }
    }

    if (spec.groupId) {
      if (!spawnedByGroup.has(spec.groupId)) {
        spawnedByGroup.set(spec.groupId, [])
      }
      spawnedByGroup.get(spec.groupId).push(layerId)
    }

    primaryFace = layerFace || primaryFace
    newIds.push(layerId)
  })

  spawnedByGroup.forEach((memberIds) => {
    if (memberIds.length >= 2) {
      const gid = `group-${++groupCounter}`
      layerGroups[gid] = {
        id: gid,
        name: `Group ${groupCounter}`,
        face: primaryFace,
        memberIds: [...memberIds],
      }
      memberIds.forEach((id) => {
        ensureLayerState(id).groupId = gid
      })
    }
  })

  if (primaryFace !== activeLayerFace.value) {
    setActiveLayerFace(primaryFace)
  }
  selectedIds.value = newIds
  closeContextMenu()
  bumpLayout()
  return newIds
}

export function copySelectedLayers(blockId = null) {
  const targets = resolveActionTargets(blockId)
  if (targets.length === 0) return false
  const specs = targets.map(buildLayerCloneSpec).filter(Boolean)
  if (specs.length === 0) return false
  clipboardLayers.value = specs
  pasteCascadeCount = 0
  closeContextMenu()
  return true
}

export function pasteLayers(options = {}) {
  if (clipboardLayers.value.length === 0) return []
  pasteCascadeCount += 1
  const step = ((pasteCascadeCount - 1) % 6) + 1
  const delta = step * 20
  const targetFace = options.face || activeLayerFace.value
  return spawnClonedLayers(clipboardLayers.value, delta, delta, { targetFace })
}

export function duplicateSelectedLayers(blockId = null) {
  const targets = resolveActionTargets(blockId)
  if (targets.length === 0) return []
  const specs = targets.map(buildLayerCloneSpec).filter(Boolean)
  if (specs.length === 0) return []
  return spawnClonedLayers(specs, 20, 20)
}

export function resetElementOffset(blockId) {
  delete elementOffsets[blockId]
  delete elementSizes[blockId]
  bumpLayout()
}

export function resetSelectedOffsets() {
  selectedIds.value.forEach((id) => {
    delete elementOffsets[id]
    delete elementSizes[id]
  })
  closeContextMenu()
  bumpLayout()
}

export function resetAllOffsets() {
  Object.keys(elementOffsets).forEach((key) => {
    delete elementOffsets[key]
  })
  Object.keys(elementSizes).forEach((key) => {
    delete elementSizes[key]
  })
  bumpLayout()
}

export function resetAllLayerState(hiddenIds = []) {
  presetHiddenIds.value = new Set(hiddenIds)
  customLayers.splice(0, customLayers.length)
  clearDynamicTextBoxes()
  syncDynamicLayerDefs()

  const builtInIds = new Set(CANVAS_LAYER_DEFINITIONS.map((d) => d.id))
  Object.keys(layerState).forEach((id) => {
    if (!builtInIds.has(id)) {
      delete layerState[id]
    }
  })
  CANVAS_LAYER_DEFINITIONS.forEach((def, index) => {
    const state = ensureLayerState(def.id)
    state.visible = !presetHiddenIds.value.has(def.id)
    state.locked = false
    state.zIndex = 10 + index
    state.groupId = null
  })
  Object.keys(layerGroups).forEach((gid) => {
    delete layerGroups[gid]
  })
  const ticket = ticketAccessor()
  if (ticket) {
    ticket.customBoxTexts = {}
    ticket.customBoxColors = {}
  }
  groupCounter = 0
  customCounter = 0
  pasteCascadeCount = 0
  clearSelection()
  resetAllOffsets()
}

export function setLayerPanelOpen(open) {
  isLayerPanelOpen.value = Boolean(open)
  if (isLayerPanelOpen.value && typeof window !== 'undefined' && window.innerWidth < 1024) {
    isSidebarOpen.value = false
  }
}

export function setSidebarOpen(open) {
  isSidebarOpen.value = Boolean(open)
  if (isSidebarOpen.value && typeof window !== 'undefined' && window.innerWidth < 1024) {
    isLayerPanelOpen.value = false
  }
}

export function toggleLayerPanel() {
  isLayerPanelOpen.value = !isLayerPanelOpen.value
}

export function setHoveredLayer(id) {
  hoveredLayerId.value = id || null
}

export function registerDragHistoryHooks(hooks = {}) {
  dragHistoryHooks = {
    onStart: typeof hooks.onStart === 'function' ? hooks.onStart : null,
    onEnd: typeof hooks.onEnd === 'function' ? hooks.onEnd : null,
  }
}

export function notifyDragStart() {
  dragHistoryHooks.onStart?.()
}

export function notifyDragEnd() {
  dragHistoryHooks.onEnd?.()
}

export function captureCanvasState() {
  const offsets = {}
  Object.entries(elementOffsets).forEach(([id, pos]) => {
    if (pos && (pos.x !== 0 || pos.y !== 0)) {
      offsets[id] = { x: Math.round(pos.x), y: Math.round(pos.y) }
    }
  })

  const sizes = {}
  Object.entries(elementSizes).forEach(([id, sz]) => {
    if (isSizeCustomized(sz)) {
      sizes[id] = {
        scale: sz.scale ?? 1,
        width: sz.width ?? null,
      }
    }
  })

  const layers = {}
  layerDefinitions.forEach((def) => {
    const st = ensureLayerState(def.id)
    layers[def.id] = {
      visible: st.visible,
      locked: st.locked,
      zIndex: st.zIndex,
      groupId: st.groupId,
    }
  })

  const groups = {}
  Object.entries(layerGroups).forEach(([gid, g]) => {
    if (g) {
      groups[gid] = {
        id: g.id,
        name: g.name,
        face: g.face,
        memberIds: [...(g.memberIds || [])],
      }
    }
  })

  const savedCustomLayers = customLayers.map((layer) => ({
    ...layer,
    boxes: (layer.boxes || []).map((b) => ({ ...b })),
  }))

  return {
    offsets,
    sizes,
    layers,
    groups,
    groupCounter,
    customLayers: savedCustomLayers,
    customCounter,
    presetHiddenIds: [...presetHiddenIds.value],
  }
}

export function applyCanvasState(snapshot) {
  if (!snapshot) return

  if (Array.isArray(snapshot.presetHiddenIds)) {
    presetHiddenIds.value = new Set(snapshot.presetHiddenIds)
  }

  customLayers.splice(
    0,
    customLayers.length,
    ...(snapshot.customLayers || []).map((layer) => ({
      ...layer,
      boxes: (layer.boxes || []).map((b) => ({ ...b })),
    }))
  )
  syncDynamicLayerDefs()
  syncAllCustomLayerBoxes()

  Object.keys(elementOffsets).forEach((key) => {
    delete elementOffsets[key]
  })
  Object.entries(snapshot.offsets || {}).forEach(([id, pos]) => {
    if (pos && (pos.x !== 0 || pos.y !== 0)) {
      elementOffsets[id] = { x: Math.round(pos.x), y: Math.round(pos.y) }
    }
  })

  Object.keys(elementSizes).forEach((key) => {
    delete elementSizes[key]
  })
  Object.entries(snapshot.sizes || {}).forEach(([id, sz]) => {
    if (isSizeCustomized(sz)) {
      elementSizes[id] = {
        scale: sz.scale ?? 1,
        width: sz.width ?? null,
      }
    }
  })

  const validDefIds = new Set(layerDefinitions.map((d) => d.id))
  Object.keys(layerState).forEach((id) => {
    if (!validDefIds.has(id)) {
      delete layerState[id]
    }
  })
  layerDefinitions.forEach((def, index) => {
    const state = ensureLayerState(def.id)
    const saved = snapshot.layers?.[def.id]
    state.visible = saved?.visible ?? (def.isCustom ? true : !presetHiddenIds.value.has(def.id))
    state.locked = saved?.locked ?? false
    state.zIndex = Number.isFinite(saved?.zIndex) ? saved.zIndex : 10 + index
    state.groupId = saved?.groupId || null
  })

  Object.keys(layerGroups).forEach((gid) => {
    delete layerGroups[gid]
  })
  Object.entries(snapshot.groups || {}).forEach(([gid, g]) => {
    if (g) {
      layerGroups[gid] = {
        id: g.id || gid,
        name: g.name || gid,
        face: g.face || layerMap[g.memberIds?.[0]]?.face || 'front',
        memberIds: [...(g.memberIds || [])],
      }
    }
  })

  groupCounter = Number(snapshot.groupCounter) || 0
  customCounter = Number(snapshot.customCounter) || 0

  selectedIds.value = selectedIds.value.filter(
    (id) => layerMap[id] && layerState[id]?.visible !== false
  )
  closeContextMenu()
  bumpLayout()
}

export function openLayersPanel() {
  const targetId = contextMenu.targetId || selectedIds.value[0]
  if (targetId && layerMap[targetId]?.face) {
    setActiveLayerFace(layerMap[targetId].face)
  }
  isLayerPanelOpen.value = true
  closeContextMenu()
}

export function getBlockScale(blockId) {
  const el = blockEls.get(blockId)
  if (!el || el.offsetWidth <= 0 || el.offsetHeight <= 0) {
    return { scaleX: 1, scaleY: 1 }
  }
  const rect = el.getBoundingClientRect()
  const ownScale = getElementSize(blockId).scale || 1
  return {
    scaleX: rect.width / el.offsetWidth / ownScale || 1,
    scaleY: rect.height / el.offsetHeight / ownScale || 1,
  }
}

export function getSelectionRect() {
  let minLeft = Infinity
  let minTop = Infinity
  let maxRight = -Infinity
  let maxBottom = -Infinity
  let count = 0

  selectedIds.value.forEach((id) => {
    const el = blockEls.get(id)
    if (!el || layerState[id]?.visible === false) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    minLeft = Math.min(minLeft, rect.left)
    minTop = Math.min(minTop, rect.top)
    maxRight = Math.max(maxRight, rect.right)
    maxBottom = Math.max(maxBottom, rect.bottom)
    count++
  })

  if (count === 0) return null
  return {
    left: minLeft,
    top: minTop,
    right: maxRight,
    bottom: maxBottom,
    width: maxRight - minLeft,
    height: maxBottom - minTop,
  }
}

export function getFaceLayerRects(face) {
  const rects = {}
  const visibleFace = isFlipped.value ? 'back' : 'front'
  if (face !== visibleFace) return rects

  const defs = layerDefinitions.filter((def) => def.face === face)
  for (const def of defs) {
    const st = layerState[def.id]
    if (st?.visible === false) continue
    const el = blockEls.get(def.id)
    if (!el) continue
    const faceEl = el.closest('.ticket-face')
    if (!faceEl) continue
    const faceRect = faceEl.getBoundingClientRect()
    if (faceRect.width < 180 || faceRect.height < 80) continue
    const elRect = el.getBoundingClientRect()
    if (elRect.width <= 0 || elRect.height <= 0) continue

    const left = ((elRect.left - faceRect.left) / faceRect.width) * 100
    const top = ((elRect.top - faceRect.top) / faceRect.height) * 100
    const width = (elRect.width / faceRect.width) * 100
    const height = (elRect.height / faceRect.height) * 100

    rects[def.id] = {
      left: Math.max(0, Math.min(98, left)),
      top: Math.max(0, Math.min(98, top)),
      width: Math.max(2, Math.min(100 - Math.max(0, left), width)),
      height: Math.max(3, Math.min(100 - Math.max(0, top), height)),
    }
  }
  return rects
}

export function useCanvasDrag() {
  return {
    layerDefinitions,
    layerMap,
    customLayers,
    elementOffsets,
    elementSizes,
    layerState,
    layerGroups,
    selectedIds,
    activeDragId,
    hoveredLayerId,
    isFlipped,
    isSidebarOpen,
    isLayerPanelOpen,
    activeLayerFace,
    layoutVersion,
    contextMenu,
    hasCustomOffsets,
    hasSelectedOffsets,
    hasClipboardLayers,
    hiddenLayersCount,
    activeSelectedEditable,
    selectedGroup,
    hasAnyGroupedInSelection,
    canGroupSelected,
    isSelectionLocked,
    ensureLayerState,
    ensureOffset,
    getOffset,
    ensureElementSize,
    getElementSize,
    setElementSize,
    resetElementSize,
    isAnyLayerVisible,
    setFlipped,
    toggleFlip,
    setActiveLayerFace,
    setHoveredLayer,
    setLayerPanelOpen,
    setSidebarOpen,
    toggleLayerPanel,
    registerDragHistoryHooks,
    notifyDragStart,
    notifyDragEnd,
    captureCanvasState,
    applyCanvasState,
    getFaceLayerRects,
    registerBlockEl,
    registerBlockEditFn,
    triggerSelectedEdit,
    isSelected,
    getGroupMemberIds,
    getDragTargetIds,
    selectBlock,
    selectGroup,
    clearSelection,
    openContextMenu,
    closeContextMenu,
    groupSelected,
    ungroupSelected,
    moveBlocksByDelta,
    nudgeSelected,
    removeField,
    removeSelectedFields,
    removeTextBoxById,
    toggleLayerVisibility,
    restoreAllFields,
    toggleLayerLock,
    toggleSelectedLock,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    reorderLayerByDrop,
    addCustomTextBox,
    setCustomLayerStylePreset,
    setTextBoxColor,
    resetTextBoxColor,
    copySelectedLayers,
    pasteLayers,
    duplicateSelectedLayers,
    resetElementOffset,
    resetSelectedOffsets,
    resetAllOffsets,
    resetAllLayerState,
    openLayersPanel,
    getBlockScale,
    getSelectionRect,
    bumpLayout,
  }
}
