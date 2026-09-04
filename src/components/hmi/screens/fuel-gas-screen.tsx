"use client";

import { useEffect, useRef, useState } from "react";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1357;
const H = 803;
const IMAGE = "/hmi/screens/bg-fuel-gas.png";
const VALVE_STATUS_FONT_SIZE = 14.4;

// Dynamic text regions measured against bg-fuel-gas.png (1357×803).
// Keeping them in background-image coordinates makes the image and overlays
// scale as one canvas.
const VALVE_STATUS = {
  SOV_2061: { x: 321, y: 191, w: 61, h: 26 },
  SOV_2008: { x: 749, y: 180, w: 61, h: 26 },
  SOV_2060: { x: 222, y: 349, w: 59, h: 26 },
  SOV_2006: { x: 653, y: 349, w: 61, h: 26 },
  SOV_2004: { x: 795, y: 349, w: 61, h: 26 },
} as const;

type ValveStatusKey = keyof typeof VALVE_STATUS;

function ScaleToFitFG({ children }: { children: React.ReactNode }) {
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

function ValveStatus({ tag, text, isOpen }: {
  tag: ValveStatusKey;
  text: string;
  isOpen: boolean;
}) {
  const { x, y, w, h } = VALVE_STATUS[tag];
  return (
    <StatusTxt
      text={text}
      top={y}
      left={x}
      w={w}
      h={h}
      fontSize={VALVE_STATUS_FONT_SIZE}
      isRed={isOpen}
      kind="valve"
    />
  );
}

type Props = { sim: SimulationState };

export function FuelGasScreen({ sim }: Props) {
  const tags = sim.tags;

  // Valve states
  const gasA = String(tags.SOL_GAS_A_STATUS ?? "CLS");
  const gasB = String(tags.SOL_GAS_B_STATUS ?? "CLS");
  const gasC = String(tags.SOL_GAS_C_STATUS ?? "CLS");
  const fueling = gasA === "OPN";

  // Primary sim values
  const wf36dmd = Number(tags.WF36DMD ?? 0);
  const wf36fb  = Number(tags.WF36FB  ?? wf36dmd);
  const pgssel  = Number(tags.PGSSEL  ?? 0);
  const pgsfb   = Number(tags.PGSFB   ?? pgssel);
  const fg1flow = Number(tags.FG1FLOW ?? 0);
  const ps3     = Number(tags.PS3     ?? 0);
  const t2      = Number(tags.T2      ?? 84.7);

  // Derived fuel-gas values (approximate physics from available tags)
  const pt2139  = ps3 * 2.496;           // supply pressure upstream (~714 psig @ nominal)
  const pt2027  = ps3 * 2.56;            // supply pressure after stop valve (~731 psig @ nominal)
  const ft2000  = fg1flow * 0.0652;      // actual flow (acfs): ~80.8 acfs @ 1240 SCFM
  const te2032  = t2 + 6.8;             // fuel gas temp at inlet (~91.5°F @ T2=84.7)
  const pt2030  = ps3 * 1.006;           // manifold pressure (~287 psig @ nominal)
  const te2035  = t2 - 16.9;            // fuel gas temp downstream (~67.8°F @ T2=84.7)
  const pt2028  = ps3 * 1.059;           // far manifold pressure (~302.7 psig @ nominal)

  const fmtPsig = (v: number) => v.toFixed(1) + " psig";
  const fmtDegF = (v: number) => v.toFixed(1) + "°F";
  const fmtAcfs = (v: number) => v.toFixed(1) + " acfs";
  const fmtPct  = (v: number) => v.toFixed(1) + "%";

  return (
    <ScaleToFitFG>
      <img
        src={IMAGE}
        alt="Fuel GAS"
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {/* ── Valve status overlays ─────────────────────────────── */}

      {/* SOV-2061: upstream stop valve */}
      <ValveStatus tag="SOV_2061" text={gasA} isOpen={gasA === "OPN"} />

      {/* SOV-2008: vent valve — OPPOSITE of fueling state */}
      <ValveStatus tag="SOV_2008" text={fueling ? "CLS" : "OPN"} isOpen={!fueling} />

      {/* Pipe valve OPN/CLS text */}
      {/* SOV-2060 */}
      <ValveStatus tag="SOV_2060" text={gasB} isOpen={gasB === "OPN"} />
      {/* SOV-2006 */}
      <ValveStatus tag="SOV_2006" text={gasC} isOpen={gasC === "OPN"} />
      {/* SOV-2004 */}
      <ValveStatus tag="SOV_2004" text={gasC} isOpen={gasC === "OPN"} />

      {/* ── Numeric value overlays ────────────────────────────── */}

      {/* PT-2139: supply pressure (large circular gauge, top center) */}
      <SolidBox val={fmtPsig(pt2139)} top={168} left={612} w={81} h={21} fontSize={12} bgColor="#000" />

      {/* PT-2027: pressure after the upstream stop valve */}
      <SolidBox val={fmtPsig(pt2027)} top={245} left={473} w={81} h={21} fontSize={12} bgColor="#000" />

      {/* PT-2028: far-right manifold pressure */}
      <SolidBox val={fmtPsig(pt2028)} top={254} left={1224} w={92} h={20} fontSize={12} bgColor="#000" />

      {/* FT-2000: actual flow in acfs (circular gauge below pipe) */}
      <SolidBox val={fmtAcfs(ft2000)} top={399} left={437} w={83} h={20} fontSize={13} bgColor="#000" />

      {/* TE-2032: fuel gas inlet temperature (circular gauge below pipe) */}
      <SolidBox val={fmtDegF(te2032)} top={399} left={577} w={60} h={20} fontSize={13} bgColor="#000" />

      {/* SCFM total flow display */}
      <SolidBox val={Math.round(fg1flow).toString()} top={473} left={421} w={88} h={20} fontSize={13} bgColor="#000" />

      {/* FCV-2001 demand / feedback % */}
      <SolidBox val={fmtPct(wf36dmd)} top={381} left={962} w={52} h={20} fontSize={13} bgColor="#000" />
      <SolidBox val={fmtPct(wf36fb)} top={400} left={962} w={52} h={20} fontSize={13} bgColor="#000" />

      {/* FCV-2202 demand / feedback % */}
      <SolidBox val={fmtPct(pgssel)} top={478} left={792} w={51} h={20} fontSize={13} bgColor="#000" />
      <SolidBox val={fmtPct(pgsfb)} top={498} left={792} w={51} h={20} fontSize={13} bgColor="#000" />

      {/* PT-2030: bottom manifold pressure */}
      <SolidBox val={fmtPsig(pt2030)} top={622} left={763} w={80} h={21} fontSize={12} bgColor="#000" />

      {/* TE-2035: downstream fuel gas temperature */}
      <SolidBox val={fmtDegF(te2035)} top={585} left={944} w={62} h={21} fontSize={13} bgColor="#000" />
    </ScaleToFitFG>
  );
}
