"use client";

import { ActionButton, NavButton } from "@/components/hmi/dashboard-ui";

const MENU_TABS = ["CONTROL", "SYSTEMS", "MISC", "VG CAL"] as const;

export const HMI_SCREEN_MENU_ITEMS = [
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
] as const;

type HmiScreenMenuProps = {
  title: string;
  activeItem: string;
  isTrip: boolean;
  onSelect: (item: string) => void;
  onAlarmListToggle: () => void;
  onAck: () => void;
  onTripReset: () => void;
};

export function HmiScreenMenu({
  title,
  activeItem,
  isTrip,
  onSelect,
  onAlarmListToggle,
  onAck,
  onTripReset,
}: HmiScreenMenuProps) {
  return (
    <aside className="flex flex-col md:min-h-0 overflow-hidden rounded-md border border-teal-500/35 bg-gradient-to-b from-[#0d3d42] via-[#0a2a30] to-[#071018] p-1.5">
      <div className="mb-1.5 grid shrink-0 grid-cols-2 gap-0.5">
        {MENU_TABS.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`rounded px-0.5 py-0.5 text-[7px] font-bold ${
              index === 0 ? "bg-cyan-500/25 text-cyan-100" : "bg-slate-800/50 text-slate-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-1.5 shrink-0 rounded border border-cyan-400/30 bg-cyan-500/10 py-1 text-center text-[9px] font-bold text-cyan-100">
        {title}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-1 md:grid-rows-[repeat(15,minmax(0,1fr))] gap-1 md:gap-0.5 overflow-visible md:overflow-hidden">
        {HMI_SCREEN_MENU_ITEMS.map((item) => (
          <NavButton key={item} label={item} active={activeItem === item} onClick={() => onSelect(item)} />
        ))}
      </div>

      <div className="mt-1.5 grid shrink-0 grid-cols-2 gap-0.5 border-t border-teal-500/20 pt-1.5">
        <ActionButton label="PRINT" variant="ghost" />
        <ActionButton label="Alarms" variant="ghost" onClick={onAlarmListToggle} />
        <ActionButton label="Ack" variant="ghost" onClick={onAck} />
        <ActionButton label="Reset" onClick={onTripReset} variant="danger" emphasize={isTrip} />
      </div>
    </aside>
  );
}
