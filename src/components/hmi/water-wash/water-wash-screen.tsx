"use client";

import { useMemo } from "react";
import { WaterWashOverlay } from "@/components/hmi/water-wash/water-wash-overlay";
import { buildOverlaySensorState } from "@/lib/hmi/overlay-sensor-state";
import type { SimulationState } from "@/lib/hmi/simulation";

export interface WaterWashScreenProps {
  sim: SimulationState;
}

export function WaterWashScreen({ sim }: WaterWashScreenProps) {
  const overlayState = useMemo(() => buildOverlaySensorState(sim.tags), [sim.tags]);

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-black rounded-md border border-slate-700/70 p-1">
      <WaterWashOverlay s={overlayState} />
    </div>
  );
}
