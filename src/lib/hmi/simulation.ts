import type { HmiTagMap, OperationMode } from "@/lib/hmi/types";
import { SENSOR_TAG_LOADED_DEFAULTS } from "@/lib/hmi/sensor-tag-registry";
import { VERTICAL_MOTOR_DEFAULTS, HORIZONTAL_MOTOR_DEFAULTS } from "@/lib/hmi/motor-tag-registry";
import { SOLENOID_VALVE_DEFAULTS } from "@/lib/hmi/valve-tag-registry";
import { VANE_VALUE_DEFAULTS } from "@/lib/hmi/vane-tag-registry";

export type SimulationState = {
  mode: OperationMode;
  modeMs: number;
  mwSetpoint: number;
  tags: HmiTagMap;
};

const MODE_DURATION_MS: Record<OperationMode, number> = {
  STOPPED: 10_000,
  CRANKING: 8_000,
  IGNITION: 7_000,
  WARMUP: 10_000,
  SYNCHRONIZING: 8_000,
  LOADED: 25_000,
  UNLOADING: 8_000,
  TRIP: 6_000,
};

const MODE_SEQUENCE: OperationMode[] = [
  "STOPPED",
  "CRANKING",
  "IGNITION",
  "WARMUP",
  "SYNCHRONIZING",
  "LOADED",
  "UNLOADING",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function jitter(value: number, delta: number) {
  return value + (randomUnit() * 2 - 1) * delta;
}

let lcgSeed = 0x1234abcd;

// Deterministic pseudo-random value for dummy HMI simulation.
function randomUnit() {
  lcgSeed = (1664525 * lcgSeed + 1013904223) >>> 0;
  return lcgSeed / 0x100000000;
}

function resolveSequenceText(mode: OperationMode) {
  if (mode === "STOPPED") return "Unit is stopped";
  if (mode === "LOADED") return "Unit is loaded";
  if (mode === "TRIP") return "Unit trip active";
  return `Sequence: ${mode}`;
}

function nextMode(mode: OperationMode): OperationMode {
  if (mode === "TRIP") {
    return "STOPPED";
  }
  const index = MODE_SEQUENCE.indexOf(mode);
  if (index === -1 || index === MODE_SEQUENCE.length - 1) {
    return "STOPPED";
  }
  return MODE_SEQUENCE[index + 1];
}

function modeTargets(mode: OperationMode) {
  switch (mode) {
    case "STOPPED":
      return { rpm: 0, mw: 0, t48: 150, ps3: 14.7 };
    case "CRANKING":
      return { rpm: 900, mw: 0, t48: 250, ps3: 16.0 };
    case "IGNITION":
      return { rpm: 1700, mw: 0, t48: 550, ps3: 22.0 };
    case "WARMUP":
      return { rpm: 2500, mw: 0, t48: 980, ps3: 45.0 };
    case "SYNCHRONIZING":
      return { rpm: 2988, mw: 3.5, t48: 1350, ps3: 120.0 };
    case "LOADED":
      return { rpm: 10018.6, mw: 25.4, t48: 1662.3, ps3: 285.7 };
    case "UNLOADING":
      return { rpm: 2990, mw: 5.0, t48: 1320, ps3: 160.0 };
    case "TRIP":
      return { rpm: 1200, mw: 0, t48: 650, ps3: 60.0 };
  }
}

export function createInitialSimulationState(): SimulationState {
  return {
    mode: "LOADED",
    modeMs: 0,
    mwSetpoint: 25.5,
    tags: {
      N25: 10018.6,
      N25REF: 10810.0,
      NSD: 3904.6,
      NSDREF: 3967.65,
      T48: 1662.3,
      T3: 941.1,
      T2: 84.7,
      PS3: 285.7,
      MW: 25.4,
      MW_SP: 25.5,
      RUN_STATUS: "RUN",
      NOX_WATER_STATUS: "Active",
      SEQ_TEXT: "Unit is loaded",
      VIB_A: 0.42,
      VIB_B: 0.38,
      LUBE_OIL_PRESS: 62.5,
      ...SENSOR_TAG_LOADED_DEFAULTS,
      ...VERTICAL_MOTOR_DEFAULTS,
      ...HORIZONTAL_MOTOR_DEFAULTS,
      ...SOLENOID_VALVE_DEFAULTS,
      ...VANE_VALUE_DEFAULTS,
    },
  };
}

function jitterSensorTags(tags: HmiTagMap): Partial<HmiTagMap> {
  const next: Partial<HmiTagMap> = {};
  for (const [tagId, base] of Object.entries(SENSOR_TAG_LOADED_DEFAULTS)) {
    const current = Number(tags[tagId] ?? base);
    const delta = tagId.startsWith("PT_") ? 0.4 : 1.2;
    next[tagId] = clamp(jitter(current, delta) * 0.92 + base * 0.08, base - 15, base + 15);
  }
  return next;
}

export function stepSimulation(
  current: SimulationState,
  deltaMs: number
): SimulationState {
  let mode = current.mode;
  let modeMs = current.modeMs + deltaMs;

  if (randomUnit() < 0.004 && mode !== "TRIP") {
    mode = "TRIP";
    modeMs = 0;
  } else if (modeMs >= MODE_DURATION_MS[mode]) {
    mode = nextMode(mode);
    modeMs = 0;
  }

  const target = modeTargets(mode);
  const targetMw = mode === "LOADED" ? current.mwSetpoint : target.mw;
  const now = { ...current.tags };

  const rpm = clamp(jitter(Number(now.N25), 12) * 0.85 + target.rpm * 0.15, 0, 11000);
  const mw = clamp(jitter(Number(now.MW), 0.3) * 0.85 + targetMw * 0.15, 0, 30);
  const t48 = clamp(jitter(Number(now.T48), 4) * 0.9 + target.t48 * 0.1, 100, 1800);
  const ps3 = clamp(jitter(Number(now.PS3), 1) * 0.9 + target.ps3 * 0.1, 12, 320);
  const nsd = clamp(jitter(Number(now.NSD), 8) * 0.85 + 3904.6 * 0.15, 0, 4200);

  const run = mode === "LOADED" || mode === "SYNCHRONIZING" ? "RUN" : "STOP";
  const seqText = resolveSequenceText(mode);

  return {
    mode,
    modeMs,
    mwSetpoint: current.mwSetpoint,
    tags: {
      ...now,
      N25: rpm,
      N25REF: mode === "STOPPED" ? 0 : 10810.0,
      NSD: nsd,
      NSDREF: 3967.65,
      T48: t48,
      T3: clamp(0.55 * t48 + 20 + randomUnit() * 8, 80, 980),
      T2: clamp(84 + randomUnit() * 2, 82, 90),
      PS3: ps3,
      MW: mw,
      MW_SP: current.mwSetpoint,
      RUN_STATUS: run,
      NOX_WATER_STATUS: mode === "LOADED" ? "Active" : "Inactive",
      SEQ_TEXT: seqText,
      VIB_A: clamp(0.2 + mw * 0.02 + randomUnit() * 0.15, 0.1, 2.2),
      VIB_B: clamp(0.2 + mw * 0.025 + randomUnit() * 0.2, 0.1, 2.4),
      LUBE_OIL_PRESS: clamp(25 + mw * 1.8 + randomUnit() * 1.2, 12, 85),
      ...jitterSensorTags(now),
      MOT_0109_RUN: false,
      MOT_0108B_RUN: false,
      MOT_0108A_RUN: true,
      MOT_0085_RUN: false,
      MOT_6015_RUN: false,
      MOT_0129_RUN: false,
      ...SOLENOID_VALVE_DEFAULTS,
      ...VANE_VALUE_DEFAULTS,
    },
  };
}

export function toggleMotorTag(
  current: SimulationState,
  tagId: keyof typeof VERTICAL_MOTOR_DEFAULTS
): SimulationState {
  const now = current.tags[tagId];
  const running = now === true || now === "RUN";
  return {
    ...current,
    tags: {
      ...current.tags,
      [tagId]: !running,
    },
  };
}

export function adjustSetpoint(current: SimulationState, delta: number): SimulationState {
  const nextSetpoint = clamp(current.mwSetpoint + delta, 0, 30);
  return {
    ...current,
    mwSetpoint: nextSetpoint,
    tags: {
      ...current.tags,
      MW_SP: nextSetpoint,
    },
  };
}

export function forceTripReset(current: SimulationState): SimulationState {
  return {
    ...current,
    mode: "STOPPED",
    modeMs: 0,
    tags: {
      ...current.tags,
      SEQ_TEXT: "Trip acknowledged, unit stopped",
    },
  };
}
