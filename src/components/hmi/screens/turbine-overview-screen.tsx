"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1291;
const H = 973;
const IMAGE = "/hmi/screens/bg-turbine-overview.png";
const READOUT_FONT_SIZE = 11.5;
const BAR_BOTTOM = 186;
const BAR_HEIGHT = 151;
const BAR_MAX_TEMPERATURE = 2000;
const EXHAUST_SIMULATION_SWING = 85;

const EXHAUST_CHANNELS = [
  { keys: ["TE8045A", "TE8045A1", "TE_8045A"], offset: 110, left: 420, width: 4 },
  { keys: ["TE8045B", "TE8045B1", "TE_8045B"], offset: -260, left: 512, width: 6 },
  { keys: ["TE8045C", "TE8045C1", "TE_8045C"], offset: 210, left: 606, width: 4 },
  { keys: ["TE8045D", "TE8045D1", "TE_8045D"], offset: -80, left: 698, width: 6 },
  { keys: ["TE8045E", "TE8045E1", "TE_8045E"], offset: -390, left: 792, width: 4 },
  { keys: ["TE8045F", "TE8045F1", "TE_8045F"], offset: 145, left: 884, width: 4 },
  { keys: ["TE8045G", "TE8045G1", "TE_8045G"], offset: -170, left: 976, width: 6 },
  { keys: ["TE8045H", "TE8045H1", "TE_8045H"], offset: -520, left: 1070, width: 4 },
  { keys: ["TE8045", "TE_8045", "T48"], offset: 0, left: 1164, width: 4 },
] as const;

const EXHAUST_READOUTS = [
  { left: 379, width: 67 },
  { left: 472, width: 69 },
  { left: 565, width: 69 },
  { left: 658, width: 68 },
  { left: 750, width: 69 },
  { left: 843, width: 67 },
  { left: 936, width: 69 },
  { left: 1029, width: 69 },
  { left: 1123, width: 69 },
] as const;

function ScaleToFitTurbineOverview({ children }: { children: ReactNode }) {
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

function numericTag(tags: SimulationState["tags"], keys: readonly string[], fallback: number) {
  for (const key of keys) {
    const value = tags[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return fallback;
}

function simulatedValue(base: number, tick: number, channel: number, spread: number) {
  if (tick === 0) return base;
  const fastWave = Math.sin(tick * 1.73 + channel * 1.91);
  const slowWave = Math.sin(tick * 0.41 + channel * 0.83);
  return base + (fastWave * 0.62 + slowWave * 0.38) * spread;
}

function ExhaustTemperatureBar({ value, left, width }: { value: number; left: number; width: number }) {
  const boundedValue = Math.max(0, Math.min(BAR_MAX_TEMPERATURE, value));
  const height = (boundedValue / BAR_MAX_TEMPERATURE) * BAR_HEIGHT;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: BAR_BOTTOM - height,
        width,
        height,
        backgroundColor: "#ed1c24",
        transition: "top 450ms linear, height 450ms linear",
      }}
    />
  );
}

type Props = { sim: SimulationState };

export function TurbineOverviewScreen({ sim }: Props) {
  const tags = sim.tags;
  const [sampleTick, setSampleTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSampleTick((tick) => tick + 1), 500);
    return () => window.clearInterval(id);
  }, []);

  const t48 = numericTag(tags, ["T48"], 1662.3);
  const exhaustTemperatures = EXHAUST_CHANNELS.map((channel, index) =>
    simulatedValue(
      numericTag(tags, channel.keys, t48 + channel.offset),
      sampleTick,
      index + 1,
      EXHAUST_SIMULATION_SWING,
    ),
  );
  const exhaustSpread = Math.max(...exhaustTemperatures) - Math.min(...exhaustTemperatures);

  const pt8014 = simulatedValue(numericTag(tags, ["PT8014", "PT_8014"], 14.6), sampleTick, 10, 0.08);
  const vigv = simulatedValue(numericTag(tags, ["VIGV", "ZE8072"], 29), sampleTick, 11, 0.18);
  const vbv = simulatedValue(numericTag(tags, ["VBV", "ZE8071"], 41.8), sampleTick, 12, 0.18);
  const te8036 = simulatedValue(numericTag(tags, ["TE8036", "TE_8036", "T25"], 211.7), sampleTick, 13, 0.45);
  const vsv = simulatedValue(numericTag(tags, ["VSV", "ZE8073"], 78.9), sampleTick, 14, 0.18);
  const te8039 = simulatedValue(numericTag(tags, ["TE8039", "TE_8039", "T3"], 941.2), sampleTick, 15, 0.65);
  const pt8061 = simulatedValue(numericTag(tags, ["PT8061", "PT_8061"], 74.7), sampleTick, 16, 0.12);
  const se8013 = simulatedValue(numericTag(tags, ["SE8013", "SE_8013", "NSD"], 3904), sampleTick, 17, 1.4);
  const pt8065 = simulatedValue(numericTag(tags, ["PT8065", "PT_8065"], 72.3), sampleTick, 18, 0.12);
  const te8021 = simulatedValue(numericTag(tags, ["TE8021", "TE_8021", "T2"], 85.1), sampleTick, 19, 0.3);
  const pt8059 = simulatedValue(numericTag(tags, ["PT8059", "PT_8059"], 26.5), sampleTick, 20, 0.1);
  const se8082 = simulatedValue(numericTag(tags, ["SE8082", "SE_8082", "N25"], 10022), sampleTick, 21, 2.2);
  const pt8090 = simulatedValue(numericTag(tags, ["PT8090", "PT_8090"], 0.7), sampleTick, 22, 0.04);
  const pt8025 = simulatedValue(numericTag(tags, ["PT8025", "PT_8025", "PS3"], 286.1), sampleTick, 23, 0.25);
  const vigvDemand = numericTag(tags, ["VIGV_DMD", "ZE8072_DMD"], 0);
  const vbvDemand = numericTag(tags, ["VBV_DMD", "ZE8071_DMD"], 0);
  const vsvDemand = numericTag(tags, ["VSV_DMD", "ZE8073_DMD"], 0);

  const degF = (value: number) => `${value.toFixed(1)}°F`;
  const percent = (value: number) => `${value.toFixed(1)}%`;
  const psia = (value: number) => `${value.toFixed(1)} psia`;

  return (
    <ScaleToFitTurbineOverview>
      <Image
        src={IMAGE}
        alt="Turbine overview"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* Bar baselines and channel order are mapped from sample_screen/GT2-011.jpg. */}
      {EXHAUST_CHANNELS.map((channel, index) => (
        <ExhaustTemperatureBar
          key={channel.keys[0]}
          value={exhaustTemperatures[index]}
          left={channel.left}
          width={channel.width}
        />
      ))}

      {EXHAUST_READOUTS.map((readout, index) => (
        <SolidBox
          key={EXHAUST_CHANNELS[index].keys[0]}
          val={degF(exhaustTemperatures[index])}
          top={8}
          left={readout.left}
          w={readout.width}
          h={21}
          fontSize={READOUT_FONT_SIZE}
          bgColor="#000"
        />
      ))}

      <SolidBox val={degF(exhaustSpread)} top={110} left={268} w={60} h={21} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psia(pt8014)} top={337} left={81} w={65} h={21} fontSize={READOUT_FONT_SIZE} bgColor="#000" />

      <SolidBox val={percent(vigv)} top={322} left={188} w={54} h={20} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${Math.round(vigvDemand)}%`} top={356} left={210} w={32} h={19} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={percent(vbv)} top={322} left={296} w={54} h={20} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${Math.round(vbvDemand)}%`} top={356} left={318} w={32} h={19} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te8036)} top={338} left={401} w={61} h={19} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={percent(vsv)} top={316} left={535} w={54} h={24} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${Math.round(vsvDemand)}%`} top={356} left={558} w={32} h={19} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te8039)} top={338} left={646} w={63} h={20} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psia(pt8061)} top={334} left={909} w={66} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />

      <SolidBox val={`${Math.round(se8013)} rpm`} top={558} left={1027} w={69} h={22} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psia(pt8065)} top={780} left={951} w={67} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te8021)} top={870} left={176} w={53} h={20} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psia(pt8059)} top={870} left={342} w={66} h={22} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${Math.round(se8082)} rpm`} top={870} left={434} w={76} h={22} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psia(pt8090)} top={870} left={554} w={58} h={22} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psia(pt8025)} top={870} left={694} w={75} h={22} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
    </ScaleToFitTurbineOverview>
  );
}
