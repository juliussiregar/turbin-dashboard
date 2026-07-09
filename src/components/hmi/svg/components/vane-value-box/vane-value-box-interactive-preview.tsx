"use client";

import { useState } from "react";
import { applyTagPatch } from "@/lib/hmi/tag-registry";
import { createInitialSimulationState } from "@/lib/hmi/simulation";
import { VANE_TAG_IDS, type VaneTagId } from "@/lib/hmi/vane-tag-registry";
import { VaneValueBoxBound, VANE_VALUE_BOX_VIEWBOX } from "./vane-value-box";

export function VaneValueBoxInteractivePreview() {
  const [tags, setTags] = useState(() => createInitialSimulationState().tags);
  const [tagId, setTagId] = useState<VaneTagId>("VIGV");

  const handleValueChange = (next: number) => {
    setTags((prev) => applyTagPatch(prev, { [tagId]: next }));
  };

  const current = Number(tags[tagId] ?? 0);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {VANE_TAG_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTagId(id)}
            className={`rounded border px-2 py-0.5 text-[10px] transition ${
              id === tagId
                ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-200"
                : "border-slate-600/60 bg-slate-800/70 text-slate-300 hover:border-cyan-500/40"
            }`}
          >
            {id}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-[11px] text-slate-400">
        <span>Nilai dummy</span>
        <input
          type="number"
          step="0.1"
          value={current}
          onChange={(e) => handleValueChange(Number(e.target.value))}
          className="w-24 rounded border border-slate-600 bg-slate-950 px-2 py-0.5 text-sm text-slate-100"
        />
      </label>
      <div className="overflow-hidden rounded-lg border border-slate-600 bg-black p-2">
        <svg
          viewBox={VANE_VALUE_BOX_VIEWBOX}
          width="100%"
          height={120}
          preserveAspectRatio="xMidYMid meet"
          className="block w-full max-w-[360px]"
          aria-label="VaneValueBox interactive preview"
        >
          <rect x={0} y={0} width={72} height={36} fill="#000" />
          <VaneValueBoxBound tagId={tagId} tags={tags} x={8} y={2} />
        </svg>
      </div>
    </div>
  );
}
