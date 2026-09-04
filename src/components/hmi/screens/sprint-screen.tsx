"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1395;
const H = 958;
const IMAGE = "/hmi/screens/bg-sprint.png";
const READOUT_FONT_SIZE = 13.2;
const VALVE_STATUS_FONT_SIZE = 14.4;

function ScaleToFitSprint({ children }: { children: ReactNode }) {
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

function numericTag(tags: SimulationState["tags"], keys: string[], fallback: number) {
  for (const key of keys) {
    const value = tags[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return fallback;
}

function valvePosition(value: unknown, fallback: "OPN" | "CLS") {
  if (value == null) return fallback;
  const normalized = String(value).toUpperCase();
  return normalized === "OPN" || normalized === "OPEN" ? "OPN" : "CLS";
}

function resolveRunning(value: unknown, fallback: boolean) {
  if (value === true || value === "RUN" || value === "ON") return true;
  if (value === false || value === "STOP" || value === "OFF") return false;
  return fallback;
}

type Props = { sim: SimulationState };

export function SprintScreen({ sim }: Props) {
  const tags = sim.tags;
  const sprintActive = String(tags.SPRINT_STATUS ?? "Inactive").toUpperCase() === "ACTIVE";

  const pt2112 = numericTag(tags, ["PT2112", "PT_2112"], -1.9);
  const pt2116 = numericTag(tags, ["PT2116", "PT_2116"], 89.4);
  const pt2101 = numericTag(tags, ["PT2101", "PT_2101"], 4.4);
  const te2102 = numericTag(tags, ["TE2102", "TE_2102"], 92.1);
  const ft2105 = numericTag(tags, ["FT2105", "FT_2105", "NOX_FB"], 0.3);
  const fcv2104Demand = numericTag(tags, ["FCV2104_DMD", "FCV_2104_DMD", "NOX_DMD"], 0);
  const pdt2108 = numericTag(tags, ["PDT2108", "PDT_2108"], 0.2);

  const sov2110 = valvePosition(tags.SOV_2110_STATUS, sprintActive ? "OPN" : "CLS");
  const sov2111 = valvePosition(tags.SOV_2111_STATUS, sprintActive ? "CLS" : "OPN");
  const sov2107 = valvePosition(tags.SOV_2107_STATUS, sprintActive ? "OPN" : "CLS");
  const sov2174 = valvePosition(tags.SOV_2174_STATUS, sprintActive ? "OPN" : "CLS");
  const pumpRunning = resolveRunning(tags.MOT_2100_RUN, sprintActive);

  return (
    <ScaleToFitSprint>
      <Image
        src={IMAGE}
        alt="Sprint system"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* The permissive/control tables at upper left intentionally remain part of the background. */}
      <SolidBox val={`${pt2112.toFixed(1)} psig`} top={174} left={706} w={82} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${pt2116.toFixed(1)} psig`} top={301} left={866} w={84} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${pt2101.toFixed(1)} psig`} top={658} left={487} w={82} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${te2102.toFixed(1)}°F`} top={658} left={580} w={70} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${ft2105.toFixed(1)} gpm`} top={658} left={793} w={85} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${fcv2104Demand.toFixed(1)}%`} top={789} left={725} w={52} h={25} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${pdt2108.toFixed(1)} psid`} top={864} left={1084} w={86} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />

      <StatusTxt text={sov2110} top={315} left={556} w={51} h={29} fontSize={VALVE_STATUS_FONT_SIZE} isRed={sov2110 === "OPN"} kind="valve" />
      <StatusTxt text={sov2111} top={535} left={369} w={60} h={32} fontSize={VALVE_STATUS_FONT_SIZE} isRed={sov2111 === "OPN"} kind="valve" />
      <StatusTxt text={sov2107} top={628} left={994} w={55} h={30} fontSize={VALVE_STATUS_FONT_SIZE} isRed={sov2107 === "OPN"} kind="valve" />
      <StatusTxt text={sov2174} top={581} left={1226} w={55} h={30} fontSize={VALVE_STATUS_FONT_SIZE} isRed={sov2174 === "OPN"} kind="valve" />
      <StatusTxt text={pumpRunning ? "RUN" : "STOP"} top={711} left={397} w={72} h={31} fontSize={20} isRed={pumpRunning} />
    </ScaleToFitSprint>
  );
}
