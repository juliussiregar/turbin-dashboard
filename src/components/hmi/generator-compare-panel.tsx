"use client";

import { useState } from "react";
import { GeneratorZoneSvg } from "@/components/hmi/generator-zone";
import { GENERATOR_ZONE } from "@/lib/hmi/layouts/generator-zone.layout";

const { width, height, referenceUrl, diffThresholdPercent } = GENERATOR_ZONE.compare;

export function GeneratorComparePanel() {
  const [overlay, setOverlay] = useState(45);
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-900 p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-bold">Generator Zone Compare</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Patokan: Screenshot 19.49.45 — geser overlay sampai nempel. Target diff &lt; {diffThresholdPercent}% (
          <code className="text-zinc-300">npm run hmi:diff</code>).
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showOverlay} onChange={(e) => setShowOverlay(e.target.checked)} />
            Tampilkan overlay patokan
          </label>
          <label className="flex items-center gap-2">
            Opacity overlay: {overlay}%
            <input
              type="range"
              min={0}
              max={100}
              value={overlay}
              onChange={(e) => setOverlay(Number(e.target.value))}
              className="w-40"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Patokan</div>
            <div
              className="overflow-hidden rounded border border-zinc-600 bg-black"
              style={{ width, height }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={referenceUrl} alt="Patokan generator zone" width={width} height={height} className="block" />
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Render saat ini</div>
            <div
              id="generator-render"
              data-testid="generator-render"
              className="relative overflow-hidden rounded border border-zinc-600 bg-black"
              style={{ width, height }}
            >
              <GeneratorZoneSvg idPrefix="gz-compare" className="h-full w-full" />
              {showOverlay ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={referenceUrl}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ opacity: overlay / 100 }}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded border border-zinc-700 bg-zinc-800/50 p-4 text-sm text-zinc-300">
          <p className="font-semibold text-zinc-100">Cara evaluasi otomatis</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Jalankan dev server: <code>npm run dev</code></li>
            <li>Jalankan: <code>npm run hmi:diff</code></li>
            <li>Lihat skor diff % — kalau &gt; {diffThresholdPercent}%, sesuaikan <code>generator-zone.layout.ts</code> lalu ulang</li>
            <li>Hasil diff image: <code>public/hmi/last-diff.png</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
