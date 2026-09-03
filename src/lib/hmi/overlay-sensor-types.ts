/** Display values rendered in SolidBox / PctBox. */
export type HmiOverlayDisplayValue = string;

export type HmiSensorState = {
  te0057: HmiOverlayDisplayValue;
  te0021: HmiOverlayDisplayValue;
  te0022: HmiOverlayDisplayValue;
  pt0183: HmiOverlayDisplayValue;
  te0023: HmiOverlayDisplayValue;
  gen_kv: HmiOverlayDisplayValue;
  gen_pf: HmiOverlayDisplayValue;
  gen_mvar: HmiOverlayDisplayValue;
  gen_mva: HmiOverlayDisplayValue;
  gen_f: HmiOverlayDisplayValue;
  bus_f: HmiOverlayDisplayValue;
  te0079: HmiOverlayDisplayValue;
  te0080: HmiOverlayDisplayValue;
  te0082: HmiOverlayDisplayValue;
  te0081: HmiOverlayDisplayValue;
  vigv: HmiOverlayDisplayValue;
  vbv: HmiOverlayDisplayValue;
  vsv: HmiOverlayDisplayValue;
  dmd1: HmiOverlayDisplayValue;
  fb1: HmiOverlayDisplayValue;
  dmd2: HmiOverlayDisplayValue;
  fb2: HmiOverlayDisplayValue;
  dmd: HmiOverlayDisplayValue;
  dmd3: HmiOverlayDisplayValue;
  fb3: HmiOverlayDisplayValue;
  mot0109: boolean;
  mot0108b: boolean;
  mot0108a: boolean;
  mot0085: boolean;
  mot0129: boolean;
  mot2100: boolean;
  motNox: boolean;
  motNox2: boolean;
  sov2110: boolean;
  vGas1: boolean;
  vGas2: boolean;
  vGas3: boolean;
  vGas4: boolean;
  vGas6: boolean;
  fcv2019: boolean;
  mot6015: boolean;
  /** Enclosure cooling fans — spin only when true. */
  fan4103a: boolean;
  fan4103b: boolean;
  fan4017a: boolean;
  fan4017b: boolean;

  // Water Wash specific tags
  ww_pdt5000: HmiOverlayDisplayValue;
  ww_pt5001: HmiOverlayDisplayValue;
  ww_lt5042: HmiOverlayDisplayValue;
  ww_te5040a1: HmiOverlayDisplayValue;
  ww_pt5041: HmiOverlayDisplayValue;
  ww_sov5032: boolean;
  ww_sov5033: boolean;
  ww_sov5039: boolean;
  ww_mot5035: boolean;
  ww_he5044: boolean;
  ww_he5036: boolean;
  ww_time_remain: HmiOverlayDisplayValue;
  ww_soak_remain: HmiOverlayDisplayValue;

  // Water Inj Nox specific tags
  nox_val1: HmiOverlayDisplayValue;
  nox_val2: HmiOverlayDisplayValue;
  nox_water_status: boolean;
  nox_val6: HmiOverlayDisplayValue;
  nox_val7: HmiOverlayDisplayValue;
  nox_val8: HmiOverlayDisplayValue;
  nox_val9: HmiOverlayDisplayValue;
  nox_val10: HmiOverlayDisplayValue;
  nox_val11: HmiOverlayDisplayValue;
  nox_val12: HmiOverlayDisplayValue;
  nox_val13: HmiOverlayDisplayValue;
  nox_val14: HmiOverlayDisplayValue;
  nox_val15: HmiOverlayDisplayValue;
  nox_val16: HmiOverlayDisplayValue;
  nox_val17: HmiOverlayDisplayValue;

  // Vibration Monitoring specific tags
  vib_top1: HmiOverlayDisplayValue;
  vib_top2: HmiOverlayDisplayValue;
  vib_top3: HmiOverlayDisplayValue;
  vib_top4: HmiOverlayDisplayValue;
  vib_top5: HmiOverlayDisplayValue;
  vib_top6: HmiOverlayDisplayValue;
  vib_top7: HmiOverlayDisplayValue;
  vib_top8: HmiOverlayDisplayValue;
  vib_top9: HmiOverlayDisplayValue;
  vib_top10: HmiOverlayDisplayValue;
  vib_top11: HmiOverlayDisplayValue;
  vib_top12: HmiOverlayDisplayValue;
  vib_top13: HmiOverlayDisplayValue;
  vib_top14: HmiOverlayDisplayValue;
  vib_top15: HmiOverlayDisplayValue;
  vib_top16: HmiOverlayDisplayValue;
  vib_top17: HmiOverlayDisplayValue;

  vib_ch1: HmiOverlayDisplayValue;
  vib_ch2: HmiOverlayDisplayValue;
  vib_ch3: HmiOverlayDisplayValue;
  vib_ch4: HmiOverlayDisplayValue;
  vib_ch5: HmiOverlayDisplayValue;
  vib_ch6: HmiOverlayDisplayValue;
  vib_ch7: HmiOverlayDisplayValue;
  vib_ch8: HmiOverlayDisplayValue;
  vib_ch9: HmiOverlayDisplayValue;
  vib_ch10: HmiOverlayDisplayValue;
  vib_ch11: HmiOverlayDisplayValue;
  vib_ch12: HmiOverlayDisplayValue;

  vib_bar1: number;
  vib_bar2: number;
  vib_bar3: number;
  vib_bar4: number;
  vib_bar5: number;
  vib_bar6: number;
  vib_bar7: number;
  vib_bar8: number;
  vib_bar9: number;
  vib_bar10: number;
  vib_bar11: number;
  vib_bar12: number;
};
