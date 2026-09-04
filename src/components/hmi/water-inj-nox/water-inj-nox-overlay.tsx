"use client";

import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import { ScaleToFit } from "@/components/hmi/overlay/scale-to-fit";
import type { HmiSensorState } from "@/lib/hmi/overlay-sensor-types";

export interface WaterInjNoxOverlayProps {
  s: HmiSensorState;
  className?: string;
}

const BACKGROUND_SRC = "/water_inj_nox.png";
const WW_WIDTH = 1480;
const WW_HEIGHT = 1027;

function WaterInjNoxElements({ s }: { s: HmiSensorState }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* NOX Dummy Elements */}
      <SolidBox val={s.nox_val1} top={57} left={1169} w={89} h={33} fontSize={14} />
      <SolidBox val={s.nox_val2} top={57} left={1270} w={90} h={33} fontSize={14} />

      {/* Water Injection Status */}
      <StatusTxt
        text={s.nox_water_status ? "ACTIVE" : "INACTIVE"}
        top={66}
        left={506}
        w={95}
        h={24}
        fontSize={14}
        isRed={!s.nox_water_status}
      />

      <SolidBox val={s.nox_val6} top={89} left={722} w={118} h={51} fontSize={16} />
      <SolidBox val={s.nox_val7} top={220} left={186} w={86} h={29} fontSize={14} />
      <SolidBox val={s.nox_val8} top={332} left={419} w={85} h={29} fontSize={14} />
      <SolidBox val={s.nox_val9} top={345} left={554} w={85} h={29} fontSize={14} />
      <SolidBox val={s.nox_val10} top={345} left={768} w={85} h={29} fontSize={14} />
      <SolidBox val={s.nox_val11} top={366} left={70} w={85} h={29} fontSize={14} />
      <SolidBox val={s.nox_val12} top={500} left={698} w={52} h={20} fontSize={14} />
      <SolidBox val={s.nox_val16} top={520} left={698} w={52} h={20} fontSize={14} />
      <SolidBox val={s.nox_val13} top={518} left={986} w={85} h={29} fontSize={14} />
      <SolidBox val={s.nox_val14} top={567} left={474} w={85} h={29} fontSize={14} />
      <SolidBox val={s.nox_val15} top={697} left={186} w={86} h={29} fontSize={14} />
    </div>
  );
}

export function WaterInjNoxOverlay({ s, className }: WaterInjNoxOverlayProps) {
  return (
    <div className="relative h-full min-h-0 w-full bg-black rounded-md overflow-hidden border border-slate-700/70">
      <ScaleToFit
        width={WW_WIDTH}
        height={WW_HEIGHT}
        className={className ?? "flex h-full min-h-0 w-full items-center justify-center"}
      >
        <div style={{ position: "relative", width: WW_WIDTH, height: WW_HEIGHT, overflow: "hidden" }}>
          <img
            src={BACKGROUND_SRC}
            alt="Water Inj Nox Background"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            draggable={false}
          />
          <WaterInjNoxElements s={s} />
        </div>
      </ScaleToFit>
    </div>
  );
}
