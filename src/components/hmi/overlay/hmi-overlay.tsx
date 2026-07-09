"use client";

import { useState } from "react";
import { ImageOverlay } from "@/components/hmi/overlay/image-overlay";
import { PctBox } from "@/components/hmi/overlay/pct-box";
import { ScaleToFit, HMI_OVERLAY_HEIGHT, HMI_OVERLAY_WIDTH } from "@/components/hmi/overlay/scale-to-fit";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { StatusTxt } from "@/components/hmi/overlay/status-txt";
import {
  HMI_OVERLAY_DEFAULT_SCALE,
  HMI_OVERLAY_SCALE_MAX,
  HMI_OVERLAY_SCALE_MIN,
  HMI_OVERLAY_TRANSFORM_ORIGIN,
} from "@/lib/hmi/layouts/overlay-layout";
import type { HmiSensorState } from "@/lib/hmi/overlay-sensor-types";

export type { HmiSensorState } from "@/lib/hmi/overlay-sensor-types";

export interface HmiOverlayProps {
  s: HmiSensorState;
  className?: string;
  /** Scale overlay elements independently from the background image. */
  overlayScale?: number;
  /** Show slider to calibrate overlay scale at runtime. */
  showScaleControl?: boolean;
}

const BACKGROUND_SRC = "/hmi/untitled-design-2/background.png";

function OverlayElements({ s, overlayScale }: { s: HmiSensorState; overlayScale: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${overlayScale})`,
        transformOrigin: HMI_OVERLAY_TRANSFORM_ORIGIN,
      }}
    >
      <SolidBox val={s.te0057} top={162} left={30} w={89} h={29} />
      <SolidBox val={s.te0021} top={226} left={31} w={90} h={30} />
      <SolidBox val={s.te0022} top={290} left={31} w={90} h={29} />
      <SolidBox val={s.pt0183} top={363} left={32} w={101} h={29} />
      <SolidBox val={s.te0023} top={119} left={287} w={90} h={30} />
      <SolidBox val={s.gen_kv} top={233} left={194} w={73} h={22} fontSize={13} />
      <SolidBox val={s.gen_pf} top={254} left={194} w={73} h={25} fontSize={13} />
      <SolidBox val={s.gen_mvar} top={279} left={194} w={73} h={26} fontSize={13} />
      <SolidBox val={s.gen_mva} top={303} left={194} w={73} h={25} fontSize={13} />
      <SolidBox val={s.gen_f} top={328} left={194} w={73} h={25} fontSize={13} />
      <SolidBox val={s.bus_f} top={353} left={194} w={73} h={23} fontSize={13} />
      <StatusTxt text={s.mot0109 ? "RUN" : "STOP"} top={457} left={137} w={60} h={20} fontSize={12} isRed={!!s.mot0109} />
      <StatusTxt text={s.mot0108b ? "RUN" : "STOP"} top={457} left={197} w={60} h={20} fontSize={12} isRed={!!s.mot0108b} />
      <StatusTxt text={s.mot0108a ? "RUN" : "STOP"} top={457} left={257} w={60} h={20} fontSize={12} isRed={!!s.mot0108a} />
      <StatusTxt text={s.mot0085 ? "RUN" : "STOP"} top={476} left={326} w={60} h={20} fontSize={12} isRed={!!s.mot0085} />
      <SolidBox val={s.te0079} top={202} left={408} w={86} h={27} />
      <SolidBox val={s.te0080} top={201} left={520} w={88} h={29} />
      <SolidBox val={s.te0082} top={362} left={403} w={86} h={28} />
      <SolidBox val={s.te0081} top={361} left={509} w={86} h={28} />
      <StatusTxt text={s.mot0129 ? "RUN" : "STOP"} top={306} left={518} w={45} h={20} fontSize={12} isRed={!!s.mot0129} />
      <StatusTxt text={s.mot2100 ? "RUN" : "STOP"} top={438} left={531} w={56} h={21} fontSize={12} isRed={!!s.mot2100} />
      <StatusTxt text={s.motNox ? "RUN" : "STOP"} top={444} left={712} w={55} h={20} fontSize={12} isRed={!!s.motNox} />
      <StatusTxt text={s.motNox2 ? "RUN" : "STOP"} top={503} left={712} w={55} h={22} fontSize={12} isRed={!!s.motNox2} />
      <StatusTxt text={s.sov2110 ? "OPN" : "CLS"} top={412} left={575} w={46} h={20} fontSize={12} isRed={!!s.sov2110} />
      <SolidBox val={s.vigv} top={387} left={676} w={45} h={23} fontSize={13} />
      <SolidBox val={s.vbv} top={365} left={729} w={48} h={23} fontSize={13} />
      <SolidBox val={s.vsv} top={363} left={788} w={45} h={25} fontSize={13} />
      <StatusTxt text={s.vGas1 ? "OPN" : "CLS"} top={146} left={511} w={45} h={20} fontSize={12} isRed={!!s.vGas1} />
      <StatusTxt text={s.vGas2 ? "OPN" : "CLS"} top={144} left={606} w={45} h={20} fontSize={12} isRed={!!s.vGas2} />
      <StatusTxt text={s.vGas3 ? "OPN" : "CLS"} top={145} left={694} w={45} h={20} fontSize={12} isRed={!!s.vGas3} />
      <StatusTxt text={s.vGas4 ? "OPN" : "CLS"} top={68} left={586} w={45} h={20} fontSize={12} isRed={!!s.vGas4} />
      <StatusTxt text={s.vGas6 ? "OPN" : "CLS"} top={68} left={676} w={45} h={20} fontSize={12} isRed={!!s.vGas6} />
      <PctBox val={s.dmd1} top={169} left={678} w={38} />
      <PctBox val={s.fb1} top={184} left={678} w={38} />
      <PctBox val={s.dmd2} top={168} left={815} w={38} />
      <PctBox val={s.fb2} top={183} left={815} w={38} />
      <PctBox val={s.dmd} top={530} left={820} w={35} />
      <PctBox val={s.dmd3} top={530} left={820} w={35} />
      <PctBox val={s.fb3} top={543} left={820} w={35} />
      <StatusTxt text={s.fcv2019 ? "OPN" : "CLS"} top={510} left={876} w={38} h={21} fontSize={12} isRed={!!s.fcv2019} />
      <StatusTxt text={s.mot6015 ? "RUN" : "STOP"} top={401} left={869} w={63} h={23} fontSize={12} isRed={!!s.mot6015} />
      <ImageOverlay asset="fan-red" top={65} left={96} w={53} h={53} animateRotate pivotX={50} pivotY={50} />
      <ImageOverlay asset="fan-green" top={60} left={156} w={68} h={64} animateRotate pivotX={50} pivotY={50} />
      <ImageOverlay asset="fan-green" top={56} left={938} w={65} h={67} animateRotate pivotX={50} pivotY={50} />
      <ImageOverlay asset="fan-red" top={64} left={875} w={54} h={53} animateRotate pivotX={50} pivotY={50} />
    </div>
  );
}

function OverlayCanvas({ s, overlayScale }: { s: HmiSensorState; overlayScale: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: HMI_OVERLAY_WIDTH,
        height: HMI_OVERLAY_HEIGHT,
        overflow: "hidden",
      }}
    >
      <img
        src={BACKGROUND_SRC}
        alt="HMI Background"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        draggable={false}
      />
      <OverlayElements s={s} overlayScale={overlayScale} />
    </div>
  );
}

function OverlayScaleControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 rounded border border-slate-600/70 bg-slate-900/90 px-2 py-1 text-[10px] text-slate-200 shadow-lg backdrop-blur-sm">
      <span className="whitespace-nowrap font-semibold uppercase tracking-wide text-slate-400">Overlay</span>
      <input
        type="range"
        min={HMI_OVERLAY_SCALE_MIN}
        max={HMI_OVERLAY_SCALE_MAX}
        step={0.005}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-24 cursor-pointer accent-cyan-400"
        aria-label="Overlay scale"
      />
      <span className="w-10 text-right font-mono text-cyan-300">{(value * 100).toFixed(1)}%</span>
      <button
        type="button"
        onClick={() => onChange(HMI_OVERLAY_DEFAULT_SCALE)}
        className="rounded border border-slate-600 px-1.5 py-0.5 text-[9px] text-slate-300 hover:bg-slate-800"
      >
        Reset
      </button>
    </div>
  );
}

export function HmiOverlay({
  s,
  className,
  overlayScale: overlayScaleProp,
  showScaleControl = true,
}: HmiOverlayProps) {
  const [overlayScaleState, setOverlayScaleState] = useState(HMI_OVERLAY_DEFAULT_SCALE);
  const overlayScale = overlayScaleProp ?? overlayScaleState;

  return (
    <div className="relative h-full min-h-0 w-full">
      <ScaleToFit className={className ?? "flex h-full min-h-0 w-full items-center justify-center bg-black"}>
        <OverlayCanvas s={s} overlayScale={overlayScale} />
      </ScaleToFit>
      {showScaleControl && overlayScaleProp == null ? (
        <OverlayScaleControl value={overlayScale} onChange={setOverlayScaleState} />
      ) : null}
    </div>
  );
}
