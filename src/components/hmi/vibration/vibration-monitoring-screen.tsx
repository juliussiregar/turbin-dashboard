"use client";

import { useMemo } from "react";
import { VibrationMonitoringOverlay } from "@/components/hmi/vibration/vibration-monitoring-overlay";
import { buildOverlaySensorState } from "@/lib/hmi/overlay-sensor-state";
import type { SimulationState } from "@/lib/hmi/simulation";

export interface VibrationMonitoringScreenProps {
  sim: SimulationState;
}

export function VibrationMonitoringScreen({ sim }: VibrationMonitoringScreenProps) {
  const overlayState = useMemo(() => buildOverlaySensorState(sim.tags), [sim.tags]);

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-black rounded-md border border-slate-700/70 p-1">
      <VibrationMonitoringOverlay s={overlayState} />
    </div>
  );
}
