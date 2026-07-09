import type { HmiTagMap } from "@/lib/hmi/types";
import { resolveVaneValue, type VaneTagId } from "@/lib/hmi/vane-tag-registry";

export type VaneValueBoxProps = {
  label: string;
  value: number | string;
  digits?: number;
  x?: number;
  y?: number;
  width?: number;
  boxHeight?: number;
};

export type VaneValueBoxBoundProps = {
  tagId: VaneTagId;
  tags: HmiTagMap;
  x?: number;
  y?: number;
  width?: number;
  boxHeight?: number;
};

function formatValue(value: number | string, digits: number) {
  if (typeof value === "number") return value.toFixed(digits);
  return value;
}

export function VaneValueBox({
  label,
  value,
  digits = 1,
  x = 0,
  y = 0,
  width = 56,
  boxHeight = 18,
}: VaneValueBoxProps) {
  const cx = width / 2;
  const boxY = 12;
  const display = formatValue(value, digits);

  return (
    <g transform={`translate(${x} ${y})`} data-tag={label}>
      <text
        x={cx}
        y={9}
        textAnchor="middle"
        fill="#f4f4f5"
        fontSize="9"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {label}
      </text>
      <rect
        x={0}
        y={boxY}
        width={width}
        height={boxHeight}
        rx={1}
        fill="#0d180d"
        stroke="#b8c4b8"
        strokeWidth={1.1}
      />
      <text
        x={cx}
        y={boxY + boxHeight - 5}
        textAnchor="middle"
        fill="#2ef059"
        fontSize="10"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {display}
      </text>
    </g>
  );
}

export function VaneValueBoxBound({ tagId, tags, x = 0, y = 0, width, boxHeight }: VaneValueBoxBoundProps) {
  const resolved = resolveVaneValue(tags, tagId);
  const raw = tags[tagId];

  return (
    <VaneValueBox
      label={resolved.label}
      value={typeof raw === "number" ? raw : resolved.value}
      digits={resolved.digits}
      x={x}
      y={y}
      width={width}
      boxHeight={boxHeight}
    />
  );
}

export const VANE_VALUE_BOX_VIEWBOX = "0 0 72 36";

export function VaneValueBoxPreviewSvg({
  className,
  tags,
  tagId = "VIGV",
}: {
  className?: string;
  tags: HmiTagMap;
  tagId?: VaneTagId;
}) {
  return (
    <svg
      viewBox={VANE_VALUE_BOX_VIEWBOX}
      width="100%"
      height={120}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-label="VaneValueBox preview"
    >
      <rect x={0} y={0} width={72} height={36} fill="#000" />
      <VaneValueBoxBound tagId={tagId} tags={tags} x={8} y={2} />
    </svg>
  );
}
