"use client";

import { GENERATOR_ZONE } from "@/lib/hmi/layouts/generator-zone.layout";
import type { HmiTagMap } from "@/lib/hmi/types";

type GeneratorZoneProps = {
  tags?: HmiTagMap;
  fanActive?: boolean;
  /** Prefix gradient/pattern ids when multiple SVG instances on one page. */
  idPrefix?: string;
  className?: string;
};

function num(tags: HmiTagMap | undefined, key: string, fallback: number, digits = 1) {
  const v = tags?.[key];
  if (typeof v === "number") return v.toFixed(digits);
  return fallback.toFixed(digits);
}

function motorRunning(tags: HmiTagMap | undefined, tagId: string, fallback: boolean) {
  const v = tags?.[tagId];
  if (typeof v === "boolean") return v;
  if (v === "RUN") return true;
  if (v === "STOP") return false;
  return fallback;
}

function FanImpeller({
  cx,
  cy,
  color,
  spinning,
}: {
  cx: number;
  cy: number;
  color: string;
  spinning: boolean;
}) {
  const blade = (rot: number) => {
    const rad = (rot * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const pts = [
      [0, -4],
      [7, -22],
      [0, -26],
      [-7, -22],
    ];
    const mapped = pts
      .map(([x, y]) => `${cx + x * cos - y * sin},${cy + x * sin + y * cos}`)
      .join(" ");
    return <polygon points={mapped} fill={color} stroke="#111" strokeWidth={0.8} />;
  };

  return (
    <g
      className={spinning ? "hmi-fan-spin" : ""}
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animationDuration: spinning ? "0.85s" : undefined,
        animationPlayState: spinning ? "running" : "paused",
      }}
    >
      {blade(0)}
      {blade(90)}
      {blade(180)}
      {blade(270)}
      <circle cx={cx} cy={cy} r={4.5} fill="#111" />
    </g>
  );
}

function GeneratorDefs({ idPrefix }: { idPrefix: string }) {
  const g = (name: string) => `${idPrefix}-${name}`;
  return (
    <defs>
      <linearGradient id={g("generatorGreen")} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0b5a12" />
        <stop offset="35%" stopColor="#2cc93a" />
        <stop offset="55%" stopColor="#1a9e28" />
        <stop offset="100%" stopColor="#063f0a" />
      </linearGradient>
      <linearGradient id={g("pipeMetal")} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#9ca3af" />
        <stop offset="35%" stopColor="#f8fafc" />
        <stop offset="55%" stopColor="#e5e7eb" />
        <stop offset="100%" stopColor="#6b7280" />
      </linearGradient>
      <linearGradient id={g("motorMetal")} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e5e7eb" />
        <stop offset="50%" stopColor="#9ca3af" />
        <stop offset="100%" stopColor="#6b7280" />
      </linearGradient>
      <linearGradient id={g("fanCellMetal")} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e5e7eb" />
        <stop offset="55%" stopColor="#a1a1aa" />
        <stop offset="100%" stopColor="#71717a" />
      </linearGradient>
    </defs>
  );
}

function FatPipe({ d, width, pipeId }: { d: string; width: number; pipeId: string }) {
  return (
    <g>
      <path d={d} stroke="#6b7280" strokeWidth={width + 3} fill="none" strokeLinecap="butt" strokeLinejoin="round" />
      <path d={d} stroke={`url(#${pipeId})`} strokeWidth={width} fill="none" strokeLinecap="butt" strokeLinejoin="round" />
      <path
        d={d}
        stroke="#ffffff"
        strokeWidth={Math.max(2.5, width * 0.32)}
        fill="none"
        strokeLinecap="butt"
        strokeLinejoin="round"
        opacity={0.75}
      />
    </g>
  );
}

export function GeneratorZoneDefs({ idPrefix }: { idPrefix: string }) {
  return <GeneratorDefs idPrefix={idPrefix} />;
}

const DEFAULT_NUMBERS: Record<string, number> = {
  GEN_KV: 11.8,
  GEN_PF: 0.93,
  GEN_MVAR: 10.0,
  GEN_MVA: 27.1,
  GEN_FREQ: 49.8,
  BUS_FREQ: 49.9,
  TE_0057: 153.8,
  TE_0021: 175.8,
  TE_0022: 143.6,
  PT_0183: 28.9,
};

const MOTOR_FALLBACK_RUN: Record<string, boolean> = {
  MOT_0109_RUN: false,
  MOT_0108B_RUN: false,
  MOT_0108A_RUN: true,
  MOT_0085_RUN: false,
};

/** Inner SVG group — safe to embed inside a larger process sketch. */
export function GeneratorZoneContent({
  tags,
  fanActive = true,
  idPrefix = "gz",
}: Omit<GeneratorZoneProps, "className">) {
  const L = GENERATOR_ZONE;
  const g = (name: string) => `${idPrefix}-${name}`;
  const fan = L.fans.left;
  const body = L.body;
  const panel = L.electricalPanel;
  const pipe = L.pipe;

  return (
    <>
      <g transform={`translate(${fan.x} ${fan.y})`}>
        <text x={66} y={-20} textAnchor="middle" fill="#f5f5f5" fontSize="16" fontWeight="700">
          {fan.label}
        </text>
        {(["A", "B"] as const).map((letter, i) => {
          const cellX = i * (L.fans.cell.width + L.fans.cell.gap);
          const spinning = letter === "A" ? fanActive : false;
          const color = letter === "A" ? "#e11d1d" : "#1db954";
          const cx = 32;
          const cy = 40;
          return (
            <g key={letter} transform={`translate(${cellX} 0)`}>
              <text x={32} y={-5} textAnchor="middle" fill="#f5f5f5" fontSize="13" fontWeight="700">
                {letter}
              </text>
              <rect
                x={0}
                y={0}
                width={L.fans.cell.width}
                height={L.fans.cell.height}
                rx={2}
                fill={`url(#${g("fanCellMetal")})`}
                stroke="#1f1f1f"
                strokeWidth={1.5}
              />
              <FanImpeller cx={cx} cy={cy} color={color} spinning={spinning} />
              {spinning ? (
                <g fill="none" stroke="#f4f4f5" strokeWidth={1.5} opacity={0.95}>
                  <path d={`M${cx - 20} ${cy - 16} Q${cx - 26} ${cy - 4} ${cx - 22} ${cy + 8}`} />
                  <path d={`M${cx + 20} ${cy + 16} Q${cx + 26} ${cy + 4} ${cx + 22} ${cy - 8}`} />
                </g>
              ) : null}
            </g>
          );
        })}
      </g>

      {/* green arrow from fans */}
      <path
        d={`M${L.fans.fanLink.x} ${L.fans.fanLink.startY} V${L.fans.fanLink.tipY - 14}`}
        stroke="#1de43d"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <polygon
        points={`${L.fans.fanLink.x},${L.fans.fanLink.tipY} ${L.fans.fanLink.x - 8},${L.fans.fanLink.tipY - 14} ${L.fans.fanLink.x + 8},${L.fans.fanLink.tipY - 14}`}
        fill="#1de43d"
      />

      {/* bottom pipes + motors */}
      <g>
        <FatPipe
          pipeId={g("pipeMetal")}
          width={pipe.mainWidth}
          d={`M${pipe.leftX} ${pipe.attachY} V${pipe.runY} H${pipe.rightX} V${pipe.attachY}`}
        />
        <rect x={pipe.leftX - 5} y={pipe.attachY - 2} width={10} height={7} rx={1} fill="#e5e7eb" stroke="#9ca3af" />
        <rect x={pipe.rightX - 5} y={pipe.attachY - 2} width={10} height={7} rx={1} fill="#e5e7eb" stroke="#9ca3af" />
        {L.motors.slice(0, 3).map((motor) => (
          <path
            key={motor.id}
            d={`M${motor.cx} ${pipe.runY} V${motor.top}`}
            stroke="#d4d4d8"
            strokeWidth={2}
            fill="none"
          />
        ))}
        {(() => {
          const m85 = L.motors[3];
          return (
            <FatPipe
              pipeId={g("pipeMetal")}
              width={pipe.stubWidth}
              d={`M${pipe.rightX} ${pipe.runY - 8} V${pipe.runY + 22} H${m85.cx} V${m85.top}`}
            />
          );
        })()}
        {L.motors.map((motor) => {
          const running = motorRunning(tags, motor.tagId, MOTOR_FALLBACK_RUN[motor.tagId] ?? false);
          const bar = running ? "#ff1f1f" : "#2ef059";
          const status = running ? "RUN" : "STOP";
          const w = 20;
          const h = 30;
          return (
            <g key={motor.id}>
              <text x={motor.cx} y={motor.top - 4} textAnchor="middle" fill={bar} fontSize="9" fontWeight="700">
                {status}
              </text>
              <rect
                x={motor.cx - w / 2}
                y={motor.top}
                width={w}
                height={h}
                rx={5}
                fill={`url(#${g("motorMetal")})`}
                stroke="#9aa0a8"
                strokeWidth={1}
              />
              {[-5.5, -2.75, 0, 2.75, 5.5].map((ox) => (
                <rect
                  key={ox}
                  x={motor.cx + ox - 0.95}
                  y={motor.top + 5}
                  width={1.9}
                  height={h - 10}
                  rx={0.3}
                  fill={bar}
                />
              ))}
              <text x={motor.cx} y={motor.top + h + 12} textAnchor="middle" fill="#f4f4f5" fontSize="8" fontWeight="700">
                {motor.id}
              </text>
            </g>
          );
        })}
      </g>

      {/* left sensors */}
      {L.sensors.map((sensor) => {
        const value = num(tags, sensor.tagId, DEFAULT_NUMBERS[sensor.tagId] ?? 0);
        const startX = sensor.boxX + 62;
        const startY = sensor.boxY + 9;
        const elbowX = startX + 10;
        return (
          <g key={sensor.tagId}>
            <path
              d={`M${startX} ${startY} H${elbowX} V${sensor.tapY} H${sensor.tapX}`}
              stroke="#e8eaed"
              strokeWidth={1.6}
              fill="none"
            />
            <circle cx={sensor.tapX} cy={sensor.tapY} r={1.8} fill="#f4f4f5" />
            <g transform={`translate(${sensor.boxX} ${sensor.boxY})`}>
              <rect x={0} y={0} width={62} height={18} rx={1} fill="#0a0a0a" stroke="#d4d4d8" strokeWidth={1.2} />
              <text x={31} y={13} textAnchor="middle" fill="#2ef059" fontSize="10" fontWeight="700">
                {value} {sensor.unit}
              </text>
              <text x={31} y={30} textAnchor="middle" fill="#f4f4f5" fontSize="9" fontWeight="700">
                {sensor.label}
              </text>
            </g>
          </g>
        );
      })}

      {/* generator body */}
      <g>
        {body.nose.map((n, i) => (
          <rect
            key={i}
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={1}
            fill={i === 0 ? "#0a6e14" : i === 1 ? "#0f8219" : "#12921d"}
            stroke="#2ede43"
            strokeWidth={i === 2 ? 1.2 : 1}
          />
        ))}
        <rect
          x={body.main.x}
          y={body.main.y}
          width={body.main.w}
          height={body.main.h}
          rx={3}
          fill={`url(#${g("generatorGreen")})`}
          stroke="#2ede43"
          strokeWidth={2}
        />
        <rect x={body.main.x + 4} y={body.main.y + 6} width={body.main.w - 8} height={14} rx={2} fill="#7cff88" opacity={0.18} />
        <rect x={body.main.x + 4} y={body.main.y + body.main.h - 20} width={body.main.w - 8} height={14} rx={2} fill="#031a05" opacity={0.35} />
        <rect
          x={body.rightCap.x}
          y={body.rightCap.y}
          width={body.rightCap.w}
          height={body.rightCap.h}
          rx={2}
          fill="#0f7a18"
          stroke="#2ede43"
          strokeWidth={1.2}
        />
      </g>

      {/* electrical panel */}
      {panel.rows.map((row, index) => {
        const y = panel.y + index * panel.rowH;
        const digits = row.tagId === "GEN_PF" ? 2 : 1;
        const value = num(tags, row.tagId, DEFAULT_NUMBERS[row.tagId] ?? 0, digits);
        return (
          <g key={row.tagId}>
            <rect x={panel.x} y={y} width={panel.chipW} height={panel.rowH - 1} fill="#050505" stroke="#1a1a1a" strokeWidth={0.8} />
            <text x={panel.x + panel.chipW / 2} y={y + 11} textAnchor="middle" fill="#2ef059" fontSize="11" fontWeight="700">
              {value}
            </text>
            <text x={panel.x + panel.chipW + 6} y={y + 11} fill="#f5f5f5" fontSize="11" fontWeight="700">
              {row.label}
            </text>
          </g>
        );
      })}
    </>
  );
}

/** Standalone SVG for compare page / screenshots (380×420). */
export function GeneratorZoneSvg({
  tags,
  fanActive = true,
  idPrefix = "gz",
  className,
}: GeneratorZoneProps) {
  const { width, height } = GENERATOR_ZONE.viewBox;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Generator zone"
    >
      <GeneratorDefs idPrefix={idPrefix} />
      <rect width={width} height={height} fill="#050505" />
      <GeneratorZoneContent tags={tags} fanActive={fanActive} idPrefix={idPrefix} />
    </svg>
  );
}
