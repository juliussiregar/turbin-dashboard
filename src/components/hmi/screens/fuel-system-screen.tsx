"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1399;
const H = 1047;
const IMAGE = "/hmi/screens/bg-fuel-system.png";
const VALVE_STATUS_FONT_SIZE = 14.4;

// Dynamic OPN/CLS regions measured against bg-fuel-system.png (1399×1047).
const VALVE_STATUS = {
  SOV_2061: { x: 631, y: 82, w: 45, h: 22 },
  SOV_2008: { x: 929, y: 71, w: 45, h: 22 },
  SOV_2060: { x: 565, y: 190, w: 45, h: 22 },
  SOV_2006: { x: 864, y: 190, w: 45, h: 22 },
  SOV_2004: { x: 963, y: 190, w: 45, h: 22 },
  SOV_2038: { x: 1007, y: 708, w: 48, h: 22 },
  SOV_2208: { x: 900, y: 846, w: 48, h: 22 },
  SOV_2010: { x: 1208, y: 885, w: 48, h: 22 },
} as const;

type ValveStatusKey = keyof typeof VALVE_STATUS;

function ScaleToFitFuelSystem({ children }: { children: ReactNode }) {
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

function ValveStatus({ tag, text }: { tag: ValveStatusKey; text: string }) {
  const { x, y, w, h } = VALVE_STATUS[tag];
  return (
    <StatusTxt
      text={text}
      top={y}
      left={x}
      w={w}
      h={h}
      fontSize={VALVE_STATUS_FONT_SIZE}
      isRed={text === "OPN"}
      kind="valve"
    />
  );
}

function valvePosition(value: unknown, fallback: "OPN" | "CLS" = "CLS") {
  if (value == null) return fallback;
  const normalized = String(value).toUpperCase();
  return normalized === "OPN" || normalized === "OPEN" ? "OPN" : "CLS";
}

type Props = { sim: SimulationState };

export function FuelSystemScreen({ sim }: Props) {
  const tags = sim.tags;

  const gasA = valvePosition(tags.SOL_GAS_A_STATUS);
  const gasB = valvePosition(tags.SOL_GAS_B_STATUS);
  const gasC = valvePosition(tags.SOL_GAS_C_STATUS);
  const gasD = valvePosition(tags.SOL_GAS_D_STATUS);
  const gasE = valvePosition(tags.SOL_GAS_E_STATUS);
  const fueling = gasA === "OPN";

  const sov2038 = valvePosition(tags.SOV_2038_STATUS, gasD);
  const sov2208 = valvePosition(tags.SOV_2208_STATUS, gasE);
  const sov2010 = valvePosition(tags.SOV_2010_STATUS, valvePosition(tags.SOV_2110_STATUS));

  const ps3 = Number(tags.PS3 ?? 0);
  const t2 = Number(tags.T2 ?? 84.9);
  const fg1flow = Number(tags.FG1FLOW ?? 0);
  const wf36dmd = Number(tags.WF36DMD ?? 0);
  const wf36fb = Number(tags.WF36FB ?? wf36dmd);
  const pgssel = Number(tags.PGSSEL ?? 0);
  const pgsfb = Number(tags.PGSFB ?? pgssel);
  const noxDmd = Number(tags.NOX_DMD ?? 0);
  const noxFb = Number(tags.NOX_FB ?? noxDmd);

  const pt2139 = Number(tags.PT2139 ?? ps3 * 2.496);
  const pt2027 = Number(tags.PT2027 ?? ps3 * 2.56);
  const pt2028 = Number(tags.PT2028 ?? ps3 * 1.059);
  const pt2030 = Number(tags.PT2030 ?? ps3 * 1.006);
  const ft2000 = Number(tags.FT2000 ?? fg1flow * 0.0652);
  const te2032 = Number(tags.TE2032 ?? t2 + 6.8);
  const te2035 = Number(tags.TE2035 ?? t2 - 17.3);

  const pt2182 = Number(tags.PT2182 ?? 9999);
  const pdt2073 = Number(tags.PDT2073 ?? 0);
  const pt2071 = Number(tags.PT2071 ?? 29);
  const te2286 = Number(tags.TE2286 ?? t2 + 22.3);
  const te2077 = Number(tags.TE2077 ?? t2 + 3.8);
  const te2173 = Number(tags.TE2173 ?? t2 + 3);
  const pt2184 = Number(tags.PT2184 ?? 9999);
  const ft2003 = Number(tags.FT2003 ?? Math.max(0.1, Math.abs(noxFb)));

  const fmtPsig = (value: number) => `${value.toFixed(1)} psig`;
  const fmtPsid = (value: number) => `${value.toFixed(1)} psid`;
  const fmtDegF = (value: number) => `${value.toFixed(1)}°F`;
  const fmtAcfs = (value: number) => `${value.toFixed(1)} acfs`;
  const fmtGpm = (value: number) => `${value.toFixed(1)} gpm`;
  const fmtPct = (value: number) => `${value.toFixed(1)}%`;

  return (
    <ScaleToFitFuelSystem>
      <Image
        src={IMAGE}
        alt="Fuel System"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* Fuel-gas valve positions */}
      <ValveStatus tag="SOV_2061" text={gasA} />
      <ValveStatus tag="SOV_2008" text={fueling ? "CLS" : "OPN"} />
      <ValveStatus tag="SOV_2060" text={gasB} />
      <ValveStatus tag="SOV_2006" text={gasC} />
      <ValveStatus tag="SOV_2004" text={gasC} />

      {/* Water-injection valve positions */}
      <ValveStatus tag="SOV_2038" text={sov2038} />
      <ValveStatus tag="SOV_2208" text={sov2208} />
      <ValveStatus tag="SOV_2010" text={sov2010} />

      {/* Upper fuel-gas readouts */}
      <SolidBox val={fmtPsig(pt2139)} top={68} left={816} w={81} h={21} fontSize={11} bgColor="#000" />
      <SolidBox val={fmtPsig(pt2027)} top={120} left={730} w={81} h={21} fontSize={11} bgColor="#000" />
      <SolidBox val={fmtPsig(pt2028)} top={114} left={1251} w={84} h={21} fontSize={11} bgColor="#000" />
      <SolidBox val={fmtAcfs(ft2000)} top={235} left={701} w={79} h={21} fontSize={11} bgColor="#000" />
      <SolidBox val={fmtDegF(te2032)} top={236} left={803} w={66} h={21} fontSize={11} bgColor="#000" />
      <SolidBox val={fg1flow.toFixed(1)} top={294} left={699} w={76} h={21} fontSize={11} bgColor="#000" />
      <SolidBox val={fmtPct(pgssel)} top={210} left={1083} w={37} h={17} fontSize={9} bgColor="#000" />
      <SolidBox val={fmtPct(pgsfb)} top={227} left={1083} w={37} h={17} fontSize={9} bgColor="#000" />
      <SolidBox val={fmtPct(wf36dmd)} top={284} left={959} w={39} h={16} fontSize={9} bgColor="#000" />
      <SolidBox val={fmtPct(wf36fb)} top={299} left={959} w={39} h={16} fontSize={9} bgColor="#000" />

      {/* Water-injection readouts */}
      <SolidBox val={fmtPsig(pt2182)} top={548} left={508} w={79} h={21} fontSize={10} bgColor="#000" />
      <SolidBox val={fmtPsid(pdt2073)} top={617} left={670} w={72} h={21} fontSize={10} bgColor="#000" />
      <SolidBox val={fmtPsig(pt2071)} top={621} left={753} w={73} h={21} fontSize={10} bgColor="#000" />
      <SolidBox val={fmtDegF(te2286)} top={619} left={904} w={73} h={21} fontSize={10} bgColor="#000" />
      <SolidBox val={fmtPct(noxDmd)} top={736} left={855} w={39} h={18} fontSize={9} bgColor="#000" />
      <SolidBox val={fmtPct(noxFb)} top={754} left={855} w={39} h={18} fontSize={9} bgColor="#000" />
      <SolidBox val={fmtGpm(ft2003)} top={761} left={1038} w={75} h={22} fontSize={10} bgColor="#000" />
      <SolidBox val={fmtDegF(te2077)} top={795} left={706} w={74} h={22} fontSize={10} bgColor="#000" />
      <SolidBox val={fmtDegF(te2173)} top={875} left={420} w={75} h={22} fontSize={10} bgColor="#000" />
      <SolidBox val={fmtPsig(pt2184)} top={872} left={508} w={79} h={22} fontSize={10} bgColor="#000" />
      <SolidBox val={fmtDegF(te2035)} top={638} left={1316} w={81} h={22} fontSize={10} bgColor="#000" />
      <SolidBox val={fmtPsig(pt2030)} top={741} left={1317} w={80} h={22} fontSize={10} bgColor="#000" />
    </ScaleToFitFuelSystem>
  );
}
