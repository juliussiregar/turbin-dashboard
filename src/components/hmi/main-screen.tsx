"use client";

import type { SimulationState } from "@/lib/hmi/simulation";
import {
  ActionButton,
  DataLine,
  DigitalReadout,
  fmt,
  KpiChip,
  NavButton,
  Panel,
  StatusPill,
} from "@/components/hmi/dashboard-ui";
import { ProcessDiagram } from "@/components/hmi/process-diagram";

const NAV_ITEMS = [
  "Previous Screen",
  "Fire Protection",
  "Fuel GAS",
  "Fuel System",
  "Hyd Starter",
  "MLO Skid",
  "MLO GB/Gen",
  "Skid Enclosure",
  "Sprint",
  "Turbine Lube Oil",
  "Turbine Overview",
  "Ventilation",
  "Vibration Monitoring",
  "Water Inj (Nox)",
  "Water Wash",
];

const ENGINE_ROWS = [
  ["N2", "100.0", "%"],
  ["N25REF", "10810.0", "RPM"],
  ["T3", "941.1", "°F"],
  ["T48REF", "1662.3", "°F"],
  ["PS3", "285.7", "psia"],
  ["T2", "84.7", "°F"],
  ["T48", "1662.3", "°F"],
  ["T3REF", "941.1", "°F"],
] as const;

const MINERAL_ROWS = [
  ["LT0135A", "72.4", "%"],
  ["TE0057A1", "153.8", "°F"],
  ["TE0057B1", "154.1", "°F"],
  ["TE0057C1", "153.2", "°F"],
  ["TE0057D1", "154.0", "°F"],
] as const;

const GENERATOR_ROWS = [
  ["TE0021A1", "175.8", "°F"],
  ["TE0022A1", "143.6", "°F"],
  ["TE0023A1", "169.5", "°F"],
  ["TE0034A1", "162.4", "°F"],
  ["TE0035A1", "158.7", "°F"],
  ["TE0036A1", "161.2", "°F"],
] as const;

const TURBINE_LUBE_ROWS = [
  ["PT1021A1", "62.5", "psig"],
  ["TE1021A1", "118.4", "°F"],
  ["TE1022A1", "119.1", "°F"],
  ["TE1023A1", "117.8", "°F"],
  ["TE1024A1", "120.2", "°F"],
] as const;

const VIBRATION_ROWS = [
  ["XE8009X", "0.42", "in/s"],
  ["XE8009Y", "0.38", "in/s"],
  ["XE8010X", "0.35", "in/s"],
  ["XE8010Y", "0.31", "in/s"],
  ["XE8077", "0.28", "in/s"],
] as const;

const FUEL_ROWS = [
  ["WF36DMD", "18.4", "%"],
  ["PGSSEL", "31.7", "%"],
  ["FG1FLOW", "1240", "lb/hr"],
  ["FG2FLOW", "0.0", "lb/hr"],
] as const;

const VENTILATION_ROWS = [
  ["PDT4004", "0.12", "inH2O"],
  ["TE4082A1", "142.3", "°F"],
  ["TE4083A1", "143.1", "°F"],
  ["PDT4005", "0.08", "inH2O"],
  ["TE4084A1", "141.8", "°F"],
] as const;

function StaticTable({ rows }: { rows: readonly (readonly [string, string, string])[] }) {
  return (
    <div className="space-y-0">
      {rows.map(([label, value, unit]) => (
        <DataLine key={label} label={label} value={value} unit={unit} />
      ))}
    </div>
  );
}

type MainScreenProps = {
  sim: SimulationState;
  onRaise: () => void;
  onLower: () => void;
  onTripReset: () => void;
};

export function MainScreen({ sim, onRaise, onLower, onTripReset }: MainScreenProps) {
  const tags = sim.tags;
  const isRun = String(tags.RUN_STATUS) === "RUN";

  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_118px] gap-2 p-2">
      <div className="grid min-h-0 grid-rows-[1fr_172px] gap-2">
        {/* Upper: process + data panels */}
        <div className="grid min-h-0 grid-cols-[1fr_272px] gap-2">
          <div className="min-h-0 overflow-hidden rounded-md border border-slate-700/60 shadow-lg">
            <ProcessDiagram />
          </div>

          <div className="grid min-h-0 grid-rows-6 gap-1.5">
            <Panel title="ENGINE PARAMETERS">
              <div className="space-y-0">
                <DataLine label="N25" value={fmt(tags.N25, 1)} unit="RPM" highlight />
                <DataLine label="NSD" value={fmt(tags.NSD, 1)} unit="RPM" highlight />
                <DataLine label="PS3" value={fmt(tags.PS3, 1)} unit="psia" highlight />
                <StaticTable rows={ENGINE_ROWS.slice(2)} />
              </div>
            </Panel>
            <Panel title="MINERAL LUBE OIL">
              <StaticTable rows={MINERAL_ROWS} />
            </Panel>
            <Panel title="GENERATOR">
              <div className="space-y-0">
                <DataLine label="MW" value={fmt(tags.MW, 1)} unit="MW" highlight />
                <StaticTable rows={GENERATOR_ROWS} />
              </div>
            </Panel>
            <Panel title="TURBINE LUBE OIL">
              <div className="space-y-0">
                <DataLine label="LUBE P" value={fmt(tags.LUBE_OIL_PRESS, 1)} unit="psig" highlight />
                <StaticTable rows={TURBINE_LUBE_ROWS.slice(1)} />
              </div>
            </Panel>
            <Panel title="VIBRATION">
              <div className="space-y-0">
                <DataLine label="VIB A" value={fmt(tags.VIB_A, 2)} unit="in/s" highlight />
                <DataLine label="VIB B" value={fmt(tags.VIB_B, 2)} unit="in/s" highlight />
                <StaticTable rows={VIBRATION_ROWS.slice(2)} />
              </div>
            </Panel>
            <Panel title="FUEL DATA">
              <div className="space-y-0">
                <DataLine label="MODE" value={sim.mode} highlight />
                <StaticTable rows={FUEL_ROWS} />
              </div>
            </Panel>
          </div>
        </div>

        {/* Bottom control row */}
        <div className="grid min-h-0 grid-cols-4 gap-2">
          <Panel title="SYSTEM STATUSES">
            <div className="grid grid-cols-2 gap-1.5">
              <StatusPill label="NOX WATER INJ" status={String(tags.NOX_WATER_STATUS)} tone="active" />
              <StatusPill label="RUN" status={String(tags.RUN_STATUS)} tone={isRun ? "good" : "bad"} />
              <StatusPill label="SPRINT" status="Inactive" tone="neutral" />
              <StatusPill label="CRANK" status="Active" tone="active" />
            </div>
            <div className="mt-2 rounded border border-emerald-500/20 bg-black/50 p-1.5 text-[9px] leading-snug text-emerald-300">
              UNIT IN LOCAL CONTROL · SYNC ENABLED · {String(tags.SEQ_TEXT)}
            </div>
          </Panel>

          <Panel title="EXCITER / AVR">
            <div className="space-y-2">
              <DataLine label="Exciter Amps" value="3.40" />
              <DataLine label="Exciter Volts" value="24.13" unit="VDC" />
              <ActionButton label="AVR CONTROL" variant="ghost" />
            </div>
          </Panel>

          <Panel title="MW CONTROL">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <DigitalReadout label="MW OUTPUT" value={fmt(tags.MW, 2)} unit="MW" />
              <div className="flex flex-col gap-1">
                <ActionButton label="RAISE" onClick={onRaise} />
                <ActionButton label="LOWER" onClick={onLower} />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <DataLine label="NSD REF" value={fmt(tags.NSDREF, 2)} unit="RPM" highlight />
              <DataLine label="MW SETPOINT" value={fmt(tags.MW_SP, 2)} unit="MW" highlight />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <StatusPill label="RUN PERMISSIVE" status="NOT OK" tone="bad" />
              <StatusPill label="MW CTRL ENBL" status="ENABLED" tone="good" />
            </div>
          </Panel>

          <Panel title="SHUTDOWN / VENTILATION">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-[8px] font-bold uppercase text-slate-500">Shutdown Flags</div>
                {["ESN", "ES", "SI", "DM", "NSD"].map((flag) => (
                  <div key={flag} className="text-[9px] text-sky-400">
                    {flag} Flag
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-1 text-[8px] font-bold uppercase text-slate-500">Ventilation</div>
                <StaticTable rows={VENTILATION_ROWS} />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Navigation rail */}
      <aside className="flex min-h-0 flex-col rounded-md border border-teal-500/30 bg-gradient-to-b from-teal-900/90 via-teal-950/95 to-slate-950 p-1.5 shadow-lg">
        <div className="mb-1.5 grid grid-cols-2 gap-0.5">
          {["CONTROL", "SYSTEMS", "MISC", "VG CAL"].map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`rounded px-1 py-0.5 text-[7px] font-bold ${
                i === 0 ? "bg-cyan-500/25 text-cyan-100" : "bg-slate-800/50 text-slate-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mb-1 rounded border border-cyan-400/30 bg-cyan-500/10 py-1 text-center text-[9px] font-bold text-cyan-100">
          MAIN SCREEN
        </div>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5">
          {NAV_ITEMS.map((item, i) => (
            <NavButton key={item} label={item} active={i === 0} />
          ))}
        </div>
        <div className="mt-1.5 space-y-0.5 border-t border-teal-500/20 pt-1.5">
          <ActionButton label="PRINT" variant="ghost" />
          <ActionButton label="Alarms" variant="ghost" />
          <ActionButton label="Ack" variant="ghost" />
          <ActionButton label="Reset" onClick={onTripReset} variant="danger" />
        </div>
      </aside>
    </div>
  );
}

export function MainScreenHeader({ sim, clock }: { sim: SimulationState; clock: string }) {
  const tags = sim.tags;
  const today = new Date().toLocaleDateString();

  return (
    <header className="border-b border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-3 py-1.5 text-slate-100 shadow-lg">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-[10px] font-black text-slate-900">
            GE
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide">SENIPAH</div>
            <div className="text-[10px] text-slate-400">Gas Turbine Control</div>
          </div>
        </div>

        <button
          type="button"
          className="rounded-lg border border-red-400/50 bg-gradient-to-b from-red-500 to-red-700 px-6 py-1.5 text-sm font-black tracking-wider text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] transition hover:from-red-400 hover:to-red-600"
        >
          EMERG STOP
        </button>

        <div className="text-right">
          <div className="text-sm font-bold">
            MAIN SCREEN <span className="text-slate-500">|</span> UNIT 2
          </div>
          <div className="font-mono text-[11px] text-cyan-300">
            {clock} <span className="text-slate-500">|</span> {today}
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 font-semibold text-sky-300">
          REGULATOR: NSDPRX — NSD Regulator
        </div>
        <div className="rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-right font-semibold text-sky-300">
          SEQUENCE: {String(tags.SEQ_TEXT)}
        </div>
      </div>

      <div className="mt-1.5 grid grid-cols-5 gap-1.5">
        <KpiChip label="N25" value={fmt(tags.N25, 1)} unit="RPM" />
        <KpiChip label="NSD" value={fmt(tags.NSD, 1)} unit="RPM" />
        <KpiChip label="SE-8100" value={fmt(tags.N25, 1)} unit="RPM" />
        <KpiChip label="PS3" value={fmt(tags.PS3, 1)} unit="psia" />
        <KpiChip label="T2" value={fmt(tags.T2, 1)} unit="°F" />
      </div>

      <div className="mt-1.5 grid grid-cols-5 gap-2">
        <KpiChip label="N25REF" value={fmt(tags.N25REF, 1)} unit="RPM" />
        <KpiChip label="NSDREF" value={fmt(tags.NSDREF, 1)} unit="RPM" />
        <KpiChip label="T48" value={fmt(tags.T48, 1)} unit="°F" />
        <KpiChip label="T3" value={fmt(tags.T3, 1)} unit="°F" />
        <div className="rounded-md border border-cyan-400/40 bg-gradient-to-r from-cyan-600/30 to-sky-600/20 px-2 py-1 text-right">
          <div className="text-[8px] font-medium uppercase tracking-wider text-cyan-200/70">MW</div>
          <div className="font-mono text-lg font-black text-white">{fmt(tags.MW, 1)}</div>
        </div>
      </div>
    </header>
  );
}
