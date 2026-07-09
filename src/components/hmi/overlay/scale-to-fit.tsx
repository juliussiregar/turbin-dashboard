"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export const HMI_OVERLAY_WIDTH = 1024;
export const HMI_OVERLAY_HEIGHT = 576;
export const HMI_OVERLAY_SIZE_FACTOR = 1;

type ScaleToFitProps = {
  children: ReactNode;
  className?: string;
  sizeFactor?: number;
};

export function ScaleToFit({ children, className, sizeFactor = HMI_OVERLAY_SIZE_FACTOR }: ScaleToFitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const fit = Math.min(width / HMI_OVERLAY_WIDTH, height / HMI_OVERLAY_HEIGHT);
      setScale(fit * sizeFactor);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sizeFactor]);

  return (
    <div ref={containerRef} className={className ?? "h-full w-full"}>
      <div
        className="relative mx-auto"
        style={{
          width: HMI_OVERLAY_WIDTH * scale,
          height: HMI_OVERLAY_HEIGHT * scale,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: HMI_OVERLAY_WIDTH,
            height: HMI_OVERLAY_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
