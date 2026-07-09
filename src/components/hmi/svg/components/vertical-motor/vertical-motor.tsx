import type { HmiTagMap } from "@/lib/hmi/types";
import { getTagDefinition } from "@/lib/hmi/tag-registry";
import { resolveMotorRunning, splitMotorLabel, type VerticalMotorTagId } from "@/lib/hmi/motor-tag-registry";

export type VerticalMotorProps = {
  idLabel: string;
  running: boolean;
  x?: number;
  y?: number;
  bodyWidth?: number;
  bodyHeight?: number;
  onClick?: () => void;
};

const BAR_OFFSETS = [-5.25, -1.75, 1.75, 5.25];

export function VerticalMotor({
  idLabel,
  running,
  x = 0,
  y = 0,
  bodyWidth = 18,
  bodyHeight = 36,
  onClick,
}: VerticalMotorProps) {
  const safeId = idLabel.replace(/[^A-Za-z0-9]/g, "_");
  const shellGradId = `vm-shell-${safeId}`;
  const barGradId = `vm-bar-${safeId}`;
  const clipId = `vm-clip-${safeId}`;

  const bar = running ? "#ef1f1f" : "#2ef059";
  const barDark = running ? "#991b1b" : "#15803d";
  const status = running ? "RUN" : "STOP";
  const { prefix, code } = splitMotorLabel(idLabel);
  const cx = bodyWidth / 2;
  const rx = bodyWidth / 2;
  const lugW = 8;
  const lugH = 3.5;
  const barW = 2.1;
  const barTop = 6;
  const barH = bodyHeight - 12;

  const statusY = bodyHeight + 10;
  const prefixY = bodyHeight + 20;
  const codeY = bodyHeight + 30;
  const hitHeight = bodyHeight + (code ? 36 : 24);

  return (
    <g transform={`translate(${x} ${y})`} data-tag={idLabel} data-status={status} style={{ cursor: onClick ? "pointer" : undefined }}>
      <defs>
        <linearGradient id={shellGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3f4a56" />
          <stop offset="18%" stopColor="#8b95a1" />
          <stop offset="48%" stopColor="#eef2f7" />
          <stop offset="72%" stopColor="#9aa3ad" />
          <stop offset="100%" stopColor="#3f4a56" />
        </linearGradient>
        <linearGradient id={barGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={barDark} />
          <stop offset="45%" stopColor={bar} />
          <stop offset="100%" stopColor={barDark} />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={bodyWidth} height={bodyHeight} rx={rx} ry={rx} />
        </clipPath>
      </defs>

      {/* top pipe lug */}
      <rect
        x={cx - lugW / 2}
        y={-lugH + 0.5}
        width={lugW}
        height={lugH}
        rx={0.6}
        fill="#6b7280"
        stroke="#4b5563"
        strokeWidth={0.6}
      />

      {/* capsule shell */}
      <rect
        x={0}
        y={0}
        width={bodyWidth}
        height={bodyHeight}
        rx={rx}
        ry={rx}
        fill={`url(#${shellGradId})`}
        stroke="#7b8490"
        strokeWidth={0.8}
      />

      {/* dark window recess */}
      <rect
        x={2}
        y={4}
        width={bodyWidth - 4}
        height={bodyHeight - 8}
        rx={rx - 2}
        fill="#111827"
        opacity={0.55}
        clipPath={`url(#${clipId})`}
      />

      {/* status bars */}
      <g clipPath={`url(#${clipId})`}>
        {BAR_OFFSETS.map((ox) => (
          <rect
            key={ox}
            x={cx + ox - barW / 2}
            y={barTop}
            width={barW}
            height={barH}
            rx={0.35}
            fill={`url(#${barGradId})`}
          />
        ))}
      </g>

      {/* top/bottom rim highlights */}
      <ellipse cx={cx} cy={2.5} rx={rx - 1.5} ry={1.8} fill="#f8fafc" opacity={0.55} />
      <ellipse cx={cx} cy={bodyHeight - 2} rx={rx - 0.5} ry={1.6} fill="#374151" opacity={0.65} />

      {/* bottom foot */}
      <rect
        x={-1}
        y={bodyHeight - 1}
        width={bodyWidth + 2}
        height={2.2}
        rx={0.8}
        fill="#9ca3af"
        stroke="#6b7280"
        strokeWidth={0.4}
      />

      <text
        x={cx}
        y={statusY}
        textAnchor="middle"
        fill={bar}
        fontSize="10"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {status}
      </text>
      <text
        x={cx}
        y={prefixY}
        textAnchor="middle"
        fill="#f4f4f5"
        fontSize="9"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {prefix}
      </text>
      {code ? (
        <text
          x={cx}
          y={codeY}
          textAnchor="middle"
          fill="#f4f4f5"
          fontSize="9"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {code}
        </text>
      ) : null}

      {onClick ? (
        <rect x={-6} y={-lugH} width={bodyWidth + 12} height={hitHeight + lugH} fill="transparent" onClick={onClick} />
      ) : null}
    </g>
  );
}

export function VerticalMotorBound({
  tagId,
  tags,
  x = 0,
  y = 0,
  onToggle,
}: {
  tagId: VerticalMotorTagId;
  tags: HmiTagMap;
  x?: number;
  y?: number;
  onToggle?: (tagId: VerticalMotorTagId, running: boolean) => void;
}) {
  const def = getTagDefinition(tagId);
  const running = resolveMotorRunning(tags[tagId]);
  const idLabel = def?.label ?? tagId.replaceAll("_", " ");

  return (
    <VerticalMotor
      idLabel={idLabel}
      running={running}
      x={x}
      y={y}
      onClick={onToggle ? () => onToggle(tagId, !running) : undefined}
    />
  );
}

export const VERTICAL_MOTOR_VIEWBOX = "0 0 80 88";

export function VerticalMotorPreviewSvg({ tags, className }: { tags: HmiTagMap; className?: string }) {
  return (
    <svg
      viewBox={VERTICAL_MOTOR_VIEWBOX}
      width="100%"
      height={160}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-label="VerticalMotor preview"
    >
      <rect x={0} y={0} width={80} height={88} fill="#000" />
      <VerticalMotorBound tagId="MOT_0109_RUN" tags={tags} x={31} y={6} />
    </svg>
  );
}
