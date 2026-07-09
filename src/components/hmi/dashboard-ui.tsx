"use client";

import type { ReactNode } from "react";

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
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-md border border-slate-600/60 bg-slate-800/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-sm ${className}`}
    >
      <header className="border-b border-slate-600/50 bg-gradient-to-r from-slate-700/90 to-slate-800/90 px-2 py-1 text-center text-[10px] font-bold tracking-wide text-slate-100">
        {title}
      </header>
      <div className="min-h-0 flex-1 overflow-hidden p-1.5">{children}</div>
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
    <div className="flex items-baseline justify-between gap-2 border-b border-slate-700/40 py-[2px] text-[9.5px] leading-tight last:border-0">
      <span className="truncate font-medium text-slate-400">{label}</span>
      <span className={`shrink-0 font-mono font-semibold ${highlight ? "text-cyan-300" : "text-sky-400"}`}>
        {value}
        {unit ? <span className="ml-0.5 text-[8px] text-slate-500">{unit}</span> : null}
      </span>
    </div>
  );
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
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
      : tone === "bad"
        ? "border-red-500/40 bg-red-500/15 text-red-300"
        : tone === "active"
          ? "border-sky-500/40 bg-sky-500/15 text-sky-300"
          : "border-slate-500/40 bg-slate-700/40 text-slate-300";

  return (
    <div className={`rounded border px-2 py-1 ${toneClass}`}>
      <div className="text-[8px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-[10px] font-bold">{status}</div>
    </div>
  );
}

export function NavButton({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`w-full rounded border px-2 py-1 text-left text-[9.5px] font-semibold transition ${
        active
          ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
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
}: {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "danger" | "ghost";
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
      className={`rounded border px-2 py-1 text-[9px] font-bold tracking-wide shadow-sm transition ${cls}`}
    >
      {label}
    </button>
  );
}

export function KpiChip({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-md border border-slate-600/50 bg-slate-900/60 px-2 py-1">
      <div className="text-[8px] font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-mono text-[11px] font-bold text-cyan-300">
        {value}
        {unit ? <span className="ml-1 text-[9px] font-normal text-slate-400">{unit}</span> : null}
      </div>
    </div>
  );
}

export function DigitalReadout({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded border border-emerald-500/30 bg-black/70 px-2 py-1 shadow-[inset_0_0_12px_rgba(16,185,129,0.08)]">
      <div className="text-[8px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="font-mono text-xl font-bold leading-none text-emerald-400">
        {value}
        {unit ? <span className="ml-1 text-xs text-emerald-600">{unit}</span> : null}
      </div>
    </div>
  );
}
