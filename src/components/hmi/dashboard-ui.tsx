"use client";

import type { ReactNode } from "react";
import type { HmiAlarm } from "@/lib/hmi/alarms";

export function fmt(value: unknown, digits = 1) {
  if (typeof value === "number") return value.toFixed(digits);
  if (typeof value === "string" || typeof value === "boolean") return String(value);
  if (value == null) return "-";
  return JSON.stringify(value);
}

export function Panel({
  title,
  children,
  className = "",
  accent,
  compact,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  accent?: "cyan" | "amber" | "emerald" | "rose";
  compact?: boolean;
}) {
  const accentBar =
    accent === "amber"
      ? "from-amber-500/80 to-amber-700/40"
      : accent === "emerald"
        ? "from-emerald-500/80 to-emerald-700/40"
        : accent === "rose"
          ? "from-rose-500/80 to-rose-700/40"
          : "from-cyan-500/70 to-sky-700/30";

  return (
    <section
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-md border border-slate-600/70 bg-[#0f1724]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_10px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accentBar}`} />
      <header
        className={`shrink-0 border-b border-slate-700/70 bg-[#152033] px-2.5 font-mono text-left font-bold uppercase tracking-[0.08em] text-slate-200 ${
          compact ? "py-1 text-[9px]" : "py-1.5 text-[10px]"
        }`}
      >
        {title}
      </header>
      <div className={`min-h-0 flex-1 overflow-hidden ${compact ? "p-1" : "p-1.5"}`}>{children}</div>
    </section>
  );
}

export function DataLine({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-800/70 py-[3px] text-[10px] leading-none last:border-0">
      <span className="min-w-0 truncate font-medium text-slate-500">{label}</span>
      <span
        className={`shrink-0 font-mono text-[11px] font-semibold tabular-nums ${
          highlight ? "text-cyan-300" : "text-[#5ec8ff]"
        }`}
      >
        {value}
        {unit ? <span className="ml-1 text-[8px] font-normal text-slate-500">{unit}</span> : null}
      </span>
    </div>
  );
}

/** Live numeric row — calm updates, no flash (avoids flicker on 1s jitter). */
export function LiveDataLine({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) {
  return <DataLine label={label} value={value} unit={unit} highlight={highlight} />;
}

export function StatusPill({
  label,
  status,
  tone = "neutral",
}: {
  label: string;
  status: string;
  tone?: "good" | "bad" | "active" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-300"
      : tone === "bad"
        ? "border-red-500/45 bg-red-500/10 text-red-300"
        : tone === "active"
          ? "border-sky-500/45 bg-sky-500/10 text-sky-300"
          : "border-slate-600/50 bg-slate-800/50 text-slate-400";

  return (
    <div className={`rounded border px-2 py-1 ${toneClass}`}>
      <div className="text-[8px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-[10px] font-bold">{status}</div>
    </div>
  );
}

/** Classic HMI lamp + label row. */
export function StatusLamp({
  label,
  on,
  onLabel = "ON",
  offLabel = "OFF",
  invert,
}: {
  label: string;
  on: boolean;
  onLabel?: string;
  offLabel?: string;
  /** When true, ON is red (alarm/run motor style) instead of green. */
  invert?: boolean;
}) {
  const lit = on;
  const color = invert
    ? lit
      ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.85)]"
      : "bg-emerald-600/80 shadow-[0_0_6px_rgba(16,185,129,0.35)]"
    : lit
      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]"
      : "bg-slate-600";

  return (
    <div className="flex items-center gap-1.5 rounded border border-slate-700/60 bg-slate-900/50 px-1.5 py-1">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[8px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className={`text-[10px] font-bold ${lit ? (invert ? "text-red-300" : "text-emerald-300") : "text-slate-400"}`}>
          {lit ? onLabel : offLabel}
        </div>
      </div>
    </div>
  );
}

export function Sparkline({
  values,
  stroke = "#22d3ee",
  fill = "rgba(34,211,238,0.10)",
  height = 28,
  domainMin,
  domainMax,
}: {
  values: number[];
  stroke?: string;
  fill?: string;
  height?: number;
  /** Fixed Y domain keeps the chart from jumping when values jitter. */
  domainMin?: number;
  domainMax?: number;
}) {
  const w = 120;
  const h = height;
  if (values.length < 2) {
    return <div style={{ height: h }} className="w-full rounded bg-slate-900/40" />;
  }

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const min = domainMin ?? dataMin;
  const max = domainMax ?? dataMax;
  // Pad slightly so the line does not hug the edges; never collapse span.
  const pad = (max - min) * 0.08 || Math.abs(max) * 0.02 || 1;
  const yMin = min - pad;
  const yMax = max + pad;
  const span = yMax - yMin || 1;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - yMin) / span) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = pts.join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <polygon points={area} fill={fill} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function TrendCard({
  label,
  value,
  unit,
  series,
  stroke,
  domainMin,
  domainMax,
}: {
  label: string;
  value: string;
  unit?: string;
  series: number[];
  stroke?: string;
  domainMin?: number;
  domainMax?: number;
}) {
  return (
    <div className="rounded border border-slate-700/70 bg-slate-950/70 p-1.5">
      <div className="flex items-baseline justify-between gap-1">
        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="font-mono text-[11px] font-bold tabular-nums text-cyan-200">
          {value}
          {unit ? <span className="ml-0.5 text-[8px] font-normal text-slate-500">{unit}</span> : null}
        </span>
      </div>
      <div className="mt-1 h-7">
        <Sparkline values={series} stroke={stroke} domainMin={domainMin} domainMax={domainMax} />
      </div>
    </div>
  );
}

export function AlarmStrip({
  alarms,
  onAck,
  onOpen,
  tripActive,
}: {
  alarms: HmiAlarm[];
  onAck?: () => void;
  onOpen?: () => void;
  tripActive?: boolean;
}) {
  const active = alarms.filter((a) => a.state === "active");
  const top = alarms.find((a) => a.state === "active") ?? alarms[0];
  const hasAlarm = tripActive || active.some((a) => a.severity === "ALARM");
  const hasWarn = active.some((a) => a.severity === "WARNING");

  const barClass = hasAlarm
    ? "border-red-500/60 bg-red-950/85 text-red-50 shadow-[inset_0_0_20px_rgba(239,68,68,0.25)]"
    : hasWarn
      ? "border-amber-500/35 bg-amber-950/60 text-amber-100"
      : top
        ? "border-slate-600/60 bg-slate-900/80 text-slate-300"
        : "border-emerald-500/25 bg-emerald-950/40 text-emerald-300";

  const message = tripActive
    ? "UNIT TRIP ACTIVE — acknowledge alarms, then Reset to clear"
    : top
      ? null
      : "No active alarms — unit monitoring normal";

  return (
    <div className={`flex min-h-[30px] items-center gap-2 rounded-md border px-2.5 py-1 ${barClass}`}>
      <span className="shrink-0 font-mono text-[9px] font-black uppercase tracking-wider opacity-90">
        {hasAlarm ? "ALARM" : hasWarn ? "WARN" : top ? "EVENT" : "NORMAL"}
      </span>
      <div className="min-w-0 flex-1 truncate font-mono text-[11px] tabular-nums">
        {message ? (
          message
        ) : top ? (
          <>
            <span className="opacity-60">{top.time}</span> · {top.message}
            {active.length > 1 ? <span className="opacity-70"> (+{active.length - 1})</span> : null}
          </>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded border border-white/15 bg-black/25 px-1.5 py-0.5 text-[8px] font-bold uppercase hover:bg-black/40"
      >
        List
      </button>
      <button
        type="button"
        onClick={onAck}
        disabled={active.length === 0}
        className="shrink-0 rounded border border-white/15 bg-black/25 px-1.5 py-0.5 text-[8px] font-bold uppercase enabled:hover:bg-black/40 disabled:opacity-40"
      >
        Ack
      </button>
    </div>
  );
}

export function AlarmListPanel({
  alarms,
  open,
  onClose,
}: {
  alarms: HmiAlarm[];
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="absolute bottom-[4.5rem] left-4 right-4 z-[60] overflow-hidden rounded-md border border-slate-500/60 bg-slate-950 shadow-2xl md:bottom-4 md:left-auto md:right-[160px] md:z-30 md:w-[380px]">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-3 py-2">
        <span className="text-[11px] font-bold tracking-wide text-slate-200">ALARM / EVENT LIST</span>
        <button type="button" onClick={onClose} className="text-[11px] font-bold text-slate-400 hover:text-white">
          CLOSE
        </button>
      </div>
      <div className="max-h-56 overflow-y-auto">
        {alarms.length === 0 ? (
          <div className="p-4 text-[11px] text-slate-500">No events yet.</div>
        ) : (
          alarms.map((a) => (
            <div
              key={a.id}
              className={`border-b border-slate-800 px-3 py-2 text-[11px] ${
                a.state === "active" && a.severity === "ALARM"
                  ? "bg-red-950/40 text-red-200"
                  : a.state === "active" && a.severity === "WARNING"
                    ? "bg-amber-950/30 text-amber-100"
                    : "text-slate-400"
              }`}
            >
              <div className="flex justify-between gap-2 font-mono">
                <span>{a.time}</span>
                <span className="uppercase opacity-70">
                  {a.severity}
                  {a.state === "acked" ? " · ACK" : ""}
                </span>
              </div>
              <div className="mt-1 leading-snug">{a.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function NavButton({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full truncate rounded border px-1.5 py-0.5 text-left text-[9px] font-semibold transition ${
        active
          ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
          : "border-slate-600/50 bg-slate-800/70 text-slate-200 hover:border-cyan-500/30 hover:bg-slate-700/80"
      }`}
    >
      {label}
    </button>
  );
}

export function ActionButton({
  label,
  onClick,
  variant = "primary",
  disabled,
  emphasize,
}: {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "danger" | "ghost";
  disabled?: boolean;
  emphasize?: boolean;
}) {
  const cls =
    variant === "danger"
      ? "border-red-500/50 bg-gradient-to-b from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600"
      : variant === "ghost"
        ? "border-slate-500/50 bg-slate-700/60 text-slate-200 hover:bg-slate-600/70"
        : "border-sky-500/40 bg-gradient-to-b from-sky-600 to-sky-700 text-white hover:from-sky-500 hover:to-sky-600";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded border px-2 py-1 font-mono text-[9px] font-bold tracking-wide shadow-sm transition disabled:opacity-40 ${cls} ${
        emphasize ? "ring-2 ring-red-400/70 ring-offset-1 ring-offset-slate-950" : ""
      }`}
    >
      {label}
    </button>
  );
}

export function KpiChip({
  label,
  value,
  unit,
  emphasize,
  tip,
}: {
  label: string;
  value: string;
  unit?: string;
  emphasize?: boolean;
  tip?: string;
}) {
  return (
    <div
      className={`group relative min-w-0 rounded-md border px-3 py-2 ${
        emphasize
          ? "border-cyan-400/40 bg-gradient-to-b from-cyan-950/80 to-slate-950"
          : "border-slate-600/50 bg-slate-950/70"
      }`}
    >
      <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div
        className={`mt-0.5 font-mono font-bold tabular-nums ${
          emphasize ? "text-base text-white" : "text-[15px] text-cyan-300"
        }`}
      >
        {value}
        {unit ? <span className="ml-1.5 text-[11px] font-normal text-slate-400">{unit}</span> : null}
      </div>
      {tip ? (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1 w-max max-w-[200px] -translate-x-1/2 rounded border border-slate-600 bg-slate-950 px-2 py-1 text-center font-sans text-[10px] font-normal normal-case leading-snug tracking-normal text-slate-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {tip}
        </div>
      ) : null}
    </div>
  );
}

export function DemoBar({
  onStart,
  onTrip,
  onReset,
  tripActive,
}: {
  onStart: () => void;
  onTrip: () => void;
  onReset: () => void;
  tripActive: boolean;
}) {
  return (
    <div className="flex w-full flex-wrap items-center gap-3 rounded-md border border-slate-600/60 bg-slate-950/70 px-2.5 py-1.5 sm:w-auto sm:gap-2">
      <span className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">Demo</span>
      <div className="flex flex-1 items-center gap-1.5">
        <button
          type="button"
          onClick={onStart}
          className="flex-1 shrink-0 rounded border border-sky-500/40 bg-sky-700/40 px-2 py-1 text-center font-mono text-[9px] font-bold text-sky-100 hover:bg-sky-600/50 sm:flex-none"
        >
          Start Seq
        </button>
        <button
          type="button"
          onClick={onTrip}
          className="flex-1 shrink-0 rounded border border-amber-500/40 bg-amber-800/40 px-2 py-1 text-center font-mono text-[9px] font-bold text-amber-100 hover:bg-amber-700/50 sm:flex-none"
        >
          Force Trip
        </button>
        <button
          type="button"
          onClick={onReset}
          className={`flex-1 shrink-0 rounded border px-2 py-1 text-center font-mono text-[9px] font-bold sm:flex-none ${
            tripActive
              ? "border-red-400/70 bg-red-600 text-white ring-2 ring-red-400/50"
              : "border-slate-500/50 bg-slate-700/50 text-slate-200 hover:bg-slate-600/60"
          }`}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export function DigitalReadout({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded border border-emerald-500/35 bg-black/80 px-2 py-1.5 shadow-[inset_0_0_16px_rgba(16,185,129,0.1)]">
      <div className="text-[8px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="font-mono text-xl font-bold leading-none tabular-nums text-emerald-400">
        {value}
        {unit ? <span className="ml-1 text-xs text-emerald-700">{unit}</span> : null}
      </div>
    </div>
  );
}
