"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1480;
const H = 1027;
const IMAGE = "/hmi/screens/bg-water_inj_nox.png";
const READOUT_FONT_SIZE = 14;

function ScaleToFitWaterInjNox({ children }: { children: ReactNode }) {
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

export function WaterInjNoxScreen({ sim }: Props) {
  const tags = sim.tags;
  const waterActive = String(tags.NOX_WATER_STATUS ?? "Inactive").toUpperCase() === "ACTIVE";
  const value = (key: string, fallback: number) => numericTag(tags, key, fallback);
  const gpm = (key: string, fallback: number) => `${value(key, fallback).toFixed(1)} gpm`;
  const sov2038 = valvePosition(tags.SOV_2038_STATUS);
  const sov2208 = valvePosition(tags.SOV_2208_STATUS);
  const sov2010 = valvePosition(tags.SOV_2010_STATUS);

  return (
    <ScaleToFitWaterInjNox>
      <Image
        src={IMAGE}
        alt="Water injection NOx system"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      <SolidBox val={`${value("NOX_VAL1", 50.1).toFixed(1)} psig`} top={57} left={1169} w={89} h={33} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${value("NOX_VAL2", 45.2).toFixed(1)} psig`} top={57} left={1270} w={90} h={33} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <StatusTxt text={waterActive ? "ACTIVE" : "INACTIVE"} top={66} left={506} w={95} h={24} fontSize={14} isRed={!waterActive} />
      <SolidBox val={gpm("NOX_VAL6", 99.9)} top={89} left={722} w={118} h={51} fontSize={16} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL7", 34.2)} top={220} left={186} w={86} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL8", 22.1)} top={332} left={419} w={85} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL9", 44.4)} top={345} left={554} w={85} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL10", 55.5)} top={345} left={768} w={85} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL11", 66.6)} top={366} left={70} w={85} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL12", 77.7)} top={500} left={698} w={52} h={20} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL16", 33.3)} top={520} left={698} w={52} h={20} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL13", 88.8)} top={518} left={986} w={85} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL14", 11.1)} top={567} left={474} w={85} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={gpm("NOX_VAL15", 22.2)} top={697} left={186} w={86} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />

      <StatusTxt text={sov2038} top={464} left={925} w={54} h={25} fontSize={14.4} isRed={sov2038 === "OPN"} kind="valve" />
      <StatusTxt text={sov2208} top={676} left={763} w={54} h={25} fontSize={14.4} isRed={sov2208 === "OPN"} kind="valve" />
      <StatusTxt text={sov2010} top={705} left={1149} w={54} h={25} fontSize={14.4} isRed={sov2010 === "OPN"} kind="valve" />
    </ScaleToFitWaterInjNox>
  );
}
