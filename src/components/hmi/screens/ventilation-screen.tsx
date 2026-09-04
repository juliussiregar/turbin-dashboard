"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ImageOverlay } from "@/components/hmi/overlay/image-overlay";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1410;
const H = 1090;
const IMAGE = "/hmi/screens/bg-ventilation.png";
const READOUT_FONT_SIZE = 11.5;

const READOUTS = [
  { keys: ["TE4085A1", "TE_4085A1"], fallback: 91.2, kind: "temperature", top: 54, left: 350, w: 54, h: 22, drift: 0.35 },
  { keys: ["TE4083A1", "TE_4083A1"], fallback: 91.2, kind: "temperature", top: 56, left: 451, w: 55, h: 20, drift: 0.35 },
  { keys: ["PDT4005", "PDT_4005"], fallback: -0.9, kind: "pressure", top: 56, left: 615, w: 66, h: 20, drift: 0.06 },
  { keys: ["PDT4004", "PDT_4004"], fallback: -1.2, kind: "pressure", top: 56, left: 737, w: 67, h: 20, drift: 0.06 },
  { keys: ["TE4084A1", "TE_4084A1"], fallback: 89.3, kind: "temperature", top: 54, left: 880, w: 53, h: 22, drift: 0.35 },
  { keys: ["TE4086A1", "TE_4086A1"], fallback: 88.5, kind: "temperature", top: 54, left: 982, w: 54, h: 22, drift: 0.35 },
  { keys: ["TE4082A1", "TE_4082A1"], fallback: 90.5, kind: "temperature", top: 59, left: 1107, w: 51, h: 21, drift: 0.35 },
  { keys: ["PDT4014", "PDT_4014"], fallback: 1.3, kind: "pressure", top: 376, left: 346, w: 61, h: 20, drift: 0.05 },
  { keys: ["PDT4011", "PDT_4011"], fallback: 1.9, kind: "pressure", top: 392, left: 911, w: 61, h: 20, drift: 0.05 },
  { keys: ["PDT4007", "PDT_4007"], fallback: -5.6, kind: "pressure", top: 454, left: 1337, w: 66, h: 20, drift: 0.08 },
  { keys: ["TE4030", "TE_4030"], fallback: 144.2, kind: "temperature", top: 504, left: 53, w: 60, h: 20, drift: 0.5 },
  { keys: ["TE4001", "TE_4001"], fallback: 141.4, kind: "temperature", top: 554, left: 1327, w: 61, h: 20, drift: 0.5 },
  { keys: ["TE4102", "TE_4102"], fallback: 113.8, kind: "temperature", top: 642, left: 53, w: 60, h: 20, drift: 0.45 },
  { keys: ["TE4054", "TE_4054"], fallback: 93.8, kind: "temperature", top: 658, left: 1334, w: 54, h: 20, drift: 0.4 },
  { keys: ["TE4031", "TE_4031"], fallback: 141.6, kind: "temperature", top: 776, left: 53, w: 60, h: 20, drift: 0.5 },
  { keys: ["TE4090", "TE_4090"], fallback: 84.9, kind: "temperature", top: 845, left: 1211, w: 54, h: 19, drift: 0.35 },
  { keys: ["TE4023A1", "TE_4023A1"], fallback: 168.1, kind: "temperature", top: 893, left: 184, w: 61, h: 21, drift: 0.55 },
  { keys: ["TE4022A1", "TE_4022A1"], fallback: 161.4, kind: "temperature", top: 893, left: 280, w: 61, h: 21, drift: 0.55 },
  { keys: ["TE4021A1", "TE_4021A1"], fallback: 162.6, kind: "temperature", top: 893, left: 373, w: 61, h: 21, drift: 0.55 },
  { keys: ["TE4101A1", "TE_4101A1"], fallback: 90.6, kind: "temperature", top: 914, left: 806, w: 54, h: 20, drift: 0.4 },
  { keys: ["TE4101B1", "TE_4101B1"], fallback: 87, kind: "temperature", top: 914, left: 897, w: 55, h: 20, drift: 0.4 },
  { keys: ["TE4101C1", "TE_4101C1"], fallback: 92.9, kind: "temperature", top: 914, left: 989, w: 55, h: 20, drift: 0.4 },
  { keys: ["TE4101D1", "TE_4101D1"], fallback: 87.8, kind: "temperature", top: 914, left: 1082, w: 54, h: 20, drift: 0.4 },
  { keys: ["TE4093A1", "TE_4093A1"], fallback: 99.9, kind: "temperature", top: 931, left: 497, w: 52, h: 20, drift: 0.4 },
  { keys: ["TE4091A1", "TE_4091A1"], fallback: 99.5, kind: "temperature", top: 930, left: 591, w: 54, h: 21, drift: 0.4 },
  { keys: ["TE4026A1", "TE_4026A1"], fallback: 152.8, kind: "temperature", top: 1000, left: 184, w: 61, h: 22, drift: 0.5 },
  { keys: ["TE4025A1", "TE_4025A1"], fallback: 159.9, kind: "temperature", top: 1000, left: 280, w: 61, h: 22, drift: 0.5 },
  { keys: ["TE4024A1", "TE_4024A1"], fallback: 149.7, kind: "temperature", top: 1001, left: 373, w: 60, h: 21, drift: 0.5 },
] as const;

function ScaleToFitVentilation({ children }: { children: ReactNode }) {
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

function resolveRunning(value: unknown, fallback: boolean) {
  if (value === true || value === "RUN" || value === "ON") return true;
  if (value === false || value === "STOP" || value === "OFF") return false;
  return fallback;
}

function simulatedValue(base: number, tick: number, channel: number, spread: number) {
  if (tick === 0) return base;
  const fastWave = Math.sin(tick * 1.79 + channel * 1.67);
  const slowWave = Math.sin(tick * 0.43 + channel * 0.91);
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

export function VentilationScreen({ sim }: Props) {
  const tags = sim.tags;
  const operating = sim.mode !== "STOPPED" && sim.mode !== "TRIP";
  const [sampleTick, setSampleTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSampleTick((tick) => tick + 1), 500);
    return () => window.clearInterval(id);
  }, []);

  const fan4103aRunning = resolveRunning(tags.MOT_4103A_RUN, operating);
  const fan4103bRunning = resolveRunning(tags.MOT_4103B_RUN, operating);
  const fan4017aRunning = resolveRunning(tags.MOT_4017A_RUN, operating);
  const fan4017bRunning = resolveRunning(tags.MOT_4017B_RUN, operating);
  const fan4020Running = resolveRunning(tags.MOT_4020_RUN, operating);
  const fan4019Running = resolveRunning(tags.MOT_4019_RUN, operating);

  return (
    <ScaleToFitVentilation>
      <Image
        src={IMAGE}
        alt="Turbine ventilation"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* Fan hub centers and colors are mapped from sample_screen/GT2-012.jpg. */}
      <AnimatedFan cx={547} cy={389} size={54} color="red" spinning={fan4103aRunning} />
      <AnimatedFan cx={625} cy={389} size={52} color="green" spinning={fan4103bRunning} />
      <AnimatedFan cx={1127} cy={405} size={54} color="red" spinning={fan4017aRunning} />
      <AnimatedFan cx={1204} cy={405} size={52} color="green" spinning={fan4017bRunning} />
      <AnimatedFan cx={1139} cy={754} size={29} color="green" spinning={fan4020Running} />
      <AnimatedFan cx={1201} cy={754} size={29} color="green" spinning={fan4019Running} />

      {READOUTS.map((readout, index) => {
        const value = simulatedValue(
          numericTag(tags, readout.keys, readout.fallback),
          sampleTick,
          index + 1,
          readout.drift,
        );
        const formatted =
          readout.kind === "pressure" ? `${value.toFixed(1)}\"H2O` : `${value.toFixed(1)}°F`;

        return (
          <SolidBox
            key={readout.keys[0]}
            val={formatted}
            top={readout.top}
            left={readout.left}
            w={readout.w}
            h={readout.h}
            fontSize={READOUT_FONT_SIZE}
            bgColor="#000"
          />
        );
      })}
    </ScaleToFitVentilation>
  );
}
