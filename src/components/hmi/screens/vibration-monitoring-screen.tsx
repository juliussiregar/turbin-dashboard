"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SolidBox } from "@/components/hmi/overlay/solid-box";
import type { SimulationState } from "@/lib/hmi/simulation";

const W = 1459;
const H = 1071;
const IMAGE = "/hmi/screens/bg-vibration_monitoring.png";

const TOP_READOUTS = [
  { key: "VIB_TOP1", fallback: 8.7, top: 52, left: 97, w: 86, h: 35 },
  { key: "VIB_TOP2", fallback: 8.2, top: 53, left: 195, w: 116, h: 34 },
  { key: "VIB_TOP3", fallback: 8.5, top: 53, left: 390, w: 117, h: 34 },
  { key: "VIB_TOP4", fallback: 8.1, top: 52, left: 530, w: 86, h: 35 },
  { key: "VIB_TOP5", fallback: 8.4, top: 52, left: 644, w: 88, h: 36 },
  { key: "VIB_TOP6", fallback: 8.3, top: 52, left: 769, w: 89, h: 36 },
  { key: "VIB_TOP7", fallback: 8.6, top: 52, left: 878, w: 89, h: 36 },
  { key: "VIB_TOP8", fallback: 8.2, top: 52, left: 988, w: 89, h: 36 },
  { key: "VIB_TOP9", fallback: 8.5, top: 52, left: 1097, w: 88, h: 36 },
  { key: "VIB_TOP10", fallback: 180, top: 52, left: 1206, w: 88, h: 36 },
  { key: "VIB_TOP11", fallback: 180, top: 52, left: 1314, w: 90, h: 36 },
  { key: "VIB_TOP12", fallback: 8.4, top: 421, left: 96, w: 85, h: 35 },
  { key: "VIB_TOP13", fallback: 8.3, top: 424, left: 195, w: 117, h: 32 },
  { key: "VIB_TOP14", fallback: 8.5, top: 425, left: 390, w: 116, h: 33 },
  { key: "VIB_TOP15", fallback: 8.2, top: 421, left: 532, w: 86, h: 37 },
  { key: "VIB_TOP16", fallback: 180, top: 422, left: 652, w: 87, h: 35 },
  { key: "VIB_TOP17", fallback: 180, top: 422, left: 773, w: 87, h: 36 },
] as const;

const CHANNELS = [
  { key: "VIB_CH1", fallback: 0.42, max: 1, bar: [603, 83, 22, 337], box: [952, 60, 65, 33], unit: "in/s" },
  { key: "VIB_CH2", fallback: 0.38, max: 1, bar: [603, 146, 24, 338], box: [952, 148, 67, 33], unit: "in/s" },
  { key: "VIB_CH3", fallback: 0.35, max: 1, bar: [603, 283, 24, 336], box: [952, 265, 67, 33], unit: "in/s" },
  { key: "VIB_CH4", fallback: 0.31, max: 1, bar: [603, 350, 24, 337], box: [952, 355, 66, 33], unit: "in/s" },
  { key: "VIB_CH5", fallback: 0.28, max: 1, bar: [600, 570, 24, 336], box: [952, 552, 67, 33], unit: "in/s" },
  { key: "VIB_CH6", fallback: 0.33, max: 1, bar: [600, 637, 24, 336], box: [952, 640, 65, 33], unit: "in/s" },
  { key: "VIB_CH7", fallback: 0.25, max: 1, bar: [603, 833, 24, 336], box: [951, 811, 67, 34], unit: "in/s" },
  { key: "VIB_CH8", fallback: 0.29, max: 1, bar: [603, 898, 24, 336], box: [952, 902, 64, 33], unit: "in/s" },
  { key: "VIB_CH9", fallback: 0.45, max: 1, bar: [603, 1099, 24, 338], box: [952, 1083, 67, 33], unit: "in/s" },
  { key: "VIB_CH10", fallback: 0.4, max: 1, bar: [602, 1166, 23, 338], box: [952, 1170, 66, 33], unit: "in/s" },
  { key: "VIB_CH11", fallback: 0.52, max: 2, bar: [603, 1289, 23, 336], box: [951, 1272, 65, 34], unit: "mil" },
  { key: "VIB_CH12", fallback: 0.48, max: 2, bar: [605, 1355, 22, 335], box: [952, 1368, 65, 32], unit: "mil" },
] as const;

function ScaleToFitVibrationMonitoring({ children }: { children: ReactNode }) {
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

function numericTag(tags: SimulationState["tags"], key: string, fallback: number) {
  const value = tags[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function VibrationBarGauge({
  value,
  max,
  top,
  left,
  w,
  h,
}: {
  value: number;
  max: number;
  top: number;
  left: number;
  w: number;
  h: number;
}) {
  const safeValue = Math.max(0, Math.min(max, Number.isFinite(value) ? value : 0));
  const fillPercent = Math.max(2, Math.min(100, (safeValue / max) * 100));
  const alertThreshold = max * 0.5;
  const tripThreshold = max * 0.8;
  const color = safeValue >= tripThreshold ? "#ef4444" : safeValue >= alertThreshold ? "#f59e0b" : "#00ff66";

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: w,
        height: h,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        backgroundColor: "rgba(10, 15, 25, 0.75)",
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.8)",
      }}
    >
      <div style={{ position: "absolute", insetInline: 0, bottom: "80%", height: 1, zIndex: 3, backgroundColor: "rgba(239,68,68,0.7)" }} />
      <div style={{ position: "absolute", insetInline: 0, bottom: "50%", height: 1, zIndex: 3, backgroundColor: "rgba(245,158,11,0.7)" }} />
      <div
        style={{
          zIndex: 2,
          width: "100%",
          height: `${fillPercent}%`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
          transition: "height 0.3s ease-out, background-color 0.2s ease",
        }}
      />
    </div>
  );
}

type Props = { sim: SimulationState };

export function VibrationMonitoringScreen({ sim }: Props) {
  const tags = sim.tags;

  return (
    <ScaleToFitVibrationMonitoring>
      <Image
        src={IMAGE}
        alt="Vibration monitoring"
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, width: W, height: H }}
        draggable={false}
      />

      {TOP_READOUTS.map((readout) => (
        <SolidBox
          key={readout.key}
          val={`${numericTag(tags, readout.key, readout.fallback).toFixed(1)} VDC`}
          top={readout.top}
          left={readout.left}
          w={readout.w}
          h={readout.h}
          fontSize={14}
          bgColor="#000"
        />
      ))}

      {CHANNELS.map((channel) => {
        const value = numericTag(tags, channel.key, channel.fallback);
        const [barTop, barLeft, barWidth, barHeight] = channel.bar;
        const [boxTop, boxLeft, boxWidth, boxHeight] = channel.box;
        return (
          <div key={channel.key}>
            <VibrationBarGauge value={value} max={channel.max} top={barTop} left={barLeft} w={barWidth} h={barHeight} />
            <SolidBox
              val={`${value.toFixed(2)} ${channel.unit}`}
              top={boxTop}
              left={boxLeft}
              w={boxWidth}
              h={boxHeight}
              fontSize={13}
              bgColor="#000"
            />
          </div>
        );
      })}
    </ScaleToFitVibrationMonitoring>
  );
}
