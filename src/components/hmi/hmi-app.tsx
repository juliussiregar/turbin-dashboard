"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MainScreen, MainScreenHeader } from "@/components/hmi/main-screen";
import {
  acknowledgeAll,
  createAlarm,
  detectAlarms,
  pruneAlarms,
  type HmiAlarm,
} from "@/lib/hmi/alarms";
import {
  adjustSetpoint,
  createInitialSimulationState,
  forceTrip,
  forceTripReset,
  startSequence,
  stepSimulation,
  type SimulationState,
} from "@/lib/hmi/simulation";
import type { TagHistory } from "@/lib/hmi/tag-history";

const HISTORY_LEN = 30;

function pushHistory(prev: TagHistory, sim: SimulationState): TagHistory {
  const next = (key: keyof TagHistory, value: number) => {
    const arr = [...prev[key], value];
    return arr.length > HISTORY_LEN ? arr.slice(arr.length - HISTORY_LEN) : arr;
  };
  return {
    MW: next("MW", Number(sim.tags.MW) || 0),
    N25: next("N25", Number(sim.tags.N25) || 0),
    VIB_A: next("VIB_A", Number(sim.tags.VIB_A) || 0),
  };
}

function emptyHistory(sim: SimulationState): TagHistory {
  const mw = Number(sim.tags.MW) || 0;
  const n25 = Number(sim.tags.N25) || 0;
  const vib = Number(sim.tags.VIB_A) || 0;
  return {
    MW: Array.from({ length: 8 }, () => mw),
    N25: Array.from({ length: 8 }, () => n25),
    VIB_A: Array.from({ length: 8 }, () => vib),
  };
}

type HmiAppProps = {
  currentScreenId: string;
  unitId?: "gtg1" | "gtg2";
  demo?: "trip_demo" | "load_ramp";
};

export function HmiApp({
  currentScreenId: _currentScreenId,
  unitId = "gtg1",
  demo,
}: HmiAppProps) {
  const router = useRouter();
  const unitLabel = unitId === "gtg2" ? "GTG-2" : "GTG-1";
  const [sim, setSim] = useState(() => createInitialSimulationState());
  const [clock, setClock] = useState("");
  const [history, setHistory] = useState<TagHistory>(() => emptyHistory(createInitialSimulationState()));
  const [alarms, setAlarms] = useState<HmiAlarm[]>([]);
  const [alarmListOpen, setAlarmListOpen] = useState(false);
  const [navActive, setNavActive] = useState("Previous Screen");

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  useEffect(() => {
    if (demo !== "trip_demo") return;
    const t = window.setTimeout(() => {
      setSim((prev) => forceTrip(prev));
      setAlarms((cur) =>
        pruneAlarms([
          createAlarm("SEQ", `${unitLabel} UNIT TRIP — demo scenario from plant overview`, "ALARM"),
          ...cur,
        ])
      );
    }, 600);
    return () => window.clearTimeout(t);
  }, [demo, unitLabel]);

  useEffect(() => {
    const tick = setInterval(() => {
      setSim((prev) => {
        const next = stepSimulation(prev, 1000);
        const fresh = detectAlarms(
          {
            mode: prev.mode,
            vibA: Number(prev.tags.VIB_A) || 0,
            lube: Number(prev.tags.LUBE_OIL_PRESS) || 0,
            mw: Number(prev.tags.MW) || 0,
          },
          {
            mode: next.mode,
            vibA: Number(next.tags.VIB_A) || 0,
            lube: Number(next.tags.LUBE_OIL_PRESS) || 0,
            mw: Number(next.tags.MW) || 0,
          }
        );
        if (fresh.length) {
          setAlarms((cur) => pruneAlarms([...fresh, ...cur]));
        }
        setHistory((h) => pushHistory(h, next));
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const activeAlarmCount = useMemo(() => alarms.filter((a) => a.state === "active").length, [alarms]);
  const isTrip = sim.mode === "TRIP";

  const pushInfo = (message: string, tagId = "MW_SP") => {
    setAlarms((cur) => pruneAlarms([createAlarm(tagId, message, "INFO"), ...cur]));
  };

  return (
    <div className="flex h-dvh animate-[hmi-fade-in_280ms_ease-out] flex-col md:flex-row items-stretch justify-center bg-[radial-gradient(ellipse_at_top,_#1e293b_0%,_#0f172a_50%,_#020617_100%)] p-0 md:p-2 overflow-hidden">
      <div
        className={`relative flex h-full flex-col w-full max-w-[1920px] lg:grid lg:grid-rows-[auto_minmax(0,1fr)] overflow-y-auto overflow-x-hidden lg:overflow-hidden md:rounded-xl border-x-0 border-y md:border bg-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.55)] ${
          isTrip ? "border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.2)]" : "border-slate-600/50"
        }`}
      >
        <MainScreenHeader
          sim={sim}
          clock={clock}
          history={history}
          alarmCount={activeAlarmCount}
          unitLabel={unitLabel}
          onStartSeq={() => {
            setSim((prev) => startSequence(prev));
            pushInfo("Demo: start sequence → CRANKING", "SEQ");
          }}
          onForceTrip={() => {
            setSim((prev) => forceTrip(prev));
            setAlarms((cur) =>
              pruneAlarms([createAlarm("SEQ", "UNIT TRIP — emergency sequence active", "ALARM"), ...cur])
            );
          }}
          onDemoReset={() => {
            setSim((prev) => forceTripReset(prev));
            pushInfo("Demo: trip reset — unit stopped", "SEQ");
          }}
        />
        <main className="relative flex flex-col flex-1 min-h-0 bg-[#0b1220] lg:overflow-hidden">
          <MainScreen
            sim={sim}
            history={history}
            alarms={alarms}
            alarmListOpen={alarmListOpen}
            navActive={navActive}
            onNavSelect={setNavActive}
            onAlarmListToggle={() => setAlarmListOpen((v) => !v)}
            onAlarmListClose={() => setAlarmListOpen(false)}
            onAck={() => setAlarms((a) => acknowledgeAll(a))}
            onRaise={() => {
              setSim((prev) => {
                const next = adjustSetpoint(prev, 0.5);
                if (next.mwSetpoint !== prev.mwSetpoint) {
                  const sp = next.mwSetpoint.toFixed(1);
                  queueMicrotask(() =>
                    setAlarms((cur) =>
                      pruneAlarms([createAlarm("MW_SP", `MW setpoint RAISE → ${sp} MW`, "INFO"), ...cur])
                    )
                  );
                }
                return next;
              });
            }}
            onLower={() => {
              setSim((prev) => {
                const next = adjustSetpoint(prev, -0.5);
                if (next.mwSetpoint !== prev.mwSetpoint) {
                  const sp = next.mwSetpoint.toFixed(1);
                  queueMicrotask(() =>
                    setAlarms((cur) =>
                      pruneAlarms([createAlarm("MW_SP", `MW setpoint LOWER → ${sp} MW`, "INFO"), ...cur])
                    )
                  );
                }
                return next;
              });
            }}
            onTripReset={() => {
              setSim((prev) => forceTripReset(prev));
              setAlarms((cur) =>
                pruneAlarms([createAlarm("SEQ", "Trip reset — unit stopped", "INFO"), ...cur])
              );
            }}
          />
        </main>
      </div>
    </div>
  );
}
