import { ref } from 'vue'
import { QrImageBox, BarcodeImageBox, CustomImageBox } from './ImageBox.js'

/**
 * Registry of all ImageBox OOP objects used across Front and Back ticket faces.
 */
export const ticketImages = {
  backQr: new QrImageBox({
    id: 'back-qr-image',
    blockId: 'back-qr',
    fieldKey: 'customQrImage',
    label: '2D QR Code',
    section: 'Scan Zone',
    face: 'back',
  }),
  backBarcode: new BarcodeImageBox({
    id: 'back-barcode-image',
    blockId: 'back-barcode',
    fieldKey: 'customBarcodeImage',
    label: '1D Barcode Graphic',
    section: 'Footer',
    face: 'back',
  }),
}

export const CUSTOM_IMAGE_PRESETS = {
  photo: {
    key: 'photo',
    label: 'Custom Image',
    templateType: 'image',
    defaultWidth: 120,
    defaultHeight: 120,
    aspectRatio: 1,
  },
  qr: {
    key: 'qr',
    label: 'QR Code',
    templateType: 'qr',
    defaultWidth: 96,
    defaultHeight: 96,
    aspectRatio: 1,
  },
  barcode: {
    key: 'barcode',
    label: '1D Barcode',
    templateType: 'barcode',
    defaultWidth: 280,
    defaultHeight: 44,
    aspectRatio: 280 / 44,
  },
}

export const CUSTOM_IMAGE_PRESET_LIST = Object.values(CUSTOM_IMAGE_PRESETS)

export const IMAGE_BOX_BY_ID = Object.fromEntries(
  Object.values(ticketImages).map((box) => [box.id, box])
)

const dynamicImages = new Map()
const dynamicImageRegistryVersion = ref(0)

export function registerDynamicImageBox(config) {
  if (!config?.id) return null
  const box = config instanceof CustomImageBox ? config : new CustomImageBox(config)
  dynamicImages.set(box.id, box)
  dynamicImageRegistryVersion.value++
  return box
}

export function unregisterDynamicImageBox(id) {
  if (!id) return
  if (dynamicImages.delete(id)) {
    dynamicImageRegistryVersion.value++
  }
}

export function clearDynamicImages() {
  if (dynamicImages.size > 0) {
    dynamicImages.clear()
    dynamicImageRegistryVersion.value++
  }
}

export function getImageBoxById(id) {
  void dynamicImageRegistryVersion.value
  if (!id) return null
  return IMAGE_BOX_BY_ID[id] || dynamicImages.get(id) || null
}

export function getBlockImageBoxes(blockId) {
  void dynamicImageRegistryVersion.value
  if (!blockId) return []
  const builtIn = Object.values(ticketImages).filter((box) => box.blockId === blockId)
  const custom = [...dynamicImages.values()].filter((box) => box.blockId === blockId)
  return [...builtIn, ...custom]
}
