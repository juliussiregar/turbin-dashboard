"use client";

import { useMemo } from "react";
import {
  ActionButton,
  AlarmListPanel,
  AlarmStrip,
  DemoBar,
  DigitalReadout,
  fmt,
  KpiChip,
  LiveDataLine,
  NavButton,
  Panel,
  StatusLamp,
  TrendCard,
} from "@/components/hmi/dashboard-ui";
import { HmiOverlay } from "@/components/hmi/overlay";
import type { HmiAlarm } from "@/lib/hmi/alarms";
import { buildOverlaySensorState } from "@/lib/hmi/overlay-sensor-state";
import {
  ENGINE_PANEL_ROWS,
  FUEL_PANEL_ROWS,
  GENERATOR_PANEL_ROWS,
  MINERAL_PANEL_ROWS,
  TURBINE_LUBE_PANEL_ROWS,
  VENTILATION_PANEL_ROWS,
  VIBRATION_PANEL_ROWS,
  type PanelRowSpec,
} from "@/lib/hmi/panel-tag-registry";
import type { SimulationState } from "@/lib/hmi/simulation";
import type { TagHistory } from "@/lib/hmi/tag-history";
import { getTagDefinition } from "@/lib/hmi/tag-registry";
import type { HmiTagMap } from "@/lib/hmi/types";

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

function LiveTable({ tags, rows }: { tags: HmiTagMap; rows: PanelRowSpec[] }) {
  return (
    <div>
      {rows.map((row) => {
        const def = getTagDefinition(row.tagId);
        const digits = row.digits ?? def?.decimals ?? 1;
        return (
          <LiveDataLine
            key={row.tagId + row.label}
            label={row.label}
            value={fmt(tags[row.tagId], digits)}
            unit={def?.unit}
            highlight={row.highlight}
          />
        );
      })}
    </div>
  );
}

type MainScreenProps = {
  sim: SimulationState;
  history: TagHistory;
  alarms: HmiAlarm[];
  alarmListOpen: boolean;
  navActive: string;
  onNavSelect: (item: string) => void;
  onAlarmListToggle: () => void;
  onAlarmListClose: () => void;
  onAck: () => void;
  onRaise: () => void;
  onLower: () => void;
  onTripReset: () => void;
};

export function MainScreen({
  sim,
  history,
  alarms,
  alarmListOpen,
  navActive,
  onNavSelect,
  onAlarmListToggle,
  onAlarmListClose,
  onAck,
  onRaise,
  onLower,
  onTripReset,
}: MainScreenProps) {
  const tags = sim.tags;
  const isRun = String(tags.RUN_STATUS) === "RUN";
  const overlayState = useMemo(() => buildOverlaySensorState(tags), [tags]);
  const runPermissiveOk = String(tags.RUN_PERMISSIVE) === "OK";
  const mwCtrlEnabled = String(tags.MW_CTRL_ENBL) === "ENABLED";
  const isTrip = sim.mode === "TRIP";

  return (
    <div className="relative grid h-full min-h-0 grid-cols-[minmax(0,1fr)_136px] gap-2 overflow-hidden p-2">
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto_minmax(150px,0.26fr)] gap-2 overflow-hidden">
        {/* Process image scales to fit cell — always fully visible, no scroll */}
        <div className="grid min-h-0 grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)] gap-2 overflow-hidden">
          <div className="min-h-0 min-w-0 overflow-hidden rounded-md border border-slate-700/70 bg-black">
            <HmiOverlay s={overlayState} showScaleControl={false} />
          </div>

          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 overflow-hidden">
            <div className="grid shrink-0 grid-cols-3 gap-1.5">
              <TrendCard
                label="MW"
                value={fmt(tags.MW, 1)}
                unit="MW"
                series={history.MW}
                stroke="#34d399"
                domainMin={0}
                domainMax={30}
              />
              <TrendCard
                label="N25"
                value={fmt(tags.N25, 0)}
                unit="RPM"
                series={history.N25}
                stroke="#22d3ee"
                domainMin={0}
                domainMax={11000}
              />
              <TrendCard
                label="VIB"
                value={fmt(tags.VIB_A, 2)}
                unit="in/s"
                series={history.VIB_A}
                stroke="#fbbf24"
                domainMin={0}
                domainMax={2}
              />
            </div>

            <div className="grid min-h-0 grid-cols-2 grid-rows-3 gap-1.5 overflow-hidden">
              <Panel title="ENGINE PARAMETERS" accent="cyan" compact className="min-h-0">
                <LiveTable tags={tags} rows={ENGINE_PANEL_ROWS} />
              </Panel>
              <Panel title="MINERAL LUBE OIL" accent="cyan" compact className="min-h-0">
                <LiveTable tags={tags} rows={MINERAL_PANEL_ROWS} />
              </Panel>
              <Panel title="GENERATOR" accent="emerald" compact className="min-h-0">
                <LiveTable tags={tags} rows={GENERATOR_PANEL_ROWS} />
              </Panel>
              <Panel title="TURBINE LUBE OIL" accent="cyan" compact className="min-h-0">
                <LiveTable tags={tags} rows={TURBINE_LUBE_PANEL_ROWS} />
              </Panel>
              <Panel title="VIBRATION" accent="amber" compact className="min-h-0">
                <LiveTable tags={tags} rows={VIBRATION_PANEL_ROWS} />
              </Panel>
              <Panel title="FUEL DATA" accent="rose" compact className="min-h-0">
                <LiveDataLine label="MODE" value={sim.mode} highlight />
                <LiveTable tags={tags} rows={FUEL_PANEL_ROWS} />
              </Panel>
            </div>
          </div>
        </div>

        <AlarmStrip alarms={alarms} onAck={onAck} onOpen={onAlarmListToggle} tripActive={isTrip} />

        <div className="grid min-h-0 grid-cols-4 gap-2 overflow-hidden">
          <Panel title="SYSTEM STATUSES" accent="emerald" compact>
            <div className="grid grid-cols-2 gap-1.5">
              <StatusLamp
                label="NOX WATER INJ"
                on={String(tags.NOX_WATER_STATUS) === "Active"}
                onLabel="Active"
                offLabel="Inactive"
              />
              <StatusLamp label="RUN" on={isRun} onLabel="RUN" offLabel="STOP" invert />
              <StatusLamp
                label="SPRINT"
                on={String(tags.SPRINT_STATUS) === "Active"}
                onLabel="Active"
                offLabel="Inactive"
              />
              <StatusLamp
                label="CRANK"
                on={String(tags.CRANK_STATUS) === "Active"}
                onLabel="Active"
                offLabel="Inactive"
              />
            </div>
            <div
              className={`mt-1.5 truncate rounded border px-1.5 py-1 text-[10px] ${
                isTrip
                  ? "border-red-500/40 bg-red-950/50 text-red-200"
                  : "border-emerald-500/25 bg-black/50 text-emerald-300"
              }`}
            >
              LOCAL · SYNC · {String(tags.SEQ_TEXT)}
            </div>
          </Panel>

          <Panel title="EXCITER / AVR" accent="cyan" compact>
            <LiveDataLine label="Exciter Amps" value={fmt(tags.EXCITER_AMPS, 2)} unit="A" highlight />
            <LiveDataLine label="Exciter Volts" value={fmt(tags.EXCITER_VOLTS, 2)} unit="VDC" highlight />
            <div className="mt-2">
              <ActionButton label="AVR CONTROL" variant="ghost" />
            </div>
          </Panel>

          <Panel title="MW CONTROL" accent="emerald" compact>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <DigitalReadout label="MW OUTPUT" value={fmt(tags.MW, 2)} unit="MW" />
              <div className="flex flex-col gap-1">
                <ActionButton label="RAISE" onClick={onRaise} disabled={!mwCtrlEnabled} />
                <ActionButton label="LOWER" onClick={onLower} disabled={!mwCtrlEnabled} />
              </div>
            </div>
            <div className="mt-1">
              <LiveDataLine label="NSD REF" value={fmt(tags.NSDREF, 2)} unit="RPM" highlight />
              <LiveDataLine label="MW SETPOINT" value={fmt(tags.MW_SP, 2)} unit="MW" highlight />
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <StatusLamp label="RUN PERMISSIVE" on={runPermissiveOk} onLabel="OK" offLabel="NOT OK" />
              <StatusLamp label="MW CTRL" on={mwCtrlEnabled} onLabel="ENABLED" offLabel="DISABLED" />
            </div>
          </Panel>

          <Panel title="SHUTDOWN / VENTILATION" accent={isTrip ? "rose" : "cyan"} compact>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">Shutdown</div>
                <div className="space-y-0.5">
                  {["ESN", "ES", "SI", "DM", "NSD"].map((flag) => {
                    const active = isTrip && (flag === "ES" || flag === "ESN");
                    return (
                      <div
                        key={flag}
                        className={`flex items-center gap-1.5 text-[10px] ${
                          active ? "font-bold text-red-300" : "text-sky-400"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-red-500" : "bg-slate-600"}`} />
                        {flag}
                        {active ? " · ACT" : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">Vent</div>
                <LiveTable tags={tags} rows={VENTILATION_PANEL_ROWS} />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <aside className="flex min-h-0 flex-col overflow-hidden rounded-md border border-teal-500/35 bg-gradient-to-b from-[#0d3d42] via-[#0a2a30] to-[#071018] p-1.5">
        <div className="mb-1.5 grid shrink-0 grid-cols-2 gap-0.5">
          {["CONTROL", "SYSTEMS", "MISC", "VG CAL"].map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`rounded px-0.5 py-0.5 text-[7px] font-bold ${
                i === 0 ? "bg-cyan-500/25 text-cyan-100" : "bg-slate-800/50 text-slate-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mb-1.5 shrink-0 rounded border border-cyan-400/30 bg-cyan-500/10 py-1 text-center text-[9px] font-bold text-cyan-100">
          MAIN SCREEN
        </div>
        <div className="grid min-h-0 flex-1 grid-rows-[repeat(15,minmax(0,1fr))] gap-0.5 overflow-hidden">
          {NAV_ITEMS.map((item) => (
            <NavButton key={item} label={item} active={navActive === item} onClick={() => onNavSelect(item)} />
          ))}
        </div>
        <div className="mt-1.5 grid shrink-0 grid-cols-2 gap-0.5 border-t border-teal-500/20 pt-1.5">
          <ActionButton label="PRINT" variant="ghost" />
          <ActionButton label="Alarms" variant="ghost" onClick={onAlarmListToggle} />
          <ActionButton label="Ack" variant="ghost" onClick={onAck} />
          <ActionButton label="Reset" onClick={onTripReset} variant="danger" emphasize={isTrip} />
        </div>
      </aside>

      <AlarmListPanel alarms={alarms} open={alarmListOpen} onClose={onAlarmListClose} />
    </div>
  );
}

export function MainScreenHeader({
  sim,
  clock,
  history,
  alarmCount,
  onStartSeq,
  onForceTrip,
  onDemoReset,
}: {
  sim: SimulationState;
  clock: string;
  history: TagHistory;
  alarmCount: number;
  onStartSeq: () => void;
  onForceTrip: () => void;
  onDemoReset: () => void;
}) {
  const tags = sim.tags;
  const today = new Date().toLocaleDateString();
  const isTrip = sim.mode === "TRIP";

  return (
    <header
      className={`relative z-20 shrink-0 overflow-visible border-b px-3 py-2 text-slate-100 ${
        isTrip
          ? "border-red-500/50 bg-gradient-to-r from-red-950/80 via-[#122033] to-red-950/60"
          : "border-slate-700/80 bg-gradient-to-r from-[#0b1524] via-[#122033] to-[#0b1524]"
      }`}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white font-mono text-[10px] font-black text-slate-900">
            GE
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold tracking-wide">SENIPAH</div>
            <div className="text-[10px] text-slate-400">Gas Turbine Control · Unit 2</div>
          </div>
          {alarmCount > 0 || isTrip ? (
            <div className="shrink-0 rounded border border-red-500/40 bg-red-950/60 px-2 py-0.5 font-mono text-[9px] font-bold text-red-200">
              {isTrip ? "TRIP" : `${alarmCount} ACTIVE`}
            </div>
          ) : (
            <div className="shrink-0 rounded border border-emerald-500/25 bg-emerald-950/40 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-300">
              NORMAL
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg border border-red-400/50 bg-gradient-to-b from-red-500 to-red-700 px-6 py-1.5 text-sm font-black tracking-wider text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] transition hover:from-red-400 hover:to-red-600"
        >
          EMERG STOP
        </button>

        <div className="text-right">
          <div className="text-sm font-bold">
            MAIN SCREEN <span className="text-slate-500">|</span>{" "}
            <span className={`font-mono ${isTrip ? "text-red-300" : "text-cyan-200"}`}>{sim.mode}</span>
          </div>
          <div className="font-mono text-[11px] tabular-nums text-cyan-300">
            {clock} <span className="text-slate-500">|</span> {today}
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[auto_1fr_1fr_200px] items-center gap-2 text-[11px]">
        <DemoBar onStart={onStartSeq} onTrip={onForceTrip} onReset={onDemoReset} tripActive={isTrip} />
        <div className="truncate rounded border border-sky-500/20 bg-sky-500/10 px-2.5 py-1.5 font-semibold text-sky-300">
          REGULATOR: NSDPRX — NSD Regulator
        </div>
        <div
          className={`truncate rounded border px-2.5 py-1.5 text-right font-semibold ${
            isTrip
              ? "border-red-500/40 bg-red-950/50 text-red-200"
              : "border-sky-500/20 bg-sky-500/10 text-sky-300"
          }`}
        >
          SEQUENCE: {String(tags.SEQ_TEXT)}
        </div>
        <div className="flex h-[34px] items-center gap-2 overflow-hidden rounded border border-slate-700/60 bg-slate-950/60 px-2">
          <span className="shrink-0 font-mono text-[9px] font-bold uppercase text-slate-500">MW 30s</span>
          <div className="h-6 min-w-0 flex-1">
            <svg viewBox="0 0 120 24" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
              {history.MW.length > 1 ? (
                <polyline
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  points={history.MW
                    .map((v, i) => {
                      const x = (i / (history.MW.length - 1)) * 120;
                      const y = 22 - (Math.min(30, Math.max(0, v)) / 30) * 18;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ")}
                />
              ) : null}
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-6 gap-2 overflow-visible">
        <KpiChip
          label="N25"
          value={fmt(tags.N25, 1)}
          unit="RPM"
          emphasize
          tip="Putaran compressor (HP) — naik saat unit start"
        />
        <KpiChip label="NSD" value={fmt(tags.NSD, 1)} unit="RPM" tip="Putaran power turbine / load shaft" />
        <KpiChip label="PS3" value={fmt(tags.PS3, 1)} unit="psia" tip="Tekanan compressor discharge" />
        <KpiChip label="T48" value={fmt(tags.T48, 1)} unit="°F" tip="Suhu exhaust turbine (kritikal)" />
        <KpiChip label="T2" value={fmt(tags.T2, 1)} unit="°F" tip="Suhu inlet udara compressor" />
        <div className="rounded-md border border-cyan-400/45 bg-gradient-to-r from-cyan-700/30 to-sky-900/40 px-3 py-1.5 text-right">
          <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-cyan-200/70">
            MW OUTPUT
          </div>
          <div
            className={`font-mono text-xl font-black tabular-nums leading-none ${
              isTrip ? "text-red-300" : "text-white"
            }`}
          >
            {fmt(tags.MW, 1)}
          </div>
          <div className="mt-0.5 font-mono text-[8px] text-slate-500">daya listrik keluar</div>
        </div>
      </div>
    </header>
  );
}
