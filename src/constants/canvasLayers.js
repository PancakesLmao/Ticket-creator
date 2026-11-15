export const CANVAS_LAYER_DEFINITIONS = [
  // Front Face Layers
  { id: 'front-foil-top', label: 'Foil Top Text', section: 'Foil Strip', face: 'front' },
  { id: 'front-foil-bottom', label: 'Foil Bottom Text', section: 'Foil Strip', face: 'front' },

  { id: 'front-emblem', label: 'Ticket Emblem / Logo', section: 'Header', face: 'front', actionLabel: 'Switch Icon' },
  { id: 'front-issuer', label: 'Issuer / Organization', section: 'Header', face: 'front' },
  { id: 'front-title', label: 'Event / Pass Title', section: 'Header', face: 'front' },
  { id: 'front-badge', label: 'Header Badge', section: 'Header', face: 'front' },

  { id: 'front-hero-label', label: 'Holder Overline', section: 'Headline', face: 'front' },
  { id: 'front-headline-name', label: 'Main Name / Headline', section: 'Headline', face: 'front' },
  { id: 'front-subtitle', label: 'Primary Tag / Role', section: 'Headline', face: 'front' },
  { id: 'front-honors', label: 'Secondary Tag / Perk', section: 'Headline', face: 'front' },

  { id: 'front-origin', label: 'Origin Code & City', section: 'Route', face: 'front' },
  { id: 'front-route-line', label: 'Route Icon & Transit', section: 'Route', face: 'front', actionLabel: 'Edit / Icon' },
  { id: 'front-dest', label: 'Destination Code & City', section: 'Route', face: 'front' },

  { id: 'front-meta-venue', label: 'Venue Field', section: 'Info Grid', face: 'front' },
  { id: 'front-meta-date', label: 'Date Field', section: 'Info Grid', face: 'front' },
  { id: 'front-meta-time', label: 'Start Time Field', section: 'Info Grid', face: 'front' },
  { id: 'front-meta-doors', label: 'Doors / Gate Field', section: 'Info Grid', face: 'front' },

  { id: 'front-notice', label: 'Security Micro-Notice', section: 'Footer', face: 'front' },

  { id: 'stub-header-label', label: 'Stub Overline', section: 'Stub', face: 'front' },
  { id: 'stub-pass-title', label: 'Stub Pass Type', section: 'Stub', face: 'front' },
  { id: 'stub-price-badge', label: 'Price / Admit Badge', section: 'Stub', face: 'front' },
  { id: 'stub-section', label: 'Stub Section', section: 'Stub', face: 'front' },
  { id: 'stub-row', label: 'Stub Row', section: 'Stub', face: 'front' },
  { id: 'stub-seat', label: 'Stub Seat', section: 'Stub', face: 'front' },
  { id: 'stub-ticket-no', label: 'Stub Ticket No.', section: 'Stub', face: 'front' },
  { id: 'stub-footer', label: 'Stub Retain Notice', section: 'Stub', face: 'front' },

  // Back Face Layers
  { id: 'back-qr', label: '2D QR Code', section: 'Scan Zone', face: 'back' },
  { id: 'back-qr-payload', label: 'QR Verification Code', section: 'Scan Zone', face: 'back' },

  { id: 'back-address', label: 'Venue Address', section: 'Top Bar', face: 'back' },
  { id: 'back-contact', label: 'Organizer / Website', section: 'Top Bar', face: 'back' },

  { id: 'back-emblem', label: 'Back Emblem / Logo', section: 'Brand Box', face: 'back', actionLabel: 'Switch Icon' },
  { id: 'back-brand-title', label: 'Back Brand Title', section: 'Brand Box', face: 'back' },
  { id: 'back-brand-subtitle', label: 'Back Brand Subtitle', section: 'Brand Box', face: 'back' },
  { id: 'back-terms', label: 'Entry Policy & Terms', section: 'Terms Box', face: 'back' },

  { id: 'back-barcode', label: '1D Barcode Graphic', section: 'Footer', face: 'back' },
  { id: 'back-serial', label: 'Barcode Serial No.', section: 'Footer', face: 'back' },
]

export const CANVAS_LAYER_MAP = Object.fromEntries(
  CANVAS_LAYER_DEFINITIONS.map((layer) => [layer.id, layer])
)
