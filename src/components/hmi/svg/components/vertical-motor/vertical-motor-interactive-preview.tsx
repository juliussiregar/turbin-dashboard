"use client";

import { useState } from "react";
import { applyTagPatch } from "@/lib/hmi/tag-registry";
import { createInitialSimulationState } from "@/lib/hmi/simulation";
import type { VerticalMotorTagId } from "@/lib/hmi/motor-tag-registry";
import { VerticalMotorBound, VERTICAL_MOTOR_VIEWBOX } from "./vertical-motor";

export function VerticalMotorInteractivePreview() {
  const [tags, setTags] = useState(() => createInitialSimulationState().tags);

  const handleToggle = (tagId: VerticalMotorTagId, running: boolean) => {
    setTags((prev) => applyTagPatch(prev, { [tagId]: running }));
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500">Klik motor untuk toggle RUN / STOP</p>
      <div className="overflow-hidden rounded-lg border border-slate-600 bg-black p-2">
        <svg
          viewBox={VERTICAL_MOTOR_VIEWBOX}
          width="100%"
          height={150}
          preserveAspectRatio="xMidYMid meet"
          className="block w-full max-w-[360px]"
          aria-label="VerticalMotor interactive preview"
        >
          <rect x={0} y={0} width={80} height={88} fill="#000" />
          <VerticalMotorBound tagId="MOT_0109_RUN" tags={tags} x={31} y={6} onToggle={handleToggle} />
        </svg>
      </div>
    </div>
  );
}
