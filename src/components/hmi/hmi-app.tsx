"use client";

import { useEffect, useState } from "react";
import { MainScreen, MainScreenHeader } from "@/components/hmi/main-screen";
import {
  adjustSetpoint,
  createInitialSimulationState,
  forceTripReset,
  stepSimulation,
} from "@/lib/hmi/simulation";

type HmiAppProps = {
  currentScreenId: string;
};

export function HmiApp({ currentScreenId: _currentScreenId }: HmiAppProps) {
  const [sim, setSim] = useState(() => createInitialSimulationState());
  const [clock, setClock] = useState("");

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setSim((prev) => stepSimulation(prev, 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="flex min-h-screen items-start justify-center overflow-auto bg-[radial-gradient(ellipse_at_top,_#1e293b_0%,_#0f172a_50%,_#020617_100%)] p-4">
      <div className="grid h-[768px] w-[1366px] shrink-0 grid-rows-[118px_1fr] overflow-hidden rounded-xl border border-slate-600/50 bg-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <MainScreenHeader sim={sim} clock={clock} />
        <main className="min-h-0 overflow-hidden bg-slate-950/80">
          <MainScreen
            sim={sim}
            onRaise={() => setSim((prev) => adjustSetpoint(prev, 0.5))}
            onLower={() => setSim((prev) => adjustSetpoint(prev, -0.5))}
            onTripReset={() => setSim((prev) => forceTripReset(prev))}
          />
        </main>
      </div>
    </div>
  );
}
