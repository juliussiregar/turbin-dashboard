import type { HmiTagMap } from "@/lib/hmi/types";
import { resolveSensorTag } from "@/lib/hmi/tag-registry";
import {
  SENSOR_TAG_BOX_GENERATOR_LEFT,
  type SensorTagId,
} from "@/lib/hmi/sensor-tag-registry";

export type SensorTagBoxProps = {
  tag: string;
  value: number | string;
  unit: string;
  digits?: number;
  x?: number;
  y?: number;
  width?: number;
  valueHeight?: number;
};

export type SensorTagBoxBoundProps = {
  tagId: string;
  tags: HmiTagMap;
  x?: number;
  y?: number;
  width?: number;
  valueHeight?: number;
};

function formatValue(value: number | string, digits: number) {
  if (typeof value === "number") return value.toFixed(digits);
  return value;
}

export function SensorTagBox({
  tag,
  value,
  unit,
  digits = 1,
  x = 0,
  y = 0,
  width = 62,
  valueHeight = 18,
}: SensorTagBoxProps) {
  const cx = width / 2;
  const display = unit ? `${formatValue(value, digits)} ${unit}` : formatValue(value, digits);

  return (
    <g transform={`translate(${x} ${y})`} data-tag={tag}>
      <rect x={0} y={0} width={width} height={valueHeight} rx={1} fill="#0a0a0a" stroke="#d4d4d8" strokeWidth={1.2} />
      <text x={cx} y={valueHeight - 5} textAnchor="middle" fill="#2ef059" fontSize="10" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif">
        {display}
      </text>
      <text x={cx} y={valueHeight + 12} textAnchor="middle" fill="#f4f4f5" fontSize="9" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif">
        {tag}
      </text>
    </g>
  );
}

export function SensorTagBoxBound({ tagId, tags, x = 0, y = 0, width, valueHeight }: SensorTagBoxBoundProps) {
  const resolved = resolveSensorTag(tags, tagId);
  return (
    <SensorTagBox
      tag={resolved.label}
      value={resolved.value}
      unit={resolved.unit}
      digits={resolved.digits}
      x={x}
      y={y}
      width={width}
      valueHeight={valueHeight}
    />
  );
}

export const SENSOR_TAG_BOX_VIEWBOX = "0 0 80 44";

export function sensorTagBoxLeadAnchor(x: number, y: number, width = 62, valueHeight = 18) {
  return { x: x + width, y: y + valueHeight / 2 };
}

export function SensorTagBoxPreviewSvg({
  className,
  tags,
  tagIds = SENSOR_TAG_BOX_GENERATOR_LEFT,
}: {
  className?: string;
  tags: HmiTagMap;
  tagIds?: readonly SensorTagId[];
}) {
  const boxCount = Math.max(1, tagIds.length);
  const viewHeight = 8 + boxCount * 42 + 4;
  const svgHeight = Math.max(96, Math.min(220, viewHeight * 1.2));

  return (
    <svg viewBox={`0 0 80 ${viewHeight}`} width="100%" height={svgHeight} preserveAspectRatio="xMidYMid meet" className={className} aria-label="SensorTagBox preview">
      <rect x={0} y={0} width={80} height={viewHeight} fill="#000" />
      {tagIds.map((tagId, i) => (
        <SensorTagBoxBound key={tagId} tagId={tagId} tags={tags} x={9} y={8 + i * 42} />
      ))}
    </svg>
  );
}
