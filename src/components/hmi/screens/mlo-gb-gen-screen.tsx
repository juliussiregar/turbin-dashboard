"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1400;
const H = 959;
const IMAGE = "/hmi/screens/bg-mlo-gb-gen.png";
const READOUT_FONT_SIZE = 13.2;

function ScaleToFitMloGbGen({ children }: { children: ReactNode }) {
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

function resolveRunning(value: unknown) {
  return value === true || value === "RUN" || value === "ON";
}

type Props = { sim: SimulationState };

export function MloGbGenScreen({ sim }: Props) {
  const tags = sim.tags;
  const t2 = Number(tags.T2 ?? 85.1);
  const pt0183 = Number(tags.PT0183 ?? tags.PT_0183 ?? 28.9);

  const te0139 = Number(tags.TE0139 ?? t2 + 60.9);
  const pt0049 = Number(tags.PT0049 ?? pt0183 + 0.4);
  const te0021 = Number(tags.TE0021 ?? tags.TE_0021 ?? 176);
  const te0057 = Number(tags.TE0057 ?? tags.TE_0057 ?? 153.5);
  const te0022a1 = Number(tags.TE0022A1 ?? tags.TE_0022 ?? 143.6);
  const te0079 = Number(tags.TE0079 ?? tags.TE_0079 ?? 173.7);
  const te0080 = Number(tags.TE0080 ?? tags.TE_0080 ?? 180.1);
  const te0023 = Number(tags.TE0023 ?? tags.TE_0023 ?? 169.5);
  const te0036 = Number(tags.TE0036 ?? t2 + 67.2);
  const te0035 = Number(tags.TE0035 ?? t2 + 70.1);
  const te0082 = Number(tags.TE0082 ?? tags.TE_0082 ?? 167.8);
  const te0081 = Number(tags.TE0081 ?? tags.TE_0081 ?? 171.4);
  const te0084 = Number(tags.TE0084 ?? tags.TE_0081 ?? 171.9);

  const jackingPumpRunning = resolveRunning(tags.MOT_0085_RUN);
  const turningGearRunning = resolveRunning(tags.MOT_0129_RUN);

  const fmtDegF = (value: number) => `${value.toFixed(1)}°F`;
  const fmtPsig = (value: number) => `${value.toFixed(1)} psig`;

  return (
    <ScaleToFitMloGbGen>
      <Image
        src={IMAGE}
        alt="Mineral Lube Oil Gearbox and Generator"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* Dynamic instrument readouts measured against the native background. */}
      <SolidBox val={fmtDegF(te0139)} top={119} left={299} w={81} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtPsig(pt0183)} top={118} left={494} w={85} h={24} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtPsig(pt0049)} top={205} left={203} w={86} h={24} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0021)} top={293} left={399} w={84} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0057)} top={343} left={622} w={84} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0022a1)} top={440} left={400} w={84} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0079)} top={259} left={1011} w={84} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0080)} top={259} left={1195} w={84} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0023)} top={381} left={912} w={83} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0036)} top={689} left={399} w={84} h={24} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0035)} top={689} left={709} w={84} h={24} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0082)} top={656} left={968} w={82} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0081)} top={656} left={1220} w={83} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />
      <SolidBox val={fmtDegF(te0084)} top={850} left={1216} w={83} h={23} fontSize={READOUT_FONT_SIZE} bgColor="#000" />

      {/* Jacking-oil pump and turning-gear motor states. */}
      <StatusTxt
        text={jackingPumpRunning ? "RUN" : "STOP"}
        top={267}
        left={197}
        w={71}
        h={30}
        fontSize={20}
        isRed={jackingPumpRunning}
      />
      <StatusTxt
        text={turningGearRunning ? "RUN" : "STOP"}
        top={514}
        left={1234}
        w={70}
        h={30}
        fontSize={20}
        isRed={turningGearRunning}
      />
    </ScaleToFitMloGbGen>
  );
}
