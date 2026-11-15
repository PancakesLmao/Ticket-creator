/**
 * Parent OOP class for all editable image and graphic elements on the ticket canvas.
 * Every image element (built-in QR/Barcode or user-added custom images) inherits
 * shared attributes, URL binding, and template fallback rules.
 */
export class ImageBox {
  constructor({
    id,
    blockId = null,
    fieldKey = null,
    label = '',
    section = 'Graphics',
    face = 'front',
    templateType = 'image', // 'qr' | 'barcode' | 'image'
    defaultWidth = 100,
    defaultHeight = 100,
    aspectRatio = 1,
    fit = 'contain',
    editable = true,
  }) {
    this.id = id
    this.blockId = blockId
    this.fieldKey = fieldKey
    this.label = label || id
    this.section = section
    this.face = face
    this.templateType = templateType
    this.defaultWidth = defaultWidth
    this.defaultHeight = defaultHeight
    this.aspectRatio = aspectRatio
    this.fit = fit
    this.editable = editable !== false
  }

  getUrl(ticket) {
    if (!ticket) return null
    if (this.fieldKey && ticket[this.fieldKey]) {
      return ticket[this.fieldKey]
    }
    return ticket.customBoxImages?.[this.id] ?? null
  }

  setUrl(ticket, nextUrl) {
    if (!ticket) return null
    const url = typeof nextUrl === 'string' ? nextUrl.trim() : null
    if (!ticket.customBoxImages) {
      ticket.customBoxImages = {}
    }
    if (url) {
      ticket.customBoxImages[this.id] = url
      if (this.fieldKey) {
        ticket[this.fieldKey] = url
      }
    } else {
      delete ticket.customBoxImages[this.id]
      if (this.fieldKey) {
        ticket[this.fieldKey] = null
      }
    }
    return url
  }

  clearUrl(ticket) {
    return this.setUrl(ticket, null)
  }

  hasCustomImage(ticket) {
    return Boolean(this.getUrl(ticket))
  }

  isRemoved(ticket) {
    return Boolean(ticket?.removedImages?.[this.id] || ticket?.removedTextBoxes?.[this.id])
  }

  remove(ticket) {
    if (!ticket) return
    if (!ticket.removedImages) {
      ticket.removedImages = {}
    }
    ticket.removedImages[this.id] = true
  }

  restore(ticket) {
    if (ticket?.removedImages && this.id in ticket.removedImages) {
      delete ticket.removedImages[this.id]
    }
    if (ticket?.removedTextBoxes && this.id in ticket.removedTextBoxes) {
      delete ticket.removedTextBoxes[this.id]
    }
  }
}

export class QrImageBox extends ImageBox {
  constructor(config = {}) {
    super({
      face: 'back',
      section: 'Scan Zone',
      templateType: 'qr',
      defaultWidth: 96,
      defaultHeight: 96,
      aspectRatio: 1,
      ...config,
    })
  }
}

export class BarcodeImageBox extends ImageBox {
  constructor(config = {}) {
    super({
      face: 'back',
      section: 'Footer',
      templateType: 'barcode',
      defaultWidth: 280,
      defaultHeight: 44,
      aspectRatio: 280 / 44,
      ...config,
    })
  }
}

export class CustomImageBox extends ImageBox {
  constructor(config = {}) {
    super({
      section: 'Custom',
      templateType: config.templateType || 'image',
      ...config,
    })
    this.isCustom = true
  }
}
