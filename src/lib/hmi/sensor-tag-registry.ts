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
};
