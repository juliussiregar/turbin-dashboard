export type LeadLineProps = {
  startX: number;
  startY: number;
  elbowX?: number;
  endX: number;
  endY: number;
  color?: "white" | "yellow";
  strokeWidth?: number;
  showTapDot?: boolean;
};

export function LeadLine({
  startX,
  startY,
  elbowX = startX + 10,
  endX,
  endY,
  color = "white",
  strokeWidth = 1.6,
  showTapDot = true,
}: LeadLineProps) {
  const stroke = color === "yellow" ? "#facc15" : "#e8eaed";
  return (
    <g>
      <path
        d={`M${startX} ${startY} H${elbowX} V${endY} H${endX}`}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showTapDot ? <circle cx={endX} cy={endY} r={1.8} fill="#f4f4f5" /> : null}
    </g>
  );
}
