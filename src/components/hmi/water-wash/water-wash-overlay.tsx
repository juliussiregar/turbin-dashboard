"use client";

import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import { ScaleToFit } from "@/components/hmi/overlay/scale-to-fit";
import type { HmiSensorState } from "@/lib/hmi/overlay-sensor-types";

export interface WaterWashOverlayProps {
  s: HmiSensorState;
  className?: string;
}

const BACKGROUND_SRC = "/water_wash.png";
const WW_WIDTH = 1479;
const WW_HEIGHT = 1028;

function WaterWashElements({ s }: { s: HmiSensorState }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Sensor values */}
      <SolidBox val={s.ww_pdt5000} top={56} left={851} w={90} h={34} fontSize={16} />
      <SolidBox val={s.ww_pt5001} top={56} left={1035} w={90} h={34} fontSize={16} />
      <SolidBox val={s.ww_lt5042} top={443} left={986} w={89} h={35} fontSize={16} />
      <SolidBox val={s.ww_te5040a1} top={549} left={903} w={89} h={34} fontSize={16} />
      <SolidBox val={s.ww_pt5041} top={920} left={408} w={89} h={35} fontSize={16} />

      {/* Valves */}
      {/* <StatusTxt text={s.ww_sov5032 ? "OPN" : "CLS"} top={400} left={365} w={55} h={25} fontSize={14} isRed={!!s.ww_sov5032} kind="valve" />
      <StatusTxt text={s.ww_sov5033 ? "OPN" : "CLS"} top={840} left={365} w={55} h={25} fontSize={14} isRed={!!s.ww_sov5033} kind="valve" />
      <StatusTxt text={s.ww_sov5039 ? "OPN" : "CLS"} top={435} left={825} w={55} h={25} fontSize={14} isRed={!!s.ww_sov5039} kind="valve" /> */}

      {/* Motors & Heaters */}
      {/* <StatusTxt text={s.ww_mot5035 ? "RUN" : "STOP"} top={915} left={920} w={60} h={25} fontSize={14} isRed={!s.ww_mot5035} />
      <StatusTxt text={s.ww_he5044 ? "ON" : "OFF"} top={725} left={1240} w={60} h={25} fontSize={14} isRed={!s.ww_he5044} />
      <StatusTxt text={s.ww_he5036 ? "ON" : "OFF"} top={815} left={1240} w={60} h={25} fontSize={14} isRed={!s.ww_he5036} /> */}

      {/* Time Remaining */}
      <div style={{ position: "absolute", background: "white", top: 214, width: 50, height: 32, left: 735, fontSize: 18, fontWeight: "bold", color: "#111827", fontFamily: "monospace", textAlign: "right" }}>
        {s.ww_time_remain}
      </div>
      <div style={{ position: "absolute", background: "white", top: 248, width: 50, height: 32, left: 735, fontSize: 18, fontWeight: "bold", color: "#111827", fontFamily: "monospace", textAlign: "right" }}>
        {s.ww_soak_remain}
      </div>
    </div>
  );
}

export function WaterWashOverlay({ s, className }: WaterWashOverlayProps) {
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
            alt="Water Wash Background"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            draggable={false}
          />
          <WaterWashElements s={s} />
        </div>
      </ScaleToFit>
    </div>
  );
}
