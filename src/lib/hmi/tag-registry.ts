import type { HmiTagDefinition, HmiTagMap } from "@/lib/hmi/types";
import { SENSOR_TAG_DEFINITIONS } from "@/lib/hmi/sensor-tag-registry";
import { MOTOR_TAG_DEFINITIONS } from "@/lib/hmi/motor-tag-registry";
import { SOLENOID_VALVE_TAG_DEFINITIONS } from "@/lib/hmi/valve-tag-registry";
import { VANE_TAG_DEFINITIONS } from "@/lib/hmi/vane-tag-registry";
import { PANEL_TAG_DEFINITIONS } from "@/lib/hmi/panel-tag-registry";

export const TAG_REGISTRY: HmiTagDefinition[] = [
  { id: "N25", label: "N25", unit: "RPM", decimals: 1, min: 0, max: 3100 },
  { id: "NSD", label: "NSD", unit: "RPM", decimals: 1, min: 0, max: 4100 },
  { id: "T48", label: "T48", unit: "F", decimals: 1, min: 100, max: 1800 },
  { id: "T3", label: "T3", unit: "F", decimals: 1, min: 80, max: 980 },
  { id: "T2", label: "T2", unit: "F", decimals: 1, min: 80, max: 100 },
  { id: "PS3", label: "PS3", unit: "psia", decimals: 1, min: 12, max: 320 },
  { id: "MW", label: "MW", unit: "MW", decimals: 1, min: 0, max: 30 },
  { id: "MW_SP", label: "MW SP", unit: "MW", decimals: 1, min: 0, max: 30 },
  {
    id: "LUBE_OIL_PRESS",
    label: "Lube Oil",
    unit: "psig",
    decimals: 1,
    min: 10,
    max: 100,
  },
  { id: "VIB_A", label: "VIB-A", unit: "in/s", decimals: 2, min: 0, max: 3 },
  { id: "VIB_B", label: "VIB-B", unit: "in/s", decimals: 2, min: 0, max: 3 },
  { id: "RUN_STATUS", label: "RUN STATUS" },
  { id: "NOX_WATER_STATUS", label: "NOX WATER" },
  { id: "SEQ_TEXT", label: "SEQUENCE" },
  ...SENSOR_TAG_DEFINITIONS,
  ...MOTOR_TAG_DEFINITIONS,
  ...SOLENOID_VALVE_TAG_DEFINITIONS,
  ...VANE_TAG_DEFINITIONS,
  ...PANEL_TAG_DEFINITIONS,
];

const TAG_MAP = new Map(TAG_REGISTRY.map((tag) => [tag.id, tag] as const));

export function getTagDefinition(tagId: string) {
  return TAG_MAP.get(tagId);
}

export function formatTagValue(tags: HmiTagMap, tagId: string) {
  const def = getTagDefinition(tagId);
  const raw = tags[tagId];

  if (raw == null) return "-";

  if (typeof raw === "number") {
    const digits = def?.decimals ?? 1;
    const valueText = raw.toFixed(digits);
    return def?.unit ? `${valueText} ${def.unit}` : valueText;
  }

  return String(raw);
}

export type ResolvedSensorTag = {
  tagId: string;
  label: string;
  value: number | string;
  unit: string;
  digits: number;
};

/** Resolve label TE-xxxx, unit, dan nilai dari HmiTagMap — untuk SensorTagBox dinamis. */
export function resolveSensorTag(tags: HmiTagMap, tagId: string): ResolvedSensorTag {
  const def = getTagDefinition(tagId);
  const raw = tags[tagId];

  return {
    tagId,
    label: def?.label ?? tagId.replaceAll("_", "-"),
    value: raw == null ? "-" : typeof raw === "number" ? raw : String(raw),
    unit: def?.unit ?? "",
    digits: def?.decimals ?? 1,
  };
}

/** Merge patch tag dari offline sender / websocket tanpa mengganti tag lain. */
export function applyTagPatch(current: HmiTagMap, patch: Partial<HmiTagMap>): HmiTagMap {
  const next: HmiTagMap = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      next[key] = value;
    }
  }
  return next;
}
