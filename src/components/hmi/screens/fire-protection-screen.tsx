"use client";

import { useEffect, useRef, useState } from "react";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1370;
const H = 964;
const IMAGE = "/hmi/screens/bg-fire-protection-overlay.png";

// Auto-detected tag box positions (background coords 1370×964)
// Positions scanned directly from bg-fire-protection-overlay.png (1370×964)
const TAGS = {
  PSH_3057A:  { x: 526, y:  56, w:  89, h: 35 },
  HS_3063:    { x:  28, y: 170, w:  89, h: 35 },
  SOV_3060:   { x: 450, y: 245, w:  89, h: 35 },
  SOV_3059:   { x: 599, y: 245, w:  89, h: 35 },
  SOV_3061:   { x: 725, y: 245, w:  89, h: 35 },
  SOV_3062:   { x: 875, y: 245, w:  89, h: 35 },
  HS_3008:    { x: 372, y: 393, w:  89, h: 35 },
  HS_3040:    { x: 570, y: 394, w:  90, h: 35 },
  YSL_3041:   { x: 835, y: 394, w:  90, h: 35 },
  YSA_3006:   { x: 963, y: 394, w:  90, h: 35 },
  AE_3029:    { x:1261, y: 392, w:  89, h: 35 },
  HS_3009:    { x:  18, y: 468, w:  90, h: 35 },
  YSL_3044:   { x: 122, y: 468, w:  89, h: 35 },
  TS_3028:    { x: 363, y: 472, w:  89, h: 35 },
  TS_3012:    { x: 467, y: 472, w:  89, h: 35 },
  AE_3007:    { x: 570, y: 472, w:  90, h: 35 },
  TS_3003:    { x: 674, y: 472, w:  89, h: 35 },
  BE_3000:    { x: 778, y: 471, w:  89, h: 35 },
  YSL_3036:   { x: 881, y: 472, w:  90, h: 35 },
  AE_3004:    { x:1045, y: 472, w:  89, h: 35 },
  AE_3030:    { x:1261, y: 487, w:  89, h: 35 },
  TS_3027:    { x:  16, y: 652, w:  90, h: 35 },
  YSA_3026:   { x:  16, y: 741, w:  90, h: 35 },
  YSL_3042:   { x:1260, y: 785, w:  89, h: 35 },
  HS_3024:    { x: 111, y: 900, w:  90, h: 35 },
  BE_3025:    { x: 290, y: 900, w:  89, h: 35 },
  AE_3013:    { x: 448, y: 900, w:  90, h: 35 },
  YSL_3045:   { x: 551, y: 900, w:  90, h: 35 },
  YSA_3046:   { x: 655, y: 900, w:  90, h: 35 },
  BE_3016:    { x: 759, y: 900, w:  90, h: 35 },
  BE_3017:    { x: 862, y: 900, w:  90, h: 35 },
  AE_3015:    { x: 966, y: 900, w:  89, h: 35 },
  TS_3014:    { x:1070, y: 900, w:  89, h: 35 },
} as const;

type TagKey = keyof typeof TAGS;

function ScaleToFitFP({ children }: { children: React.ReactNode }) {
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
    <div ref={containerRef} className="flex h-full min-h-0 w-full overflow-hidden items-center justify-center bg-black">
      <div style={{ position: "relative", width: W * scale, height: H * scale }}>
        <div
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: W, height: H,
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

function Overlay({ tag, text, isRed, kind }: {
  tag: TagKey;
  text: string;
  isRed?: boolean;
  kind?: "motor" | "valve";
}) {
  const { x, y, w, h } = TAGS[tag];
  return <StatusTxt text={text} top={y} left={x} w={w} h={h} fontSize={10} isRed={isRed} kind={kind} />;
}

type Props = { sim: SimulationState };

export function FireProtectionScreen({ sim }: Props) {
  const isTrip = sim.mode === "TRIP";

  return (
    <ScaleToFitFP>
      <img
        src={IMAGE}
        alt="Fire Protection"
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* SOV discharge valves — open on trip (CO2 released) */}
      {isTrip && (
        <>
          <Overlay tag="SOV_3060" text="OPN" isRed kind="valve" />
          <Overlay tag="SOV_3059" text="OPN" isRed kind="valve" />
          <Overlay tag="SOV_3061" text="OPN" isRed kind="valve" />
          <Overlay tag="SOV_3062" text="OPN" isRed kind="valve" />
        </>
      )}

      {/* Gas/flame detectors — alarm on trip */}
      {isTrip && (
        <>
          <Overlay tag="AE_3029" text="ALARM" isRed />
          <Overlay tag="AE_3030" text="ALARM" isRed />
          <Overlay tag="AE_3007" text="ALARM" isRed />
          <Overlay tag="AE_3004" text="ALARM" isRed />
          <Overlay tag="AE_3013" text="ALARM" isRed />
          <Overlay tag="AE_3015" text="ALARM" isRed />
        </>
      )}
    </ScaleToFitFP>
  );
}
