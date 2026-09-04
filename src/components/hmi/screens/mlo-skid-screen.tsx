"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ImageOverlay } from "@/components/hmi/overlay/image-overlay";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1400;
const H = 1004;
const IMAGE = "/hmi/screens/bg-mlo-skid.png";
const READOUT_FONT_SIZE = 13.2;

const MOTOR_STATUS = {
  MOT_0109: { x: 184, y: 704, w: 84, h: 31 },
  MOT_0108B: { x: 304, y: 704, w: 86, h: 31 },
  MOT_0108A: { x: 427, y: 704, w: 88, h: 31 },
} as const;

type MotorStatusKey = keyof typeof MOTOR_STATUS;

function ScaleToFitMloSkid({ children }: { children: ReactNode }) {
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

function MotorStatus({ tag, running }: { tag: MotorStatusKey; running: boolean }) {
  const { x, y, w, h } = MOTOR_STATUS[tag];
  return (
    <StatusTxt
      text={running ? "RUN" : "STOP"}
      top={y}
      left={x}
      w={w}
      h={h}
      fontSize={20}
      isRed={running}
    />
  );
}

function resolveRunning(value: unknown, fallback: boolean) {
  if (value === true || value === "RUN" || value === "ON") return true;
  if (value === false || value === "STOP" || value === "OFF") return false;
  return fallback;
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
  // The green source has slightly more transparent padding than the red one.
  const displaySize = color === "red" ? size : size * 1.075;
  return (
    <ImageOverlay
      asset={`fan-${color}`}
      top={cy - displaySize / 2}
      left={cx - displaySize / 2}
      w={displaySize}
      h={displaySize}
      animateRotate={spinning}
      pivotX={50}
      pivotY={50}
    />
  );
}

type Props = { sim: SimulationState };

export function MloSkidScreen({ sim }: Props) {
  const tags = sim.tags;
  const t2 = Number(tags.T2 ?? 84.9);
  const lubePressure = Number(tags.LUBE_OIL_PRESS ?? 62.5);

  const te0138a1 = Number(tags.TE0138A1 ?? t2 - 5.7);
  const pdt0130 = Number(tags.PDT0130 ?? lubePressure * 0.0848);
  const pt0123 = Number(tags.PT0123 ?? lubePressure * 0.0112);
  const pt0122 = Number(tags.PT0122 ?? lubePressure * -0.0176);
  const pt0121 = Number(tags.PT0121 ?? lubePressure - 1.2);
  const te0136 = Number(tags.TE0136 ?? tags.TE_0079 ?? 174);
  const pdt0124 = Number(tags.PDT0124 ?? Number(tags.PDT4004 ?? 0.12) * -16.67);
  const lt0135 = Number(tags.LT0135 ?? tags.LT0135A ?? 73.5);

  const mot0109 = Boolean(tags.MOT_0109_RUN);
  const mot0108b = Boolean(tags.MOT_0108B_RUN);
  const mot0108a = Boolean(tags.MOT_0108A_RUN);

  const operating = sim.mode !== "STOPPED" && sim.mode !== "TRIP";
  const fan0156Running = resolveRunning(tags.MOT_0156_RUN, operating);
  const fan0157Running = resolveRunning(tags.MOT_0157_RUN, operating);
  const fan0110Running = resolveRunning(tags.MOT_0110_RUN, operating);
  const fan0233Running = resolveRunning(tags.MOT_0233_RUN, operating);

  const fmtDegF = (value: number) => `${value.toFixed(1)}°F`;
  const fmtPsig = (value: number) => `${value.toFixed(1)} psig`;
  const fmtPsid = (value: number) => `${value.toFixed(1)} psid`;
  const fmtInH2O = (value: number) => `${value.toFixed(1)}\"H2O`;
  const fmtPct = (value: number) => `${value.toFixed(1)}%`;

  return (
    <ScaleToFitMloSkid>
      <Image
        src={IMAGE}
        alt="Mineral Lube Oil Skid"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* Fan color follows the reference diagram; animation follows live state. */}
      <AnimatedFan cx={438} cy={154} size={54} color="red" spinning={fan0156Running} />
      <AnimatedFan cx={438} cy={262} size={54} color="green" spinning={fan0157Running} />
      <AnimatedFan cx={706.5} cy={533.5} size={57} color="red" spinning={fan0110Running} />
      <AnimatedFan cx={786.5} cy={648.5} size={43} color="red" spinning={fan0233Running} />

      {/* Dynamic instrument readouts measured against the native background. */}
      <SolidBox val={fmtDegF(te0138a1)} top={126} left={670} w={82} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtPsid(pdt0130)} top={166} left={903} w={86} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtPsig(pt0123)} top={570} left={186} w={87} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtPsig(pt0122)} top={570} left={307} w={88} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtPsig(pt0121)} top={570} left={425} w={84} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0136)} top={636} left={563} w={84} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtInH2O(pdt0124)} top={740} left={563} w={89} h={23} fontSize={11} bgColor="#000" />
      <SolidBox val={fmtPct(lt0135)} top={839} left={994} w={82} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />

      {/* Generator lube-oil pump states. */}
      <MotorStatus tag="MOT_0109" running={mot0109} />
      <MotorStatus tag="MOT_0108B" running={mot0108b} />
      <MotorStatus tag="MOT_0108A" running={mot0108a} />
    </ScaleToFitMloSkid>
  );
}
