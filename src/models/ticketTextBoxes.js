import { ref } from 'vue'
import {
  HeaderTextBox,
  HeadlineTextBox,
  RouteTextBox,
  MetadataTextBox,
  StubTextBox,
  BackTextBox,
  CustomTextBox,
} from './TextBox.js'

/**
 * Registry of all TextBox OOP objects used across Front and Back ticket faces.
 * Every object inherits shared attributes and methods from `TextBox`.
 */
export const ticketTextBoxes = {
  // Holographic Foil Strip
  holoStatus: new HeaderTextBox({
    id: 'foil-holo-status',
    blockId: 'front-foil-top',
    section: 'Foil Strip',
    fieldKey: 'holoStatus',
    label: 'Foil Top Text',
    placeholder: 'HOLO-SEAL',
    tag: 'span',
    popover: true,
    foilText: true,
    primaryEdit: true,
    textClass:
      'relative z-10 font-mono-code text-[8px] font-bold tracking-[0.25em] sm:[writing-mode:vertical-rl] sm:rotate-180 uppercase',
  }),
  foilSubStatus: new HeaderTextBox({
    id: 'foil-sub-status',
    blockId: 'front-foil-bottom',
    section: 'Foil Strip',
    fieldKey: 'foilSubStatus',
    label: 'Foil Bottom Text',
    placeholder: 'VERIFIED',
    tag: 'span',
    popover: true,
    foilText: true,
    primaryEdit: true,
    textClass:
      'relative z-10 font-mono-code text-[8px] font-bold tracking-[0.25em] sm:[writing-mode:vertical-rl] sm:rotate-180 uppercase',
  }),

  // Front Header
  institutionName: new HeaderTextBox({
    id: 'front-issuer-text',
    blockId: 'front-issuer',
    fieldKey: 'institutionName',
    label: 'Issuer / Organization',
    placeholder: 'ORGANIZATION NAME',
    primaryEdit: true,
    textClass:
      'text-[10px] font-mono-code tracking-[0.25em] text-slate-300/80 uppercase truncate',
    inputClass: 'text-[10px] font-mono-code tracking-[0.18em] uppercase',
  }),
  ceremonyTitle: new HeaderTextBox({
    id: 'front-title-text',
    blockId: 'front-title',
    fieldKey: 'ceremonyTitle',
    label: 'Event / Pass Title',
    placeholder: 'EVENT TITLE',
    primaryEdit: true,
    textClass: 'text-sm font-display font-bold tracking-wider text-white truncate',
    inputClass: 'text-sm font-display font-bold tracking-wider',
  }),
  classYear: new HeaderTextBox({
    id: 'front-badge-text',
    blockId: 'front-badge',
    fieldKey: 'classYear',
    label: 'Header Badge',
    placeholder: 'BADGE',
    tag: 'span',
    foilText: true,
    primaryEdit: true,
    inputClass: 'text-[10px] font-mono-code font-bold uppercase w-24 text-center',
  }),

  // Front Headline Block
  heroLabel: new HeadlineTextBox({
    id: 'front-hero-label-text',
    blockId: 'front-hero-label',
    fieldKey: 'heroLabel',
    label: 'Holder Overline',
    placeholder: 'HOLDER LABEL',
    primaryEdit: true,
    textClass:
      'text-[10px] font-mono-code uppercase tracking-widest text-slate-300/75 truncate',
    inputClass: 'text-[10px] font-mono-code uppercase tracking-widest',
  }),
  graduateName: new HeadlineTextBox({
    id: 'front-headline-name-text',
    blockId: 'front-headline-name',
    fieldKey: 'graduateName',
    label: 'Main Name / Headline',
    placeholder: 'RECIPIENT OR EVENT NAME',
    primaryEdit: true,
    textClass:
      'text-2xl sm:text-3xl font-display font-bold tracking-tight silver-text-emboss leading-tight mt-1 truncate',
    inputClass: 'text-xl sm:text-2xl font-display font-bold tracking-tight',
  }),
  degreeMajor: new HeadlineTextBox({
    id: 'front-subtitle-text',
    blockId: 'front-subtitle',
    fieldKey: 'degreeMajor',
    label: 'Primary Tag / Role',
    placeholder: 'SUBTITLE / ROLE',
    tag: 'span',
    primaryEdit: true,
    colorKey: 'degreeColor',
    defaultColor: '#a5f3fc',
    textClass: 'text-xs sm:text-sm font-mono-code font-medium truncate block',
    inputClass: 'text-xs font-mono-code w-40',
  }),
  honors: new HeadlineTextBox({
    id: 'front-honors-text',
    blockId: 'front-honors',
    fieldKey: 'honors',
    label: 'Secondary Tag / Perk',
    placeholder: 'DISTINCTION / PERK',
    tag: 'span',
    primaryEdit: true,
    colorKey: 'honorsColor',
    defaultColor: '#fef08a',
    textClass: 'text-xs sm:text-sm font-mono-code font-medium truncate block',
    inputClass: 'text-xs font-mono-code w-40',
  }),

  // Front Route Block
  originLabel: new RouteTextBox({
    id: 'front-origin-label-text',
    blockId: 'front-origin',
    fieldKey: 'originLabel',
    label: 'Origin Label',
    placeholder: 'FROM',
    textClass:
      'text-[10px] font-mono-code uppercase tracking-widest text-slate-300/75 truncate',
    inputClass: 'text-[10px] font-mono-code uppercase',
  }),
  originCode: new RouteTextBox({
    id: 'front-origin-code-text',
    blockId: 'front-origin',
    fieldKey: 'originCode',
    label: 'Origin Code',
    placeholder: 'ORG',
    primaryEdit: true,
    textClass:
      'text-3xl sm:text-4xl font-display font-bold tracking-tight silver-text-emboss leading-none mt-0.5 truncate uppercase',
    inputClass: 'text-2xl sm:text-3xl font-display font-bold uppercase w-24',
  }),
  originName: new RouteTextBox({
    id: 'front-origin-name-text',
    blockId: 'front-origin',
    fieldKey: 'originName',
    label: 'Origin Name',
    placeholder: 'Origin Terminal',
    textClass: 'text-[11px] text-slate-300/80 font-medium mt-1 truncate',
    inputClass: 'text-[11px] font-medium',
  }),
  routeId: new RouteTextBox({
    id: 'front-route-id-text',
    blockId: 'front-route-line',
    fieldKey: 'degreeMajor',
    label: 'Route Identifier',
    placeholder: 'ROUTE ID',
    primaryEdit: true,
    colorKey: 'degreeColor',
    defaultColor: '#a5f3fc',
    textClass: 'text-[10px] font-mono-code tracking-[0.22em] mb-1 truncate max-w-full',
    inputClass: 'text-[10px] font-mono-code text-center w-32',
  }),
  routeTransitNote: new RouteTextBox({
    id: 'front-route-note-text',
    blockId: 'front-route-line',
    fieldKey: 'routeTransitNote',
    label: 'Transit Note',
    placeholder: 'TRANSIT NOTE',
    textClass:
      'text-[9px] font-mono-code tracking-[0.2em] text-slate-300/70 mt-1 truncate max-w-full',
    inputClass: 'text-[9px] font-mono-code text-center w-36',
  }),
  destLabel: new RouteTextBox({
    id: 'front-dest-label-text',
    blockId: 'front-dest',
    fieldKey: 'destLabel',
    label: 'Destination Label',
    placeholder: 'TO',
    textClass:
      'text-[10px] font-mono-code uppercase tracking-widest text-slate-300/75 truncate',
    inputClass: 'text-[10px] font-mono-code uppercase text-right',
  }),
  destCode: new RouteTextBox({
    id: 'front-dest-code-text',
    blockId: 'front-dest',
    fieldKey: 'destCode',
    label: 'Destination Code',
    placeholder: 'DST',
    primaryEdit: true,
    textClass:
      'text-3xl sm:text-4xl font-display font-bold tracking-tight silver-text-emboss leading-none mt-0.5 truncate uppercase',
    inputClass: 'text-2xl sm:text-3xl font-display font-bold uppercase w-24 text-right ml-auto',
  }),
  destName: new RouteTextBox({
    id: 'front-dest-name-text',
    blockId: 'front-dest',
    fieldKey: 'destName',
    label: 'Destination Name',
    placeholder: 'Destination',
    textClass: 'text-[11px] text-slate-300/80 font-medium mt-1 truncate',
    inputClass: 'text-[11px] font-medium text-right',
  }),

  // 4-Column Event Metadata Grid
  meta1Label: new MetadataTextBox({
    id: 'front-meta1-label-text',
    blockId: 'front-meta-venue',
    fieldKey: 'meta1Label',
    label: 'Venue Label',
    placeholder: 'LABEL',
    textClass:
      'text-[9px] font-mono-code uppercase tracking-widest text-slate-300/70 truncate',
    inputClass: 'text-[9px] font-mono-code uppercase',
  }),
  venueName: new MetadataTextBox({
    id: 'front-venue-name-text',
    blockId: 'front-meta-venue',
    fieldKey: 'venueName',
    label: 'Venue Value',
    placeholder: 'VENUE',
    primaryEdit: true,
    textClass: 'text-xs sm:text-sm font-mono-code font-semibold text-white truncate mt-0.5',
    inputClass: 'text-xs font-mono-code font-semibold mt-0.5',
  }),
  meta2Label: new MetadataTextBox({
    id: 'front-meta2-label-text',
    blockId: 'front-meta-date',
    fieldKey: 'meta2Label',
    label: 'Date Label',
    placeholder: 'LABEL',
    textClass:
      'text-[9px] font-mono-code uppercase tracking-widest text-slate-300/70 truncate',
    inputClass: 'text-[9px] font-mono-code uppercase',
  }),
  eventDate: new MetadataTextBox({
    id: 'front-event-date-text',
    blockId: 'front-meta-date',
    fieldKey: 'eventDate',
    label: 'Date Value',
    placeholder: 'DATE',
    primaryEdit: true,
    textClass: 'text-xs sm:text-sm font-mono-code font-semibold text-white truncate mt-0.5',
    inputClass: 'text-xs font-mono-code font-semibold mt-0.5',
  }),
  meta3Label: new MetadataTextBox({
    id: 'front-meta3-label-text',
    blockId: 'front-meta-time',
    fieldKey: 'meta3Label',
    label: 'Time Label',
    placeholder: 'LABEL',
    textClass:
      'text-[9px] font-mono-code uppercase tracking-widest text-slate-300/70 truncate',
    inputClass: 'text-[9px] font-mono-code uppercase',
  }),
  ceremonyTime: new MetadataTextBox({
    id: 'front-ceremony-time-text',
    blockId: 'front-meta-time',
    fieldKey: 'ceremonyTime',
    label: 'Time Value',
    placeholder: 'TIME',
    primaryEdit: true,
    textClass: 'text-xs sm:text-sm font-mono-code font-semibold text-white truncate mt-0.5',
    inputClass: 'text-xs font-mono-code font-semibold mt-0.5',
  }),
  meta4Label: new MetadataTextBox({
    id: 'front-meta4-label-text',
    blockId: 'front-meta-doors',
    fieldKey: 'meta4Label',
    label: 'Doors Label',
    placeholder: 'LABEL',
    textClass:
      'text-[9px] font-mono-code uppercase tracking-widest text-slate-300/70 truncate',
    inputClass: 'text-[9px] font-mono-code uppercase',
  }),
  doorsTime: new MetadataTextBox({
    id: 'front-doors-time-text',
    blockId: 'front-meta-doors',
    fieldKey: 'doorsTime',
    label: 'Doors Value',
    placeholder: 'DOORS',
    primaryEdit: true,
    textClass: 'text-xs sm:text-sm font-mono-code font-semibold text-white truncate mt-0.5',
    inputClass: 'text-xs font-mono-code font-semibold mt-0.5',
  }),

  // Front Footer Security Notice
  securityNotice: new HeaderTextBox({
    id: 'front-notice-text',
    blockId: 'front-notice',
    fieldKey: 'securityNotice',
    section: 'Footer',
    label: 'Security Notice',
    placeholder: 'ENTRY & ID NOTICE',
    tag: 'span',
    primaryEdit: true,
    textClass: 'block truncate',
    inputClass: 'text-[10px] font-mono-code uppercase',
  }),

  // Tear-Off Stub
  stubHeaderLabel: new StubTextBox({
    id: 'stub-header-label-text',
    blockId: 'stub-header-label',
    fieldKey: 'stubHeaderLabel',
    label: 'Stub Overline',
    placeholder: 'PASS STUB',
    tag: 'div',
    primaryEdit: true,
    textClass:
      'text-[9px] font-mono-code tracking-[0.22em] text-slate-300/75 uppercase truncate',
    inputClass: 'text-[9px] font-mono-code uppercase',
  }),
  ticketType: new StubTextBox({
    id: 'stub-pass-title-text',
    blockId: 'stub-pass-title',
    fieldKey: 'ticketType',
    label: 'Stub Pass Type',
    placeholder: 'PASS TYPE',
    tag: 'div',
    primaryEdit: true,
    textClass: 'text-xs font-display font-bold tracking-wider text-white truncate',
    inputClass: 'text-xs font-display font-bold',
  }),
  admitCount: new StubTextBox({
    id: 'stub-admit-count-text',
    blockId: 'stub-price-badge',
    fieldKey: 'admitCount',
    label: 'Price / Admit Badge',
    placeholder: 'ADMIT 1',
    primaryEdit: true,
    colorKey: 'degreeColor',
    defaultColor: '#a5f3fc',
    inputClass: 'text-[10px] font-mono-code w-20 text-center',
  }),
  sectionLabel: new StubTextBox({
    id: 'stub-section-label-text',
    blockId: 'stub-section',
    fieldKey: 'sectionLabel',
    label: 'Section Label',
    placeholder: 'SECTION',
    textClass: 'text-[9px] font-mono-code text-slate-300/70 uppercase truncate',
    inputClass: 'text-[9px] font-mono-code uppercase w-16',
  }),
  section: new StubTextBox({
    id: 'stub-section-value-text',
    blockId: 'stub-section',
    fieldKey: 'section',
    label: 'Section Value',
    placeholder: 'SEC',
    primaryEdit: true,
    textClass: 'text-[11px] font-mono-code font-semibold text-white truncate text-right',
    inputClass: 'text-[11px] font-mono-code font-semibold text-right w-20',
  }),
  rowLabel: new StubTextBox({
    id: 'stub-row-label-text',
    blockId: 'stub-row',
    fieldKey: 'rowLabel',
    label: 'Row Label',
    placeholder: 'ROW',
    textClass: 'text-[9px] font-mono-code text-slate-300/70 uppercase truncate',
    inputClass: 'text-[9px] font-mono-code uppercase w-16',
  }),
  row: new StubTextBox({
    id: 'stub-row-value-text',
    blockId: 'stub-row',
    fieldKey: 'row',
    label: 'Row Value',
    placeholder: 'ROW',
    primaryEdit: true,
    textClass: 'text-[11px] font-mono-code font-semibold text-white truncate text-right',
    inputClass: 'text-[11px] font-mono-code font-semibold text-right w-20',
  }),
  seatLabel: new StubTextBox({
    id: 'stub-seat-label-text',
    blockId: 'stub-seat',
    fieldKey: 'seatLabel',
    label: 'Seat Label',
    placeholder: 'SEAT',
    textClass: 'text-[9px] font-mono-code text-slate-300/70 uppercase truncate',
    inputClass: 'text-[9px] font-mono-code uppercase w-16',
  }),
  seat: new StubTextBox({
    id: 'stub-seat-value-text',
    blockId: 'stub-seat',
    fieldKey: 'seat',
    label: 'Seat Value',
    placeholder: 'SEAT',
    primaryEdit: true,
    textClass: 'text-[11px] font-mono-code font-semibold text-white truncate text-right',
    inputClass: 'text-[11px] font-mono-code font-semibold text-right w-20',
  }),
  ticketNoLabel: new StubTextBox({
    id: 'stub-ticket-no-label-text',
    blockId: 'stub-ticket-no',
    fieldKey: 'ticketNoLabel',
    label: 'Ticket No. Label',
    placeholder: 'TICKET NO.',
    textClass: 'text-[9px] font-mono-code text-slate-300/70 uppercase truncate',
    inputClass: 'text-[9px] font-mono-code uppercase w-16',
  }),
  ticketNumber: new StubTextBox({
    id: 'stub-ticket-no-value-text',
    blockId: 'stub-ticket-no',
    fieldKey: 'ticketNumber',
    label: 'Ticket No. Value',
    placeholder: '#0001',
    primaryEdit: true,
    colorKey: 'degreeColor',
    defaultColor: '#a5f3fc',
    textClass: 'text-[11px] font-mono-code font-semibold truncate text-right',
    inputClass: 'text-[11px] font-mono-code font-semibold text-right w-20',
  }),
  stubFooterLeft: new StubTextBox({
    id: 'stub-footer-left-text',
    blockId: 'stub-footer',
    fieldKey: 'stubFooterLeft',
    label: 'Stub Retain Label',
    placeholder: 'RETAIN STUB',
    primaryEdit: true,
    textClass: 'tracking-widest uppercase truncate',
    inputClass: 'text-[9px] font-mono-code uppercase w-24',
  }),
  stubFooterRight: new StubTextBox({
    id: 'stub-footer-right-text',
    blockId: 'stub-footer',
    fieldKey: 'stubFooterRight',
    label: 'Stub Detach Label',
    placeholder: 'DETACHABLE',
    textClass: 'text-slate-400 uppercase tracking-wider shrink-0',
    inputClass: 'text-[9px] font-mono-code uppercase text-right w-20',
  }),

  // Back Face
  qrPayload: new BackTextBox({
    id: 'back-qr-payload-text',
    blockId: 'back-qr-payload',
    fieldKey: 'qrPayload',
    section: 'Scan Zone',
    label: 'QR Verification Code',
    placeholder: 'QR PAYLOAD',
    tag: 'div',
    primaryEdit: true,
    textClass:
      'text-[9px] font-mono-code tracking-[0.22em] text-slate-200 truncate max-w-full text-center px-1',
    inputClass: 'text-[9px] font-mono-code text-center',
  }),
  venueAddress: new BackTextBox({
    id: 'back-address-value-text',
    blockId: 'back-address',
    fieldKey: 'venueAddress',
    section: 'Top Bar',
    label: 'Venue Address',
    placeholder: 'STREET ADDRESS OR GATE',
    tag: 'div',
    primaryEdit: true,
    textClass: 'text-[10px] font-mono-code font-semibold text-white truncate',
    inputClass: 'text-[10px] font-mono-code',
  }),
  organizerContact: new BackTextBox({
    id: 'back-contact-text',
    blockId: 'back-contact',
    fieldKey: 'organizerContact',
    section: 'Top Bar',
    label: 'Organizer / Website',
    placeholder: 'WEBSITE / CONTACT',
    primaryEdit: true,
    colorKey: 'degreeColor',
    defaultColor: '#a5f3fc',
    textClass: 'text-[10px] font-mono-code truncate',
    inputClass: 'text-[10px] font-mono-code text-right w-40',
  }),
  logoTitle: new BackTextBox({
    id: 'back-brand-title-text',
    blockId: 'back-brand-title',
    fieldKey: 'logoTitle',
    section: 'Brand Box',
    label: 'Back Brand Title',
    placeholder: 'BRAND OR PARTNER TITLE',
    tag: 'div',
    primaryEdit: true,
    textClass:
      'text-sm sm:text-base font-display font-bold tracking-wider silver-text-emboss truncate',
    inputClass: 'text-sm font-display font-bold',
  }),
  logoSubtitle: new BackTextBox({
    id: 'back-brand-subtitle-text',
    blockId: 'back-brand-subtitle',
    fieldKey: 'logoSubtitle',
    section: 'Brand Box',
    label: 'Back Brand Subtitle',
    placeholder: 'TAGLINE OR UPLOAD NOTE',
    tag: 'div',
    primaryEdit: true,
    textClass: 'text-[10px] text-slate-300/75 font-mono-code truncate',
    inputClass: 'text-[10px] font-mono-code',
  }),
  termsLabel: new BackTextBox({
    id: 'back-terms-label-text',
    blockId: 'back-terms',
    fieldKey: 'termsLabel',
    section: 'Terms Box',
    label: 'Terms Header',
    placeholder: 'TERMS & RULES',
    tag: 'div',
    textClass: 'w-full text-[9px] font-mono-code tracking-widest text-slate-300/80 uppercase truncate',
    inputClass: 'w-full text-[9px] font-mono-code uppercase',
  }),
  policyText: new BackTextBox({
    id: 'back-policy-text',
    blockId: 'back-terms',
    fieldKey: 'policyText',
    section: 'Terms Box',
    label: 'Entry Policy & Terms',
    placeholder: 'Click to enter entry policy, refund rules, or special instructions.',
    tag: 'div',
    multiline: true,
    primaryEdit: true,
    textClass: 'w-full flex-1 mt-1.5 text-[10px] leading-relaxed text-slate-200/90 line-clamp-4',
    inputClass: 'w-full mt-1.5 text-[10px] leading-relaxed',
  }),
  barcodeNumber: new BackTextBox({
    id: 'back-serial-text',
    blockId: 'back-serial',
    fieldKey: 'barcodeNumber',
    section: 'Footer',
    label: 'Barcode Serial No.',
    placeholder: '0000-0000-0000',
    tag: 'div',
    primaryEdit: true,
    textClass: 'text-[10px] font-mono-code font-bold tracking-[0.2em] text-white',
    inputClass: 'text-[10px] font-mono-code font-bold text-right w-40',
  }),
}

export const CUSTOM_TEXT_STYLE_PRESETS = {
  headline: {
    key: 'headline',
    label: 'Headline',
    placeholder: 'CUSTOM HEADLINE',
    tag: 'div',
    textClass:
      'text-xl sm:text-2xl font-display font-bold tracking-tight silver-text-emboss leading-tight truncate',
    inputClass: 'text-lg sm:text-xl font-display font-bold tracking-tight',
  },
  tag: {
    key: 'tag',
    label: 'Accent Tag',
    placeholder: 'ACCENT TAG',
    tag: 'div',
    colorKey: 'degreeColor',
    defaultColor: '#a5f3fc',
    textClass: 'text-xs sm:text-sm font-mono-code font-semibold tracking-wider truncate',
    inputClass: 'text-xs font-mono-code font-semibold',
  },
  label: {
    key: 'label',
    label: 'Mono Label',
    placeholder: 'OVERLINE // LABEL',
    tag: 'div',
    textClass:
      'text-[10px] font-mono-code uppercase tracking-[0.22em] text-slate-300/85 truncate',
    inputClass: 'text-[10px] font-mono-code uppercase tracking-widest',
  },
  badge: {
    key: 'badge',
    label: 'Foil Badge',
    placeholder: 'BADGE TEXT',
    tag: 'span',
    foilText: true,
    textClass: 'text-[10px] font-mono-code font-bold tracking-wider uppercase',
    inputClass: 'text-[10px] font-mono-code font-bold uppercase text-center',
  },
  multiline: {
    key: 'multiline',
    label: 'Multiline Note',
    placeholder: 'Click to edit custom note or instructions...',
    tag: 'div',
    multiline: true,
    textClass: 'text-[10px] leading-relaxed text-slate-200/90 whitespace-pre-wrap',
    inputClass: 'text-[10px] leading-relaxed',
  },
}

export const CUSTOM_TEXT_PRESET_LIST = Object.values(CUSTOM_TEXT_STYLE_PRESETS)

export const TEXT_BOX_BY_ID = Object.fromEntries(
  Object.values(ticketTextBoxes).map((box) => [box.id, box])
)

const dynamicTextBoxes = new Map()
const dynamicRegistryVersion = ref(0)

export function registerDynamicTextBox(config) {
  if (!config?.id) return null
  const box = config instanceof CustomTextBox ? config : new CustomTextBox(config)
  dynamicTextBoxes.set(box.id, box)
  dynamicRegistryVersion.value++
  return box
}

export function unregisterDynamicTextBox(id) {
  if (!id) return
  if (dynamicTextBoxes.delete(id)) {
    dynamicRegistryVersion.value++
  }
}

export function clearDynamicTextBoxes() {
  if (dynamicTextBoxes.size > 0) {
    dynamicTextBoxes.clear()
    dynamicRegistryVersion.value++
  }
}

export function getTextBoxById(id) {
  void dynamicRegistryVersion.value
  if (!id) return null
  return TEXT_BOX_BY_ID[id] || dynamicTextBoxes.get(id) || null
}

export function getBlockTextBoxes(blockId) {
  void dynamicRegistryVersion.value
  if (!blockId) return []
  const builtIn = Object.values(ticketTextBoxes).filter((box) => box.blockId === blockId)
  const custom = [...dynamicTextBoxes.values()].filter((box) => box.blockId === blockId)
  return [...builtIn, ...custom]
}
