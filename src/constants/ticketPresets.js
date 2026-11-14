export const DEFAULT_BG_OPACITY = 0.35
export const DEFAULT_OVERLAY_OPACITY = 0.5

export const presetList = [
  { key: 'commencement', label: 'Commencement', icon: 'GraduationCap' },
  { key: 'boarding_pass', label: 'Flight Pass', icon: 'Plane' },
  { key: 'concert', label: 'Concert / Live', icon: 'Music' },
  { key: 'vip_pass', label: 'VIP / Event', icon: 'Crown' },
]

export const baseColorPresets = [
  { id: 'obsidian', name: 'Deep Obsidian', hex: '#0b0f19', desc: 'Stealth Void' },
  { id: 'sapphire', name: 'Cosmic Sapphire', hex: '#0f172a', desc: 'Deep Navy Glass' },
  { id: 'titanium', name: 'Frosted Titanium', hex: '#334155', desc: 'Industrial Slate' },
  { id: 'emerald', name: 'Bioluminescent Emerald', hex: '#064e3b', desc: 'Cyber Green' },
  { id: 'teal', name: 'Quantum Teal', hex: '#0d3d43', desc: 'Laser Cyan' },
  { id: 'amethyst', name: 'Royal Amethyst', hex: '#2e1065', desc: 'Imperial Violet' },
  { id: 'crimson', name: 'Velvet Crimson', hex: '#4c0519', desc: 'Academic Ruby' },
  { id: 'amber', name: 'Golden Amber', hex: '#451a03', desc: 'Warm Topaz' },
  { id: 'opal', name: 'Frosted Opal', hex: '#f1f5f9', desc: 'High-Key White Glass' },
]

export const foilPresets = [
  { id: 'silver', name: 'Metallic Silver', hex: '#e2e8f0' },
  { id: 'gold', name: 'Ceremony Gold', hex: '#facc15' },
  { id: 'cyan', name: 'Laser Cyan', hex: '#38bdf8' },
  { id: 'rose', name: 'Rose Gold', hex: '#f472b6' },
  { id: 'obsidian', name: 'Stealth Black', hex: '#0f172a' },
  { id: 'white', name: 'Frost White', hex: '#ffffff' },
]

export const presets = {
  commencement: {
    hiddenLayers: ['front-origin', 'front-route-line', 'front-dest'],
    headerIcon: 'GraduationCap',
    routeIcon: 'Sparkles',
    removedTextBoxes: {},

    holoStatus: 'HOLO-SEAL // VALID',
    foilSubStatus: 'OFFICIAL CREDENTIAL',

    institutionName: 'ORGANIZATION NAME',
    ceremonyTitle: 'EVENT OR CEREMONY TITLE',
    classYear: 'YEAR / BADGE',

    heroLabel: 'RECIPIENT / HOLDER LABEL',
    graduateName: 'RECIPIENT FULL NAME',
    degreeMajor: 'PRIMARY SUBTITLE / ROLE',
    degreeColor: '#a5f3fc',
    honors: 'SECONDARY TAG / NOTE',
    honorsColor: '#fef08a',

    originLabel: 'ORIGIN // FROM',
    originCode: 'ORG',
    originName: 'ORIGIN LOCATION',
    destLabel: 'DEST // HALL',
    destCode: 'DST',
    destName: 'DESTINATION LOCATION',
    routeTransitNote: 'ROUTE / TRANSIT NOTE',

    meta1Label: 'VENUE',
    venueName: 'VENUE NAME',
    meta2Label: 'DATE',
    eventDate: 'EVENT DATE',
    meta3Label: 'START TIME',
    ceremonyTime: 'START TIME',
    meta4Label: 'DOORS',
    doorsTime: 'DOORS TIME',

    securityNotice: 'SAMPLE ENTRY NOTICE • VALID ID REQUIRED',

    stubHeaderLabel: 'ADMIT PASS',
    ticketType: 'PASS TYPE',
    admitCount: 'ADMIT 01',
    sectionLabel: 'SECTION',
    section: 'SEC-A',
    rowLabel: 'ROW',
    row: '01',
    seatLabel: 'SEAT',
    seat: '01',
    ticketNoLabel: 'TICKET NO.',
    ticketNumber: '#0001',
    stubFooterLeft: 'RETAIN STUB',
    stubFooterRight: 'DETACHABLE',

    qrPayload: 'QR-PAYLOAD-0001',
    venueAddress: '123 SAMPLE STREET • GATE A',
    organizerContact: 'WWW.EXAMPLE.COM',
    logoTitle: 'BRAND OR PARTNER TITLE',
    logoSubtitle: 'CLICK TO EDIT',
    termsLabel: 'ENTRY POLICY & TERMS',
    policyText:
      'Sample entry policy and terms placeholder. Click to edit rules, refund policy, or guest instructions.',
    barcodeNumber: '0000-0000-0000-01',
  },

  boarding_pass: {
    hiddenLayers: [
      'front-hero-label',
      'front-headline-name',
      'front-subtitle',
      'front-honors',
    ],
    headerIcon: 'Plane',
    routeIcon: 'Plane',
    removedTextBoxes: {},

    holoStatus: 'LASER SECURED',
    foilSubStatus: 'AUTH-0994-X',

    institutionName: 'CARRIER / OPERATOR NAME',
    ceremonyTitle: 'BOARDING PASS TITLE',
    classYear: 'CABIN / TIER',

    heroLabel: 'PASSENGER LABEL',
    graduateName: 'PASSENGER FULL NAME',
    degreeMajor: 'ROUTE / FLIGHT ID',
    degreeColor: '#a5f3fc',
    honors: 'BOARDING PRIORITY',
    honorsColor: '#fef08a',

    originLabel: 'ORIGIN // SECTOR',
    originCode: 'ORG',
    originName: 'ORIGIN TERMINAL',
    destLabel: 'DEST // SECTOR',
    destCode: 'DST',
    destName: 'DESTINATION TERMINAL',
    routeTransitNote: 'TRANSIT DETAILS • NON-STOP',

    meta1Label: 'PASSENGER',
    venueName: 'PASSENGER NAME',
    meta2Label: 'DATE',
    eventDate: 'EVENT DATE',
    meta3Label: 'BOARDING',
    ceremonyTime: 'START TIME',
    meta4Label: 'GATE',
    doorsTime: 'GATE 01',

    securityNotice: 'SAMPLE TRANSIT NOTICE • CHECK-IN REQUIRED',

    stubHeaderLabel: 'BOARDING STUB',
    ticketType: 'BOARDING PASS',
    admitCount: 'ZONE 01',
    sectionLabel: 'CABIN',
    section: 'CABIN A',
    rowLabel: 'ROW',
    row: '01',
    seatLabel: 'SEAT',
    seat: '01A',
    ticketNoLabel: 'SEQ NO.',
    ticketNumber: '#0001',
    stubFooterLeft: 'RETAIN STUB',
    stubFooterRight: 'DETACHABLE',

    qrPayload: 'QR-TRANSIT-0001',
    venueAddress: 'TERMINAL 1 • CONCOURSE A',
    organizerContact: 'WWW.EXAMPLE.COM',
    logoTitle: 'CARRIER / BRAND TITLE',
    logoSubtitle: 'CLICK TO EDIT',
    termsLabel: 'BAGGAGE & TRANSIT TERMS',
    policyText:
      'Sample transit and baggage policy placeholder. Click to customize boarding rules and check-in cutoff times.',
    barcodeNumber: '0000-0000-0000-02',
  },

  concert: {
    hiddenLayers: ['front-origin', 'front-route-line', 'front-dest'],
    headerIcon: 'Music',
    routeIcon: 'Sparkles',
    removedTextBoxes: {},

    holoStatus: 'VERIFIED ENTRY',
    foilSubStatus: 'COLLECTOR EDITION',

    institutionName: 'PROMOTER / ORGANIZER NAME',
    ceremonyTitle: 'CONCERT OR SHOW TITLE',
    classYear: 'TOUR / BADGE',

    heroLabel: 'FEATURED PERFORMER',
    graduateName: 'HEADLINER / ARTIST NAME',
    degreeMajor: 'STAGE / FLOOR ZONE',
    degreeColor: '#f472b6',
    honors: 'ACCESS PERK / TIER',
    honorsColor: '#fef08a',

    originLabel: 'STAGE // ZONE',
    originCode: 'STG',
    originName: 'MAIN STAGE',
    destLabel: 'TIER // PASS',
    destCode: 'ZON',
    destName: 'FLOOR ACCESS',
    routeTransitNote: 'LIVE EVENT ACCESS',

    meta1Label: 'VENUE',
    venueName: 'ARENA / VENUE NAME',
    meta2Label: 'DATE',
    eventDate: 'EVENT DATE',
    meta3Label: 'SHOWTIME',
    ceremonyTime: 'START TIME',
    meta4Label: 'DOORS',
    doorsTime: 'DOORS TIME',

    securityNotice: 'SAMPLE VENUE NOTICE • NO RE-ENTRY',

    stubHeaderLabel: 'SHOW PASS',
    ticketType: 'GENERAL ADMISSION',
    admitCount: '$00 • ADMIT 01',
    sectionLabel: 'SECTION',
    section: 'SEC-A',
    rowLabel: 'TIER',
    row: 'GA',
    seatLabel: 'GATE',
    seat: 'GATE 1',
    ticketNoLabel: 'PASS ID',
    ticketNumber: '#0001',
    stubFooterLeft: 'RETAIN STUB',
    stubFooterRight: 'DETACHABLE',

    qrPayload: 'QR-EVENT-0001',
    venueAddress: '123 VENUE BLVD • MAIN ENTRANCE',
    organizerContact: 'WWW.EXAMPLE.COM',
    logoTitle: 'EVENT / SPONSOR TITLE',
    logoSubtitle: 'CLICK TO EDIT',
    termsLabel: 'CONCERT RULES & POLICY',
    policyText:
      'Sample concert policy placeholder. Click to edit venue rules, camera restrictions, and entry instructions.',
    barcodeNumber: '0000-0000-0000-03',
  },

  vip_pass: {
    hiddenLayers: ['front-origin', 'front-route-line', 'front-dest'],
    headerIcon: 'Crown',
    routeIcon: 'Zap',
    removedTextBoxes: {},

    holoStatus: 'ALL-ACCESS VIP',
    foilSubStatus: 'COMMUNITY SUMMIT',

    institutionName: 'HOST / ORGANIZATION NAME',
    ceremonyTitle: 'VIP EVENT OR SUMMIT TITLE',
    classYear: 'VIP TIER',

    heroLabel: 'CREDENTIAL HOLDER',
    graduateName: 'ATTENDEE FULL NAME',
    degreeMajor: 'ALL-ACCESS CREDENTIAL',
    degreeColor: '#a5f3fc',
    honors: 'LOUNGE + BACKSTAGE',
    honorsColor: '#fde047',

    originLabel: 'PASS',
    originCode: 'ALL',
    originName: 'MAIN HALL',
    destLabel: 'ACCESS',
    destCode: 'VIP',
    destName: 'VIP LOUNGE',
    routeTransitNote: 'FULL EVENT ACCESS',

    meta1Label: 'VENUE',
    venueName: 'CONVENTION HALL NAME',
    meta2Label: 'DATE',
    eventDate: 'EVENT DATE',
    meta3Label: 'CHECK-IN',
    ceremonyTime: 'START TIME',
    meta4Label: 'LOUNGE',
    doorsTime: 'SUITE 100',

    securityNotice: 'SAMPLE CREDENTIAL NOTICE • KEEP BADGE VISIBLE',

    stubHeaderLabel: 'CREDENTIAL',
    ticketType: 'VIP PASS',
    admitCount: 'VIP • ADMIT 01',
    sectionLabel: 'TRACK',
    section: 'MAIN + LABS',
    rowLabel: 'BADGE',
    row: 'GOLD',
    seatLabel: 'TABLE',
    seat: 'VIP-01',
    ticketNoLabel: 'MEMBER #',
    ticketNumber: '#0001',
    stubFooterLeft: 'RETAIN STUB',
    stubFooterRight: 'DETACHABLE',

    qrPayload: 'QR-VIP-0001',
    venueAddress: '123 SAMPLE WAY • HALL A',
    organizerContact: 'WWW.EXAMPLE.COM',
    logoTitle: 'PARTNER / BRAND TITLE',
    logoSubtitle: 'CLICK TO EDIT',
    termsLabel: 'CODE OF CONDUCT & TERMS',
    policyText:
      'Sample VIP credential terms placeholder. Click to edit access privileges, schedule notes, and conduct rules.',
    barcodeNumber: '0000-0000-0000-04',
  },
}
