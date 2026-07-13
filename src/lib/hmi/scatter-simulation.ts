export type ScatterEngineId = "esn4001" | "esn4003" | "esn4009" | "esn4011";

export type ScatterPoint = {
  hours: number;
  value: number;
  band: "good" | "warn";
};

export type ScatterEngine = {
  id: ScatterEngineId;
  label: string;
  esn: string;
  tsoHours: number;
  install: string;
  mwPoints: ScatterPoint[];
  effPoints: ScatterPoint[];
  mwRef: number;
  effRef: number;
};

export type ScatterHealth = "healthy" | "watch" | "alert";

function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Approx normal via Box-Muller for a looser, more natural cloud. */
function gaussian(seed: number) {
  const u1 = Math.max(1e-6, hash(seed));
  const u2 = hash(seed + 19.17);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function makeCloud(
  seed: number,
  count: number,
  yBase: number,
  ySpread: number,
  hoursMax = 99,
  bandMode: "mw" | "eff" = "mw"
): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  for (let i = 0; i < count; i++) {
    // Stratify hours so the cloud fills 0→99 instead of clumping.
    const slot = i / count;
    const jitter = (hash(seed + i * 5.3) - 0.5) * (hoursMax / count) * 2.4;
    const hours = Math.min(hoursMax, Math.max(0, slot * hoursMax + jitter));

    // Mix gaussian core + wider uniform wings + light hour drift.
    const core = gaussian(seed + i * 11.1) * ySpread * 0.55;
    const wing = (hash(seed + i * 17.9) - 0.5) * ySpread * 1.35;
    const drift = (hours / hoursMax) * ySpread * 0.28;
    const outlier =
      hash(seed + i * 29.4) > 0.92 ? (hash(seed + i * 31.2) - 0.5) * ySpread * 1.8 : 0;
    const value = yBase + core + wing - drift + outlier;

    const band =
      bandMode === "mw"
        ? value >= yBase - ySpread * 0.35
          ? "good"
          : "warn"
        : value <= yBase + ySpread * 0.35
          ? "good"
          : "warn";

    points.push({
      hours: Number(hours.toFixed(2)),
      value: Number(value.toFixed(3)),
      band,
    });
  }
  return points;
}

const ENGINE_SEEDS: {
  id: ScatterEngineId;
  label: string;
  esn: string;
  tsoHours: number;
  install: string;
  mwBase: number;
  effBase: number;
}[] = [
  {
    id: "esn4001",
    label: "GTG-1 A",
    esn: "4001",
    tsoHours: 12480,
    install: "12 Mar 2022",
    mwBase: 27.8,
    effBase: 1.15,
  },
  {
    id: "esn4003",
    label: "GTG-1 B",
    esn: "4003",
    tsoHours: 11820,
    install: "04 Jun 2022",
    mwBase: 26.4,
    effBase: 1.35,
  },
  {
    id: "esn4009",
    label: "GTG-2 A",
    esn: "4009",
    tsoHours: 9420,
    install: "19 Jan 2023",
    mwBase: 28.6,
    effBase: 1.05,
  },
  {
    id: "esn4011",
    label: "GTG-2 B",
    esn: "4011",
    tsoHours: 8760,
    install: "02 Aug 2023",
    mwBase: 27.2,
    effBase: 1.22,
  },
];

export function createScatterState(now = Date.now()): ScatterEngine[] {
  return ENGINE_SEEDS.map((e, idx) => {
    const seed = Number(e.esn) * 13 + idx * 97 + Math.floor(now / 60_000);
    return {
      id: e.id,
      label: e.label,
      esn: e.esn,
      tsoHours: e.tsoHours,
      install: e.install,
      mwRef: 30,
      effRef: 1,
      mwPoints: makeCloud(seed, 120, e.mwBase, 6.5, 99, "mw"),
      effPoints: makeCloud(seed + 211, 110, e.effBase, 0.95, 99, "eff"),
    };
  });
}

/** Slow jitter so the scatter cloud gently moves. */
export function stepScatterState(prev: ScatterEngine[]): ScatterEngine[] {
  return prev.map((engine, ei) => ({
    ...engine,
    mwPoints: engine.mwPoints.map((p, i) => {
      // Update every 3rd point per tick — lighter redraw, still looks alive.
      if (i % 3 !== (Math.floor(Date.now() / 2200) + ei) % 3) return p;
      const n = (hash(Date.now() / 7000 + ei * 11 + i) - 0.5) * 0.22;
      const next = Math.min(34.5, Math.max(16, p.value + n));
      return {
        ...p,
        value: Number(next.toFixed(3)),
        band: next >= 26.5 ? "good" : "warn",
      };
    }),
    effPoints: engine.effPoints.map((p, i) => {
      if (i % 3 !== (Math.floor(Date.now() / 2200) + ei + 1) % 3) return p;
      const n = (hash(Date.now() / 8000 + ei * 13 + i * 2) - 0.5) * 0.03;
      const next = Math.min(2.45, Math.max(0.35, p.value + n));
      return {
        ...p,
        value: Number(next.toFixed(3)),
        band: next <= 1.35 ? "good" : "warn",
      };
    }),
  }));
}

export function avg(points: ScatterPoint[]) {
  if (!points.length) return 0;
  return points.reduce((s, p) => s + p.value, 0) / points.length;
}

export function pctBelowMwRef(engine: ScatterEngine) {
  if (!engine.mwPoints.length) return 0;
  const below = engine.mwPoints.filter((p) => p.value < engine.mwRef).length;
  return (below / engine.mwPoints.length) * 100;
}

export function pctAboveEffRef(engine: ScatterEngine) {
  if (!engine.effPoints.length) return 0;
  const above = engine.effPoints.filter((p) => p.value > engine.effRef).length;
  return (above / engine.effPoints.length) * 100;
}

export function engineHealth(engine: ScatterEngine): ScatterHealth {
  const mwGap = engine.mwRef - avg(engine.mwPoints);
  const effGap = avg(engine.effPoints) - engine.effRef;
  if (mwGap > 3.2 || effGap > 0.35) return "alert";
  if (mwGap > 2.2 || effGap > 0.2) return "watch";
  return "healthy";
}

export function formatTso(hours: number) {
  return `${hours.toLocaleString("en-US")} h`;
}
