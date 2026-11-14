/**
 * Parent OOP class for all editable text boxes on the ticket canvas.
 * Every text box created on the ticket is an instance of `TextBox` (or one of its
 * domain subclasses) and inherits shared attributes, value binding, styling,
 * and unfocused-drag vs focused-edit interaction rules.
 */
export class TextBox {
  constructor({
    id,
    blockId = null,
    fieldKey,
    label = '',
    section = 'General',
    face = 'front',
    placeholder = 'CLICK TO EDIT',
    tag = 'span',
    textClass = '',
    inputClass = '',
    multiline = false,
    editable = true,
    popover = false,
    foilText = false,
    primaryEdit = false,
    colorKey = null,
    defaultColor = null,
  }) {
    this.id = id
    this.blockId = blockId
    this.fieldKey = fieldKey
    this.label = label || id
    this.section = section
    this.face = face
    this.placeholder = placeholder
    this.tag = tag
    this.textClass = textClass
    this.inputClass = inputClass
    this.multiline = Boolean(multiline)
    this.editable = editable !== false
    this.popover = Boolean(popover)
    this.foilText = Boolean(foilText)
    this.primaryEdit = Boolean(primaryEdit)
    this.colorKey = colorKey
    this.defaultColor = defaultColor
  }

  getValue(ticket) {
    if (!ticket || !this.fieldKey) return ''
    return ticket[this.fieldKey] ?? ''
  }

  setValue(ticket, nextValue) {
    if (!ticket || !this.fieldKey) return ''
    const formatted = String(nextValue ?? '').trim()
    ticket[this.fieldKey] = formatted
    return formatted
  }

  getDisplayValue(ticket) {
    const val = this.getValue(ticket)
    return val || this.placeholder
  }

  isRemoved(ticket) {
    return Boolean(ticket?.removedTextBoxes?.[this.id])
  }

  remove(ticket) {
    if (!ticket) return
    if (!ticket.removedTextBoxes) {
      ticket.removedTextBoxes = {}
    }
    ticket.removedTextBoxes[this.id] = true
  }

  restore(ticket) {
    if (ticket?.removedTextBoxes && this.id in ticket.removedTextBoxes) {
      delete ticket.removedTextBoxes[this.id]
    }
  }

  resolveTextClass(ticket, extraClass = '') {
    const base =
      typeof this.textClass === 'function' ? this.textClass(ticket) : this.textClass
    return [base, extraClass].filter(Boolean).join(' ')
  }

  resolveTextStyle(ticket, extraStyle = {}) {
    const baseStyle = {}
    if (this.colorKey && ticket) {
      baseStyle.color = ticket[this.colorKey] || this.defaultColor || undefined
    } else if (this.defaultColor) {
      baseStyle.color = this.defaultColor
    }
    if (typeof extraStyle === 'object' && extraStyle !== null) {
      return { ...baseStyle, ...extraStyle }
    }
    return baseStyle
  }

  /**
   * Unfocused text boxes are always draggable unless their layer is locked.
   * When focused (inline input/textarea active), pointer events stay inside the input.
   */
  canDrag({ isFocused = false, isLocked = false } = {}) {
    return !isFocused && !isLocked
  }

  /**
   * Determines whether a click on this text box should open the inline text editor.
   * - If the text box belongs to a draggable block, 1st click selects the block (keeping it
   *   unfocused and draggable from anywhere), and clicking while already selected focuses the input.
   * - Any drag movement (> 3px) or Ctrl/Cmd multi-select click never opens the input.
   */
  shouldEnterFocus({
    isEditableActive = true,
    hasParentBlock = true,
    wasBlockSelected = false,
    hasMoved = false,
    isMultiKey = false,
  } = {}) {
    if (!this.editable || !isEditableActive) return false
    if (hasMoved || isMultiKey) return false
    if (!hasParentBlock) return true
    return Boolean(wasBlockSelected)
  }
}

export class HeaderTextBox extends TextBox {
  constructor(config) {
    super({
      face: 'front',
      section: 'Header',
      tag: 'div',
      ...config,
    })
  }
}

export class HeadlineTextBox extends TextBox {
  constructor(config) {
    super({
      face: 'front',
      section: 'Headline',
      tag: 'div',
      ...config,
    })
  }
}

export class RouteTextBox extends TextBox {
  constructor(config) {
    super({
      face: 'front',
      section: 'Route',
      tag: 'div',
      ...config,
    })
  }
}

export class MetadataTextBox extends TextBox {
  constructor(config) {
    super({
      face: 'front',
      section: 'Info Grid',
      tag: 'div',
      ...config,
    })
  }
}

export class StubTextBox extends TextBox {
  constructor(config) {
    super({
      face: 'front',
      section: 'Stub',
      tag: 'span',
      ...config,
    })
  }
}

export class BackTextBox extends TextBox {
  constructor(config) {
    super({
      face: 'back',
      section: 'Back',
      tag: 'span',
      ...config,
    })
  }
}

export class CustomTextBox extends TextBox {
  constructor(config) {
    super({
      section: 'Custom',
      tag: 'div',
      primaryEdit: true,
      ...config,
    })
    this.stylePreset = config.stylePreset || 'headline'
    this.isCustom = true
  }

  getValue(ticket) {
    if (!ticket) return ''
    return ticket.customBoxTexts?.[this.id] ?? ''
  }

  setValue(ticket, nextValue) {
    if (!ticket) return ''
    const formatted = String(nextValue ?? '').trim()
    if (!ticket.customBoxTexts) {
      ticket.customBoxTexts = {}
    }
    ticket.customBoxTexts[this.id] = formatted
    return formatted
  }
}
