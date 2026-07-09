import fanGreen from '../../assets/fans/fan-green.png';
import fanRed from '../../assets/fans/fan-red.png';

const FAN_SRC: Record<string, string> = {
  'fan-green': fanGreen,
  'fan-red': fanRed,
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
      className={animateRotate ? 'hmi-fan-spin' : undefined}
      style={{
        position: 'absolute',
        top,
        left,
        width: w,
        height: h,
        objectFit: 'contain',
        transformOrigin: \`\${pivotX}% \${pivotY}%\`,
        pointerEvents: 'none',
      }}
    />
  );
}
