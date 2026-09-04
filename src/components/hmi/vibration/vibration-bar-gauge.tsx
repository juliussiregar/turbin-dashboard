"use client";

export interface VibrationBarGaugeProps {
  value: number;
  min?: number;
  max?: number;
  alertThreshold?: number;
  tripThreshold?: number;
  top: number;
  left: number;
  w: number;
  h: number;
}

export function VibrationBarGauge({
  value,
  min = 0,
  max = 1.0,
  alertThreshold = 0.6,
  tripThreshold = 0.9,
  top,
  left,
  w,
  h,
}: VibrationBarGaugeProps) {
  const safeVal = Math.max(min, Math.min(max, typeof value === "number" && !isNaN(value) ? value : min));
  const fillPct = Math.max(2, Math.min(100, ((safeVal - min) / (max - min)) * 100));

  let barColor = "#00ff66";
  let glowColor = "rgba(0, 255, 102, 0.4)";

  if (safeVal >= tripThreshold) {
    barColor = "#ef4444";
    glowColor = "rgba(239, 68, 68, 0.6)";
  } else if (safeVal >= alertThreshold) {
    barColor = "#f59e0b";
    glowColor = "rgba(245, 158, 11, 0.5)";
  }

  const alertPct = ((alertThreshold - min) / (max - min)) * 100;
  const tripPct = ((tripThreshold - min) / (max - min)) * 100;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: w,
        height: h,
        backgroundColor: "rgba(10, 15, 25, 0.75)",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.8)",
      }}
    >
      {/* Trip threshold marker */}
      {tripPct > 0 && tripPct < 100 && (
        <div
          style={{
            position: "absolute",
            bottom: `${tripPct}%`,
            left: 0,
            right: 0,
            height: "1px",
            backgroundColor: "rgba(239, 68, 68, 0.7)",
            zIndex: 3,
          }}
        />
      )}

      {/* Alert threshold marker */}
      {alertPct > 0 && alertPct < 100 && (
        <div
          style={{
            position: "absolute",
            bottom: `${alertPct}%`,
            left: 0,
            right: 0,
            height: "1px",
            backgroundColor: "rgba(245, 158, 11, 0.7)",
            zIndex: 3,
          }}
        />
      )}

      {/* Dynamic filling bar */}
      <div
        style={{
          width: "100%",
          height: `${fillPct}%`,
          backgroundColor: barColor,
          boxShadow: `0 0 8px ${glowColor}`,
          transition: "height 0.3s ease-out, background-color 0.2s ease",
          zIndex: 2,
        }}
      />
    </div>
  );
}
