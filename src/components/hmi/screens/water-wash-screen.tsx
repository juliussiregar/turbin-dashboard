"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1479;
const H = 1028;
const IMAGE = "/hmi/screens/bg-water_wash.png";
const READOUT_FONT_SIZE = 16;

function ScaleToFitWaterWash({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / W, height / H));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-black">
      <div style={{ position: "relative", width: W * scale, height: H * scale }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function numericTag(tags: SimulationState["tags"], key: string, fallback: number) {
  const value = tags[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function valvePosition(value: unknown, fallback: "OPN" | "CLS" = "CLS") {
  if (value == null) return fallback;
  const normalized = String(value).toUpperCase();
  return normalized === "OPN" || normalized === "OPEN" ? "OPN" : "CLS";
}

type Props = { sim: SimulationState };

export function WaterWashScreen({ sim }: Props) {
  const tags = sim.tags;
  const pdt5000 = numericTag(tags, "WW_PDT5000", 0);
  const pt5001 = numericTag(tags, "WW_PT5001", 113);
  const lt5042 = numericTag(tags, "WW_LT5042", -0.3);
  const te5040a1 = numericTag(tags, "WW_TE5040A1", 88.3);
  const pt5041 = numericTag(tags, "WW_PT5041", -0.1);
  const timeRemain = numericTag(tags, "WW_TIME_REMAIN", 0);
  const soakRemain = numericTag(tags, "WW_SOAK_REMAIN", 0);
  const sov5032 = valvePosition(tags.WW_SOV5032_STATUS ?? tags.WW_SOV5032);
  const sov5033 = valvePosition(tags.WW_SOV5033_STATUS ?? tags.WW_SOV5033);
  const sov5039 = valvePosition(tags.WW_SOV5039_STATUS ?? tags.WW_SOV5039);

  return (
    <ScaleToFitWaterWash>
      <Image
        src={IMAGE}
        alt="Water wash system"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      <SolidBox val={`${pdt5000.toFixed(1)} psid`} top={56} left={851} w={90} h={34} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${pt5001.toFixed(1)} psig`} top={56} left={1035} w={90} h={34} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${lt5042.toFixed(1)}%`} top={443} left={986} w={89} h={35} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${te5040a1.toFixed(1)}°F`} top={549} left={903} w={89} h={34} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${pt5041.toFixed(1)} psig`} top={920} left={408} w={89} h={35} fontSize={READOUT_FONT_SIZE} bgColor="#000" />

      <StatusTxt text={sov5032} top={409} left={379} w={54} h={25} fontSize={14.4} isRed={sov5032 === "OPN"} kind="valve" />
      <StatusTxt text={sov5033} top={849} left={381} w={54} h={25} fontSize={14.4} isRed={sov5033 === "OPN"} kind="valve" />
      <StatusTxt text={sov5039} top={415} left={866} w={54} h={25} fontSize={14.4} isRed={sov5039 === "OPN"} kind="valve" />

      <div
        style={{
          position: "absolute",
          top: 214,
          left: 735,
          width: 50,
          height: 32,
          background: "white",
          color: "#111827",
          fontFamily: "monospace",
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "right",
        }}
      >
        {Math.round(timeRemain)}
      </div>
      <div
        style={{
          position: "absolute",
          top: 248,
          left: 735,
          width: 50,
          height: 32,
          background: "white",
          color: "#111827",
          fontFamily: "monospace",
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "right",
        }}
      >
        {Math.round(soakRemain)}
      </div>
    </ScaleToFitWaterWash>
  );
}
