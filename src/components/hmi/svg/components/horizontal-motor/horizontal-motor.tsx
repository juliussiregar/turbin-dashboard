import type { HmiTagMap } from "@/lib/hmi/types";
import { getTagDefinition } from "@/lib/hmi/tag-registry";
import {
  resolveMotorRunning,
  splitMotorLabel,
  type HorizontalMotorTagId,
} from "@/lib/hmi/motor-tag-registry";

export type HorizontalMotorProps = {
  idLabel: string;
  running: boolean;
  x?: number;
  y?: number;
  bodyWidth?: number;
  bodyHeight?: number;
  onClick?: () => void;
};

const BAR_OFFSETS = [-4.2, -1.4, 1.4, 4.2];

function motorBodyPath(x: number, y: number, w: number, h: number, chamfer: number) {
  return `M${x} ${y} H${x + w - chamfer} L${x + w} ${y + chamfer} V${y + h - chamfer} L${x + w - chamfer} ${y + h} H${x} V${y} Z`;
}

export function HorizontalMotor({
  idLabel,
  running,
  x = 0,
  y = 0,
  bodyWidth = 32,
  bodyHeight = 18,
  onClick,
}: HorizontalMotorProps) {
  const safeId = idLabel.replace(/[^A-Za-z0-9]/g, "_");
  const shellGradId = `hm-shell-${safeId}`;
  const flangeGradId = `hm-flange-${safeId}`;
  const barGradId = `hm-bar-${safeId}`;
  const clipId = `hm-clip-${safeId}`;

  const bar = running ? "#ef1f1f" : "#2ef059";
  const barDark = running ? "#991b1b" : "#15803d";
  const status = running ? "RUN" : "STOP";
  const { prefix, code } = splitMotorLabel(idLabel);

  const flangeW = 6;
  const flangeH = 20;
  const bodyX = flangeW;
  const bodyY = 3;
  const chamfer = 4;
  const motorCx = bodyX + bodyWidth / 2;
  const motorCy = bodyY + bodyHeight / 2;
  const barLen = bodyWidth - 10;
  const barH = 2.3;
  const flangeY = bodyY + bodyHeight / 2 - flangeH / 2;

  const statusY = bodyY + bodyHeight + 10;
  const labelX = bodyX + bodyWidth + 4;
  const labelPrefixY = bodyY + 7;
  const labelCodeY = bodyY + 16;

  return (
    <g transform={`translate(${x} ${y})`} data-tag={idLabel} data-status={status} style={{ cursor: onClick ? "pointer" : undefined }}>
      <defs>
        <linearGradient id={shellGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4b5563" />
          <stop offset="24%" stopColor="#9ca3af" />
          <stop offset="50%" stopColor="#e5e7eb" />
          <stop offset="76%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
        <linearGradient id={flangeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="45%" stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
        <linearGradient id={barGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={barDark} />
          <stop offset="40%" stopColor={bar} />
          <stop offset="100%" stopColor={barDark} />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={motorBodyPath(bodyX, bodyY, bodyWidth, bodyHeight, chamfer)} />
        </clipPath>
      </defs>

      {/* left mounting hub */}
      <rect
        x={0}
        y={flangeY}
        width={flangeW}
        height={flangeH}
        rx={2}
        fill={`url(#${flangeGradId})`}
        stroke="#6b7280"
        strokeWidth={0.7}
      />
      <ellipse cx={flangeW / 2} cy={flangeY + 2} rx={2.5} ry={1.2} fill="#f3f4f6" opacity={0.7} />
      <ellipse cx={flangeW / 2} cy={flangeY + flangeH - 2} rx={2.5} ry={1.2} fill="#4b5563" opacity={0.65} />

      {/* main body — chamfered right corners */}
      <path
        d={motorBodyPath(bodyX, bodyY, bodyWidth, bodyHeight, chamfer)}
        fill={`url(#${shellGradId})`}
        stroke="#8b939e"
        strokeWidth={0.8}
        strokeLinejoin="round"
      />

      {/* inner recess */}
      <rect
        x={bodyX + 3}
        y={bodyY + 2}
        width={bodyWidth - chamfer - 4}
        height={bodyHeight - 4}
        rx={2}
        fill="#0f172a"
        opacity={0.5}
        clipPath={`url(#${clipId})`}
      />

      {/* 4 horizontal bars */}
      <g clipPath={`url(#${clipId})`}>
        {BAR_OFFSETS.map((oy) => (
          <rect
            key={oy}
            x={bodyX + 5}
            y={motorCy + oy - barH / 2}
            width={barLen}
            height={barH}
            rx={0.3}
            fill={`url(#${barGradId})`}
          />
        ))}
      </g>

      {/* top/bottom sheen */}
      <path
        d={`M${bodyX + 2} ${bodyY + 1.5} H${bodyX + bodyWidth - chamfer - 2}`}
        stroke="#f8fafc"
        strokeWidth={0.8}
        opacity={0.45}
        clipPath={`url(#${clipId})`}
      />
      <path
        d={`M${bodyX + 2} ${bodyY + bodyHeight - 1.5} H${bodyX + bodyWidth - chamfer - 2}`}
        stroke="#374151"
        strokeWidth={0.8}
        opacity={0.5}
        clipPath={`url(#${clipId})`}
      />

      <text
        x={motorCx}
        y={statusY}
        textAnchor="middle"
        fill={bar}
        fontSize="9"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {status}
      </text>

      <text
        x={labelX}
        y={labelPrefixY}
        textAnchor="start"
        fill="#f4f4f5"
        fontSize="9"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {prefix}
      </text>
      {code ? (
        <text
          x={labelX}
          y={labelCodeY}
          textAnchor="start"
          fill="#f4f4f5"
          fontSize="9"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {code}
        </text>
      ) : null}

      {onClick ? (
        <rect
          x={-2}
          y={flangeY - 2}
          width={labelX + (code ? 36 : 24)}
          height={flangeH + 14}
          fill="transparent"
          onClick={onClick}
        />
      ) : null}
    </g>
  );
}

export function HorizontalMotorBound({
  tagId,
  tags,
  x = 0,
  y = 0,
  onToggle,
}: {
  tagId: HorizontalMotorTagId;
  tags: HmiTagMap;
  x?: number;
  y?: number;
  onToggle?: (tagId: HorizontalMotorTagId, running: boolean) => void;
}) {
  const def = getTagDefinition(tagId);
  const running = resolveMotorRunning(tags[tagId]);
  const idLabel = def?.label ?? tagId.replaceAll("_", " ");

  return (
    <HorizontalMotor
      idLabel={idLabel}
      running={running}
      x={x}
      y={y}
      onClick={onToggle ? () => onToggle(tagId, !running) : undefined}
    />
  );
}

export const HORIZONTAL_MOTOR_VIEWBOX = "0 0 76 36";

export function HorizontalMotorPreviewSvg({ tags, className }: { tags: HmiTagMap; className?: string }) {
  return (
    <svg
      viewBox={HORIZONTAL_MOTOR_VIEWBOX}
      width="100%"
      height={120}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-label="HorizontalMotor preview"
    >
      <rect x={0} y={0} width={76} height={36} fill="#000" />
      <HorizontalMotorBound tagId="MOT_0129_RUN" tags={tags} x={2} y={2} />
    </svg>
  );
}
