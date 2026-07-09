"use client";

import { useState } from "react";
import { applyTagPatch } from "@/lib/hmi/tag-registry";
import { createInitialSimulationState } from "@/lib/hmi/simulation";
import {
  VERTICAL_MOTOR_TAG_IDS,
  type VerticalMotorTagId,
} from "@/lib/hmi/motor-tag-registry";
import { VerticalMotorBound, VERTICAL_MOTOR_VIEWBOX } from "@/components/hmi/svg";

export default function RebuildStep02Page() {
  const [tagId, setTagId] = useState<VerticalMotorTagId>("MOT_0109_RUN");
  const [tags, setTags] = useState(() => createInitialSimulationState().tags);

  const running = tags[tagId] === true || tags[tagId] === "RUN";

  const handleToggle = (id: VerticalMotorTagId, next: boolean) => {
    setTags((prev) => applyTagPatch(prev, { [id]: next }));
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Rebuild From Scratch</p>
          <h1 className="mt-1 text-xl font-bold">Step 02 - VerticalMotor (Single Component)</h1>
          <p className="mt-2 text-sm text-slate-400">
            Label bawah dinamis dari tag registry. Klik motor untuk toggle RUN (merah) / STOP (hijau).
          </p>
        </header>

        <section className="grid gap-4 rounded-lg border border-slate-700 bg-slate-900 p-4 md:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">Tag ID</span>
              <select
                value={tagId}
                onChange={(e) => setTagId(e.target.value as VerticalMotorTagId)}
                className="w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm"
              >
                {VERTICAL_MOTOR_TAG_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded border border-slate-700 bg-slate-950 p-3 text-sm">
              <div className="text-xs text-slate-500">Status saat ini</div>
              <div className={`mt-1 font-bold ${running ? "text-red-400" : "text-emerald-400"}`}>
                {running ? "RUN" : "STOP"}
              </div>
            </div>
            <p className="text-xs text-slate-500">Klik SVG di kanan untuk toggle status.</p>
          </div>

          <div className="rounded border border-slate-700 bg-black p-4">
            <svg viewBox={VERTICAL_MOTOR_VIEWBOX} width="100%" height={220} aria-label="single vertical motor preview">
              <rect x={0} y={0} width={80} height={72} fill="#000" />
              <VerticalMotorBound tagId={tagId} tags={tags} x={31} y={6} onToggle={handleToggle} />
            </svg>
          </div>
        </section>
      </div>
    </main>
  );
}
