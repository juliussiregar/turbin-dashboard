/**
 * Layout contract for the generator zone (fans + body + sensors + bottom motors).
 * All SVG coordinates for this zone live here — adjust against /dev/generator-compare overlay.
 */
export const GENERATOR_ZONE = {
  viewBox: { width: 380, height: 420 },

  compare: {
    width: 380,
    height: 420,
    referenceUrl: "/hmi/patokan-generator-zone.png",
    /** Target: diff % below this before asking user for final approval. */
    diffThresholdPercent: 10,
  },

  fans: {
    left: { x: 120, y: 28, label: "MOT-4103" },
    cell: { width: 64, height: 78, gap: 4 },
    fanLink: { x: 186, startY: 106, tipY: 186 },
  },

  body: {
    nose: [
      { x: 78, y: 210, w: 10, h: 52 },
      { x: 88, y: 204, w: 14, h: 64 },
      { x: 102, y: 198, w: 16, h: 76 },
    ],
    main: { x: 118, y: 188, w: 190, h: 96 },
    rightCap: { x: 308, y: 198, w: 14, h: 76 },
  },

  electricalPanel: {
    x: 148,
    y: 196,
    rowH: 14,
    chipW: 46,
    rows: [
      { tagId: "GEN_KV", label: "KV" },
      { tagId: "GEN_PF", label: "PF" },
      { tagId: "GEN_MVAR", label: "MVAR" },
      { tagId: "GEN_MVA", label: "MVA" },
      { tagId: "GEN_FREQ", label: "Gen F (Hz)" },
      { tagId: "BUS_FREQ", label: "Bus F (Hz)" },
    ],
  },

  sensors: [
    { tagId: "TE_0057", label: "TE-0057", unit: "°F", boxX: 8, boxY: 150, tapX: 78, tapY: 220 },
    { tagId: "TE_0021", label: "TE-0021", unit: "°F", boxX: 8, boxY: 198, tapX: 78, tapY: 236 },
    { tagId: "TE_0022", label: "TE-0022", unit: "°F", boxX: 8, boxY: 246, tapX: 78, tapY: 252 },
    { tagId: "PT_0183", label: "PT-0183", unit: "psig", boxX: 8, boxY: 294, tapX: 88, tapY: 310 },
  ],

  pipe: {
    leftX: 96,
    rightX: 316,
    attachY: 284,
    runY: 338,
    mainWidth: 14,
    stubWidth: 10,
  },

  motors: [
    { id: "MOT 0109", tagId: "MOT_0109_RUN", cx: 168, top: 358 },
    { id: "MOT 0108B", tagId: "MOT_0108B_RUN", cx: 214, top: 358 },
    { id: "MOT 0108A", tagId: "MOT_0108A_RUN", cx: 260, top: 358 },
    { id: "MOT 0085", tagId: "MOT_0085_RUN", cx: 322, top: 392 },
  ],
} as const;

export type GeneratorZoneLayout = typeof GENERATOR_ZONE;
