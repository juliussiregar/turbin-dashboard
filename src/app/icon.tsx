import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #67e8f9 0%, #0284c7 100%)",
          borderRadius: 6,
          color: "#020617",
          fontSize: 18,
          fontWeight: 900,
          fontFamily: "ui-monospace, monospace",
        }}
      >
        V
      </div>
    ),
    { ...size }
  );
}
