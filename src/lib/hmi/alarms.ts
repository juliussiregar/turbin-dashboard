export type AlarmSeverity = "ALARM" | "WARNING" | "INFO";
export type AlarmAckState = "active" | "acked";

export type HmiAlarm = {
  id: string;
  time: string;
  tagId: string;
  message: string;
  severity: AlarmSeverity;
  state: AlarmAckState;
};

function clockStamp() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

let alarmSeq = 0;

export function createAlarm(
  tagId: string,
  message: string,
  severity: AlarmSeverity = "ALARM"
): HmiAlarm {
  alarmSeq += 1;
  return {
    id: `alm-${Date.now()}-${alarmSeq}`,
    time: clockStamp(),
    tagId,
    message,
    severity,
    state: "active",
  };
}

/** Derive new alarms from simulation mode/tag transitions. */
export function detectAlarms(prev: {
  mode: string;
  vibA: number;
  lube: number;
  mw: number;
}, next: {
  mode: string;
  vibA: number;
  lube: number;
  mw: number;
}): HmiAlarm[] {
  const out: HmiAlarm[] = [];

  if (prev.mode !== "TRIP" && next.mode === "TRIP") {
    out.push(createAlarm("SEQ", "UNIT TRIP — emergency sequence active", "ALARM"));
  }
  if (next.vibA > 1.6 && prev.vibA <= 1.6) {
    out.push(createAlarm("VIB_A", `High vibration VIB-A ${next.vibA.toFixed(2)} in/s`, "ALARM"));
  } else if (next.vibA > 1.0 && prev.vibA <= 1.0) {
    out.push(createAlarm("VIB_A", `Vibration rising VIB-A ${next.vibA.toFixed(2)} in/s`, "WARNING"));
  }
  if (next.lube < 25 && prev.lube >= 25) {
    out.push(createAlarm("LUBE_OIL_PRESS", `Low lube oil pressure ${next.lube.toFixed(1)} psig`, "ALARM"));
  }

  return out;
}

export function acknowledgeAll(alarms: HmiAlarm[]): HmiAlarm[] {
  return alarms.map((a) => (a.state === "active" ? { ...a, state: "acked" as const } : a));
}

export function pruneAlarms(alarms: HmiAlarm[], max = 12): HmiAlarm[] {
  return alarms.slice(0, max);
}
