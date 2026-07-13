"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  HOME_SCENARIOS,
  applyHomeScenario,
  createInitialHomeState,
  metricTone,
  stepHomeSimulation,
  unitHref,
  type HomeMetric,
  type HomeScenario,
  type HomeUnitCard,
  type UnitStatus,
} from "@/lib/hmi/home-simulation";

function formatMetric(m: HomeMetric) {
  const primary = m.value.toFixed(m.digits);
  if (m.dual) {
    return `${primary} | ${m.dual.value.toFixed(m.dual.digits)}`;
  }
  return primary;
}

function StatusBadge({ status }: { status: UnitStatus }) {
  const styles =
    status === "ALARM"
      ? "border-red-400/50 bg-red-950/70 text-red-200"
      : status === "STANDBY"
        ? "border-amber-400/40 bg-amber-950/50 text-amber-200"
        : "border-emerald-400/35 bg-emerald-950/50 text-emerald-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider ${styles}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "ALARM"
            ? "animate-pulse bg-red-400"
            : status === "STANDBY"
              ? "bg-amber-400"
              : "bg-emerald-400"
        }`}
      />
      {status}
    </span>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(0.01, max - min);
  const w = 120;
  const h = 24;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline
        fill="none"
        stroke="#84cc16"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        opacity={0.9}
      />
    </svg>
  );
}

function SemiGauge({ value, max, alarm }: { value: number; max: number; alarm?: boolean }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const cx = 100;
  const cy = 96;
  const r = 74;
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const stroke = alarm ? "#f87171" : "#84cc16";
  // Semicircle length; dashoffset shrinks the visible fill with the value.
  const arcLen = Math.PI * r;
  const dashOffset = arcLen * (1 - pct);

  return (
    <div className="relative mx-auto h-[118px] w-[210px]">
      <svg
        viewBox="0 0 200 118"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <path
          d={arcPath}
          fill="none"
          stroke="rgba(148,163,184,0.28)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke={stroke}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <div className="absolute inset-x-0 top-[52px] text-center">
        <div className="text-[26px] font-semibold leading-none tracking-tight text-white tabular-nums">
          {value.toFixed(2)}
          <span className="ml-1.5 text-[13px] font-medium text-white/85">MW</span>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ metric }: { metric: HomeMetric }) {
  const tone = metricTone(metric);
  const valueWidth = metric.dual ? "min-w-[108px]" : "min-w-[64px]";
  const valueColor =
    tone === "alarm" ? "text-red-300" : tone === "warn" ? "text-amber-300" : "text-white";

  return (
    <div className="flex h-[30px] items-center justify-between gap-2 border-b border-white/[0.08] text-[12px] last:border-b-0">
      <span className="min-w-0 flex-1 truncate leading-none text-slate-300/85">
        {metric.label}
      </span>
      <div className="flex shrink-0 items-baseline gap-1.5 leading-none">
        <span className={`${valueWidth} text-right font-semibold tabular-nums ${valueColor}`}>
          {formatMetric(metric)}
        </span>
        <span className="w-[54px] text-right text-[11px] text-slate-400">{metric.unit}</span>
      </div>
    </div>
  );
}

function UnitCard({
  unit,
  scenario,
}: {
  unit: HomeUnitCard;
  scenario: HomeScenario;
}) {
  const alarmed = unit.status === "ALARM";
  const className = [
    "relative flex h-full flex-col rounded-[2px] border",
    alarmed ? "border-red-400/35 bg-[#1a0b12]/72" : "border-white/12 bg-[#071628]/68",
    "px-4 pb-3 pt-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-md",
    "transition-[border-color,background-color,transform] duration-200",
    unit.clickable ? "hover:border-lime-300/40 hover:bg-[#0a1f38]/78 hover:-translate-y-0.5" : "",
  ].join(" ");

  return (
    <div className={className}>
      {unit.clickable ? (
        <Link
          href={unitHref(unit.id, scenario)}
          className="absolute inset-0 z-10 rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
          aria-label={`Open ${unit.title} turbine page`}
        />
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="text-[13px] font-semibold tracking-[0.16em] text-white">{unit.title}</div>
        <StatusBadge status={unit.status} />
      </div>

      <SemiGauge value={unit.mw} max={unit.mwMax} alarm={alarmed} />

      <div className="mb-2 rounded border border-white/8 bg-black/20 px-2 py-1">
        <div className="mb-0.5 flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-500">
          <span>MW 30s</span>
          <span className="tabular-nums text-slate-400">{unit.mw.toFixed(1)}</span>
        </div>
        <Sparkline values={unit.mwHistory} />
      </div>

      <div className="flex flex-1 flex-col justify-start">
        {unit.metrics.map((m) => (
          <MetricRow key={m.label} metric={m} />
        ))}
      </div>

      {unit.clickable ? (
        <div className="pointer-events-none relative z-0 mt-2 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-lime-300/70">
          Open unit →
        </div>
      ) : (
        <div className="mt-2 h-[15px]" aria-hidden />
      )}
    </div>
  );
}

export function HomeDashboard() {
  const router = useRouter();
  const [state, setState] = useState(createInitialHomeState);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-GB", { hour12: false }) +
          " " +
          now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => stepHomeSimulation(prev));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "1") router.push(unitHref("gtg1", state.scenario));
      if (e.key === "2") router.push(unitHref("gtg2", state.scenario));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, state.scenario]);

  const alarmCount = useMemo(
    () => state.alarms.filter((a) => a.severity === "ALARM").length,
    [state.alarms]
  );
  const warnCount = useMemo(
    () => state.alarms.filter((a) => a.severity === "WARN").length,
    [state.alarms]
  );

  const setScenario = (scenario: HomeScenario) => {
    setState((prev) => applyHomeScenario(prev, scenario));
  };

  return (
    <div className="relative h-dvh w-full animate-[hmi-fade-in_280ms_ease-out] overflow-hidden bg-[#020617] font-sans text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/hmi/plant-night-bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-[#020617]/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-transparent to-[#020617]/65" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col px-8 py-5 lg:px-12">
        <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-start gap-4">
          <div>
            <div className="text-[22px] font-semibold leading-none tracking-wide text-white">
              Voltara
            </div>
            <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
              Plant Overview
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded border border-emerald-400/30 bg-emerald-950/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
              <span className="font-mono text-[11px] tabular-nums text-slate-300">{clock}</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-[24px] font-medium leading-none tracking-[0.06em] text-white">
              PLTGU SENIPAH
            </h1>
            <div className="mt-2 text-[46px] font-bold leading-none tracking-tight text-white tabular-nums">
              {state.totalMw.toFixed(2)}
              <span className="ml-2 text-[20px] font-semibold text-white/90">MW</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-2">
              <Link
                href="/trending"
                className="rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:border-lime-300/40 hover:bg-lime-400/10 hover:text-lime-100"
              >
                Trending →
              </Link>
              <Link
                href="/analysis"
                className="rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:border-sky-300/40 hover:bg-sky-400/10 hover:text-sky-100"
              >
                Analysis →
              </Link>
            </div>
            {alarmCount + warnCount > 0 ? (
              <Link
                href={unitHref("gtg1", state.scenario)}
                className={`inline-flex items-center gap-2 rounded border px-2.5 py-1.5 text-[11px] font-bold transition hover:brightness-110 ${
                  alarmCount > 0
                    ? "border-red-400/50 bg-red-950/70 text-red-100"
                    : "border-amber-400/40 bg-amber-950/60 text-amber-100"
                }`}
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                {alarmCount > 0
                  ? `${alarmCount} Active Alarm${alarmCount > 1 ? "s" : ""}`
                  : `${warnCount} Warning${warnCount > 1 ? "s" : ""}`}
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 rounded border border-emerald-400/25 bg-emerald-950/40 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300">
                Plant Normal
              </div>
            )}
            <div className="text-[10px] text-slate-500">Keys: 1 = GTG-1 · 2 = GTG-2</div>
          </div>
        </header>

        <div className="mt-4 flex shrink-0 flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Scenario
          </span>
          {HOME_SCENARIOS.map((s) => {
            const active = state.scenario === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenario(s.id)}
                className={`rounded border px-2.5 py-1 text-[11px] font-semibold transition ${
                  active
                    ? "border-lime-300/50 bg-lime-400/15 text-lime-200"
                    : "border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {state.alarms.length > 0 ? (
          <div className="mt-3 max-h-[52px] shrink-0 space-y-1 overflow-hidden">
            {state.alarms.slice(0, 2).map((a) => (
              <div
                key={a.id}
                className={`truncate rounded border px-2.5 py-1 font-mono text-[11px] ${
                  a.severity === "ALARM"
                    ? "border-red-400/30 bg-red-950/50 text-red-100"
                    : "border-amber-400/30 bg-amber-950/40 text-amber-100"
                }`}
              >
                <span className="mr-2 font-bold">{a.severity}</span>
                {a.message}
              </div>
            ))}
          </div>
        ) : null}

        <main className="mt-5 grid min-h-0 flex-1 grid-cols-3 content-start items-stretch gap-5 overflow-auto pb-2 lg:gap-6">
          {state.units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} scenario={state.scenario} />
          ))}
        </main>
      </div>
    </div>
  );
}
