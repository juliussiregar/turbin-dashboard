"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ImageOverlay } from "@/components/hmi/overlay/image-overlay";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 809;
const H = 886;
const IMAGE = "/hmi/screens/bg-skid-enclosure.png";

function ScaleToFitSkidEnclosure({ children }: { children: ReactNode }) {
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

type Props = { sim: SimulationState };

export function SkidEnclosureScreen({ sim }: Props) {
  const tags = sim.tags;
  const operating = sim.mode !== "STOPPED" && sim.mode !== "TRIP";

  const fan4027aSpinning = resolveRunning(tags.MOT_4027A_RUN, operating);
  const fan4027bSpinning = resolveRunning(tags.MOT_4027B_RUN, operating);
  const sov4041 = valvePosition(tags.SOV_4041_STATUS, operating ? "OPN" : "CLS");
  const te4028 = Number(tags.TE4028 ?? Number(tags.T2 ?? 85.1) + 9.4);

  return (
    <ScaleToFitSkidEnclosure>
      <Image
        src={IMAGE}
        alt="Skid Enclosure"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* Fan positions cross-checked against sample_screen/GT2-008.jpg. */}
      <ImageOverlay
        asset="fan-green"
        top={234}
        left={303}
        w={58}
        h={58}
        animateRotate={fan4027aSpinning}
        pivotX={50}
        pivotY={50}
      />
      <ImageOverlay
        asset="fan-red"
        top={236}
        left={445}
        w={54}
        h={54}
        animateRotate={fan4027bSpinning}
        pivotX={50}
        pivotY={50}
      />

      <SolidBox val={`${te4028.toFixed(1)}°F`} top={440} left={141} w={86} h={23} fontSize={13.2} bgColor="#000" />
      <StatusTxt
        text={sov4041}
        top={447}
        left={518}
        w={55}
        h={25}
        fontSize={14.4}
        isRed={sov4041 === "OPN"}
        kind="valve"
      />
    </ScaleToFitSkidEnclosure>
  );
}
