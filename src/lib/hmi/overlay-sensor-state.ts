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
    fan4103a: resolveMotorRunning(tags.MOT_4103A_RUN),
    fan4103b: resolveMotorRunning(tags.MOT_4103B_RUN),
    fan4017a: resolveMotorRunning(tags.MOT_4017A_RUN),
    fan4017b: resolveMotorRunning(tags.MOT_4017B_RUN),
    ww_pdt5000: formatWithUnit(tags, "WW_PDT5000", -0.0),
    ww_pt5001: formatWithUnit(tags, "WW_PT5001", 113.0),
    ww_lt5042: formatWithUnit(tags, "WW_LT5042", -0.3),
    ww_te5040a1: formatWithUnit(tags, "WW_TE5040A1", 88.3),
    ww_pt5041: formatWithUnit(tags, "WW_PT5041", -0.1),
    ww_sov5032: valveOpen(tags, "WW_SOV5032", false),
    ww_sov5033: valveOpen(tags, "WW_SOV5033", false),
    ww_sov5039: valveOpen(tags, "WW_SOV5039", false),
    ww_mot5035: resolveMotorRunning(tags.WW_MOT5035_RUN),
    ww_he5044: resolveMotorRunning(tags.WW_HE5044_RUN),
    ww_he5036: resolveMotorRunning(tags.WW_HE5036_RUN),
    ww_time_remain: num(tags, "WW_TIME_REMAIN", 0, 0),
    ww_soak_remain: num(tags, "WW_SOAK_REMAIN", 0, 0),

    // Water Inj Nox dummy mapping
    nox_val1: formatWithUnit(tags, "NOX_VAL1", 0),
    nox_val2: formatWithUnit(tags, "NOX_VAL2", 0),
    nox_water_status: String(tags.NOX_WATER_STATUS) === "Active",
    nox_val6: formatWithUnit(tags, "NOX_VAL6", 0),
    nox_val7: formatWithUnit(tags, "NOX_VAL7", 0),
    nox_val8: formatWithUnit(tags, "NOX_VAL8", 0),
    nox_val9: formatWithUnit(tags, "NOX_VAL9", 0),
    nox_val10: formatWithUnit(tags, "NOX_VAL10", 0),
    nox_val11: formatWithUnit(tags, "NOX_VAL11", 0),
    nox_val12: formatWithUnit(tags, "NOX_VAL12", 0),
    nox_val13: formatWithUnit(tags, "NOX_VAL13", 0),
    nox_val14: formatWithUnit(tags, "NOX_VAL14", 0),
    nox_val15: formatWithUnit(tags, "NOX_VAL15", 0),
    nox_val16: formatWithUnit(tags, "NOX_VAL16", 0),
    nox_val17: formatWithUnit(tags, "NOX_VAL17", 0),

    // Vibration Monitoring mapping
    vib_top1: formatWithUnit(tags, "VIB_TOP1", 8.7),
    vib_top2: formatWithUnit(tags, "VIB_TOP2", 8.2),
    vib_top3: formatWithUnit(tags, "VIB_TOP3", 8.5),
    vib_top4: formatWithUnit(tags, "VIB_TOP4", 8.1),
    vib_top5: formatWithUnit(tags, "VIB_TOP5", 8.4),
    vib_top6: formatWithUnit(tags, "VIB_TOP6", 8.3),
    vib_top7: formatWithUnit(tags, "VIB_TOP7", 8.6),
    vib_top8: formatWithUnit(tags, "VIB_TOP8", 8.2),
    vib_top9: formatWithUnit(tags, "VIB_TOP9", 8.5),
    vib_top10: formatWithUnit(tags, "VIB_TOP10", 180.0),
    vib_top11: formatWithUnit(tags, "VIB_TOP11", 180.0),
    vib_top12: formatWithUnit(tags, "VIB_TOP12", 8.4),
    vib_top13: formatWithUnit(tags, "VIB_TOP13", 8.3),
    vib_top14: formatWithUnit(tags, "VIB_TOP14", 8.5),
    vib_top15: formatWithUnit(tags, "VIB_TOP15", 8.2),
    vib_top16: formatWithUnit(tags, "VIB_TOP16", 180.0),
    vib_top17: formatWithUnit(tags, "VIB_TOP17", 180.0),

    vib_ch1: formatWithUnit(tags, "VIB_CH1", 0.42),
    vib_ch2: formatWithUnit(tags, "VIB_CH2", 0.38),
    vib_ch3: formatWithUnit(tags, "VIB_CH3", 0.35),
    vib_ch4: formatWithUnit(tags, "VIB_CH4", 0.31),
    vib_ch5: formatWithUnit(tags, "VIB_CH5", 0.28),
    vib_ch6: formatWithUnit(tags, "VIB_CH6", 0.33),
    vib_ch7: formatWithUnit(tags, "VIB_CH7", 0.25),
    vib_ch8: formatWithUnit(tags, "VIB_CH8", 0.29),
    vib_ch9: formatWithUnit(tags, "VIB_CH9", 0.45),
    vib_ch10: formatWithUnit(tags, "VIB_CH10", 0.40),
    vib_ch11: formatWithUnit(tags, "VIB_CH11", 0.52),
    vib_ch12: formatWithUnit(tags, "VIB_CH12", 0.48),

    vib_bar1: Number(tags.VIB_CH1 ?? 0.42),
    vib_bar2: Number(tags.VIB_CH2 ?? 0.38),
    vib_bar3: Number(tags.VIB_CH3 ?? 0.35),
    vib_bar4: Number(tags.VIB_CH4 ?? 0.31),
    vib_bar5: Number(tags.VIB_CH5 ?? 0.28),
    vib_bar6: Number(tags.VIB_CH6 ?? 0.33),
    vib_bar7: Number(tags.VIB_CH7 ?? 0.25),
    vib_bar8: Number(tags.VIB_CH8 ?? 0.29),
    vib_bar9: Number(tags.VIB_CH9 ?? 0.45),
    vib_bar10: Number(tags.VIB_CH10 ?? 0.40),
    vib_bar11: Number(tags.VIB_CH11 ?? 0.52),
    vib_bar12: Number(tags.VIB_CH12 ?? 0.48),
  };
}
