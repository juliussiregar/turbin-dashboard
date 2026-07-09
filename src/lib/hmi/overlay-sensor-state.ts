import type { HmiSensorState } from "@/lib/hmi/overlay-sensor-types";
import { getTagDefinition } from "@/lib/hmi/tag-registry";
import { resolveMotorRunning } from "@/lib/hmi/motor-tag-registry";
import { resolveValvePosition } from "@/lib/hmi/valve-tag-registry";
import type { HmiTagMap } from "@/lib/hmi/types";

function formatWithUnit(tags: HmiTagMap, tagId: string, fallback: number) {
  const def = getTagDefinition(tagId);
  const digits = def?.decimals ?? 1;
  const raw = tags[tagId];
  const value = typeof raw === "number" ? raw : fallback;
  const text = value.toFixed(digits);
  return def?.unit ? `${text} ${def.unit}` : text;
}

function num(tags: HmiTagMap, key: string, fallback: number, digits = 1) {
  const value = tags[key];
  if (typeof value === "number") return value.toFixed(digits);
  if (value != null) return String(value);
  return fallback.toFixed(digits);
}

function valveOpen(tags: HmiTagMap, key: string, fallbackOpen: boolean) {
  const value = tags[key];
  if (value == null) return fallbackOpen;
  return resolveValvePosition(value) === "OPN";
}

export function buildOverlaySensorState(tags: HmiTagMap): HmiSensorState {
  return {
    te0057: formatWithUnit(tags, "TE_0057", 153.8),
    te0021: formatWithUnit(tags, "TE_0021", 175.8),
    te0022: formatWithUnit(tags, "TE_0022", 143.6),
    pt0183: formatWithUnit(tags, "PT_0183", 28.9),
    te0023: formatWithUnit(tags, "TE_0023", 169.5),
    gen_kv: num(tags, "GEN_KV", 11.8),
    gen_pf: num(tags, "GEN_PF", 0.93, 2),
    gen_mvar: num(tags, "GEN_MVAR", 10.0),
    gen_mva: num(tags, "GEN_MVA", 27.1),
    gen_f: num(tags, "GEN_FREQ", 49.8),
    bus_f: num(tags, "BUS_FREQ", 49.9),
    mot0109: resolveMotorRunning(tags.MOT_0109_RUN),
    mot0108b: resolveMotorRunning(tags.MOT_0108B_RUN),
    mot0108a: resolveMotorRunning(tags.MOT_0108A_RUN),
    mot0085: resolveMotorRunning(tags.MOT_0085_RUN),
    te0079: formatWithUnit(tags, "TE_0079", 174.0),
    te0080: formatWithUnit(tags, "TE_0080", 180.1),
    te0082: formatWithUnit(tags, "TE_0082", 167.8),
    te0081: formatWithUnit(tags, "TE_0081", 171.9),
    mot0129: resolveMotorRunning(tags.MOT_0129_RUN),
    mot2100: resolveMotorRunning(tags.MOT_2100_RUN),
    motNox: resolveMotorRunning(tags.MOT_NOX_RUN),
    motNox2: resolveMotorRunning(tags.MOT_NOX2_RUN),
    sov2110: valveOpen(tags, "SOV_2110_STATUS", false),
    vigv: num(tags, "VIGV", 29.0),
    vbv: num(tags, "VBV", 41.9),
    vsv: num(tags, "VSV", 78.8),
    vGas1: valveOpen(tags, "SOL_GAS_A_STATUS", true),
    vGas2: valveOpen(tags, "SOL_GAS_B_STATUS", true),
    vGas3: valveOpen(tags, "SOL_GAS_C_STATUS", true),
    vGas4: valveOpen(tags, "SOL_GAS_D_STATUS", true),
    vGas6: valveOpen(tags, "SOL_GAS_E_STATUS", true),
    dmd1: num(tags, "WF36DMD", 18.4),
    fb1: num(tags, "WF36FB", 18.4),
    dmd2: num(tags, "PGSSEL", 31.7),
    fb2: num(tags, "PGSFB", 31.6),
    dmd: num(tags, "NOX_DMD", 0.0, 1),
    dmd3: num(tags, "NOX_DMD", 0.0, 1),
    fb3: num(tags, "NOX_FB", 0.0, 1),
    fcv2019: valveOpen(tags, "FCV_2019_STATUS", false),
    mot6015: resolveMotorRunning(tags.MOT_6015_RUN),
  };
}
