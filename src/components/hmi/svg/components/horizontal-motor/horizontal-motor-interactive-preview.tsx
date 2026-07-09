"use client";

import { useState } from "react";
import { applyTagPatch } from "@/lib/hmi/tag-registry";
import { createInitialSimulationState } from "@/lib/hmi/simulation";
import type { HorizontalMotorTagId } from "@/lib/hmi/motor-tag-registry";
import { HorizontalMotorBound, HORIZONTAL_MOTOR_VIEWBOX } from "./horizontal-motor";

export function HorizontalMotorInteractivePreview() {
  const [tags, setTags] = useState(() => createInitialSimulationState().tags);

  const handleToggle = (tagId: HorizontalMotorTagId, running: boolean) => {
    setTags((prev) => applyTagPatch(prev, { [tagId]: running }));
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500">Klik motor untuk toggle RUN / STOP</p>
      <div className="overflow-hidden rounded-lg border border-slate-600 bg-black p-2">
        <svg
          viewBox={HORIZONTAL_MOTOR_VIEWBOX}
          width="100%"
          height={120}
          preserveAspectRatio="xMidYMid meet"
          className="block w-full max-w-[360px]"
          aria-label="HorizontalMotor interactive preview"
        >
          <rect x={0} y={0} width={76} height={36} fill="#000" />
          <HorizontalMotorBound tagId="MOT_0129_RUN" tags={tags} x={2} y={2} onToggle={handleToggle} />
        </svg>
      </div>
    </div>
  );
}
