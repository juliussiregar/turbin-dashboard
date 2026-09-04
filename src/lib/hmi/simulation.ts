import type { HmiTagMap, OperationMode } from "@/lib/hmi/types";
import { SENSOR_TAG_LOADED_DEFAULTS } from "@/lib/hmi/sensor-tag-registry";
import { VERTICAL_MOTOR_DEFAULTS, HORIZONTAL_MOTOR_DEFAULTS } from "@/lib/hmi/motor-tag-registry";
import { SOLENOID_VALVE_DEFAULTS } from "@/lib/hmi/valve-tag-registry";
import { VANE_VALUE_DEFAULTS } from "@/lib/hmi/vane-tag-registry";
import { PANEL_TAG_LOADED_DEFAULTS } from "@/lib/hmi/panel-tag-registry";

export type SimulationState = {
  mode: OperationMode;
  modeMs: number;
  mwSetpoint: number;
  /** When false, unit stays in current mode (default: stable LOADED for realistic POC). */
  autoCycle: boolean;
  tags: HmiTagMap;
};

/** Nominal loaded values — mirror Sample Screen GT2-001. */
const NOMINAL = {
  N25: 10018.6,
  NSD: 3904.6,
  N25REF: 10810.0,
  NSDREF: 3967.65,
  T48: 1662.3,
  T3: 941.1,
  T2: 84.7,
  PS3: 285.7,
  MW: 25.4,
  MW_SP: 25.5,
  N2: 100.0,
  VIB_A: 0.42,
  VIB_B: 0.38,
  LUBE: 62.5,
  WF36DMD: 18.4,
  PGSSEL: 31.7,
  FG1FLOW: 1240,
  GEN_KV: 11.8,
  GEN_PF: 0.93,
  GEN_MVAR: 10.0,
  GEN_MVA: 27.1,
  GEN_FREQ: 49.8,
  BUS_FREQ: 49.9,
  EXCITER_AMPS: 3.4,
  EXCITER_VOLTS: 24.13,
  VIGV: 29.0,
  VBV: 41.9,
  VSV: 78.8,
} as const;

const MODE_DURATION_MS: Record<OperationMode, number> = {
  STOPPED: 8_000,
  CRANKING: 6_000,
  IGNITION: 6_000,
  WARMUP: 8_000,
  SYNCHRONIZING: 6_000,
  LOADED: 90_000,
  UNLOADING: 8_000,
  TRIP: 8_000,
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

/** Soft pull toward a nominal value with tiny live noise. */
function live(current: number, nominal: number, noise: number, pull = 0.35) {
  const pulled = current * (1 - pull) + nominal * pull;
  return jitter(pulled, noise);
}

function approach(current: number, target: number, rate = 0.15) {
  return current * (1 - rate) + target * rate;
}

let lcgSeed = 0x1234abcd;

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
  if (mode === "TRIP") return "STOPPED";
  const index = MODE_SEQUENCE.indexOf(mode);
  if (index === -1 || index === MODE_SEQUENCE.length - 1) return "STOPPED";
  return MODE_SEQUENCE[index + 1];
}

function modeTargets(mode: OperationMode) {
  switch (mode) {
    case "STOPPED":
      return { rpm: 0, nsd: 0, mw: 0, t48: 180, t3: 120, ps3: 14.7, fuel: 0, pgs: 0, flow: 0 };
    case "CRANKING":
      return { rpm: 1200, nsd: 400, mw: 0, t48: 280, t3: 200, ps3: 18, fuel: 0, pgs: 4, flow: 0 };
    case "IGNITION":
      return { rpm: 2500, nsd: 900, mw: 0, t48: 650, t3: 400, ps3: 35, fuel: 6, pgs: 10, flow: 220 };
    case "WARMUP":
      return { rpm: 5500, nsd: 2000, mw: 0, t48: 1100, t3: 650, ps3: 90, fuel: 10, pgs: 16, flow: 480 };
    case "SYNCHRONIZING":
      return { rpm: 9800, nsd: 3600, mw: 2.0, t48: 1450, t3: 850, ps3: 220, fuel: 14, pgs: 24, flow: 720 };
    case "LOADED":
      return {
        rpm: NOMINAL.N25,
        nsd: NOMINAL.NSD,
        mw: NOMINAL.MW,
        t48: NOMINAL.T48,
        t3: NOMINAL.T3,
        ps3: NOMINAL.PS3,
        fuel: NOMINAL.WF36DMD,
        pgs: NOMINAL.PGSSEL,
        flow: NOMINAL.FG1FLOW,
      };
    case "UNLOADING":
      return { rpm: 6000, nsd: 2200, mw: 4.0, t48: 1200, t3: 700, ps3: 140, fuel: 8, pgs: 14, flow: 400 };
    case "TRIP":
      return { rpm: 800, nsd: 200, mw: 0, t48: 900, t3: 500, ps3: 40, fuel: 0, pgs: 0, flow: 0 };
  }
}

function modeAuxStatus(mode: OperationMode) {
  const loaded = mode === "LOADED";
  const spinning = mode !== "STOPPED" && mode !== "TRIP";
  const fueling = mode === "IGNITION" || mode === "WARMUP" || mode === "SYNCHRONIZING" || loaded;
  const cranking = mode === "CRANKING";
  const fansOn = spinning || loaded;

  return {
    MOT_0109_RUN: false,
    MOT_0108B_RUN: false,
    MOT_0108A_RUN: spinning || loaded,
    MOT_0085_RUN: false,
    MOT_6015_RUN: false,
    MOT_0129_RUN: cranking,
    MOT_2100_RUN: false,
    MOT_NOX_RUN: false,
    MOT_NOX2_RUN: false,
    MOT_4103A_RUN: fansOn,
    MOT_4103B_RUN: fansOn,
    MOT_4017A_RUN: fansOn,
    MOT_4017B_RUN: fansOn,
    SOL_GAS_A_STATUS: fueling ? "OPN" : "CLS",
    SOL_GAS_B_STATUS: fueling ? "OPN" : "CLS",
    SOL_GAS_C_STATUS: fueling ? "OPN" : "CLS",
    SOL_GAS_D_STATUS: "CLS",
    SOL_GAS_E_STATUS: "CLS",
    SOV_2110_STATUS: "CLS",
    FCV_2019_STATUS: "CLS",
    SPRINT_STATUS: "Inactive",
    CRANK_STATUS: cranking ? "Active" : "Inactive",
    RUN_PERMISSIVE: mode === "STOPPED" || mode === "TRIP" ? "NOT OK" : "OK",
    MW_CTRL_ENBL: loaded ? "ENABLED" : "DISABLED",
    NOX_WATER_STATUS: loaded ? "Active" : "Inactive",
  } as const;
}

function vaneTargets(mode: OperationMode) {
  if (mode === "LOADED") return { VIGV: NOMINAL.VIGV, VBV: NOMINAL.VBV, VSV: NOMINAL.VSV };
  if (mode === "STOPPED" || mode === "TRIP") return { VIGV: 0, VBV: 100, VSV: 0 };
  if (mode === "CRANKING") return { VIGV: 12, VBV: 80, VSV: 25 };
  if (mode === "IGNITION") return { VIGV: 18, VBV: 65, VSV: 40 };
  if (mode === "WARMUP") return { VIGV: 22, VBV: 52, VSV: 55 };
  if (mode === "SYNCHRONIZING") return { VIGV: 26, VBV: 45, VSV: 70 };
  return { VIGV: 20, VBV: 55, VSV: 50 };
}

export function createInitialSimulationState(): SimulationState {
  return {
    mode: "LOADED",
    modeMs: 0,
    mwSetpoint: NOMINAL.MW_SP,
    autoCycle: false,
    tags: {
      N25: NOMINAL.N25,
      NSD: NOMINAL.NSD,
      T48: NOMINAL.T48,
      T3: NOMINAL.T3,
      T2: NOMINAL.T2,
      PS3: NOMINAL.PS3,
      MW: NOMINAL.MW,
      MW_SP: NOMINAL.MW_SP,
      RUN_STATUS: "RUN",
      NOX_WATER_STATUS: "Active",
      SEQ_TEXT: "Unit is loaded",
      VIB_A: NOMINAL.VIB_A,
      VIB_B: NOMINAL.VIB_B,
      LUBE_OIL_PRESS: NOMINAL.LUBE,
      ...SENSOR_TAG_LOADED_DEFAULTS,
      ...VERTICAL_MOTOR_DEFAULTS,
      ...HORIZONTAL_MOTOR_DEFAULTS,
      ...SOLENOID_VALVE_DEFAULTS,
      ...VANE_VALUE_DEFAULTS,
      ...PANEL_TAG_LOADED_DEFAULTS,
      TE0057A1: SENSOR_TAG_LOADED_DEFAULTS.TE_0057,
      XE8009X: NOMINAL.VIB_A,
      XE8009Y: NOMINAL.VIB_B,
      MOT_4103A_RUN: true,
      MOT_4103B_RUN: true,
      MOT_4017A_RUN: true,
      MOT_4017B_RUN: true,
      NOX_DMD: 0,
      NOX_FB: 0,
      WW_TIME_REMAIN: 450,
      WW_SOAK_REMAIN: 120,
    },
  };
}

function jitterSensorTags(tags: HmiTagMap, loaded: boolean): Partial<HmiTagMap> {
  const next: Partial<HmiTagMap> = {};
  for (const [tagId, base] of Object.entries(SENSOR_TAG_LOADED_DEFAULTS)) {
    const current = Number(tags[tagId] ?? base);
    if (tagId.startsWith("VIB_CH")) {
      next[tagId] = clamp(live(current, base, 0.015, 0.4), 0.05, 1.8);
    } else if (tagId.startsWith("VIB_")) {
      next[tagId] = clamp(live(current, base, 0.1, 0.4), base - 1.0, base + 1.0);
    } else if (tagId.startsWith("WW_") || tagId.startsWith("NOX_")) {
      const noise = tagId.includes("PT") || tagId.includes("PDT") || tagId.includes("LT") ? 0.12 : 0.25;
      next[tagId] = clamp(live(current, base, noise, 0.4), base - 1.5, base + 1.5);
    } else if (loaded) {
      // Stay near sample-screen values (±0.4 °F / ±0.15 psig)
      const noise = tagId.startsWith("PT_") ? 0.12 : 0.35;
      next[tagId] = clamp(live(current, base, noise, 0.4), base - 1.5, base + 1.5);
    } else {
      const cooled = base * 0.55 + 40;
      next[tagId] = clamp(live(current, cooled, 0.8, 0.2), 60, base + 5);
    }
  }
  return next;
}

function stepPanelAnalogs(
  tags: HmiTagMap,
  mode: OperationMode,
  mw: number,
  target: ReturnType<typeof modeTargets>
): Partial<HmiTagMap> {
  const loaded = mode === "LOADED";
  const te0057 = Number(tags.TE_0057 ?? SENSOR_TAG_LOADED_DEFAULTS.TE_0057);
  const vanes = vaneTargets(mode);

  if (loaded) {
    const fuelDmd = live(Number(tags.WF36DMD ?? NOMINAL.WF36DMD), NOMINAL.WF36DMD, 0.12, 0.4);
    const pgs = live(Number(tags.PGSSEL ?? NOMINAL.PGSSEL), NOMINAL.PGSSEL, 0.15, 0.4);
    const flow = live(Number(tags.FG1FLOW ?? NOMINAL.FG1FLOW), NOMINAL.FG1FLOW, 8, 0.35);

    return {
      N2: live(Number(tags.N2 ?? NOMINAL.N2), NOMINAL.N2, 0.08, 0.5),
      N25REF: NOMINAL.N25REF,
      T48REF: live(Number(tags.T48REF ?? NOMINAL.T48), NOMINAL.T48, 1.2, 0.4),
      T3REF: live(Number(tags.T3REF ?? NOMINAL.T3), NOMINAL.T3, 0.8, 0.4),
      NSDREF: NOMINAL.NSDREF,

      LT0135A: live(Number(tags.LT0135A ?? 72.4), 72.4, 0.25, 0.4),
      TE0057A1: live(Number(tags.TE0057A1 ?? te0057), te0057, 0.25, 0.45),
      TE0057B1: live(Number(tags.TE0057B1 ?? te0057), te0057 + 0.3, 0.25, 0.45),
      TE0057C1: live(Number(tags.TE0057C1 ?? te0057), te0057 - 0.4, 0.25, 0.45),
      TE0057D1: live(Number(tags.TE0057D1 ?? te0057), te0057 + 0.15, 0.25, 0.45),
      TE0034A1: live(Number(tags.TE0034A1 ?? 162.4), 162.4, 0.35, 0.4),
      TE0035A1: live(Number(tags.TE0035A1 ?? 158.7), 158.7, 0.35, 0.4),
      TE0036A1: live(Number(tags.TE0036A1 ?? 161.2), 161.2, 0.35, 0.4),

      PT1021A1: live(Number(tags.PT1021A1 ?? NOMINAL.LUBE), NOMINAL.LUBE, 0.2, 0.4),
      TE1021A1: live(Number(tags.TE1021A1 ?? 118.4), 118.4, 0.25, 0.4),
      TE1022A1: live(Number(tags.TE1022A1 ?? 119.1), 119.1, 0.25, 0.4),
      TE1023A1: live(Number(tags.TE1023A1 ?? 117.8), 117.8, 0.25, 0.4),
      TE1024A1: live(Number(tags.TE1024A1 ?? 120.2), 120.2, 0.25, 0.4),

      XE8009X: live(Number(tags.XE8009X ?? 0.42), 0.42, 0.015, 0.45),
      XE8009Y: live(Number(tags.XE8009Y ?? 0.38), 0.38, 0.015, 0.45),
      XE8010X: live(Number(tags.XE8010X ?? 0.35), 0.35, 0.012, 0.45),
      XE8010Y: live(Number(tags.XE8010Y ?? 0.31), 0.31, 0.012, 0.45),
      XE8077: live(Number(tags.XE8077 ?? 0.28), 0.28, 0.01, 0.45),

      WF36DMD: fuelDmd,
      WF36FB: live(Number(tags.WF36FB ?? fuelDmd), fuelDmd, 0.08, 0.5),
      PGSSEL: pgs,
      PGSFB: live(Number(tags.PGSFB ?? pgs), pgs, 0.08, 0.5),
      FG1FLOW: Math.round(flow),
      FG2FLOW: 0,
      NOX_DMD: 0,
      NOX_FB: live(Number(tags.NOX_FB ?? 0), 0, 0.05, 0.5),

      PDT4004: live(Number(tags.PDT4004 ?? 0.12), 0.12, 0.008, 0.4),
      PDT4005: live(Number(tags.PDT4005 ?? 0.08), 0.08, 0.006, 0.4),
      TE4082A1: live(Number(tags.TE4082A1 ?? 142.3), 142.3, 0.3, 0.4),
      TE4083A1: live(Number(tags.TE4083A1 ?? 143.1), 143.1, 0.3, 0.4),
      TE4084A1: live(Number(tags.TE4084A1 ?? 141.8), 141.8, 0.3, 0.4),

      GEN_KV: live(Number(tags.GEN_KV ?? NOMINAL.GEN_KV), NOMINAL.GEN_KV, 0.02, 0.45),
      GEN_PF: live(Number(tags.GEN_PF ?? NOMINAL.GEN_PF), NOMINAL.GEN_PF, 0.004, 0.45),
      GEN_MVAR: live(Number(tags.GEN_MVAR ?? NOMINAL.GEN_MVAR), NOMINAL.GEN_MVAR, 0.08, 0.4),
      GEN_MVA: live(Number(tags.GEN_MVA ?? NOMINAL.GEN_MVA), NOMINAL.GEN_MVA, 0.1, 0.4),
      GEN_FREQ: live(Number(tags.GEN_FREQ ?? NOMINAL.GEN_FREQ), NOMINAL.GEN_FREQ, 0.02, 0.45),
      BUS_FREQ: live(Number(tags.BUS_FREQ ?? NOMINAL.BUS_FREQ), NOMINAL.BUS_FREQ, 0.015, 0.45),

      EXCITER_AMPS: live(Number(tags.EXCITER_AMPS ?? NOMINAL.EXCITER_AMPS), NOMINAL.EXCITER_AMPS, 0.03, 0.4),
      EXCITER_VOLTS: live(Number(tags.EXCITER_VOLTS ?? NOMINAL.EXCITER_VOLTS), NOMINAL.EXCITER_VOLTS, 0.08, 0.4),

      VIGV: live(Number(tags.VIGV ?? NOMINAL.VIGV), vanes.VIGV, 0.12, 0.4),
      VBV: live(Number(tags.VBV ?? NOMINAL.VBV), vanes.VBV, 0.12, 0.4),
      VSV: live(Number(tags.VSV ?? NOMINAL.VSV), vanes.VSV, 0.12, 0.4),
    };
  }

  // Non-loaded: approach mode targets calmly (still readable, not chaotic)
  const fuelDmd = clamp(approach(Number(tags.WF36DMD ?? 0), target.fuel, 0.18), 0, 40);
  const pgs = clamp(approach(Number(tags.PGSSEL ?? 0), target.pgs, 0.18), 0, 40);
  const flow = clamp(approach(Number(tags.FG1FLOW ?? 0), target.flow, 0.18), 0, 2000);
  const online = mode === "SYNCHRONIZING";

  return {
    N2: clamp(approach(Number(tags.N2 ?? 0), mode === "STOPPED" || mode === "TRIP" ? 0 : 100, 0.2), 0, 100),
    N25REF: mode === "STOPPED" || mode === "TRIP" ? 0 : NOMINAL.N25REF,
    T48REF: clamp(approach(Number(tags.T48REF ?? 200), target.t48, 0.15), 100, 1700),
    T3REF: clamp(approach(Number(tags.T3REF ?? 150), target.t3, 0.15), 80, 980),
    NSDREF: NOMINAL.NSDREF,

    LT0135A: clamp(live(Number(tags.LT0135A ?? 70), 68, 0.4, 0.2), 55, 80),
    TE0057A1: clamp(live(Number(tags.TE0057A1 ?? 140), 130, 0.5, 0.2), 100, 180),
    TE0057B1: clamp(live(Number(tags.TE0057B1 ?? 140), 130.5, 0.5, 0.2), 100, 180),
    TE0057C1: clamp(live(Number(tags.TE0057C1 ?? 140), 129.5, 0.5, 0.2), 100, 180),
    TE0057D1: clamp(live(Number(tags.TE0057D1 ?? 140), 130.2, 0.5, 0.2), 100, 180),
    TE0034A1: clamp(live(Number(tags.TE0034A1 ?? 140), 135, 0.5, 0.2), 100, 180),
    TE0035A1: clamp(live(Number(tags.TE0035A1 ?? 140), 133, 0.5, 0.2), 100, 180),
    TE0036A1: clamp(live(Number(tags.TE0036A1 ?? 140), 134, 0.5, 0.2), 100, 180),

    PT1021A1: clamp(approach(Number(tags.PT1021A1 ?? 40), 35 + mw * 1.2, 0.2), 15, 70),
    TE1021A1: clamp(live(Number(tags.TE1021A1 ?? 110), 105, 0.4, 0.2), 90, 130),
    TE1022A1: clamp(live(Number(tags.TE1022A1 ?? 110), 106, 0.4, 0.2), 90, 130),
    TE1023A1: clamp(live(Number(tags.TE1023A1 ?? 110), 104, 0.4, 0.2), 90, 130),
    TE1024A1: clamp(live(Number(tags.TE1024A1 ?? 110), 107, 0.4, 0.2), 90, 130),

    XE8009X: clamp(live(Number(tags.XE8009X ?? 0.2), 0.18 + mw * 0.008, 0.01, 0.3), 0.1, 0.6),
    XE8009Y: clamp(live(Number(tags.XE8009Y ?? 0.18), 0.16 + mw * 0.008, 0.01, 0.3), 0.1, 0.6),
    XE8010X: clamp(live(Number(tags.XE8010X ?? 0.15), 0.14 + mw * 0.006, 0.01, 0.3), 0.1, 0.5),
    XE8010Y: clamp(live(Number(tags.XE8010Y ?? 0.14), 0.13 + mw * 0.006, 0.01, 0.3), 0.1, 0.5),
    XE8077: clamp(live(Number(tags.XE8077 ?? 0.12), 0.12 + mw * 0.005, 0.008, 0.3), 0.08, 0.45),

    WF36DMD: fuelDmd,
    WF36FB: clamp(jitter(fuelDmd, 0.1), 0, 40),
    PGSSEL: pgs,
    PGSFB: clamp(jitter(pgs, 0.1), 0, 40),
    FG1FLOW: Math.round(flow),
    FG2FLOW: 0,
    NOX_DMD: 0,
    NOX_FB: 0,

    PDT4004: clamp(live(Number(tags.PDT4004 ?? 0.08), 0.06, 0.01, 0.2), 0.02, 0.2),
    PDT4005: clamp(live(Number(tags.PDT4005 ?? 0.05), 0.04, 0.008, 0.2), 0.02, 0.15),
    TE4082A1: clamp(live(Number(tags.TE4082A1 ?? 120), 118, 0.4, 0.2), 100, 150),
    TE4083A1: clamp(live(Number(tags.TE4083A1 ?? 120), 119, 0.4, 0.2), 100, 150),
    TE4084A1: clamp(live(Number(tags.TE4084A1 ?? 120), 117, 0.4, 0.2), 100, 150),

    GEN_KV: online || loaded ? live(Number(tags.GEN_KV ?? 11), 11.5, 0.05, 0.3) : clamp(approach(Number(tags.GEN_KV ?? 0), 0, 0.3), 0, 2),
    GEN_PF: online || loaded ? 0.9 : 0,
    GEN_MVAR: online ? clamp(mw * 0.3, 0, 5) : 0,
    GEN_MVA: online ? clamp(mw * 1.1, 0, 8) : 0,
    GEN_FREQ: online || loaded ? live(Number(tags.GEN_FREQ ?? 49.8), 49.8, 0.03, 0.3) : 0,
    BUS_FREQ: live(Number(tags.BUS_FREQ ?? 49.9), 49.9, 0.02, 0.4),

    EXCITER_AMPS: online || loaded ? live(Number(tags.EXCITER_AMPS ?? 2), 2.5, 0.05, 0.3) : 0.1,
    EXCITER_VOLTS: online || loaded ? live(Number(tags.EXCITER_VOLTS ?? 18), 20, 0.15, 0.3) : 1,

    VIGV: clamp(approach(Number(tags.VIGV ?? 0), vanes.VIGV, 0.2), 0, 100),
    VBV: clamp(approach(Number(tags.VBV ?? 0), vanes.VBV, 0.2), 0, 100),
    VSV: clamp(approach(Number(tags.VSV ?? 0), vanes.VSV, 0.2), 0, 100),
  };
}

export function stepSimulation(current: SimulationState, deltaMs: number): SimulationState {
  let mode = current.mode;
  let modeMs = current.modeMs + deltaMs;
  let autoCycle = current.autoCycle;

  if (autoCycle && modeMs >= MODE_DURATION_MS[mode]) {
    mode = nextMode(mode);
    modeMs = 0;
    // After returning to LOADED via auto cycle, settle again
    if (mode === "LOADED") autoCycle = false;
  }

  const target = modeTargets(mode);
  const targetMw = mode === "LOADED" ? current.mwSetpoint : target.mw;
  const now = { ...current.tags };
  const aux = modeAuxStatus(mode);
  const loaded = mode === "LOADED";

  const rpm = loaded
    ? live(Number(now.N25), target.rpm, 2.5, 0.45)
    : clamp(approach(Number(now.N25), target.rpm, 0.12), 0, 11000);

  const mwRate = loaded ? 0.08 : mode === "TRIP" ? 0.3 : 0.12;
  const mw = loaded
    ? live(approach(Number(now.MW), targetMw, mwRate), targetMw, 0.04, 0.25)
    : clamp(approach(Number(now.MW), targetMw, mwRate), 0, 30);

  const t48 = loaded
    ? live(Number(now.T48), target.t48, 1.5, 0.4)
    : clamp(approach(Number(now.T48), target.t48, 0.1), 100, 1800);

  const ps3 = loaded
    ? live(Number(now.PS3), target.ps3, 0.35, 0.4)
    : clamp(approach(Number(now.PS3), target.ps3, 0.1), 12, 320);

  const nsd = loaded
    ? live(Number(now.NSD), target.nsd, 1.5, 0.45)
    : clamp(approach(Number(now.NSD), target.nsd, 0.12), 0, 4200);

  const t3 = loaded
    ? live(Number(now.T3), NOMINAL.T3, 0.8, 0.4)
    : clamp(approach(Number(now.T3), target.t3, 0.1), 80, 980);

  const t2 = loaded
    ? live(Number(now.T2), NOMINAL.T2, 0.15, 0.45)
    : clamp(live(Number(now.T2), 82, 0.3, 0.2), 78, 90);

  const vibA = loaded
    ? live(Number(now.VIB_A), NOMINAL.VIB_A, 0.012, 0.45)
    : clamp(live(Number(now.VIB_A), 0.2, 0.015, 0.3), 0.1, 0.55);

  const vibB = loaded
    ? live(Number(now.VIB_B), NOMINAL.VIB_B, 0.012, 0.45)
    : clamp(live(Number(now.VIB_B), 0.18, 0.015, 0.3), 0.1, 0.55);

  const lube = loaded
    ? live(Number(now.LUBE_OIL_PRESS), NOMINAL.LUBE, 0.2, 0.4)
    : clamp(approach(Number(now.LUBE_OIL_PRESS), 30 + mw * 1.2, 0.15), 15, 70);

  let wwTime = Number(now.WW_TIME_REMAIN ?? 450) - (deltaMs / 1000);
  if (wwTime <= 0) wwTime = 450;
  
  let wwSoak = Number(now.WW_SOAK_REMAIN ?? 120) - (deltaMs / 1000);
  if (wwSoak <= 0) wwSoak = 120;

  return {
    mode,
    modeMs,
    mwSetpoint: current.mwSetpoint,
    autoCycle,
    tags: {
      ...now,
      N25: rpm,
      NSD: nsd,
      T48: t48,
      T3: t3,
      T2: t2,
      PS3: ps3,
      MW: mw,
      MW_SP: current.mwSetpoint,
      RUN_STATUS: mode === "LOADED" ? "RUN" : "STOP",
      SEQ_TEXT: resolveSequenceText(mode),
      VIB_A: vibA,
      VIB_B: vibB,
      LUBE_OIL_PRESS: lube,
      WW_TIME_REMAIN: wwTime,
      WW_SOAK_REMAIN: wwSoak,
      ...jitterSensorTags(now, loaded),
      ...stepPanelAnalogs({ ...now, VIB_A: vibA, VIB_B: vibB, LUBE_OIL_PRESS: lube }, mode, mw, target),
      ...aux,
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
  if (current.mode !== "LOADED") return current;
  const nextSetpoint = clamp(current.mwSetpoint + delta, 15, 30);
  return {
    ...current,
    mwSetpoint: nextSetpoint,
    tags: {
      ...current.tags,
      MW_SP: nextSetpoint,
    },
  };
}

export function forceTrip(current: SimulationState): SimulationState {
  return {
    ...current,
    mode: "TRIP",
    modeMs: 0,
    autoCycle: false,
    tags: {
      ...current.tags,
      SEQ_TEXT: "Unit trip active",
      RUN_STATUS: "STOP",
      MW_CTRL_ENBL: "DISABLED",
      RUN_PERMISSIVE: "NOT OK",
    },
  };
}

export function startSequence(current: SimulationState): SimulationState {
  return {
    ...current,
    mode: "CRANKING",
    modeMs: 0,
    autoCycle: true,
    mwSetpoint: current.mwSetpoint || NOMINAL.MW_SP,
    tags: {
      ...current.tags,
      SEQ_TEXT: "Sequence: CRANKING",
      RUN_STATUS: "STOP",
      CRANK_STATUS: "Active",
      RUN_PERMISSIVE: "OK",
    },
  };
}

export function forceTripReset(current: SimulationState): SimulationState {
  return {
    ...current,
    mode: "STOPPED",
    modeMs: 0,
    autoCycle: false,
    tags: {
      ...current.tags,
      SEQ_TEXT: "Trip acknowledged, unit stopped",
      RUN_STATUS: "STOP",
      MW_CTRL_ENBL: "DISABLED",
      RUN_PERMISSIVE: "NOT OK",
      CRANK_STATUS: "Inactive",
    },
  };
}

/** Return to stable loaded operation with nominal GT2 values. */
export function holdLoaded(current: SimulationState): SimulationState {
  const base = createInitialSimulationState();
  return {
    ...base,
    mwSetpoint: current.mwSetpoint || NOMINAL.MW_SP,
    tags: {
      ...base.tags,
      MW_SP: current.mwSetpoint || NOMINAL.MW_SP,
      MW: approach(Number(current.tags.MW ?? NOMINAL.MW), current.mwSetpoint || NOMINAL.MW, 0.5),
    },
  };
}
