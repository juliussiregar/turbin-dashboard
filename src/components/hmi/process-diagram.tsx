"use client";

import {
  PROCESS_DIAGRAM_HEIGHT,
  PROCESS_DIAGRAM_IMAGE,
  PROCESS_DIAGRAM_MASKS,
  PROCESS_DIAGRAM_VIEWBOX,
  PROCESS_DIAGRAM_WIDTH,
  type ProcessDiagramMask,
} from "@/lib/hmi/layouts/process-diagram-layout";

type ProcessDiagramProps = {
  /** Tampilkan outline debug untuk kalibrasi posisi mask. */
  showMaskOutlines?: boolean;
};

function DiagramMask({ mask, showOutline }: { mask: ProcessDiagramMask; showOutline?: boolean }) {
  if (mask.rx) {
    return (
      <rect
        data-mask-id={mask.id}
        x={mask.x}
        y={mask.y}
        width={mask.width}
        height={mask.height}
        rx={mask.rx}
        fill={mask.fill}
        stroke={showOutline ? "#ff2d2d" : mask.stroke}
        strokeWidth={showOutline ? 1 : mask.strokeWidth}
      />
    );
  }

  return (
    <rect
      data-mask-id={mask.id}
      x={mask.x}
      y={mask.y}
      width={mask.width}
      height={mask.height}
      fill={mask.fill}
      stroke={showOutline ? "#ff2d2d" : undefined}
      strokeWidth={showOutline ? 1 : undefined}
    />
  );
}

export function ProcessDiagram({ showMaskOutlines = false }: ProcessDiagramProps) {
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center bg-black">
      <svg
        viewBox={PROCESS_DIAGRAM_VIEWBOX}
        width={PROCESS_DIAGRAM_WIDTH}
        height={PROCESS_DIAGRAM_HEIGHT}
        preserveAspectRatio="xMidYMid meet"
        className="h-full max-h-full w-full max-w-full"
        aria-label="Turbine process schematic"
        role="img"
      >
        <image href={PROCESS_DIAGRAM_IMAGE} width={PROCESS_DIAGRAM_WIDTH} height={PROCESS_DIAGRAM_HEIGHT} />

        <g id="diagram-masks" aria-hidden="true">
          {PROCESS_DIAGRAM_MASKS.map((mask) => (
            <DiagramMask key={mask.id} mask={mask} showOutline={showMaskOutlines} />
          ))}
        </g>
      </svg>
    </div>
  );
}
