"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1356;
const H = 990;
const IMAGE = "/hmi/screens/bg-hyd-starter.png";

function ScaleToFitHydStarter({ children }: { children: ReactNode }) {
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

type Props = { sim: SimulationState };

export function HydStarterScreen({ sim }: Props) {
  const tags = sim.tags;
  const t2 = Number(tags.T2 ?? 84.9);

  const pdt6025 = Number(tags.PDT6025 ?? -Math.abs(Number(tags.PDT4005 ?? 0.1)));
  const te6027 = Number(tags.TE6027 ?? tags.TE_0023 ?? 170.3);
  const te6026a1 = Number(tags.TE6026A1 ?? t2 + 4);
  const te6003 = Number(tags.TE6003 ?? t2 + 6.5);
  const te6002a1 = Number(tags.TE6002A1 ?? t2 + 2.5);
  const lt6001 = Number(tags.LT6001 ?? Number(tags.LT0135A ?? 72.4) + 11.1);
  const starterRunning = Boolean(tags.MOT_6015_RUN);

  const fmtDegF = (value: number) => `${value.toFixed(1)}°F`;
  const fmtPsid = (value: number) => `${value.toFixed(1)} psid`;
  const fmtPct = (value: number) => `${value.toFixed(1)}%`;

  return (
    <ScaleToFitHydStarter>
      <Image
        src={IMAGE}
        alt="Hydraulic Starter"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* Dynamic instrument readouts measured against the native background. */}
      <SolidBox val={fmtPsid(pdt6025)} top={286} left={58} w={86} h={24} fontSize={13.2} bgColor="#000" />
      <SolidBox val={fmtDegF(te6027)} top={128} left={1087} w={82} h={23} fontSize={13.2} bgColor="#000" />
      <SolidBox val={fmtDegF(te6026a1)} top={503} left={590} w={83} h={23} fontSize={13.2} bgColor="#000" />
      <SolidBox val={fmtDegF(te6003)} top={694} left={112} w={82} h={23} fontSize={13.2} bgColor="#000" />
      <SolidBox val={fmtDegF(te6002a1)} top={676} left={890} w={81} h={23} fontSize={13.2} bgColor="#000" />
      <SolidBox val={fmtPct(lt6001)} top={798} left={948} w={79} h={23} fontSize={13.2} bgColor="#000" />

      {/* MOT-6015 status occupies the large status slot below the motor. */}
      <StatusTxt
        text={starterRunning ? "RUN" : "STOP"}
        top={293}
        left={536}
        w={103}
        h={38}
        fontSize={33.6}
        isRed={starterRunning}
      />
    </ScaleToFitHydStarter>
  );
}
