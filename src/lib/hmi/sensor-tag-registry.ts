import type { HmiTagDefinition } from "@/lib/hmi/types";

/** Process-diagram sensor tags. `id` = key di HmiTagMap / offline sender; `label` = tampilan TE-xxxx. */
export const SENSOR_TAG_DEFINITIONS: HmiTagDefinition[] = [
  { id: "TE_0057", label: "TE-0057", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE_0021", label: "TE-0021", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE_0022", label: "TE-0022", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE_0023", label: "TE-0023", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "PT_0183", label: "PT-0183", unit: "psig", decimals: 1, min: 0, max: 60 },
  { id: "TE_0079", label: "TE-0079", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE_0080", label: "TE-0080", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE_0081", label: "TE-0081", unit: "°F", decimals: 1, min: 100, max: 220 },
  { id: "TE_0082", label: "TE-0082", unit: "°F", decimals: 1, min: 100, max: 220 },

  // Water Wash specific tags
  { id: "WW_PDT5000", label: "PDT-5000", unit: "psid", decimals: 1, min: -1, max: 10 },
  { id: "WW_PT5001", label: "PT-5001", unit: "psig", decimals: 1, min: 0, max: 150 },
  { id: "WW_LT5042", label: "LT-5042", unit: "%", decimals: 1, min: -5, max: 105 },
  { id: "WW_TE5040A1", label: "TE-5040A1", unit: "°F", decimals: 1, min: 0, max: 250 },
  { id: "WW_PT5041", label: "PT-5041", unit: "psig", decimals: 1, min: -5, max: 10 },

  // Water Inj Nox dummy tags
  { id: "NOX_VAL1", label: "NOX-1", unit: "psig", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL2", label: "NOX-2", unit: "psig", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL3", label: "NOX-3", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL4", label: "NOX-4", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL5", label: "NOX-5", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL6", label: "NOX-6", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL7", label: "NOX-7", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL8", label: "NOX-8", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL9", label: "NOX-9", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL10", label: "NOX-10", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL11", label: "NOX-11", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL12", label: "NOX-12", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL13", label: "NOX-13", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL14", label: "NOX-14", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL15", label: "NOX-15", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL16", label: "NOX-16", unit: "gpm", decimals: 1, min: 0, max: 100 },
  { id: "NOX_VAL17", label: "NOX-17", unit: "gpm", decimals: 1, min: 0, max: 100 },

  // Vibration Monitoring Tags
  { id: "VIB_TOP1", label: "VIB-TOP1", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP2", label: "VIB-TOP2", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP3", label: "VIB-TOP3", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP4", label: "VIB-TOP4", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP5", label: "VIB-TOP5", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP6", label: "VIB-TOP6", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP7", label: "VIB-TOP7", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP8", label: "VIB-TOP8", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP9", label: "VIB-TOP9", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP10", label: "VIB-TOP10", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP11", label: "VIB-TOP11", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP12", label: "VIB-TOP12", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP13", label: "VIB-TOP13", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP14", label: "VIB-TOP14", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP15", label: "VIB-TOP15", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP16", label: "VIB-TOP16", unit: "VDC", decimals: 1, min: 0, max: 24 },
  { id: "VIB_TOP17", label: "VIB-TOP17", unit: "VDC", decimals: 1, min: 0, max: 24 },

  { id: "VIB_CH1", label: "XE8076A", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH2", label: "XE8077A", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH3", label: "XE8076B", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH4", label: "XE8077B", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH5", label: "XE8076", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH6", label: "XE8077", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH7", label: "XE8093", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH8", label: "XE8094", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH9", label: "XE8007X", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH10", label: "XE8007Y", unit: "in/s", decimals: 2, min: 0, max: 2 },
  { id: "VIB_CH11", label: "XE8009X", unit: "mil", decimals: 2, min: 0, max: 5 },
  { id: "VIB_CH12", label: "XE8009Y", unit: "mil", decimals: 2, min: 0, max: 5 },
];

export const SENSOR_TAG_BOX_GENERATOR_LEFT = [
  "TE_0057",
  "TE_0021",
  "TE_0022",
  "PT_0183",
] as const;

export const SENSOR_TAG_BOX_COUPLING = ["TE_0079", "TE_0080", "TE_0082", "TE_0081"] as const;
export const SENSOR_TAG_BOX_TOP = ["TE_0023"] as const;

export type SensorTagId =
  | (typeof SENSOR_TAG_BOX_GENERATOR_LEFT)[number]
  | "TE_0023"
  | "TE_0079"
  | "TE_0080"
  | "TE_0081"
  | "TE_0082";

export const SENSOR_TAG_LOADED_DEFAULTS: Record<string, number> = {
  TE_0057: 153.8,
  TE_0021: 175.8,
  TE_0022: 143.6,
  TE_0023: 169.5,
  PT_0183: 28.9,
  TE_0079: 174.0,
  TE_0080: 180.1,
  TE_0081: 171.9,
  TE_0082: 167.8,

  // Water Wash specific
  WW_PDT5000: -0.0,
  WW_PT5001: 113.0,
  WW_LT5042: -0.3,
  WW_TE5040A1: 88.3,
  WW_PT5041: -0.1,

  // Water Inj Nox dummy values
  NOX_VAL1: 50.1,
  NOX_VAL2: 45.2,
  NOX_VAL3: 12.3,
  NOX_VAL4: 5.4,
  NOX_VAL5: 8.5,
  NOX_VAL6: 99.9,
  NOX_VAL7: 34.2,
  NOX_VAL8: 22.1,
  NOX_VAL9: 44.4,
  NOX_VAL10: 55.5,
  NOX_VAL11: 66.6,
  NOX_VAL12: 77.7,
  NOX_VAL13: 88.8,
  NOX_VAL14: 11.1,
  NOX_VAL15: 22.2,
  NOX_VAL16: 33.3,
  NOX_VAL17: 44.4,

  // Vibration Monitoring Defaults
  VIB_TOP1: 8.7,
  VIB_TOP2: 8.2,
  VIB_TOP3: 8.5,
  VIB_TOP4: 8.1,
  VIB_TOP5: 8.4,
  VIB_TOP6: 8.3,
  VIB_TOP7: 8.6,
  VIB_TOP8: 8.2,
  VIB_TOP9: 8.5,
  VIB_TOP10: 180.0,
  VIB_TOP11: 180.0,
  VIB_TOP12: 8.4,
  VIB_TOP13: 8.3,
  VIB_TOP14: 8.5,
  VIB_TOP15: 8.2,
  VIB_TOP16: 180.0,
  VIB_TOP17: 180.0,

  VIB_CH1: 0.42,
  VIB_CH2: 0.38,
  VIB_CH3: 0.35,
  VIB_CH4: 0.31,
  VIB_CH5: 0.28,
  VIB_CH6: 0.33,
  VIB_CH7: 0.25,
  VIB_CH8: 0.29,
  VIB_CH9: 0.45,
  VIB_CH10: 0.40,
  VIB_CH11: 0.52,
  VIB_CH12: 0.48,
};
