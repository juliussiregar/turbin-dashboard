import type { HmiTagDefinition } from "@/lib/hmi/types";

/**
 * Tags shown on Main Screen side/bottom panels (and shared with process overlay).
 * Kept separate from sensor-tag-registry so overlay TE/PT boxes stay focused.
 */
export const PANEL_TAG_DEFINITIONS: HmiTagDefinition[] = [
  // Engine extras
  { id: "N2", label: "N2", unit: "%", decimals: 1, min: 0, max: 110 },
  { id: "N25REF", label: "N25REF", unit: "RPM", decimals: 1, min: 0, max: 12000 },
  { id: "T48REF", label: "T48REF", unit: "°F", decimals: 1, min: 100, max: 1800 },
  { id: "T3REF", label: "T3REF", unit: "°F", decimals: 1, min: 80, max: 980 },
  { id: "NSDREF", label: "NSDREF", unit: "RPM", decimals: 2, min: 0, max: 4200 },

  // Mineral lube / generator temps (panel labels mirror legacy HMI naming)
  { id: "LT0135A", label: "LT0135A", unit: "%", decimals: 1, min: 0, max: 100 },
  { id: "TE0057A1", label: "TE0057A1", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE0057B1", label: "TE0057B1", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE0057C1", label: "TE0057C1", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE0057D1", label: "TE0057D1", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE0034A1", label: "TE0034A1", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE0035A1", label: "TE0035A1", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE0036A1", label: "TE0036A1", unit: "°F", decimals: 1, min: 100, max: 220 },

  // Turbine lube oil
  { id: "PT1021A1", label: "PT1021A1", unit: "psig", decimals: 1, min: 0, max: 100 },
  { id: "TE1021A1", label: "TE1021A1", unit: "°F", decimals: 1, min: 80, max: 160 },
  { id: "TE1022A1", label: "TE1022A1", unit: "°F", decimals: 1, min: 80, max: 160 },
  { id: "TE1023A1", label: "TE1023A1", unit: "°F", decimals: 1, min: 80, max: 160 },
  { id: "TE1024A1", label: "TE1024A1", unit: "°F", decimals: 1, min: 80, max: 160 },

  // Vibration channels
  { id: "XE8009X", label: "XE8009X", unit: "in/s", decimals: 2, min: 0, max: 3 },
  { id: "XE8009Y", label: "XE8009Y", unit: "in/s", decimals: 2, min: 0, max: 3 },
  { id: "XE8010X", label: "XE8010X", unit: "in/s", decimals: 2, min: 0, max: 3 },
  { id: "XE8010Y", label: "XE8010Y", unit: "in/s", decimals: 2, min: 0, max: 3 },
  { id: "XE8077", label: "XE8077", unit: "in/s", decimals: 2, min: 0, max: 3 },

  // Fuel / gas
  { id: "WF36DMD", label: "WF36DMD", unit: "%", decimals: 1, min: 0, max: 100 },
  { id: "WF36FB", label: "WF36FB", unit: "%", decimals: 1, min: 0, max: 100 },
  { id: "PGSSEL", label: "PGSSEL", unit: "%", decimals: 1, min: 0, max: 100 },
  { id: "PGSFB", label: "PGSFB", unit: "%", decimals: 1, min: 0, max: 100 },
  { id: "FG1FLOW", label: "FG1FLOW", unit: "lb/hr", decimals: 0, min: 0, max: 5000 },
  { id: "FG2FLOW", label: "FG2FLOW", unit: "lb/hr", decimals: 0, min: 0, max: 5000 },
  { id: "NOX_DMD", label: "NOX DMD", unit: "%", decimals: 1, min: 0, max: 100 },
  { id: "NOX_FB", label: "NOX FB", unit: "%", decimals: 1, min: 0, max: 100 },

  // Ventilation
  { id: "PDT4004", label: "PDT4004", unit: "inH2O", decimals: 2, min: 0, max: 1 },
  { id: "PDT4005", label: "PDT4005", unit: "inH2O", decimals: 2, min: 0, max: 1 },
  { id: "TE4082A1", label: "TE4082A1", unit: "°F", decimals: 1, min: 80, max: 200 },
  { id: "TE4083A1", label: "TE4083A1", unit: "°F", decimals: 1, min: 80, max: 200 },
  { id: "TE4084A1", label: "TE4084A1", unit: "°F", decimals: 1, min: 80, max: 200 },

  // Generator electrical (overlay + panels)
  { id: "GEN_KV", label: "Gen KV", unit: "KV", decimals: 1, min: 0, max: 15 },
  { id: "GEN_PF", label: "Gen PF", decimals: 2, min: 0, max: 1 },
  { id: "GEN_MVAR", label: "Gen MVAR", unit: "MVAR", decimals: 1, min: -20, max: 20 },
  { id: "GEN_MVA", label: "Gen MVA", unit: "MVA", decimals: 1, min: 0, max: 40 },
  { id: "GEN_FREQ", label: "Gen F", unit: "Hz", decimals: 1, min: 45, max: 55 },
  { id: "BUS_FREQ", label: "Bus F", unit: "Hz", decimals: 1, min: 45, max: 55 },

  // Exciter / AVR
  { id: "EXCITER_AMPS", label: "Exciter Amps", unit: "A", decimals: 2, min: 0, max: 20 },
  { id: "EXCITER_VOLTS", label: "Exciter Volts", unit: "VDC", decimals: 2, min: 0, max: 50 },

  // Aux motors / valves used on overlay but not in core motor registry
  { id: "MOT_2100_RUN", label: "MOT-2100" },
  { id: "MOT_NOX_RUN", label: "MOT-NOX" },
  { id: "MOT_NOX2_RUN", label: "MOT-NOX2" },
  { id: "FCV_2019_STATUS", label: "FCV-2019" },

  // System status extras
  { id: "SPRINT_STATUS", label: "SPRINT" },
  { id: "CRANK_STATUS", label: "CRANK" },
  { id: "RUN_PERMISSIVE", label: "RUN PERMISSIVE" },
  { id: "MW_CTRL_ENBL", label: "MW CTRL ENBL" },
];

export const PANEL_TAG_LOADED_DEFAULTS: Record<string, number | boolean | string> = {
  N2: 100.0,
  N25REF: 10810.0,
  T48REF: 1662.3,
  T3REF: 941.1,
  NSDREF: 3967.65,

  LT0135A: 72.4,
  TE0057A1: 153.8,
  TE0057B1: 154.1,
  TE0057C1: 153.2,
  TE0057D1: 154.0,
  TE0034A1: 162.4,
  TE0035A1: 158.7,
  TE0036A1: 161.2,

  PT1021A1: 62.5,
  TE1021A1: 118.4,
  TE1022A1: 119.1,
  TE1023A1: 117.8,
  TE1024A1: 120.2,

  XE8009X: 0.42,
  XE8009Y: 0.38,
  XE8010X: 0.35,
  XE8010Y: 0.31,
  XE8077: 0.28,

  WF36DMD: 18.4,
  WF36FB: 18.4,
  PGSSEL: 31.7,
  PGSFB: 31.6,
  FG1FLOW: 1240,
  FG2FLOW: 0,
  NOX_DMD: 0,
  NOX_FB: 0,

  PDT4004: 0.12,
  PDT4005: 0.08,
  TE4082A1: 142.3,
  TE4083A1: 143.1,
  TE4084A1: 141.8,

  GEN_KV: 11.8,
  GEN_PF: 0.93,
  GEN_MVAR: 10.0,
  GEN_MVA: 27.1,
  GEN_FREQ: 49.8,
  BUS_FREQ: 49.9,

  EXCITER_AMPS: 3.4,
  EXCITER_VOLTS: 24.13,

  MOT_2100_RUN: false,
  MOT_NOX_RUN: false,
  MOT_NOX2_RUN: false,
  FCV_2019_STATUS: "CLS",

  SPRINT_STATUS: "Inactive",
  CRANK_STATUS: "Inactive",
  RUN_PERMISSIVE: "OK",
  MW_CTRL_ENBL: "ENABLED",
};

/** Row specs for live panel tables — label shown in UI, tagId in sim. */
export type PanelRowSpec = {
  tagId: string;
  label: string;
  digits?: number;
  highlight?: boolean;
};

export const ENGINE_PANEL_ROWS: PanelRowSpec[] = [
  { tagId: "N2", label: "N2", digits: 1, highlight: true },
  { tagId: "N25REF", label: "N25REF", digits: 1 },
  { tagId: "NSDREF", label: "NSDREF", digits: 2 },
  { tagId: "T3", label: "T3", digits: 1 },
  { tagId: "T48REF", label: "T48REF", digits: 1 },
  { tagId: "T3REF", label: "T3REF", digits: 1 },
];

export const MINERAL_PANEL_ROWS: PanelRowSpec[] = [
  { tagId: "LT0135A", label: "LT0135A", digits: 1, highlight: true },
  { tagId: "TE_0057", label: "TE0057A1", digits: 1 },
  { tagId: "TE0057B1", label: "TE0057B1", digits: 1 },
  { tagId: "TE0057C1", label: "TE0057C1", digits: 1 },
  { tagId: "TE0057D1", label: "TE0057D1", digits: 1 },
];

export const GENERATOR_PANEL_ROWS: PanelRowSpec[] = [
  { tagId: "TE_0021", label: "TE0021A1", digits: 1, highlight: true },
  { tagId: "TE_0022", label: "TE0022A1", digits: 1 },
  { tagId: "TE_0023", label: "TE0023A1", digits: 1 },
  { tagId: "TE0034A1", label: "TE0034A1", digits: 1 },
  { tagId: "TE0035A1", label: "TE0035A1", digits: 1 },
  { tagId: "TE0036A1", label: "TE0036A1", digits: 1 },
];

export const TURBINE_LUBE_PANEL_ROWS: PanelRowSpec[] = [
  { tagId: "LUBE_OIL_PRESS", label: "LUBE P", digits: 1, highlight: true },
  { tagId: "TE1021A1", label: "TE1021A1", digits: 1 },
  { tagId: "TE1022A1", label: "TE1022A1", digits: 1 },
  { tagId: "TE1023A1", label: "TE1023A1", digits: 1 },
  { tagId: "TE1024A1", label: "TE1024A1", digits: 1 },
];

export const VIBRATION_PANEL_ROWS: PanelRowSpec[] = [
  { tagId: "VIB_A", label: "VIB A", digits: 2, highlight: true },
  { tagId: "VIB_B", label: "VIB B", digits: 2, highlight: true },
  { tagId: "XE8010X", label: "XE8010X", digits: 2 },
  { tagId: "XE8010Y", label: "XE8010Y", digits: 2 },
  { tagId: "XE8077", label: "XE8077", digits: 2 },
];

export const FUEL_PANEL_ROWS: PanelRowSpec[] = [
  { tagId: "WF36DMD", label: "WF36DMD", digits: 1, highlight: true },
  { tagId: "PGSSEL", label: "PGSSEL", digits: 1 },
  { tagId: "FG1FLOW", label: "FG1FLOW", digits: 0 },
  { tagId: "FG2FLOW", label: "FG2FLOW", digits: 0 },
];

export const VENTILATION_PANEL_ROWS: PanelRowSpec[] = [
  { tagId: "PDT4004", label: "PDT4004", digits: 2 },
  { tagId: "TE4082A1", label: "TE4082A1", digits: 1 },
  { tagId: "TE4083A1", label: "TE4083A1", digits: 1 },
  { tagId: "PDT4005", label: "PDT4005", digits: 2 },
];
