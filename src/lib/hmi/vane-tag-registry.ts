import type { HmiTagDefinition } from "@/lib/hmi/types";

export const VANE_TAG_DEFINITIONS: HmiTagDefinition[] = [
  { id: "VIGV", label: "VIGV", decimals: 1, min: 0, max: 100 },
  { id: "VBV", label: "VBV", decimals: 1, min: 0, max: 100 },
  { id: "VSV", label: "VSV", decimals: 1, min: 0, max: 100 },
];

export const VANE_TAG_IDS = ["VIGV", "VBV", "VSV"] as const;

export type VaneTagId = (typeof VANE_TAG_IDS)[number];

export const VANE_VALUE_DEFAULTS: Record<VaneTagId, number> = {
  VIGV: 29.0,
  VBV: 41.9,
  VSV: 78.8,
};

export function resolveVaneValue(tags: Record<string, unknown>, tagId: VaneTagId) {
  const def = VANE_TAG_DEFINITIONS.find((item) => item.id === tagId);
  const raw = tags[tagId];
  const digits = def?.decimals ?? 1;

  if (raw == null) return { label: def?.label ?? tagId, value: "-", digits };
  if (typeof raw === "number") {
    return { label: def?.label ?? tagId, value: raw.toFixed(digits), digits };
  }
  if (typeof raw === "string" || typeof raw === "boolean") {
    return { label: def?.label ?? tagId, value: String(raw), digits };
  }
  return { label: def?.label ?? tagId, value: "-", digits };
}
