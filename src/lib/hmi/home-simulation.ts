export type HomeMetric = {
  label: string;
  value: number;
  unit: string;
  digits: number;
  dual?: { value: number; digits: number };
  /** Optional warn/alarm thresholds for POC coloring */
  warnAt?: number;
  alarmAt?: number;
  /** true = higher is worse (default), false = lower is worse */
  highBad?: boolean;
};

export type UnitStatus = "RUNNING" | "STANDBY" | "ALARM";
export type HomeScenario = "normal" | "load_ramp" | "trip_demo";
export type HomeUnitId = "gtg1" | "gtg2" | "hrsg";

export type HomeAlarm = {
  id: string;
  unitId: HomeUnitId;
  message: string;
  severity: "ALARM" | "WARN";
};

export type HomeUnitCard = {
  id: HomeUnitId;
  title: string;
  mw: number;
  mwMax: number;
  mwTarget: number;
  status: UnitStatus;
  clickable: boolean;
  metrics: HomeMetric[];
  mwHistory: number[];
};

export type HomeDashboardState = {
  totalMw: number;
  scenario: HomeScenario;
  units: HomeUnitCard[];
  alarms: HomeAlarm[];
};

const HISTORY_LEN = 28;

function jitter(value: number, amount: number, min?: number, max?: number) {
  const next = value + (Math.random() * 2 - 1) * amount;
  if (min != null && max != null) return Math.min(max, Math.max(min, next));
  return next;
}

function pushMwHistory(history: number[], mw: number) {
  const next = [...history, mw];
  return next.length > HISTORY_LEN ? next.slice(next.length - HISTORY_LEN) : next;
}

function seedHistory(mw: number) {
  return Array.from({ length: 12 }, (_, i) => mw + Math.sin(i / 2) * 0.15);
}

function gtgMetrics(overrides?: Partial<Record<string, number>>): HomeMetric[] {
  return [
    {
      label: "Exhaust Gas Temperature",
      value: overrides?.egt ?? 802,
      unit: "°C",
      digits: 0,
      warnAt: 805,
      alarmAt: 820,
      highBad: true,
    },
    { label: "Ambient Temperature", value: overrides?.amb ?? 25.27, unit: "°C", digits: 2 },
    {
      label: "Compressor Discharge Pressure",
      value: overrides?.cdp ?? 18.96,
      unit: "barg",
      digits: 2,
      warnAt: 17.5,
      highBad: false,
    },
    { label: "Inlet Filter Combustion DP", value: overrides?.dp ?? 74, unit: "mmH₂O", digits: 0 },
    { label: "Heat Rate", value: 0, unit: "Btu/kWh", digits: 0 },
    { label: "Time Since Overhaul", value: overrides?.tso ?? 22541, unit: "H", digits: 0 },
  ];
}

function hrsgMetrics(): HomeMetric[] {
  return [
    {
      label: "Vacuum Pressure",
      value: 0.233,
      unit: "barA",
      digits: 3,
      warnAt: 0.28,
      alarmAt: 0.35,
      highBad: true,
    },
    { label: "Condenser Temperature", value: 62.88, unit: "°C", digits: 2, warnAt: 70, highBad: true },
    {
      label: "HP / LP Steam Flow #1",
      value: 37.3,
      unit: "t/h",
      digits: 2,
      dual: { value: 9.9, digits: 2 },
    },
    {
      label: "HP / LP Steam Flow #2",
      value: 32.1,
      unit: "t/h",
      digits: 2,
      dual: { value: 9.1, digits: 2 },
    },
    { label: "Governing Valve", value: 100, unit: "%", digits: 2 },
    /** Spacer row so HRSG card height matches GTGs */
    { label: "Steam Turbine Speed", value: 3000, unit: "rpm", digits: 0 },
  ];
}

export function createInitialHomeState(): HomeDashboardState {
  const gtg1Mw = 28.77;
  const gtg2Mw = 30.33;
  const hrsgMw = 18.09;

  return {
    totalMw: gtg1Mw + gtg2Mw + hrsgMw,
    scenario: "normal",
    alarms: [],
    units: [
      {
        id: "gtg1",
        title: "GTG-1",
        mw: gtg1Mw,
        mwMax: 40,
        mwTarget: gtg1Mw,
        status: "RUNNING",
        clickable: true,
        metrics: gtgMetrics({ egt: 802, amb: 25.27, cdp: 18.96, dp: 74, tso: 22541 }),
        mwHistory: seedHistory(gtg1Mw),
      },
      {
        id: "gtg2",
        title: "GTG-2",
        mw: gtg2Mw,
        mwMax: 40,
        mwTarget: gtg2Mw,
        status: "RUNNING",
        clickable: true,
        metrics: gtgMetrics({ egt: 799, amb: 25.93, cdp: 19.68, dp: 78, tso: 4071 }),
        mwHistory: seedHistory(gtg2Mw),
      },
      {
        id: "hrsg",
        title: "HRSG",
        mw: hrsgMw,
        mwMax: 40,
        mwTarget: hrsgMw,
        status: "RUNNING",
        clickable: false,
        metrics: hrsgMetrics(),
        mwHistory: seedHistory(hrsgMw),
      },
    ],
  };
}

export function applyHomeScenario(
  prev: HomeDashboardState,
  scenario: HomeScenario
): HomeDashboardState {
  if (scenario === "normal") {
    const base = createInitialHomeState();
    return { ...base, scenario: "normal" };
  }

  if (scenario === "load_ramp") {
    return {
      ...prev,
      scenario,
      alarms: [],
      units: prev.units.map((u) => ({
        ...u,
        status: "RUNNING" as const,
        mwTarget: u.id === "hrsg" ? 22 : u.id === "gtg1" ? 34 : 35,
      })),
    };
  }

  // trip_demo — GTG-1 trips
  return {
    ...prev,
    scenario,
    alarms: [
      {
        id: "trip-gtg1",
        unitId: "gtg1",
        message: "GTG-1 UNIT TRIP — high vibration / sequence abort",
        severity: "ALARM",
      },
      {
        id: "warn-egt",
        unitId: "gtg1",
        message: "GTG-1 Exhaust Gas Temperature elevated",
        severity: "WARN",
      },
    ],
    units: prev.units.map((u) => {
      if (u.id === "gtg1") {
        return {
          ...u,
          status: "ALARM" as const,
          mwTarget: 0,
          metrics: u.metrics.map((m) =>
            m.label === "Exhaust Gas Temperature" ? { ...m, value: 828 } : m
          ),
        };
      }
      if (u.id === "gtg2") {
        return { ...u, status: "RUNNING" as const, mwTarget: 32 };
      }
      return { ...u, status: "STANDBY" as const, mwTarget: 8 };
    }),
  };
}

export function stepHomeSimulation(prev: HomeDashboardState): HomeDashboardState {
  const units = prev.units.map((unit) => {
    const towardTarget = unit.mw + (unit.mwTarget - unit.mw) * 0.12;
    const noise =
      unit.status === "ALARM"
        ? jitter(0, 0.05)
        : prev.scenario === "load_ramp"
          ? jitter(0, 0.12)
          : jitter(0, 0.08);

    let mw = towardTarget + noise;
    if (unit.status === "ALARM") mw = Math.max(0, Math.min(mw, 2.5));
    else mw = Math.max(0, Math.min(unit.mwMax * 0.95, mw));

    const metrics = unit.metrics.map((m) => {
      if (m.label === "Heat Rate" || m.label === "Time Since Overhaul" || m.label === "Steam Turbine Speed") {
        return m;
      }
      if (m.label === "Governing Valve") {
        const base = unit.status === "ALARM" ? 0 : 100;
        return { ...m, value: jitter(base, unit.status === "ALARM" ? 0.5 : 0.15, 0, 100) };
      }
      if (unit.status === "ALARM" && m.label === "Exhaust Gas Temperature") {
        return { ...m, value: jitter(m.value, 2, 810, 835) };
      }

      let amount = 0.4;
      if (m.digits === 0) amount = 1.2;
      else if (m.digits === 3) amount = 0.004;
      else if (m.digits === 2) amount = 0.06;

      const next: HomeMetric = {
        ...m,
        value: jitter(m.value, amount),
      };

      if (m.dual) {
        next.dual = {
          ...m.dual,
          value: jitter(m.dual.value, 0.05),
        };
      }

      return next;
    });

    let status = unit.status;
    if (prev.scenario !== "trip_demo" || unit.id !== "gtg1") {
      const egt = metrics.find((m) => m.label === "Exhaust Gas Temperature");
      if (egt && egt.alarmAt != null && egt.value >= egt.alarmAt) status = "ALARM";
      else if (unit.status !== "ALARM") status = unit.mw < 1 ? "STANDBY" : "RUNNING";
    }

    return {
      ...unit,
      mw,
      status,
      metrics,
      mwHistory: pushMwHistory(unit.mwHistory, mw),
    };
  });

  const totalMw = units.reduce((sum, u) => sum + u.mw, 0);

  let alarms = prev.alarms;
  if (prev.scenario !== "trip_demo") {
    const derived: HomeAlarm[] = [];
    for (const u of units) {
      for (const m of u.metrics) {
        if (m.alarmAt == null) continue;
        const highBad = m.highBad !== false;
        const isAlarm = highBad ? m.value >= m.alarmAt : m.value <= m.alarmAt;
        const isWarn =
          m.warnAt != null && (highBad ? m.value >= m.warnAt : m.value <= m.warnAt);
        if (isAlarm) {
          derived.push({
            id: `${u.id}-${m.label}-alarm`,
            unitId: u.id,
            message: `${u.title} ${m.label} ${m.value.toFixed(m.digits)} ${m.unit}`,
            severity: "ALARM",
          });
        } else if (isWarn) {
          derived.push({
            id: `${u.id}-${m.label}-warn`,
            unitId: u.id,
            message: `${u.title} ${m.label} approaching limit`,
            severity: "WARN",
          });
        }
      }
    }
    alarms = derived.slice(0, 4);
  }

  return { ...prev, totalMw, units, alarms };
}

export function metricTone(m: HomeMetric): "normal" | "warn" | "alarm" {
  const highBad = m.highBad !== false;
  if (m.alarmAt != null) {
    if (highBad ? m.value >= m.alarmAt : m.value <= m.alarmAt) return "alarm";
  }
  if (m.warnAt != null) {
    if (highBad ? m.value >= m.warnAt : m.value <= m.warnAt) return "warn";
  }
  return "normal";
}

export const HOME_SCENARIOS: { id: HomeScenario; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "load_ramp", label: "Load Ramp" },
  { id: "trip_demo", label: "Trip Demo" },
];

export function unitHref(unitId: HomeUnitId, scenario?: HomeScenario) {
  const params = new URLSearchParams({ unit: unitId });
  if (scenario && scenario !== "normal") params.set("demo", scenario);
  return `/turbine?${params.toString()}`;
}
