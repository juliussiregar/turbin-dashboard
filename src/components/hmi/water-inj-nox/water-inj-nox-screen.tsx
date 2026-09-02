"use client";

import { useMemo } from "react";
import { WaterInjNoxOverlay } from "@/components/hmi/water-inj-nox/water-inj-nox-overlay";
import { buildOverlaySensorState } from "@/lib/hmi/overlay-sensor-state";
import type { SimulationState } from "@/lib/hmi/simulation";

export interface WaterInjNoxScreenProps {
  sim: SimulationState;
}

export function WaterInjNoxScreen({ sim }: WaterInjNoxScreenProps) {
  const overlayState = useMemo(() => buildOverlaySensorState(sim.tags), [sim.tags]);

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-black rounded-md border border-slate-700/70 p-1">
      <WaterInjNoxOverlay s={overlayState} />
    </div>
  );
}
