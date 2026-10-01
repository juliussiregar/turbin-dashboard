"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { DashboardNavbar } from "@/components/hmi/dashboard-navbar";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PresetId = "performance" | "generator" | "condition";
type UnitId = "gtg1" | "gtg2" | "compare";
type RangeId = "live" | "1h" | "8h" | "24h" | "7d";
type WidgetId =
  | "power"
  | "speed"
  | "exhaust"
  | "fuel"
  | "operating"
  | "voltage"
  | "frequency"
  | "power-factor"
  | "reactive"
  | "generator-summary"
  | "vibration"
  | "lube"
  | "bearing"
  | "health-summary";

type VisualizationType = "line" | "area" | "bar" | "gauge" | "stat";

export type PersonalPresetConfig = {
  id: string;
  name: string;
  description: string;
  defaultUnit: UnitId;
  defaultRange: RangeId;
  widgets: { widgetId: string; visualization: VisualizationType }[];
  createdAt: string;
};

const VISUALIZATION_LABELS: Record<VisualizationType, string> = {
  line: "Line",
  area: "Area",
  bar: "Bars",
  gauge: "Gauge",
  stat: "Stat",
};

const WIDGET_VISUALIZATIONS: Record<WidgetId, { default: VisualizationType; allowed: VisualizationType[] }> = {
  power: { default: "line", allowed: ["line", "area", "stat"] },
  speed: { default: "line", allowed: ["line", "stat"] },
  exhaust: { default: "area", allowed: ["area", "line", "stat"] },
  fuel: { default: "area", allowed: ["area", "bar", "stat"] },
  operating: { default: "stat", allowed: ["stat"] },
  voltage: { default: "area", allowed: ["area", "line", "stat"] },
  frequency: { default: "line", allowed: ["line", "stat"] },
  "power-factor": { default: "gauge", allowed: ["gauge", "stat"] },
  reactive: { default: "bar", allowed: ["bar", "line", "stat"] },
  "generator-summary": { default: "stat", allowed: ["stat"] },
  vibration: { default: "line", allowed: ["line", "bar", "stat"] },
  lube: { default: "gauge", allowed: ["gauge", "stat"] },
  bearing: { default: "area", allowed: ["area", "line", "bar", "stat"] },
  "health-summary": { default: "stat", allowed: ["stat"] },
};

type WidgetDefinition = {
  id: WidgetId;
  title: string;
  description: string;
  group: string;
  size?: "wide";
};

type PresetDefinition = {
  id: PresetId;
  label: string;
  eyebrow: string;
  description: string;
  widgets: WidgetDefinition[];
  defaults: WidgetId[];
};

const PRESETS: PresetDefinition[] = [
  {
    id: "performance",
    label: "Unit Performance",
    eyebrow: "Output & efficiency",
    description: "Production, turbine response, temperature, and fuel demand in one operational view.",
    widgets: [
      { id: "power", title: "Power output", description: "Actual output against dispatch setpoint", group: "Power", size: "wide" },
      { id: "speed", title: "Turbine speed", description: "Compressor and load-shaft response", group: "Speed & temperature" },
      { id: "exhaust", title: "Exhaust temperature", description: "T48 operating trend and high limit", group: "Speed & temperature" },
      { id: "fuel", title: "Fuel consumption", description: "Fuel flow and control demand", group: "Efficiency" },
      { id: "operating", title: "Current operating values", description: "Key performance indicators at a glance", group: "Efficiency", size: "wide" },
    ],
    defaults: ["power", "speed", "exhaust", "fuel"],
  },
  {
    id: "generator",
    label: "Generator",
    eyebrow: "Electrical performance",
    description: "Electrical output, stability, loading, and generator health for the selected unit.",
    widgets: [
      { id: "power", title: "Active power", description: "Generated power against setpoint", group: "Output", size: "wide" },
      { id: "voltage", title: "Terminal voltage", description: "Three-phase voltage trend", group: "Electrical" },
      { id: "frequency", title: "Grid frequency", description: "Frequency stability around nominal", group: "Electrical" },
      { id: "power-factor", title: "Power factor", description: "Generator power factor trend", group: "Loading" },
      { id: "reactive", title: "Reactive power", description: "MVAR loading and response", group: "Loading" },
      { id: "generator-summary", title: "Generator summary", description: "Present electrical measurements", group: "Summary", size: "wide" },
    ],
    defaults: ["power", "voltage", "frequency", "generator-summary"],
  },
  {
    id: "condition",
    label: "Condition Monitoring",
    eyebrow: "Asset health",
    description: "Vibration, bearing temperature, and lubrication indicators for early anomaly detection.",
    widgets: [
      { id: "vibration", title: "Vibration", description: "Drive-end and non-drive-end channels", group: "Mechanical", size: "wide" },
      { id: "bearing", title: "Bearing temperature", description: "Journal bearing thermal behavior", group: "Mechanical" },
      { id: "lube", title: "Lube oil pressure", description: "Supply pressure and low alarm level", group: "Lubrication" },
      { id: "exhaust", title: "Exhaust temperature", description: "Thermal loading indicator", group: "Thermal" },
      { id: "health-summary", title: "Condition summary", description: "Current health values and condition", group: "Summary", size: "wide" },
    ],
    defaults: ["vibration", "bearing", "lube", "health-summary"],
  },
];

const WIDGET_CATALOG = new Map<WidgetId, WidgetDefinition>();
for (const preset of PRESETS) {
  for (const widget of preset.widgets) {
    if (!WIDGET_CATALOG.has(widget.id)) WIDGET_CATALOG.set(widget.id, widget);
  }
}

const PERSONAL_PRESET_STORAGE_KEY = "voltara-personal-dashboard-presets";

function subscribeToPersonalPresets(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

function getPersonalPresetsSnapshot() {
  return window.localStorage.getItem(PERSONAL_PRESET_STORAGE_KEY) ?? "[]";
}

function getPersonalPresetsServerSnapshot() {
  return "[]";
}

const RANGE_LABELS: Record<RangeId, string> = {
  live: "Live · 15 min",
  "1h": "Last hour",
  "8h": "Last 8 hours",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
};

const COLORS = { blue: "#2563eb", cyan: "#0891b2", amber: "#d97706", violet: "#7c3aed", red: "#dc2626" };

function makeSeries(range: RangeId, tick: number) {
  const count = range === "live" ? 30 : range === "1h" ? 36 : range === "8h" ? 48 : 56;
  return Array.from({ length: count }, (_, index) => {
    const phase = index + tick * 0.16;
    const label = range === "7d" ? `D${Math.floor(index / 8) + 1}` : `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`;
    return {
      label,
      mw1: 25.4 + Math.sin(phase / 4.8) * 1.15 + Math.cos(phase / 2.2) * 0.22,
      mw2: 27.1 + Math.sin(phase / 5.1 + 0.7) * 0.95,
      setpoint: 26,
      n25a: 10018 + Math.sin(phase / 4) * 22,
      n25b: 10034 + Math.sin(phase / 4.3 + 0.5) * 19,
      nsd: 3905 + Math.cos(phase / 5) * 11,
      exhaust1: 816 + Math.sin(phase / 5.8) * 13,
      exhaust2: 808 + Math.sin(phase / 6.2 + 0.9) * 11,
      fuel1: 1240 + Math.sin(phase / 4.6) * 38,
      fuel2: 1295 + Math.sin(phase / 4.9 + 0.6) * 31,
      demand: 1260 + Math.sin(phase / 5.2) * 20,
      voltage1: 11.08 + Math.sin(phase / 6) * 0.07,
      voltage2: 11.02 + Math.sin(phase / 5.4 + 0.4) * 0.06,
      frequency1: 50 + Math.sin(phase / 3.4) * 0.035,
      frequency2: 50.01 + Math.cos(phase / 3.8) * 0.03,
      pf1: 0.93 + Math.sin(phase / 6.3) * 0.012,
      pf2: 0.91 + Math.cos(phase / 5.7) * 0.014,
      mvar1: 9.8 + Math.sin(phase / 4.7) * 0.7,
      mvar2: 10.6 + Math.sin(phase / 5.2 + 0.7) * 0.6,
      vibrationA: 0.42 + Math.sin(phase / 3.5) * 0.035,
      vibrationB: 0.38 + Math.cos(phase / 4.1) * 0.03,
      bearingA: 166 + Math.sin(phase / 5) * 2.4,
      bearingB: 163 + Math.cos(phase / 5.8) * 2.1,
      lube1: 62.5 + Math.sin(phase / 4.5) * 0.65,
      lube2: 63.2 + Math.cos(phase / 5) * 0.55,
    };
  });
}

function SelectControl({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="flex min-w-[150px] flex-1 flex-col gap-1 lg:flex-none">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
        {children}
      </select>
    </label>
  );
}

function SummaryCard({ label, value, detail, tone = "blue" }: { label: string; value: string; detail: string; tone?: "blue" | "green" | "amber" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`h-2 w-2 rounded-full ring-4 ${tones[tone]}`} />
      </div>
      <div className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

function presetSummaries(presetId: PresetId, unit: UnitId, data: ReturnType<typeof makeSeries>) {
  const latest = data[data.length - 1];
  const unitTwo = unit === "gtg2";
  const compare = unit === "compare";
  const mw = compare ? latest.mw1 + latest.mw2 : unitTwo ? latest.mw2 : latest.mw1;

  if (presetId === "generator") {
    const voltage = unitTwo ? latest.voltage2 : latest.voltage1;
    const frequency = unitTwo ? latest.frequency2 : latest.frequency1;
    const powerFactor = unitTwo ? latest.pf2 : latest.pf1;
    return [
      { label: "Active power", value: `${mw.toFixed(1)} MW`, detail: compare ? "Combined generator output" : "Stable against dispatch target" },
      { label: "Terminal voltage", value: compare ? "11.08 / 11.02 kV" : `${voltage.toFixed(2)} kV`, detail: "Within operating band", tone: "green" as const },
      { label: "Grid frequency", value: compare ? "50.00 Hz" : `${frequency.toFixed(2)} Hz`, detail: "Nominal frequency maintained", tone: "green" as const },
      { label: "Power factor", value: compare ? "0.92 avg" : powerFactor.toFixed(2), detail: "Target ≥ 0.90", tone: "green" as const },
    ];
  }

  if (presetId === "condition") {
    return [
      { label: "Health score", value: unitTwo ? "90 / 100" : compare ? "91 / 100" : "92 / 100", detail: "Overall equipment condition", tone: "green" as const },
      { label: "Maximum vibration", value: `${Math.max(latest.vibrationA, latest.vibrationB).toFixed(2)} in/s`, detail: "Below alarm threshold", tone: "green" as const },
      { label: "Maximum bearing", value: `${Math.max(latest.bearingA, latest.bearingB).toFixed(0)} °F`, detail: "Thermal condition normal", tone: "green" as const },
      { label: "Condition alerts", value: "0", detail: "No active condition alerts", tone: "green" as const },
    ];
  }

  const exhaust = compare ? Math.max(latest.exhaust1, latest.exhaust2) : unitTwo ? latest.exhaust2 : latest.exhaust1;
  const fuel = compare ? latest.fuel1 + latest.fuel2 : unitTwo ? latest.fuel2 : latest.fuel1;
  return [
    { label: "MW output", value: `${mw.toFixed(1)} MW`, detail: compare ? "Combined generation" : "Near current dispatch target" },
    { label: "Operating mode", value: "LOADED", detail: "Run permissive available", tone: "green" as const },
    { label: "Exhaust temperature", value: `${exhaust.toFixed(0)} °C`, detail: compare ? "Highest selected-unit value" : "Within normal operating band", tone: "green" as const },
    { label: "Fuel flow", value: `${fuel.toFixed(0)} kg/h`, detail: compare ? "Combined fuel consumption" : "Following control demand", tone: "blue" as const },
  ];
}

function personalPresetSummaries(widgetIds: WidgetId[], unit: UnitId, data: ReturnType<typeof makeSeries>) {
  const latest = data[data.length - 1];
  const unitTwo = unit === "gtg2";
  const compare = unit === "compare";
  const mw = compare ? latest.mw1 + latest.mw2 : unitTwo ? latest.mw2 : latest.mw1;
  const summariesByWidget: Partial<Record<WidgetId, { label: string; value: string; detail: string; tone?: "blue" | "green" | "amber" }>> = {
    power: { label: "MW output", value: `${mw.toFixed(1)} MW`, detail: compare ? "Combined generation" : "Near dispatch target" },
    speed: { label: "Turbine speed", value: `${(unitTwo ? latest.n25b : latest.n25a).toFixed(0)} rpm`, detail: "Current N25 speed", tone: "green" },
    exhaust: { label: "Exhaust temperature", value: `${(compare ? Math.max(latest.exhaust1, latest.exhaust2) : unitTwo ? latest.exhaust2 : latest.exhaust1).toFixed(0)} °C`, detail: "Within operating band", tone: "green" },
    fuel: { label: "Fuel flow", value: `${(compare ? latest.fuel1 + latest.fuel2 : unitTwo ? latest.fuel2 : latest.fuel1).toFixed(0)} kg/h`, detail: compare ? "Combined consumption" : "Following demand" },
    voltage: { label: "Terminal voltage", value: compare ? "11.08 / 11.02 kV" : `${(unitTwo ? latest.voltage2 : latest.voltage1).toFixed(2)} kV`, detail: "Within operating band", tone: "green" },
    frequency: { label: "Grid frequency", value: compare ? "50.00 Hz" : `${(unitTwo ? latest.frequency2 : latest.frequency1).toFixed(2)} Hz`, detail: "Nominal maintained", tone: "green" },
    "power-factor": { label: "Power factor", value: compare ? "0.92 avg" : (unitTwo ? latest.pf2 : latest.pf1).toFixed(2), detail: "Target ≥ 0.90", tone: "green" },
    reactive: { label: "Reactive power", value: `${(compare ? latest.mvar1 + latest.mvar2 : unitTwo ? latest.mvar2 : latest.mvar1).toFixed(1)} MVAR`, detail: compare ? "Combined reactive load" : "Current reactive load" },
    vibration: { label: "Maximum vibration", value: `${Math.max(latest.vibrationA, latest.vibrationB).toFixed(2)} in/s`, detail: "Below alarm threshold", tone: "green" },
    bearing: { label: "Maximum bearing", value: `${Math.max(latest.bearingA, latest.bearingB).toFixed(0)} °F`, detail: "Thermal condition normal", tone: "green" },
    lube: { label: "Lube oil pressure", value: `${(unitTwo ? latest.lube2 : latest.lube1).toFixed(1)} psig`, detail: "Within operating range", tone: "green" },
    operating: { label: "Operating mode", value: "LOADED", detail: "Run permissive available", tone: "green" },
    "generator-summary": { label: "Generator status", value: "ONLINE", detail: "Synchronized to grid", tone: "green" },
    "health-summary": { label: "Health score", value: unitTwo ? "90 / 100" : compare ? "91 / 100" : "92 / 100", detail: "Overall equipment condition", tone: "green" },
  };

  const summaries = widgetIds.map((id) => summariesByWidget[id]).filter((summary): summary is NonNullable<typeof summary> => Boolean(summary)).slice(0, 4);
  const fallbacks = [
    { label: "Operating mode", value: "LOADED", detail: "Run permissive available", tone: "green" as const },
    { label: "Active alarms", value: "0", detail: "No unacknowledged alarms", tone: "green" as const },
    { label: "Data status", value: "LIVE", detail: "Telemetry updating normally", tone: "green" as const },
  ];
  for (const fallback of fallbacks) {
    if (summaries.length >= 4) break;
    if (!summaries.some((summary) => summary.label === fallback.label)) summaries.push(fallback);
  }
  return summaries;
}

function ChartCard({ definition, children, latest, badge, visualization, onVisualizationChange }: { definition: WidgetDefinition; children: ReactNode; latest: string; badge?: string; visualization?: VisualizationType; onVisualizationChange?: (visualization: VisualizationType) => void }) {
  const choices = WIDGET_VISUALIZATIONS[definition.id].allowed;
  return (
    <section className={`flex min-h-[280px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${definition.size === "wide" ? "xl:col-span-2" : ""}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{definition.title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{definition.description}</p>
        </div>
        <div className="flex w-full shrink-0 items-start justify-between gap-3 sm:w-auto sm:justify-end">
          {visualization && onVisualizationChange && choices.length > 1 ? <label className="text-left"><span className="sr-only">Visualization for {definition.title}</span><select value={visualization} onChange={(event) => onVisualizationChange(event.target.value as VisualizationType)} className="h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{choices.map((choice) => <option key={choice} value={choice}>{VISUALIZATION_LABELS[choice]}</option>)}</select></label> : null}
          <div className="text-right">
          <div className="whitespace-nowrap text-lg font-bold tabular-nums text-slate-900">{latest}</div>
          {badge ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">{badge}</span> : null}
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 p-3">{children}</div>
    </section>
  );
}

const tooltipStyle = { borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11, boxShadow: "0 8px 24px rgba(15,23,42,.1)" };

function TrendLines({ data, lines, domain }: { data: ReturnType<typeof makeSeries>; lines: { key: string; label: string; color: string; dash?: string }[]; domain?: [number, number] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={190}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis domain={domain ?? ["auto", "auto"]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} />
        {lines.map((line) => <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} strokeWidth={2} strokeDasharray={line.dash} dot={false} activeDot={{ r: 3 }} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

function AreaTrend({ data, lines }: { data: ReturnType<typeof makeSeries>; lines: { key: string; label: string; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={190}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
        <defs>{lines.map((line) => <linearGradient key={line.key} id={`fill-${line.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={line.color} stopOpacity={0.28} /><stop offset="95%" stopColor={line.color} stopOpacity={0.02} /></linearGradient>)}</defs>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} />
        {lines.map((line) => <Area key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} strokeWidth={2} fill={`url(#fill-${line.key})`} />)}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BarTrend({ data, lines }: { data: ReturnType<typeof makeSeries>; lines: { key: string; label: string; color: string }[] }) {
  const sampled = data.filter((_, index) => index % Math.max(1, Math.floor(data.length / 14)) === 0);
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={190}>
      <BarChart data={sampled} margin={{ top: 8, right: 12, left: -10, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} minTickGap={20} />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} />
        {lines.map((line) => <Bar key={line.key} dataKey={line.key} name={line.label} fill={line.color} radius={[3, 3, 0, 0]} maxBarSize={18} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

function GaugeView({ value, min, max, unit, target, tone = "blue" }: { value: number; min: number; max: number; unit: string; target: string; tone?: "blue" | "cyan" }) {
  const progress = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const radius = 82;
  const circumference = Math.PI * radius;
  const colors = tone === "cyan" ? { stroke: "#0891b2", pale: "#cffafe" } : { stroke: "#2563eb", pale: "#dbeafe" };
  return (
    <div className="flex h-full min-h-[190px] flex-col items-center justify-center">
      <div className="relative h-[138px] w-[215px] overflow-hidden">
        <svg viewBox="0 0 220 130" className="h-full w-full">
          <path d="M 28 112 A 82 82 0 0 1 192 112" fill="none" stroke={colors.pale} strokeWidth="18" strokeLinecap="round" />
          <path d="M 28 112 A 82 82 0 0 1 192 112" fill="none" stroke={colors.stroke} strokeWidth="18" strokeLinecap="round" strokeDasharray={`${circumference * progress} ${circumference}`} />
          <line x1="28" y1="116" x2="28" y2="124" stroke="#94a3b8" />
          <line x1="192" y1="116" x2="192" y2="124" stroke="#94a3b8" />
          <text x="28" y="129" textAnchor="middle" fontSize="9" fill="#94a3b8">{min}</text>
          <text x="192" y="129" textAnchor="middle" fontSize="9" fill="#94a3b8">{max}</text>
        </svg>
        <div className="absolute inset-x-0 bottom-2 text-center"><div className="text-3xl font-bold tabular-nums text-slate-900">{value.toFixed(unit === "PF" ? 2 : 1)}</div><div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{unit}</div></div>
      </div>
      <div className="mt-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Normal · {target}</div>
    </div>
  );
}

function StatView({ value, description }: { value: string; description: string }) {
  return (
    <div className="flex h-full min-h-[190px] flex-col items-center justify-center rounded-lg bg-gradient-to-br from-slate-50 to-blue-50/60 text-center">
      <div className="text-4xl font-bold tracking-tight tabular-nums text-slate-950">{value}</div>
      <div className="mt-3 max-w-xs text-sm leading-6 text-slate-500">Latest value · {description}</div>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Live measurement</div>
    </div>
  );
}

function ValueGrid({ items }: { items: { label: string; value: string; status?: string }[] }) {
  return (
    <div className="grid h-full grid-cols-2 gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex min-h-[78px] flex-col justify-between rounded-md border border-slate-100 bg-slate-50/80 p-2.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</div>
          <div className="text-xl font-bold tabular-nums text-slate-900">{item.value}</div>
          <div className="text-xs font-semibold text-emerald-600">● {item.status ?? "Normal"}</div>
        </div>
      ))}
    </div>
  );
}

function PresetPreview({ preset }: { preset: PresetDefinition }) {
  const previewLines: Record<PresetId, string[]> = {
    performance: ["M7 68 C34 52 44 28 72 38 S112 67 139 35 S180 21 213 42 S255 69 293 25"],
    generator: ["M7 57 C38 58 44 29 76 32 S119 55 147 43 S188 23 218 31 S257 51 293 36"],
    condition: ["M7 50 C29 49 43 46 61 50 S88 55 108 48 S139 43 157 49 S191 55 209 47 S250 42 293 48"],
  };
  const accents: Record<PresetId, string> = { performance: "#2563eb", generator: "#7c3aed", condition: "#0891b2" };
  return (
    <Link href={`/dashboard/${preset.id}`} className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.1)] focus-visible:outline-2 focus-visible:outline-blue-500">
      <div className="border-b border-slate-100 bg-slate-50/70 p-3">
        <div className="grid grid-cols-3 gap-2">
          {["Output", "Status", "Health"].map((label, index) => <div key={label} className="rounded-md border border-slate-200 bg-white px-2 py-2"><div className="text-xs font-medium text-slate-400">{label}</div><div className="mt-1.5 h-2 rounded bg-slate-200" style={{ width: `${72 - index * 12}%` }} /></div>)}
        </div>
        <svg viewBox="0 0 300 82" className="mt-2 h-20 w-full" aria-hidden="true">
          {[20, 40, 60].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#e2e8f0" />)}
          <path d={previewLines[preset.id][0]} fill="none" stroke={accents[preset.id]} strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3"><div><div className="text-base font-bold text-slate-900 group-hover:text-blue-700">{preset.label}</div><div className="mt-1 text-sm text-slate-500">{preset.widgets.length} prebuilt widgets</div></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">Preset</span></div>
        <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">{preset.description}</p>
      </div>
    </Link>
  );
}

function PersonalWidgetPlaceholder({ variant }: { variant: "line" | "bar" }) {
  if (variant === "bar") {
    return <div className="mt-2 flex h-8 items-end gap-1">{[45, 72, 55, 85, 62].map((height, index) => <span key={index} className="flex-1 rounded-t bg-violet-200" style={{ height: `${height}%` }} />)}</div>;
  }
  return <svg viewBox="0 0 100 34" className="mt-2 h-8 w-full" preserveAspectRatio="none" aria-hidden="true"><path d="M0 27 C14 22 22 8 36 16 S58 29 69 13 S88 8 100 18" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" /></svg>;
}

function PersonalPresetPreview({ preset }: { preset: PersonalPresetConfig }) {
  return (
    <Link href={`/dashboard/custom/${preset.id}`} className="group flex min-h-[270px] cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.1)] focus-visible:outline-2 focus-visible:outline-violet-500">
      <div className="flex flex-1 flex-col justify-center border-b border-slate-100 bg-gradient-to-br from-violet-50 to-blue-50/60 p-5">
        <div className="grid grid-cols-2 gap-2">
          {preset.widgets.slice(0, 2).map((widget, index) => <div key={`${widget.widgetId}-${index}`} className="rounded-md border border-white/80 bg-white/80 p-2.5 shadow-sm"><div className="h-2 w-2/3 rounded bg-slate-200" /><PersonalWidgetPlaceholder variant={index === 0 ? "line" : "bar"} /></div>)}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3"><div><div className="text-base font-bold text-slate-900 group-hover:text-violet-700">{preset.name}</div><div className="mt-1 text-sm text-slate-500">{preset.widgets.length} selected widgets</div></div><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">Personal</span></div>
        <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">{preset.description || "Personal selection of approved dashboard widgets."}</p>
      </div>
    </Link>
  );
}

function Widget({ definition, data, unit, visualization, onVisualizationChange }: { definition: WidgetDefinition; data: ReturnType<typeof makeSeries>; unit: UnitId; visualization: VisualizationType; onVisualizationChange: (visualization: VisualizationType) => void }) {
  const compare = unit === "compare";
  const unitTwo = unit === "gtg2";
  const unitLabel = unitTwo ? "GTG-2" : "GTG-1";
  const second = compare ? [{ key: definition.id === "power" ? "mw2" : definition.id === "exhaust" ? "exhaust2" : "n25b", label: "GTG-2", color: COLORS.amber }] : [];
  if (definition.id === "operating") return <ChartCard definition={definition} latest="LOADED" badge="Normal"><ValueGrid items={[{ label: "MW output", value: "25.4 MW" }, { label: "N25 speed", value: "10,018 rpm" }, { label: "PS3 pressure", value: "285.7 psia" }, { label: "T48 exhaust", value: "816 °C" }, { label: "Fuel flow", value: "1,240 kg/h" }, { label: "Vibration", value: "0.42 in/s" }]} /></ChartCard>;
  if (definition.id === "generator-summary") return <ChartCard definition={definition} latest="ONLINE" badge="Synchronized"><ValueGrid items={[{ label: "Active power", value: "25.4 MW" }, { label: "Reactive power", value: "9.8 MVAR" }, { label: "Terminal voltage", value: "11.08 kV" }, { label: "Frequency", value: "50.01 Hz" }, { label: "Power factor", value: "0.93" }, { label: "Exciter current", value: "3.4 A" }]} /></ChartCard>;
  if (definition.id === "health-summary") return <ChartCard definition={definition} latest="92 / 100" badge="Healthy"><ValueGrid items={[{ label: "Overall health", value: "92%" }, { label: "Vibration A", value: "0.42 in/s" }, { label: "Vibration B", value: "0.38 in/s" }, { label: "Bearing max", value: "166 °F" }, { label: "Lube pressure", value: "62.5 psig" }, { label: "Active alerts", value: "0" }]} /></ChartCard>;

  const configs: Partial<Record<WidgetId, { latest: string; domain?: [number, number]; lines: { key: string; label: string; color: string; dash?: string }[]; kind?: "line" | "area" | "bar" | "gauge"; gauge?: { value: number; min: number; max: number; unit: string; target: string; tone?: "blue" | "cyan" } }>> = {
    power: { latest: unitTwo ? "27.1 MW" : "25.4 MW", lines: [{ key: unitTwo ? "mw2" : "mw1", label: `${unitLabel} actual`, color: COLORS.blue }, ...second, { key: "setpoint", label: "Setpoint", color: COLORS.violet, dash: "6 4" }] },
    speed: { latest: unitTwo ? "10,034 rpm" : "10,018 rpm", lines: [{ key: unitTwo ? "n25b" : "n25a", label: `${unitLabel} N25`, color: COLORS.blue }, ...second, { key: "nsd", label: "NSD", color: COLORS.cyan }] },
    exhaust: { latest: unitTwo ? "808 °C" : "816 °C", domain: [760, 860], lines: [{ key: unitTwo ? "exhaust2" : "exhaust1", label: unitLabel, color: COLORS.amber }, ...second], kind: "area" },
    fuel: { latest: unitTwo ? "1,295 kg/h" : "1,240 kg/h", lines: [{ key: unitTwo ? "fuel2" : "fuel1", label: `${unitLabel} flow`, color: COLORS.cyan }, ...(compare ? [{ key: "fuel2", label: "GTG-2", color: COLORS.amber }] : []), { key: "demand", label: "Demand", color: COLORS.violet }], kind: "area" },
    voltage: { latest: unitTwo ? "11.02 kV" : "11.08 kV", domain: [10.7, 11.4], lines: [{ key: unitTwo ? "voltage2" : "voltage1", label: unitLabel, color: COLORS.blue }, ...(compare ? [{ key: "voltage2", label: "GTG-2", color: COLORS.amber }] : [])], kind: "area" },
    frequency: { latest: unitTwo ? "50.02 Hz" : "50.01 Hz", domain: [49.8, 50.2], lines: [{ key: unitTwo ? "frequency2" : "frequency1", label: unitLabel, color: COLORS.blue }, ...(compare ? [{ key: "frequency2", label: "GTG-2", color: COLORS.amber }] : [])] },
    "power-factor": { latest: unitTwo ? "0.91" : "0.93", lines: [], kind: "gauge", gauge: { value: unitTwo ? 0.91 : 0.93, min: 0.7, max: 1, unit: "PF", target: "Target ≥ 0.90" } },
    reactive: { latest: unitTwo ? "10.6 MVAR" : "9.8 MVAR", lines: [{ key: unitTwo ? "mvar2" : "mvar1", label: unitLabel, color: COLORS.cyan }, ...(compare ? [{ key: "mvar2", label: "GTG-2", color: COLORS.amber }] : [])], kind: "bar" },
    vibration: { latest: "0.42 in/s", domain: [0.25, 0.55], lines: [{ key: "vibrationA", label: "Drive end", color: COLORS.blue }, { key: "vibrationB", label: "Non-drive end", color: COLORS.violet }] },
    bearing: { latest: "166 °F", domain: [150, 180], lines: [{ key: "bearingA", label: "Bearing A", color: COLORS.amber }, { key: "bearingB", label: "Bearing B", color: COLORS.red }], kind: "area" },
    lube: { latest: "62.5 psig", lines: [], kind: "gauge", gauge: { value: unitTwo ? 63.2 : 62.5, min: 40, max: 80, unit: "psig", target: "Operating range 55–70", tone: "cyan" } },
  };
  const config = configs[definition.id]!;
  return <ChartCard definition={definition} latest={config.latest} badge="Live" visualization={visualization} onVisualizationChange={onVisualizationChange}>{visualization === "stat" ? <StatView value={config.latest} description={definition.description} /> : visualization === "gauge" && config.gauge ? <GaugeView {...config.gauge} /> : visualization === "bar" ? <BarTrend data={data} lines={config.lines} /> : visualization === "area" ? <AreaTrend data={data} lines={config.lines} /> : <TrendLines data={data} lines={config.lines} domain={config.domain} />}</ChartCard>;
}

export function PerformanceDashboard({ presetId = null, personalPreset }: { presetId?: PresetId | null; personalPreset?: PersonalPresetConfig }) {
  const [unit, setUnit] = useState<UnitId>(personalPreset?.defaultUnit ?? "gtg1");
  const [range, setRange] = useState<RangeId>(personalPreset?.defaultRange ?? "1h");
  const [tick, setTick] = useState(0);
  const [visualizationByWidget, setVisualizationByWidget] = useState<Partial<Record<WidgetId, VisualizationType>>>(() => Object.fromEntries(personalPreset?.widgets.map((item) => [item.widgetId, item.visualization]) ?? []) as Partial<Record<WidgetId, VisualizationType>>);
  const [visibleByPreset, setVisibleByPreset] = useState<Record<PresetId, WidgetId[]>>(() => Object.fromEntries(PRESETS.map((preset) => [preset.id, preset.defaults])) as Record<PresetId, WidgetId[]>);
  const [personalVisible, setPersonalVisible] = useState<WidgetId[]>(() => personalPreset?.widgets.map((item) => item.widgetId).filter((id): id is WidgetId => WIDGET_CATALOG.has(id as WidgetId)) ?? []);
  const personalDefinition: PresetDefinition | undefined = personalPreset ? {
    id: "performance",
    label: personalPreset.name,
    eyebrow: "Personal preset",
    description: personalPreset.description || "Personal selection of approved dashboard widgets.",
    widgets: personalPreset.widgets.map((item) => WIDGET_CATALOG.get(item.widgetId as WidgetId)).filter((widget): widget is WidgetDefinition => Boolean(widget)),
    defaults: personalPreset.widgets.map((item) => item.widgetId).filter((id): id is WidgetId => WIDGET_CATALOG.has(id as WidgetId)),
  } : undefined;
  const preset = personalDefinition ?? PRESETS.find((item) => item.id === presetId);
  const visible = personalPreset ? personalVisible : presetId ? visibleByPreset[presetId] : [];
  const data = useMemo(() => makeSeries(range, tick), [range, tick]);
  const summaries = preset ? personalPreset ? personalPresetSummaries(visible, unit, data) : presetSummaries(presetId!, unit, data) : [];
  const personalPresetsRaw = useSyncExternalStore(subscribeToPersonalPresets, getPersonalPresetsSnapshot, getPersonalPresetsServerSnapshot);
  const personalPresets = useMemo(() => {
    try {
      const parsed = JSON.parse(personalPresetsRaw) as PersonalPresetConfig[];
      return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.widgets)) : [];
    } catch {
      return [];
    }
  }, [personalPresetsRaw]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 2000);
    return () => window.clearInterval(id);
  }, []);

  const toggleWidget = (id: WidgetId) => {
    if (personalPreset) {
      setPersonalVisible((current) => current.includes(id) && current.length === 1 ? current : current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
      return;
    }
    if (!presetId) return;
    setVisibleByPreset((current) => {
      const selected = current[presetId];
      if (selected.includes(id) && selected.length === 1) return current;
      return { ...current, [presetId]: selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id] };
    });
  };

  return (
    <div className="h-dvh overflow-y-auto bg-[#f4f6f9] text-slate-900">
      <DashboardNavbar />

      {!preset ? (
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 10v10" /></svg></span><h1 className="text-3xl font-bold tracking-tight text-slate-950">Dashboards</h1></div><p className="mt-3 text-sm text-slate-500">Choose a prebuilt dashboard to monitor turbine performance, electrical output, or equipment condition.</p></div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PRESETS.map((item) => <PresetPreview key={item.id} preset={item} />)}
            {personalPresets.map((item) => <PersonalPresetPreview key={item.id} preset={item} />)}
            <Link href="/dashboard/new" className="group flex min-h-[270px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/50 px-8 py-10 text-center transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50/60 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] focus-visible:outline-2 focus-visible:outline-blue-500">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-2xl font-light text-blue-600 transition group-hover:border-blue-300 group-hover:bg-blue-100">+</span>
              <span className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-700">Create a personal preset</span>
              <span className="mt-2 max-w-xs text-sm leading-5 text-slate-500">Choose approved widgets and their default views. The layout stays automatic.</span>
            </Link>
          </div>
        </main>
      ) : <main className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{preset.label}</h1>
            <p className="mt-1 text-sm leading-5 text-slate-500">{preset.description}</p>
          </div>
        </div>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[auto_auto_1fr] xl:items-end">
            <div><div className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Unit</div><div className="flex flex-wrap gap-1.5">{([{ id: "gtg1", label: "GTG-1" }, { id: "gtg2", label: "GTG-2" }, { id: "compare", label: "Compare both" }] as const).map((item) => <button key={item.id} type="button" onClick={() => setUnit(item.id)} className={`h-9 rounded-md border px-3 text-xs font-semibold transition ${unit === item.id ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"}`}>{item.label}</button>)}</div></div>
            <SelectControl label="Time range" value={range} onChange={(value) => setRange(value as RangeId)}>{Object.entries(RANGE_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</SelectControl>
            <div><div className="mb-1.5 flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Visible widgets</span><button type="button" onClick={() => personalPreset ? setPersonalVisible(preset.defaults) : setVisibleByPreset((current) => ({ ...current, [preset.id]: preset.defaults }))} className="text-xs font-bold text-blue-600 hover:text-blue-800">Restore preset</button></div><div className="flex flex-wrap gap-1.5">{preset.widgets.map((widget) => { const checked = visible.includes(widget.id); return <button key={widget.id} type="button" onClick={() => toggleWidget(widget.id)} aria-pressed={checked} title={widget.description} className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition ${checked ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"}`}><span className={`flex h-3.5 w-3.5 items-center justify-center rounded border text-xs ${checked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"}`}>{checked ? "✓" : ""}</span>{widget.title}</button>; })}</div></div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {summaries.map((summary) => <SummaryCard key={summary.label} {...summary} />)}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {preset.widgets.filter((widget) => visible.includes(widget.id)).map((widget) => <Widget key={widget.id} definition={widget} data={data} unit={unit} visualization={visualizationByWidget[widget.id] ?? WIDGET_VISUALIZATIONS[widget.id].default} onVisualizationChange={(visualization) => setVisualizationByWidget((current) => ({ ...current, [widget.id]: visualization }))} />)}
        </div>
      </main>}
    </div>
  );
}
