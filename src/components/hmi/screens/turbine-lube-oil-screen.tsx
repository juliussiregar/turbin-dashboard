"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ImageOverlay } from "@/components/hmi/overlay/image-overlay";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1391;
const H = 1067;
const IMAGE = "/hmi/screens/bg-turbine-lube-oil.png";
const READOUT_FONT_SIZE = 14.52;
const MCD_READOUT_FONT_SIZE = 12.1;

function ScaleToFitTurbineLubeOil({ children }: { children: ReactNode }) {
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

function resolveRunning(value: unknown, fallback: boolean) {
  if (value === true || value === "RUN" || value === "ON") return true;
  if (value === false || value === "STOP" || value === "OFF") return false;
  return fallback;
}

function valvePosition(value: unknown, fallback: "OPN" | "CLS") {
  if (value == null) return fallback;
  const normalized = String(value).toUpperCase();
  return normalized === "OPN" || normalized === "OPEN" ? "OPN" : "CLS";
}

function simulatedValue(base: number, tick: number, channel: number, spread: number) {
  if (tick === 0) return base;
  const fastWave = Math.sin(tick * 1.91 + channel * 2.37);
  const slowWave = Math.sin(tick * 0.47 + channel * 1.13);
  return base + (fastWave * 0.65 + slowWave * 0.35) * spread;
}

function AnimatedFan({
  cx,
  cy,
  size,
  color,
  spinning,
}: {
  cx: number;
  cy: number;
  size: number;
  color: "red" | "green";
  spinning: boolean;
}) {
  const displaySize = color === "red" ? size : size * 1.075;
  // The source PNG canvases are not centered on the blade hubs. Position and
  // rotate from the measured hub so the visible rotor does not orbit its box.
  const pivotX = color === "red" ? 51.2 : 48.6;
  const pivotY = color === "red" ? 51.3 : 47.9;
  return (
    <ImageOverlay
      asset={`fan-${color}`}
      top={cy - displaySize * (pivotY / 100)}
      left={cx - displaySize * (pivotX / 100)}
      w={displaySize}
      h={displaySize}
      animateRotate={spinning}
      pivotX={pivotX}
      pivotY={pivotY}
    />
  );
}

type Props = { sim: SimulationState };

export function TurbineLubeOilScreen({ sim }: Props) {
  const tags = sim.tags;
  const operating = sim.mode !== "STOPPED" && sim.mode !== "TRIP";

  const [sampleTick, setSampleTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSampleTick((tick) => tick + 1), 500);
    return () => window.clearInterval(id);
  }, []);

  const te1023 = simulatedValue(numericTag(tags, ["TE1023", "TE_1023"], 150.6), sampleTick, 1, 0.45);
  const te1029 = simulatedValue(numericTag(tags, ["TE1029", "TE_1029"], 212.1), sampleTick, 2, 0.45);
  const te1025 = simulatedValue(numericTag(tags, ["TE1025", "TE_1025"], 234.6), sampleTick, 3, 0.45);
  const te1026 = simulatedValue(numericTag(tags, ["TE1026", "TE_1026"], 266.6), sampleTick, 4, 0.45);
  const te1027 = simulatedValue(numericTag(tags, ["TE1027", "TE_1027"], 249.4), sampleTick, 5, 0.45);
  const te1030 = simulatedValue(numericTag(tags, ["TE1030", "TE_1030"], 232.2), sampleTick, 6, 0.45);
  const te1028 = simulatedValue(numericTag(tags, ["TE1028", "TE_1028"], 112.8), sampleTick, 7, 0.35);
  const lt1002 = simulatedValue(numericTag(tags, ["LT1002", "LT_1002"], 68.6), sampleTick, 8, 0.25);
  const te1013 = simulatedValue(numericTag(tags, ["TE1013", "TE_1013"], 118.9), sampleTick, 9, 0.35);
  const mcd1059 = simulatedValue(numericTag(tags, ["MCD1059", "MCD_1059"], 169.3), sampleTick, 10, 0.3);
  const mcd1062 = simulatedValue(numericTag(tags, ["MCD1062", "MCD_1062"], 169.3), sampleTick, 11, 0.3);
  const mcd1066 = simulatedValue(numericTag(tags, ["MCD1066", "MCD_1066"], 169.3), sampleTick, 12, 0.3);
  const pt1022 = simulatedValue(numericTag(tags, ["PT1022", "PT_1022"], 25.8), sampleTick, 13, 0.2);
  const pdt1014 = simulatedValue(numericTag(tags, ["PDT1014", "PDT_1014"], 8.3), sampleTick, 14, 0.16);
  const pdt1082 = simulatedValue(numericTag(tags, ["PDT1082", "PDT_1082"], 0), sampleTick, 15, 0.08);
  const te1031 = simulatedValue(numericTag(tags, ["TE1031", "TE_1031"], 111), sampleTick, 16, 0.35);
  const pt1021 = simulatedValue(numericTag(tags, ["PT1021", "PT_1021", "PT1021A1"], 68.4), sampleTick, 17, 0.2);
  const te1037a1 = simulatedValue(numericTag(tags, ["TE1037A1", "TE_1037A1"], 112.4), sampleTick, 18, 0.35);
  const te1036a1 = simulatedValue(numericTag(tags, ["TE1036A1", "TE_1036A1"], 102.6), sampleTick, 19, 0.35);
  const te1035a1 = simulatedValue(numericTag(tags, ["TE1035A1", "TE_1035A1"], 211.3), sampleTick, 20, 0.45);
  const pdt1006 = simulatedValue(numericTag(tags, ["PDT1006", "PDT_1006"], 4.3), sampleTick, 21, 0.16);
  const pdt1007 = simulatedValue(numericTag(tags, ["PDT1007", "PDT_1007"], 3.3), sampleTick, 22, 0.16);

  const fan0156Spinning = resolveRunning(tags.MOT_0156_RUN, operating);
  const fan0157Spinning = resolveRunning(tags.MOT_0157_RUN, operating);
  const fan1083Spinning = resolveRunning(tags.MOT_1083_RUN, operating);
  const sov1085 = valvePosition(tags.SOV_1085_STATUS, "CLS");

  const degF = (value: number) => `${value.toFixed(1)}°F`;
  const psig = (value: number) => `${value.toFixed(1)} psig`;
  const psid = (value: number) => `${value.toFixed(1)} psid`;

  return (
    <ScaleToFitTurbineLubeOil>
      <Image
        src={IMAGE}
        alt="Turbine lube oil system"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* Fan locations and colors are mapped from sample_screen/GT2-010.jpg. */}
      <AnimatedFan cx={445} cy={755} size={58} color="red" spinning={fan0156Spinning} />
      <AnimatedFan cx={445} cy={870} size={57} color="green" spinning={fan0157Spinning} />
      <AnimatedFan cx={1285} cy={568} size={56} color="red" spinning={fan1083Spinning} />

      <SolidBox val={degF(te1023)} top={37} left={477} w={73} h={26} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1029)} top={37} left={575} w={74} h={26} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1025)} top={37} left={674} w={73} h={26} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1026)} top={37} left={772} w={74} h={26} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1027)} top={37} left={871} w={73} h={26} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1030)} top={37} left={969} w={75} h={26} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1028)} top={37} left={1068} w={71} h={26} fontSize={READOUT_FONT_SIZE} bgColor="#000" />

      <SolidBox val={`${lt1002.toFixed(1)}%`} top={179} left={360} w={68} h={26} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1013)} top={428} left={99} w={73} h={27} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${mcd1059.toFixed(1)} ohm`} top={410} left={341} w={86} h={27} fontSize={MCD_READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${mcd1062.toFixed(1)} ohm`} top={410} left={437} w={86} h={27} fontSize={MCD_READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={`${mcd1066.toFixed(1)} ohm`} top={410} left={533} w={86} h={27} fontSize={MCD_READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psig(pt1022)} top={412} left={918} w={86} h={30} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psid(pdt1014)} top={412} left={1022} w={82} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psid(pdt1082)} top={390} left={1252} w={86} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1031)} top={518} left={729} w={73} h={27} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psig(pt1021)} top={520} left={918} w={86} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1037a1)} top={644} left={99} w={73} h={27} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1036a1)} top={838} left={99} w={73} h={27} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psid(pdt1007)} top={889} left={918} w={90} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={psid(pdt1006)} top={899} left={719} w={91} h={29} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={degF(te1035a1)} top={930} left={594} w={74} h={27} fontSize={READOUT_FONT_SIZE} bgColor="#000" />

      <StatusTxt
        text={sov1085}
        top={323}
        left={1225}
        w={60}
        h={30}
        fontSize={14.4}
        isRed={sov1085 === "OPN"}
        kind="valve"
      />
    </ScaleToFitTurbineLubeOil>
  );
}
