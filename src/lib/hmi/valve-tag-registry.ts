import type { HmiTagDefinition } from "@/lib/hmi/types";

export type ValvePosition = "OPN" | "CLS";
export type ValveOrientation = "horizontal" | "vertical";
export type ValveActuatorType = "S" | "M";

export type SolenoidValveLayout = {
  orientation: ValveOrientation;
  actuator: ValveActuatorType;
  flowArrow?: boolean;
};

export const SOLENOID_VALVE_TAG_DEFINITIONS: HmiTagDefinition[] = [
  { id: "SOL_GAS_A_STATUS", label: "SOL-GAS-A" },
  { id: "SOL_GAS_B_STATUS", label: "SOL-GAS-B" },
  { id: "SOL_GAS_C_STATUS", label: "SOL-GAS-C" },
  { id: "SOL_GAS_D_STATUS", label: "SOL-GAS-D" },
  { id: "SOL_GAS_E_STATUS", label: "SOL-GAS-E" },
  { id: "SOV_2110_STATUS", label: "SOV-2110" },
];

export const SOLENOID_VALVE_TAG_IDS = [
  "SOL_GAS_A_STATUS",
  "SOL_GAS_B_STATUS",
  "SOL_GAS_C_STATUS",
  "SOL_GAS_D_STATUS",
  "SOL_GAS_E_STATUS",
  "SOV_2110_STATUS",
] as const;

export type SolenoidValveTagId = (typeof SOLENOID_VALVE_TAG_IDS)[number];

export const SOLENOID_VALVE_LAYOUTS: Record<SolenoidValveTagId, SolenoidValveLayout> = {
  SOL_GAS_A_STATUS: { orientation: "horizontal", actuator: "S", flowArrow: true },
  SOL_GAS_B_STATUS: { orientation: "horizontal", actuator: "S", flowArrow: true },
  SOL_GAS_C_STATUS: { orientation: "horizontal", actuator: "S", flowArrow: true },
  SOL_GAS_D_STATUS: { orientation: "horizontal", actuator: "S", flowArrow: false },
  SOL_GAS_E_STATUS: { orientation: "horizontal", actuator: "S", flowArrow: false },
  SOV_2110_STATUS: { orientation: "vertical", actuator: "S", flowArrow: false },
};

export const SOLENOID_VALVE_DEFAULTS: Record<SolenoidValveTagId, ValvePosition> = {
  SOL_GAS_A_STATUS: "OPN",
  SOL_GAS_B_STATUS: "OPN",
  SOL_GAS_C_STATUS: "OPN",
  SOL_GAS_D_STATUS: "CLS",
  SOL_GAS_E_STATUS: "CLS",
  SOV_2110_STATUS: "CLS",
};

export function resolveValvePosition(value: unknown): ValvePosition {
  if (value === "OPN" || value === "OPEN" || value === true) return "OPN";
  return "CLS";
}

export function resolveSolenoidValveLayout(tagId: SolenoidValveTagId): SolenoidValveLayout {
  return SOLENOID_VALVE_LAYOUTS[tagId] ?? { orientation: "horizontal", actuator: "S", flowArrow: false };
}

export const SOLENOID_VALVE_VARIANT_PRESETS: Array<SolenoidValveLayout & { label: string; position: ValvePosition }> = [
  { label: "Horizontal · S · OPN", orientation: "horizontal", actuator: "S", flowArrow: true, position: "OPN" },
  { label: "Horizontal · S · CLS", orientation: "horizontal", actuator: "S", flowArrow: false, position: "CLS" },
  { label: "Vertical · S · CLS", orientation: "vertical", actuator: "S", flowArrow: false, position: "CLS" },
  { label: "Horizontal · M", orientation: "horizontal", actuator: "M", flowArrow: false, position: "CLS" },
];
