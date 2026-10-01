"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DashboardNavbar } from "@/components/hmi/dashboard-navbar";

type UnitId = "gtg1" | "gtg2" | "compare";
type RangeId = "live" | "1h" | "8h" | "24h" | "7d";
type Visualization = "line" | "area" | "bar" | "gauge" | "stat";

type BuilderWidget = {
  id: string;
  title: string;
  description: string;
  category: string;
  defaultVisualization: Visualization;
  visualizations: Visualization[];
};

const WIDGETS: BuilderWidget[] = [
  { id: "power", title: "Power output", description: "Actual MW against dispatch setpoint", category: "Performance", defaultVisualization: "line", visualizations: ["line", "area", "stat"] },
  { id: "speed", title: "Turbine speed", description: "N25 and load-shaft response", category: "Performance", defaultVisualization: "line", visualizations: ["line", "stat"] },
  { id: "exhaust", title: "Exhaust temperature", description: "T48 operating behavior and limits", category: "Thermal & fuel", defaultVisualization: "area", visualizations: ["area", "line", "stat"] },
  { id: "fuel", title: "Fuel consumption", description: "Fuel flow against control demand", category: "Thermal & fuel", defaultVisualization: "area", visualizations: ["area", "bar", "stat"] },
  { id: "voltage", title: "Terminal voltage", description: "Generator terminal voltage", category: "Electrical", defaultVisualization: "area", visualizations: ["area", "line", "stat"] },
  { id: "frequency", title: "Grid frequency", description: "Frequency stability around nominal", category: "Electrical", defaultVisualization: "line", visualizations: ["line", "stat"] },
  { id: "power-factor", title: "Power factor", description: "Present power factor against target", category: "Electrical", defaultVisualization: "gauge", visualizations: ["gauge", "stat"] },
  { id: "reactive", title: "Reactive power", description: "MVAR loading and response", category: "Electrical", defaultVisualization: "bar", visualizations: ["bar", "line", "stat"] },
  { id: "vibration", title: "Vibration", description: "Drive-end and non-drive-end channels", category: "Condition", defaultVisualization: "line", visualizations: ["line", "bar", "stat"] },
  { id: "bearing", title: "Bearing temperature", description: "Journal bearing thermal condition", category: "Condition", defaultVisualization: "area", visualizations: ["area", "line", "bar", "stat"] },
  { id: "lube", title: "Lube oil pressure", description: "Supply pressure against operating range", category: "Condition", defaultVisualization: "gauge", visualizations: ["gauge", "stat"] },
];

const VISUALIZATION_LABELS: Record<Visualization, string> = { line: "Line", area: "Area", bar: "Bars", gauge: "Gauge", stat: "Stat" };
const RANGE_LABELS: Record<RangeId, string> = { live: "Live · 15 min", "1h": "Last hour", "8h": "Last 8 hours", "24h": "Last 24 hours", "7d": "Last 7 days" };
const SUMMARY_LABELS: Record<string, string> = { power: "MW Output", speed: "Turbine Speed", exhaust: "Exhaust Temperature", fuel: "Fuel Flow", voltage: "Terminal Voltage", frequency: "Grid Frequency", "power-factor": "Power Factor", reactive: "Reactive Power", vibration: "Maximum Vibration", bearing: "Maximum Bearing", lube: "Lube Oil Pressure" };

type Selection = { widgetId: string; visualization: Visualization };

export function PresetBuilder() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState<UnitId>("gtg1");
  const [range, setRange] = useState<RangeId>("1h");
  const [selections, setSelections] = useState<Selection[]>([
    { widgetId: "power", visualization: "line" },
    { widgetId: "exhaust", visualization: "area" },
    { widgetId: "vibration", visualization: "line" },
  ]);

  const groups = useMemo(() => Array.from(new Set(WIDGETS.map((widget) => widget.category))), []);
  const canSave = name.trim().length >= 3 && selections.length > 0;
  const automaticSummaries = selections.map((selection) => SUMMARY_LABELS[selection.widgetId]).filter(Boolean).slice(0, 4);

  const toggleWidget = (widget: BuilderWidget) => {
    setSelections((current) => current.some((item) => item.widgetId === widget.id)
      ? current.filter((item) => item.widgetId !== widget.id)
      : [...current, { widgetId: widget.id, visualization: widget.defaultVisualization }]);
  };

  const setVisualization = (widgetId: string, visualization: Visualization) => {
    setSelections((current) => current.map((item) => item.widgetId === widgetId ? { ...item, visualization } : item));
  };

  const savePreset = () => {
    if (!canSave) return;
    const preset = {
      id: `personal-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      defaultUnit: unit,
      defaultRange: range,
      widgets: selections,
      createdAt: new Date().toISOString(),
    };
    const storageKey = "voltara-personal-dashboard-presets";
    let existing: unknown[] = [];
    try {
      existing = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as unknown[];
    } catch {
      existing = [];
    }
    window.localStorage.setItem(storageKey, JSON.stringify([...existing, preset]));
    router.push(`/dashboard/custom/${preset.id}`);
  };

  return (
    <div className="h-dvh overflow-y-auto bg-[#f4f6f9] text-slate-900">
      <DashboardNavbar cancelHref="/dashboard" />

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5"><h1 className="text-2xl font-bold tracking-tight">Create personal preset</h1><p className="mt-1 text-sm text-slate-500">Configure the predefined dashboard template. Widget order and responsive layout remain controlled by the application.</p></div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold">Preset details</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs font-bold text-slate-600">Preset name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Morning Shift Monitoring" className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                <label className="text-xs font-bold text-slate-600">Description<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional short description" className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold">Default context</h2>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div><div className="mb-1.5 text-xs font-bold text-slate-600">Unit</div><div className="flex flex-wrap gap-1.5">{([{ id: "gtg1", label: "GTG-1" }, { id: "gtg2", label: "GTG-2" }, { id: "compare", label: "Compare both" }] as const).map((item) => <button key={item.id} type="button" onClick={() => setUnit(item.id)} className={`h-9 rounded-md border px-3 text-xs font-semibold ${unit === item.id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-slate-600"}`}>{item.label}</button>)}</div></div>
                <label className="text-xs font-bold text-slate-600">Time range<select value={range} onChange={(event) => setRange(event.target.value as RangeId)} className="mt-1.5 block h-9 w-full min-w-40 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold outline-none sm:w-auto">{Object.entries(RANGE_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-end justify-between"><div><h2 className="text-base font-bold">Choose widgets</h2><p className="mt-1 text-xs text-slate-500">Select approved widgets and a compatible default view.</p></div><span className="text-xs font-bold text-blue-700">{selections.length} selected</span></div>
              <div className="mt-4 space-y-5">{groups.map((group) => <fieldset key={group}><legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{group}</legend><div className="grid gap-2 md:grid-cols-2">{WIDGETS.filter((widget) => widget.category === group).map((widget) => { const selected = selections.find((item) => item.widgetId === widget.id); return <div key={widget.id} className={`rounded-lg border p-3 ${selected ? "border-blue-200 bg-blue-50/50" : "border-slate-200"}`}><div className="flex items-start gap-3"><input type="checkbox" checked={Boolean(selected)} onChange={() => toggleWidget(widget)} className="mt-1 h-4 w-4 accent-blue-600" /><button type="button" onClick={() => toggleWidget(widget)} className="flex-1 text-left"><span className="block text-sm font-bold text-slate-900">{widget.title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{widget.description}</span></button></div>{selected && widget.visualizations.length > 1 ? <label className="mt-3 flex items-center justify-between border-t border-blue-100 pt-2 text-xs font-semibold text-slate-500">Default view<select value={selected.visualization} onChange={(event) => setVisualization(widget.id, event.target.value as Visualization)} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700">{widget.visualizations.map((view) => <option key={view} value={view}>{VISUALIZATION_LABELS[view]}</option>)}</select></label> : null}</div>; })}</div></fieldset>)}</div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-base font-bold">Preset preview</h2><div className="mt-3 rounded-lg bg-slate-50 p-3"><div className="break-words text-lg font-bold">{name.trim() || "Untitled preset"}</div><div className="mt-1 break-words text-xs text-slate-500">{description.trim() || "Your preset description will appear here."}</div><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded bg-blue-50 px-2 py-1 font-bold text-blue-700">{unit === "compare" ? "GTG-1 + GTG-2" : unit.toUpperCase()}</span><span className="rounded bg-slate-200 px-2 py-1 font-semibold text-slate-600">{RANGE_LABELS[range]}</span></div></div><div className="mt-3 rounded-md border border-blue-100 bg-blue-50/60 p-3"><div className="text-xs font-bold text-blue-900">Automatic summary row</div><div className="mt-2 flex flex-wrap gap-1.5">{automaticSummaries.map((summary) => <span key={summary} className="rounded bg-white px-2 py-1 text-xs font-semibold text-blue-700">{summary}</span>)}{automaticSummaries.length < 4 ? <span className="rounded bg-white px-2 py-1 text-xs text-slate-500">+ operational context</span> : null}</div></div><div className="mt-3 space-y-2">{selections.map((selection, index) => { const widget = WIDGETS.find((item) => item.id === selection.widgetId)!; return <div key={selection.widgetId} className="flex items-center gap-3 rounded-md border border-slate-100 px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-500">{index + 1}</span><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{widget.title}</div><div className="text-xs text-slate-400">{VISUALIZATION_LABELS[selection.visualization]}</div></div></div>; })}{selections.length === 0 ? <div className="rounded-md border border-dashed border-slate-300 py-8 text-center text-xs text-slate-400">Select at least one widget</div> : null}</div><p className="mt-3 text-xs leading-5 text-slate-400">Summary cards are derived from the first four selected widgets. Widgets render in fixed catalog order and automatically reflow. There is no manual positioning.</p></div>
            <button type="button" disabled={!canSave} onClick={savePreset} className="mt-3 h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">Save personal preset</button>
            {!canSave ? <p className="mt-2 text-center text-xs text-slate-400">Enter at least 3 characters and select one widget.</p> : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
