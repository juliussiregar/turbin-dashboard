"use client";

import { useEffect, useState } from "react";
import {
  SOLENOID_VALVE_VARIANT_PRESETS,
  type ValvePosition,
} from "@/lib/hmi/valve-tag-registry";
import { SolenoidValve, solenoidValveViewBox } from "./solenoid-valve";

export function SolenoidValveInteractivePreview() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [position, setPosition] = useState<ValvePosition>("OPN");

  const preset = SOLENOID_VALVE_VARIANT_PRESETS[presetIndex];
  const viewBox = solenoidValveViewBox(preset.orientation);
  const [, , w, h] = viewBox.split(" ").map(Number);

  useEffect(() => {
    setPosition(preset.position);
  }, [preset.position, presetIndex]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {SOLENOID_VALVE_VARIANT_PRESETS.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setPresetIndex(index)}
            className={`rounded border px-2 py-0.5 text-[10px] transition ${
              index === presetIndex
                ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-200"
                : "border-slate-600/60 bg-slate-800/70 text-slate-300 hover:border-cyan-500/40"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">Klik valve untuk toggle OPN / CLS</p>
      <div className="overflow-hidden rounded-lg border border-slate-600 bg-black p-2">
        <svg
          viewBox={viewBox}
          width="100%"
          height={140}
          preserveAspectRatio="xMidYMid meet"
          className="block w-full max-w-[360px]"
          aria-label="SolenoidValve interactive preview"
        >
          <rect x={0} y={0} width={w} height={h} fill="#000" />
          <SolenoidValve
            position={position}
            orientation={preset.orientation}
            actuator={preset.actuator}
            flowArrow={preset.flowArrow}
            x={0}
            y={0}
            onClick={() => setPosition((prev) => (prev === "OPN" ? "CLS" : "OPN"))}
          />
        </svg>
      </div>
    </div>
  );
}
