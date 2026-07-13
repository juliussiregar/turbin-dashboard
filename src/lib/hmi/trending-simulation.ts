export type TrendSeriesId = "gtg1" | "gtg2" | "stg" | "aux1" | "aux2" | "bus";

export type TrendSeriesMeta = {
  id: TrendSeriesId;
  label: string;
  /** Colorblind-safe palette */
  color: string;
  /** Optional dash pattern for extra distinction */
  strokeDasharray?: string;
};

export type TrendMetricId = "mw" | "current" | "freq" | "voltage" | "egt" | "vacuum";

export type TrendRangeId = "1h" | "24h" | "7d" | "30d";

export type TrendLayoutId = "comparison" | "focus";

export type TrendPoint = {
  t: number;
  label: string;
  idx: number;
} & Record<TrendSeriesId, number>;

export type TrendEvent = {
  idx: number;
  t: number;
  label: string;
  title: string;
  kind: "trip" | "outage";
};

export const TREND_SERIES: TrendSeriesMeta[] = [
  { id: "gtg1", label: "GTG-1", color: "#0072B2" },
  { id: "gtg2", label: "GTG-2", color: "#E69F00" },
  { id: "stg", label: "STG", color: "#009E73" },
  { id: "aux1", label: "AUX-1", color: "#CC79A7" },
  { id: "aux2", label: "AUX-2", color: "#56B4E9", strokeDasharray: "7 4" },
  { id: "bus", label: "BUS", color: "#D55E00", strokeDasharray: "2 3" },
];

export const TREND_RANGES: {
  id: TrendRangeId;
  label: string;
  durationMs: number;
  stepMs: number;
  points: number;
}[] = [
  { id: "1h", label: "1h", durationMs: 60 * 60 * 1000, stepMs: 30 * 1000, points: 120 },
  { id: "24h", label: "24h", durationMs: 24 * 60 * 60 * 1000, stepMs: 10 * 60 * 1000, points: 144 },
  { id: "7d", label: "7d", durationMs: 7 * 24 * 60 * 60 * 1000, stepMs: 60 * 60 * 1000, points: 168 },
  { id: "30d", label: "30d", durationMs: 30 * 24 * 60 * 60 * 1000, stepMs: 60 * 60 * 1000, points: 240 },
];

export type MetricProfile = {
  id: TrendMetricId;
  title: string;
  unit: string;
  yMin: number;
  yMax: number;
  baselines: Record<TrendSeriesId, number>;
  noise: number;
  tripFloor: number;
  digits: number;
};

export const TREND_METRICS: MetricProfile[] = [
  {
    id: "mw",
    title: "Active Power (MW)",
    unit: "MW",
    yMin: -5,
    yMax: 35,
    baselines: { gtg1: 28, gtg2: 30, stg: 18, aux1: 22, aux2: 24, bus: 26 },
    noise: 1.2,
    tripFloor: 0,
    digits: 2,
  },
  {
    id: "current",
    title: "Phase Current (A)",
    unit: "A",
    yMin: -300,
    yMax: 1800,
    baselines: { gtg1: 1250, gtg2: 1380, stg: 820, aux1: 980, aux2: 1100, bus: 1450 },
    noise: 45,
    tripFloor: 0,
    digits: 0,
  },
  {
    id: "freq",
    title: "Frequency (Hz)",
    unit: "Hz",
    yMin: 0,
    yMax: 60,
    baselines: { gtg1: 50, gtg2: 50, stg: 50, aux1: 50, aux2: 49.9, bus: 50.1 },
    noise: 0.08,
    tripFloor: 0,
    digits: 2,
  },
  {
    id: "voltage",
    title: "Phase Voltage (kV)",
    unit: "kV",
    yMin: -2,
    yMax: 12,
    baselines: { gtg1: 11.1, gtg2: 11.0, stg: 10.9, aux1: 11.2, aux2: 10.8, bus: 11.0 },
    noise: 0.12,
    tripFloor: 0,
    digits: 2,
  },
  {
    id: "egt",
    title: "Exhaust Gas Temp (°C)",
    unit: "°C",
    yMin: 400,
    yMax: 900,
    baselines: { gtg1: 802, gtg2: 799, stg: 520, aux1: 610, aux2: 640, bus: 700 },
    noise: 6,
    tripFloor: 420,
    digits: 0,
  },
  {
    id: "vacuum",
    title: "Vacuum Pressure (barA)",
    unit: "barA",
    yMin: 0,
    yMax: 0.6,
    baselines: { gtg1: 0.22, gtg2: 0.23, stg: 0.24, aux1: 0.21, aux2: 0.25, bus: 0.2 },
    noise: 0.01,
    tripFloor: 0.45,
    digits: 3,
  },
];

export const DEFAULT_PANEL_METRICS: TrendMetricId[] = ["mw", "current", "freq", "voltage"];

function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function formatTick(t: number, rangeId: TrendRangeId) {
  const d = new Date(t);
  if (rangeId === "1h" || rangeId === "24h") {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function trippedAtFraction(seriesId: TrendSeriesId, frac: number) {
  const inShared = frac > 0.58 && frac < 0.72;
  if (seriesId === "gtg1" || seriesId === "stg" || seriesId === "aux1") {
    return inShared || (frac > 0.8 && frac < 0.84);
  }
  if (seriesId === "bus") return frac > 0.62 && frac < 0.7;
  return inShared && frac > 0.64;
}

function sampleValue(metric: MetricProfile, seriesId: TrendSeriesId, t: number, frac: number, now: number) {
  const base = metric.baselines[seriesId];
  const slow = Math.sin(t / 3_600_000 + hash(seriesId.length) * 6) * metric.noise * 0.6;
  const fast = (hash(t / 60_000 + seriesId.charCodeAt(0)) - 0.5) * metric.noise;
  let v = base + slow + fast;

  if (trippedAtFraction(seriesId, frac)) {
    v = metric.tripFloor + (hash(t) - 0.5) * metric.noise * 0.05;
  } else if (metric.id === "freq" && hash(t / 120_000 + 3) > 0.992) {
    v = 0;
  }

  const tip = Math.max(0, 1 - (now - t) / 120_000);
  v += tip * (hash(now / 1000 + seriesId.charCodeAt(1)) - 0.5) * metric.noise * 0.25;

  return Number(v.toFixed(metric.digits));
}

export function getMetric(id: TrendMetricId) {
  return TREND_METRICS.find((m) => m.id === id)!;
}

export function createTrendSeries(
  metricId: TrendMetricId,
  rangeId: TrendRangeId,
  now = Date.now()
): TrendPoint[] {
  const metric = getMetric(metricId);
  const range = TREND_RANGES.find((r) => r.id === rangeId)!;
  const points: TrendPoint[] = [];

  for (let i = 0; i < range.points; i++) {
    const frac = i / (range.points - 1);
    const t = now - range.durationMs + frac * range.durationMs;
    const row = {
      t,
      label: formatTick(t, rangeId),
      idx: i,
    } as TrendPoint;

    for (const s of TREND_SERIES) {
      row[s.id] = sampleValue(metric, s.id, t, frac, now);
    }
    points.push(row);
  }

  return points;
}

export function createAllTrendSeries(rangeId: TrendRangeId, now = Date.now()) {
  const map = {} as Record<TrendMetricId, TrendPoint[]>;
  for (const m of TREND_METRICS) {
    map[m.id] = createTrendSeries(m.id, rangeId, now);
  }
  return map;
}

export function stepAllTrendSeries(
  prev: Record<TrendMetricId, TrendPoint[]>,
  rangeId: TrendRangeId,
  now = Date.now()
) {
  const next = {} as Record<TrendMetricId, TrendPoint[]>;
  for (const m of TREND_METRICS) {
    next[m.id] = stepTrendSeries(prev[m.id] ?? createTrendSeries(m.id, rangeId, now), m.id, rangeId, now);
  }
  return next;
}

export function stepTrendSeries(
  prev: TrendPoint[],
  metricId: TrendMetricId,
  rangeId: TrendRangeId,
  now = Date.now()
): TrendPoint[] {
  const metric = getMetric(metricId);
  const range = TREND_RANGES.find((r) => r.id === rangeId)!;
  const sliced = prev.slice(1);
  const lastT = prev[prev.length - 1]?.t ?? now;
  const t = Math.max(now, lastT + range.stepMs / 4);
  const row = {
    t,
    label: formatTick(t, rangeId),
    idx: (prev[prev.length - 1]?.idx ?? 0) + 1,
  } as TrendPoint;

  for (const s of TREND_SERIES) {
    const prevVal = prev[prev.length - 1]?.[s.id] ?? metric.baselines[s.id];
    const target = sampleValue(metric, s.id, t, 1, now);
    row[s.id] = Number((prevVal * 0.82 + target * 0.18).toFixed(metric.digits));
  }

  sliced.push(row);
  // reindex for brush/events stability within window
  return sliced.map((p, i) => ({ ...p, idx: i }));
}

/** Shared plant events aligned to the same fractional windows as trip drops. */
export function createTrendEvents(points: TrendPoint[]): TrendEvent[] {
  if (points.length < 4) return [];
  const n = points.length - 1;
  const specs: { frac: number; title: string; kind: TrendEvent["kind"] }[] = [
    { frac: 0.58, title: "Outage start", kind: "outage" },
    { frac: 0.72, title: "Recovery", kind: "outage" },
    { frac: 0.8, title: "Trip / Outage", kind: "trip" },
  ];

  return specs.map((s) => {
    const idx = Math.min(n, Math.max(0, Math.round(s.frac * n)));
    const p = points[idx];
    return {
      idx,
      t: p.t,
      label: p.label,
      title: s.title,
      kind: s.kind,
    };
  });
}

export function latestStrip(
  points: TrendPoint[],
  metric: MetricProfile,
  seriesFilter?: TrendSeriesId[]
) {
  const last = points[points.length - 1];
  if (!last) return [];
  const list = seriesFilter?.length
    ? TREND_SERIES.filter((s) => seriesFilter.includes(s.id))
    : TREND_SERIES;
  return list.map((s) => ({
    id: s.id,
    label: s.label,
    color: s.color,
    text: `${s.label} ${Number(last[s.id]).toFixed(metric.digits)} ${metric.unit}`,
  }));
}
