import type { HmiTagDefinition, TagValue } from "@/lib/hmi/types";

export const MOTOR_TAG_DEFINITIONS: HmiTagDefinition[] = [
  { id: "MOT_0109_RUN", label: "MOT 0109" },
  { id: "MOT_0108B_RUN", label: "MOT 0108B" },
  { id: "MOT_0108A_RUN", label: "MOT 0108A" },
  { id: "MOT_0085_RUN", label: "MOT 0085" },
  { id: "MOT_0129_RUN", label: "MOT-0129" },
  { id: "MOT_6015_RUN", label: "MOT-6015" },
];

export const VERTICAL_MOTOR_TAG_IDS = [
  "MOT_0109_RUN",
  "MOT_0108B_RUN",
  "MOT_0108A_RUN",
  "MOT_0085_RUN",
  "MOT_6015_RUN",
] as const;

export const HORIZONTAL_MOTOR_TAG_IDS = ["MOT_0129_RUN"] as const;

export type VerticalMotorTagId = (typeof VERTICAL_MOTOR_TAG_IDS)[number];
export type HorizontalMotorTagId = (typeof HORIZONTAL_MOTOR_TAG_IDS)[number];

export function splitMotorLabel(idLabel: string): { prefix: string; code: string } {
  if (/^MOT/i.test(idLabel)) {
    const code = idLabel.replace(/^MOT[- ]?/i, "").trim();
    if (code) return { prefix: "MOT", code };
  }
  return { prefix: idLabel, code: "" };
}

export function resolveMotorRunning(raw: TagValue | undefined): boolean {
  if (raw === true || raw === "RUN") return true;
  if (raw === false || raw === "STOP") return false;
  return false;
}

export const VERTICAL_MOTOR_DEFAULTS: Record<VerticalMotorTagId, boolean> = {
  MOT_0109_RUN: false,
  MOT_0108B_RUN: false,
  MOT_0108A_RUN: true,
  MOT_0085_RUN: false,
  MOT_6015_RUN: false,
};

export const HORIZONTAL_MOTOR_DEFAULTS: Record<HorizontalMotorTagId, boolean> = {
  MOT_0129_RUN: false,
};
