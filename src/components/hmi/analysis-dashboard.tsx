"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  avg,
  createScatterState,
  engineHealth,
  formatTso,
  pctAboveEffRef,
  pctBelowMwRef,
  stepScatterState,
  type ScatterEngine,
  type ScatterEngineId,
  type ScatterHealth,
} from "@/lib/hmi/scatter-simulation";

const PAGE_BG = "#eef0f3";
const GRID = "#e8ebf0";

type LayoutId = "grid" | "focus";
type ChartKind = "mw" | "eff";

const HEALTH_META: Record<
  ScatterHealth,
  { label: string; className: string; dot: string }
> = {
  healthy: {
    label: "Healthy",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  watch: {
    label: "Watch",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  alert: {
    label: "Alert",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

/** Anchored to the chart only — no cursor-following portal (that lagged into the navbar). */
function ScatterTip({
  active,
  payload,
  kind,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { hours?: number; value?: number; band?: string } }>;
  kind: ChartKind;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (p?.hours == null || p?.value == null) return null;

  const isMw = kind === "mw";
  const color = isMw
    ? p.band === "warn"
      ? "#eab308"
      : "#22c55e"
    : p.band === "warn"
      ? "#1d4ed8"
      : "#2563eb";

  return (
    <div className="rounded-md border border-[#d5d9e0] bg-white px-2.5 py-1.5 text-[11px] text-[#111827] shadow-md">
      <div className="mb-1 font-semibold text-[#6b7280]">
        {isMw ? "GT Output" : "Compressor Efficiency"}
      </div>
      <div className="space-y-0.5 tabular-nums">
        <div className="flex justify-between gap-4">
          <span className="text-[#9ca3af]">Hours</span>
          <span className="font-semibold">{p.hours.toFixed(1)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-[#9ca3af]">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {isMw ? "Power" : "Δ Eff"}
          </span>
          <span className="font-semibold">
            {isMw ? `${p.value.toFixed(2)} MW` : `${p.value.toFixed(2)} %`}
          </span>
        </div>
      </div>
    </div>
  );
}

function HoursAxis() {
  const ticks = [0, 12, 24, 36, 48, 60, 72, 84, 99];
  return (
    <div className="px-9">
      <div className="relative h-px bg-[#d5d9e0]">
        {ticks.map((h) => (
          <span
            key={h}
            className="absolute top-0 h-1.5 w-px -translate-x-1/2 bg-[#cbd5e1]"
            style={{ left: `${(h / 99) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative mt-1 h-3">
        {ticks.map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2 font-mono text-[8px] tabular-nums text-[#9ca3af]"
            style={{ left: `${(h / 99) * 100}%` }}
          >
            {h}
          </span>
        ))}
      </div>
      <div className="mt-0.5 text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">
        Hours
      </div>
    </div>
  );
}

function EnginePanel({
  engine,
  focused,
  dimmed,
  onSelect,
}: {
  engine: ScatterEngine;
  focused: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  const health = engineHealth(engine);
  const healthUi = HEALTH_META[health];
  const mwAvg = avg(engine.mwPoints);
  const effAvg = avg(engine.effPoints);
  const belowRef = pctBelowMwRef(engine);
  const aboveEff = pctAboveEffRef(engine);

  const mwGood = engine.mwPoints.filter((p) => p.band === "good");
  const mwWarn = engine.mwPoints.filter((p) => p.band === "warn");
  const effGood = engine.effPoints.filter((p) => p.band === "good");
  const effWarn = engine.effPoints.filter((p) => p.band === "warn");

  return (
    <section
      className={`group flex min-h-0 flex-col overflow-hidden rounded-lg border bg-white transition duration-200 ${
        focused
          ? "border-[#93c5fd] shadow-[0_10px_30px_rgba(37,99,235,0.12)] ring-1 ring-[#bfdbfe]"
          : "border-[#d5d9e0] shadow-sm hover:border-[#c7d2fe] hover:shadow-md"
      } ${dimmed ? "opacity-45 grayscale-[0.25]" : "opacity-100"}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start justify-between gap-3 border-b border-[#eef0f3] px-3 py-2.5 text-left transition hover:bg-[#f8fafc]"
      >
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex h-3.5 min-w-[5.5rem] items-center justify-center rounded-sm bg-[#60a5fa] px-2 text-[10px] font-bold tracking-wide text-white shadow-sm">
              {engine.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${healthUi.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${healthUi.dot}`} />
              {healthUi.label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="rounded bg-[#f8fafc] px-1.5 py-1">
              <div className="text-[9px] uppercase tracking-wide text-[#9ca3af]">Avg MW</div>
              <div className="font-mono font-semibold tabular-nums text-[#111827]">
                {mwAvg.toFixed(1)}
                <span className="ml-0.5 text-[9px] font-medium text-[#9ca3af]">MW</span>
              </div>
            </div>
            <div className="rounded bg-[#f8fafc] px-1.5 py-1">
              <div className="text-[9px] uppercase tracking-wide text-[#9ca3af]">Below 30</div>
              <div className="font-mono font-semibold tabular-nums text-[#111827]">
                {belowRef.toFixed(0)}
                <span className="ml-0.5 text-[9px] font-medium text-[#9ca3af]">%</span>
              </div>
            </div>
            <div className="rounded bg-[#f8fafc] px-1.5 py-1">
              <div className="text-[9px] uppercase tracking-wide text-[#9ca3af]">Δ Eff</div>
              <div className="font-mono font-semibold tabular-nums text-[#111827]">
                {effAvg.toFixed(2)}
                <span className="ml-0.5 text-[9px] font-medium text-[#9ca3af]">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right font-mono text-[10px] leading-relaxed text-[#4b5563]">
          <div>
            <span className="text-[#9ca3af]">ESN</span> {engine.esn}
          </div>
          <div>
            <span className="text-[#9ca3af]">TSO</span> {formatTso(engine.tsoHours)}
          </div>
          <div>
            <span className="text-[#9ca3af]">Install</span> {engine.install}
          </div>
          <div className="mt-1 text-[9px] text-[#94a3b8] opacity-0 transition group-hover:opacity-100">
            Click to focus
          </div>
        </div>
      </button>

      <div className="min-h-0 flex-1 px-1 pb-2 pt-2">
        <div className="mb-1 flex items-center justify-between px-2">
          <div className="text-[11px] font-semibold text-[#374151]">GT Output Deterioration</div>
          <div className="font-mono text-[9px] tabular-nums text-[#94a3b8]">
            ref {engine.mwRef} MW · above-eff {aboveEff.toFixed(0)}%
          </div>
        </div>
        <div className="h-[42%] min-h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 6, right: 36, left: 2, bottom: 2 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis type="number" dataKey="hours" domain={[0, 99]} hide />
              <YAxis
                type="number"
                dataKey="value"
                domain={[0, 36]}
                ticks={[0, 6, 12, 18, 24, 30, 36]}
                tick={{ fill: "#6b7280", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={30}
                label={{
                  value: "MW",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#9ca3af",
                  fontSize: 9,
                }}
              />
              <ZAxis range={[28, 28]} />
              <ReferenceLine
                y={engine.mwRef}
                stroke="#64748b"
                strokeDasharray="4 3"
                label={{
                  value: `${engine.mwRef} MW`,
                  position: "right",
                  fill: "#64748b",
                  fontSize: 9,
                }}
              />
              <Tooltip
                cursor={false}
                isAnimationActive={false}
                wrapperStyle={{ zIndex: 20, outline: "none" }}
                content={<ScatterTip kind="mw" />}
              />
              <Scatter data={mwWarn} fill="#eab308" fillOpacity={0.8} isAnimationActive={false} />
              <Scatter data={mwGood} fill="#22c55e" fillOpacity={0.85} isAnimationActive={false} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <HoursAxis />

        <div className="h-[42%] min-h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 6, right: 36, left: 2, bottom: 4 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis type="number" dataKey="hours" domain={[0, 99]} hide />
              <YAxis
                type="number"
                dataKey="value"
                domain={[0, 2.5]}
                reversed
                ticks={[0, 0.5, 1, 1.5, 2, 2.5]}
                tick={{ fill: "#6b7280", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={30}
                label={{
                  value: "%",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#9ca3af",
                  fontSize: 9,
                }}
              />
              <ZAxis range={[26, 26]} />
              <ReferenceLine
                y={engine.effRef}
                stroke="#64748b"
                strokeDasharray="4 3"
                label={{
                  value: "-1%",
                  position: "right",
                  fill: "#64748b",
                  fontSize: 9,
                }}
              />
              <Tooltip
                cursor={false}
                isAnimationActive={false}
                wrapperStyle={{ zIndex: 20, outline: "none" }}
                content={<ScatterTip kind="eff" />}
              />
              <Scatter data={effWarn} fill="#1d4ed8" fillOpacity={0.55} isAnimationActive={false} />
              <Scatter data={effGood} fill="#2563eb" fillOpacity={0.8} isAnimationActive={false} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-1 text-center text-[11px] font-semibold text-[#374151]">
          Compressor Efficiency Deterioration
        </div>
      </div>
    </section>
  );
}

export function AnalysisDashboard() {
  const router = useRouter();
  const [engines, setEngines] = useState<ScatterEngine[] | null>(null);
  const [clock, setClock] = useState("");
  const [live, setLive] = useState(true);
  const [layout, setLayout] = useState<LayoutId>("grid");
  const [focusId, setFocusId] = useState<ScatterEngineId>("esn4001");

  useEffect(() => {
    setEngines(createScatterState());
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-GB", { hour12: false }) +
          " · " +
          now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!engines || !live) return;
    const id = setInterval(() => {
      setEngines((prev) => (prev ? stepScatterState(prev) : prev));
    }, 2200);
    return () => clearInterval(id);
  }, [engines != null, live]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (layout === "focus") {
          setLayout("grid");
          return;
        }
        router.push("/");
      }
      if (e.key === " ") {
        e.preventDefault();
        setLive((v) => !v);
      }
      if (e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4") {
        const idx = Number(e.key) - 1;
        const id = engines?.[idx]?.id;
        if (id) {
          setFocusId(id);
          setLayout("focus");
        }
      }
      if (e.key === "g" || e.key === "G") setLayout("grid");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engines, layout, router]);

  const summary = useMemo(() => {
    if (!engines) return null;
    const healthCounts = { healthy: 0, watch: 0, alert: 0 };
    let mwSum = 0;
    engines.forEach((e) => {
      healthCounts[engineHealth(e)] += 1;
      mwSum += avg(e.mwPoints);
    });
    return {
      healthCounts,
      fleetMw: mwSum / engines.length,
      worst: engines
        .slice()
        .sort((a, b) => avg(a.mwPoints) - avg(b.mwPoints))[0],
    };
  }, [engines]);

  const visibleEngines = useMemo(() => {
    if (!engines) return [];
    if (layout === "focus") return engines.filter((e) => e.id === focusId);
    return engines;
  }, [engines, focusId, layout]);

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden font-sans text-[#111827] animate-[hmi-fade-in_280ms_ease-out]"
      style={{ background: PAGE_BG }}
    >
      <header className="shrink-0 border-b border-[#d5d9e0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded border border-[#d5d9e0] bg-[#f8fafc] px-3 py-1.5 text-[12px] font-semibold text-[#374151] transition hover:border-[#93c5fd] hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
            >
              ← Back to Home
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#6b7280]">
                <Link href="/" className="hover:text-[#111827]">
                  Plant Overview
                </Link>
                <span className="text-[#9ca3af]">›</span>
                <span className="font-medium text-[#111827]">Engine Performance — Scatter Plot</span>
              </div>
              <div className="text-[11px] text-[#9ca3af]">
                GT output & compressor efficiency deterioration · live cloud simulation
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                live
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-[#d5d9e0] bg-[#f8fafc] text-[#6b7280]"
              }`}
              title="Space to toggle"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`}
              />
              {live ? "Live" : "Paused"}
            </button>
            <span className="font-mono text-[11px] tabular-nums text-[#6b7280]">{clock}</span>
            <Link
              href="/trending"
              className="rounded border border-[#d5d9e0] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#374151] hover:bg-white"
            >
              Trending
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f3] bg-[#f8fafc] px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded border border-[#d5d9e0] bg-white p-0.5">
              {(
                [
                  { id: "grid" as const, label: "All engines" },
                  { id: "focus" as const, label: "Single engine" },
                ]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLayout(opt.id)}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    layout === opt.id
                      ? "bg-[#0f172a] text-white"
                      : "text-[#6b7280] hover:bg-[#f1f5f9] hover:text-[#111827]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {engines?.map((e, i) => {
              const health = engineHealth(e);
              const active = focusId === e.id && layout === "focus";
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setFocusId(e.id);
                    setLayout("focus");
                  }}
                  className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-semibold transition ${
                    active
                      ? "border-[#93c5fd] bg-[#eff6ff] text-[#1d4ed8]"
                      : "border-[#d5d9e0] bg-white text-[#4b5563] hover:border-[#bfdbfe]"
                  }`}
                  title={`Key ${i + 1}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${HEALTH_META[health].dot}`} />
                  ESN {e.esn}
                </button>
              );
            })}
          </div>

          {summary ? (
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6b7280]">
              <span>
                Fleet avg{" "}
                <span className="font-mono font-semibold text-[#111827]">
                  {summary.fleetMw.toFixed(1)} MW
                </span>
              </span>
              <span className="text-[#d1d5db]">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {summary.healthCounts.healthy}
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {summary.healthCounts.watch}
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {summary.healthCounts.alert}
              </span>
              <span className="text-[#d1d5db]">·</span>
              <span>
                Lowest{" "}
                <button
                  type="button"
                  className="font-semibold text-[#1d4ed8] hover:underline"
                  onClick={() => {
                    if (!summary.worst) return;
                    setFocusId(summary.worst.id);
                    setLayout("focus");
                  }}
                >
                  ESN {summary.worst?.esn}
                </button>
              </span>
            </div>
          ) : null}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-auto p-3 md:p-4">
        {!engines ? (
          <div className="grid h-full grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-[#d5d9e0] bg-white p-4 shadow-sm">
                <div className="mb-3 h-8 w-40 rounded bg-slate-200" />
                <div className="mb-2 grid grid-cols-3 gap-2">
                  <div className="h-10 rounded bg-slate-100" />
                  <div className="h-10 rounded bg-slate-100" />
                  <div className="h-10 rounded bg-slate-100" />
                </div>
                <div className="mb-3 h-[38%] rounded bg-slate-100" />
                <div className="h-[38%] rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`grid h-full gap-3 ${
              layout === "focus"
                ? "min-h-[640px] grid-cols-1"
                : "min-h-[780px] grid-cols-1 md:grid-cols-2"
            }`}
          >
            {visibleEngines.map((engine) => (
              <EnginePanel
                key={engine.id}
                engine={engine}
                focused={layout === "focus" || focusId === engine.id}
                dimmed={false}
                onSelect={() => {
                  if (layout === "focus" && focusId === engine.id) {
                    setLayout("grid");
                    return;
                  }
                  setFocusId(engine.id);
                  setLayout("focus");
                }}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#d5d9e0] bg-white px-4 py-2 text-[10px] text-[#6b7280]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            MW nominal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#eab308]" />
            MW watch
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
            Efficiency cloud
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-px w-4 border-t border-dashed border-[#64748b]" />
            Reference line
          </span>
        </div>
        <div className="text-[#9ca3af]">
          Keys: <span className="font-mono">1–4</span> focus · <span className="font-mono">G</span> grid ·{" "}
          <span className="font-mono">Space</span> pause · <span className="font-mono">Esc</span> back
        </div>
      </footer>
    </div>
  );
}
