import type { HmiTagMap } from "@/lib/hmi/types";
import { getTagDefinition } from "@/lib/hmi/tag-registry";
import {
  resolveSolenoidValveLayout,
  resolveValvePosition,
  type SolenoidValveLayout,
  type SolenoidValveTagId,
  type ValveActuatorType,
  type ValveOrientation,
  type ValvePosition,
} from "@/lib/hmi/valve-tag-registry";

export type SolenoidValveProps = {
  position: ValvePosition;
  orientation?: ValveOrientation;
  actuator?: ValveActuatorType;
  flowArrow?: boolean;
  x?: number;
  y?: number;
  idLabel?: string;
  onClick?: () => void;
};

function valvePalette(position: ValvePosition) {
  if (position === "OPN") {
    return {
      fill: "#ef4444",
      fillLight: "#fca5a5",
      fillDark: "#b91c1c",
      stroke: "#fecaca",
      badge: "#ef4444",
      text: "#ff1f1f",
    };
  }
  return {
    fill: "#22c55e",
    fillLight: "#86efac",
    fillDark: "#15803d",
    stroke: "#bbf7d0",
    badge: "#22c55e",
    text: "#2ef059",
  };
}

export function SolenoidValve({
  position,
  orientation = "horizontal",
  actuator = "S",
  flowArrow = false,
  x = 0,
  y = 0,
  idLabel,
  onClick,
}: SolenoidValveProps) {
  const safeKey = `${orientation}-${actuator}-${position}-${idLabel ?? "valve"}`.replace(/[^A-Za-z0-9]/g, "_");
  const shellGradId = `sv-shell-${safeKey}`;
  const pipeGradId = `sv-pipe-${safeKey}`;
  const colors = valvePalette(position);
  const isHorizontal = orientation === "horizontal";

  const cx = isHorizontal ? 28 : 22;
  const cy = isHorizontal ? 22 : 26;
  const baseHalf = isHorizontal ? 13 : 8;
  const pointHalf = isHorizontal ? 8 : 12;
  const pipeLen = 9;
  const pipeThick = 3.5;

  const hitW = isHorizontal ? 56 : 46;
  const hitH = isHorizontal ? 46 : 52;

  const statusX = isHorizontal ? cx : cx + 16;
  const statusY = isHorizontal ? cy + 20 : cy + 4;
  const statusAnchor = isHorizontal ? "middle" : "start";

  const badgeSize = 11;
  const badgeX = isHorizontal ? cx - badgeSize / 2 : cx - 21;
  const badgeY = isHorizontal ? 3 : cy - badgeSize / 2;

  return (
    <g
      transform={`translate(${x} ${y})`}
      data-status={position}
      data-orientation={orientation}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      <defs>
        <linearGradient id={shellGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.fillDark} />
          <stop offset="45%" stopColor={colors.fillLight} />
          <stop offset="100%" stopColor={colors.fill} />
        </linearGradient>
        <linearGradient id={pipeGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="45%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>
      </defs>

      {isHorizontal ? (
        <>
          <rect x={cx - baseHalf - pipeLen} y={cy - pipeThick / 2} width={pipeLen} height={pipeThick} rx={0.5} fill={`url(#${pipeGradId})`} />
          <rect x={cx + baseHalf} y={cy - pipeThick / 2} width={pipeLen} height={pipeThick} rx={0.5} fill={`url(#${pipeGradId})`} />
        </>
      ) : (
        <>
          <rect x={cx - pipeThick / 2} y={cy - baseHalf - pipeLen} width={pipeThick} height={pipeLen} rx={0.5} fill={`url(#${pipeGradId})`} />
          <polygon
            points={`${cx},${cy - baseHalf - pipeLen - 4} ${cx - 3.5},${cy - baseHalf - pipeLen + 1} ${cx + 3.5},${cy - baseHalf - pipeLen + 1}`}
            fill="#d1d5db"
          />
          <rect x={cx - pipeThick / 2} y={cy + baseHalf} width={pipeThick} height={pipeLen} rx={0.5} fill={`url(#${pipeGradId})`} />
        </>
      )}

      {isHorizontal ? (
        <>
          <polygon
            points={`${cx - baseHalf},${cy - pointHalf} ${cx - baseHalf},${cy + pointHalf} ${cx},${cy}`}
            fill={`url(#${shellGradId})`}
            stroke={colors.stroke}
            strokeWidth={0.7}
            strokeLinejoin="round"
          />
          <polygon
            points={`${cx + baseHalf},${cy - pointHalf} ${cx + baseHalf},${cy + pointHalf} ${cx},${cy}`}
            fill={`url(#${shellGradId})`}
            stroke={colors.stroke}
            strokeWidth={0.7}
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <polygon
            points={`${cx - pointHalf},${cy - baseHalf} ${cx + pointHalf},${cy - baseHalf} ${cx},${cy}`}
            fill={`url(#${shellGradId})`}
            stroke={colors.stroke}
            strokeWidth={0.7}
            strokeLinejoin="round"
          />
          <polygon
            points={`${cx - pointHalf},${cy + baseHalf} ${cx + pointHalf},${cy + baseHalf} ${cx},${cy}`}
            fill={`url(#${shellGradId})`}
            stroke={colors.stroke}
            strokeWidth={0.7}
            strokeLinejoin="round"
          />
        </>
      )}

      {flowArrow && isHorizontal ? (
        <g stroke="#f97316" strokeWidth={1.2} fill="#f97316">
          <line x1={cx - 10} y1={cy} x2={cx + 8} y2={cy} />
          <polygon points={`${cx + 10},${cy} ${cx + 5},${cy - 3} ${cx + 5},${cy + 3}`} />
        </g>
      ) : null}

      {isHorizontal ? (
        <line x1={cx} y1={badgeY + badgeSize} x2={cx} y2={cy - pointHalf + 1} stroke="#d4d4d8" strokeWidth={0.8} />
      ) : (
        <line x1={badgeX + badgeSize} y1={cy} x2={cx - pointHalf + 1} y2={cy} stroke="#d4d4d8" strokeWidth={0.8} />
      )}

      <rect
        x={badgeX}
        y={badgeY}
        width={badgeSize}
        height={badgeSize}
        fill={colors.badge}
        stroke="#111827"
        strokeWidth={0.7}
      />
      <text x={badgeX + badgeSize / 2} y={badgeY + 8.5} textAnchor="middle" fill="#111827" fontSize="8" fontWeight="900">
        {actuator}
      </text>

      <text
        x={statusX}
        y={statusY}
        textAnchor={statusAnchor}
        fill={colors.text}
        fontSize="9"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {position}
      </text>

      {idLabel ? (
        <text
          x={isHorizontal ? cx : statusX}
          y={isHorizontal ? statusY + 10 : statusY + 12}
          textAnchor={statusAnchor}
          fill="#d4d4d8"
          fontSize="7"
          fontWeight="600"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {idLabel}
        </text>
      ) : null}

      {onClick ? (
        <rect x={0} y={0} width={hitW} height={hitH} fill="transparent" onClick={onClick} />
      ) : null}
    </g>
  );
}

export function SolenoidValveBound({
  tagId,
  tags,
  x = 0,
  y = 0,
  layout,
  onToggle,
}: {
  tagId: SolenoidValveTagId;
  tags: HmiTagMap;
  x?: number;
  y?: number;
  layout?: SolenoidValveLayout;
  onToggle?: (tagId: SolenoidValveTagId, position: ValvePosition) => void;
}) {
  const def = getTagDefinition(tagId);
  const resolvedLayout = layout ?? resolveSolenoidValveLayout(tagId);
  const position = resolveValvePosition(tags[tagId]);

  return (
    <SolenoidValve
      position={position}
      orientation={resolvedLayout.orientation}
      actuator={resolvedLayout.actuator}
      flowArrow={resolvedLayout.flowArrow}
      idLabel={def?.label}
      x={x}
      y={y}
      onClick={onToggle ? () => onToggle(tagId, position === "OPN" ? "CLS" : "OPN") : undefined}
    />
  );
}

export const SOLENOID_VALVE_VIEWBOX_HORIZONTAL = "0 0 56 46";
export const SOLENOID_VALVE_VIEWBOX_VERTICAL = "0 0 46 52";

export function solenoidValveViewBox(orientation: ValveOrientation = "horizontal") {
  return orientation === "horizontal" ? SOLENOID_VALVE_VIEWBOX_HORIZONTAL : SOLENOID_VALVE_VIEWBOX_VERTICAL;
}
