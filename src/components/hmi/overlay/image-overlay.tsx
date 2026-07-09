const FAN_SRC: Record<string, string> = {
  "fan-green": "/hmi/untitled-design-2/fans/fan-green.png",
  "fan-red": "/hmi/untitled-design-2/fans/fan-red.png",
};

export interface ImageOverlayProps {
  asset: string;
  top: number;
  left: number;
  w: number;
  h: number;
  animateRotate?: boolean;
  pivotX?: number;
  pivotY?: number;
}

export function ImageOverlay({
  asset,
  top,
  left,
  w,
  h,
  animateRotate = true,
  pivotX = 50,
  pivotY = 50,
}: ImageOverlayProps) {
  const src = FAN_SRC[asset];
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={animateRotate ? "hmi-fan-spin" : undefined}
      style={{
        position: "absolute",
        top,
        left,
        width: w,
        height: h,
        objectFit: "contain",
        transformOrigin: `${pivotX}% ${pivotY}%`,
        pointerEvents: "none",
      }}
    />
  );
}
