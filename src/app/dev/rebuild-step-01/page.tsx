"use client";

import { useState } from "react";
import { SensorTagBox } from "@/components/hmi/svg";

export default function RebuildStep01Page() {
  const [tag, setTag] = useState("TE-0057");
  const [value, setValue] = useState(153.8);
  const [unit, setUnit] = useState("°F");

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Rebuild From Scratch</p>
          <h1 className="mt-1 text-xl font-bold">Step 01 - SensorTagBox (Single Component)</h1>
          <p className="mt-2 text-sm text-slate-400">
            Fokus 1 komponen saja. Halaman ini hanya untuk kotak sensor (contoh TE-0057), belum ada komponen lain.
          </p>
        </header>

        <section className="grid gap-4 rounded-lg border border-slate-700 bg-slate-900 p-4 md:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">Tag ID Tampil</span>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">Value</span>
              <input
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">Unit</span>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm"
              />
            </label>
          </div>

          <div className="rounded border border-slate-700 bg-black p-4">
            <svg viewBox="0 0 140 90" width="100%" height={220} aria-label="single sensor tag box preview">
              <rect x={0} y={0} width={140} height={90} fill="#000" />
              <SensorTagBox tag={tag} value={value} unit={unit} x={38} y={20} />
            </svg>
          </div>
        </section>
      </div>
    </main>
  );
}
