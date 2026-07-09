"use client";

import {
  CATALOG_SUMMARY,
  PROCESS_COMPONENT_CATALOG,
  catalogNumber,
  type ProcessComponentCatalogItem,
} from "@/lib/hmi/process-component-catalog";
import { hasProcessSvgPreview, ProcessSvgPreview } from "@/components/hmi/svg";

function StatusBadge({ status }: { status: ProcessComponentCatalogItem["status"] }) {
  const cls =
    status === "done"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : status === "wip"
        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
        : "bg-slate-700/60 text-slate-400 border-slate-600/50";

  const label = status === "done" ? "Done" : status === "wip" ? "WIP" : "Pending";

  return <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${cls}`}>{label}</span>;
}

function EmptySvgPlaceholder({ item }: { item: ProcessComponentCatalogItem }) {
  const [, , w, h] = item.viewBox.split(" ").map(Number);

  return (
    <div className="overflow-hidden rounded-lg border border-dashed border-slate-600 bg-black">
      <svg
        viewBox={item.viewBox}
        width="100%"
        height={Math.min(220, Math.max(96, (h / w) * 280))}
        preserveAspectRatio="xMidYMid meet"
        aria-label={`${item.name} placeholder`}
        className="block w-full max-w-[360px]"
      >
        <rect x={0} y={0} width={w} height={h} fill="#050505" />
        <rect
          x={w * 0.06}
          y={h * 0.08}
          width={w * 0.88}
          height={h * 0.84}
          fill="none"
          stroke="#334155"
          strokeWidth={Math.max(1, w * 0.012)}
          strokeDasharray={`${w * 0.04} ${w * 0.03}`}
        />
        <text
          x={w / 2}
          y={h / 2 - h * 0.06}
          textAnchor="middle"
          fill="#64748b"
          fontSize={Math.max(8, w * 0.07)}
          fontFamily="monospace"
          fontWeight="700"
        >
          {item.name}
        </text>
        <text
          x={w / 2}
          y={h / 2 + h * 0.1}
          textAnchor="middle"
          fill="#475569"
          fontSize={Math.max(7, w * 0.055)}
          fontFamily="sans-serif"
        >
          SVG belum diisi
        </text>
      </svg>
    </div>
  );
}

function CatalogCard({ item, index }: { item: ProcessComponentCatalogItem; index: number }) {
  const representativeLabel = item.nearbyLabels[0];
  const extraLabelCount = Math.max(0, item.nearbyLabels.length - 1);

  return (
    <article
      id={item.id}
      className="scroll-mt-6 rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow-lg"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-500">#{catalogNumber(index)}</span>
            <h2 className="text-lg font-bold text-slate-100">{item.name}</h2>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-1 text-sm text-cyan-400">
            {item.category} · {item.instanceCount} instance di patokan
          </p>
        </div>
        <code className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-400">viewBox="{item.viewBox}"</code>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Zona di gambar</div>
            <p className="mt-1 font-semibold text-slate-200">{item.zone}</p>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lokasi detail</div>
            <p className="mt-1 leading-relaxed text-slate-300">{item.location}</p>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Label perwakilan</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded border border-sky-500/30 bg-sky-500/10 px-2 py-1 font-mono text-[11px] text-sky-200">
                {representativeLabel}
              </span>
              {extraLabelCount > 0 ? (
                <span className="text-[11px] text-slate-500">+{extraLabelCount} variasi di patokan</span>
              ) : null}
            </div>
          </div>

          {item.notes ? (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Catatan build</div>
              <p className="mt-1 text-slate-400">{item.notes}</p>
            </div>
          ) : null}
        </div>

        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {hasProcessSvgPreview(item.id) ? "SVG preview (1 perwakilan)" : "SVG placeholder"}
          </div>
          {hasProcessSvgPreview(item.id) ? (
            <ProcessSvgPreview id={item.id} />
          ) : (
            <EmptySvgPlaceholder item={item} />
          )}
        </div>
      </div>
    </article>
  );
}

export function ProcessComponentCatalogPage() {
  const activeIndex = PROCESS_COMPONENT_CATALOG.findIndex((item) => item.status !== "done");
  const focusIndex = activeIndex === -1 ? 0 : activeIndex;
  const activeItem = PROCESS_COMPONENT_CATALOG[focusIndex];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1e293b_0%,#0f172a_55%,#020617_100%)] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 rounded-xl border border-slate-700/70 bg-slate-900/80 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Dev · Component Queue</p>
          <h1 className="mt-2 text-2xl font-bold">Process Diagram — Build One by One</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Nomor <strong>01–{catalogNumber(PROCESS_COMPONENT_CATALOG.length - 1)}</strong> mengikuti urutan build.
            Setiap komponen punya <strong>1 preview perwakilan</strong>. Evaluasi sampai benar, baru lanjut nomor
            berikutnya.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="overflow-hidden rounded-lg border border-slate-700 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CATALOG_SUMMARY.referenceImage} alt="Patokan process diagram" className="h-auto w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
                <div className="text-2xl font-bold text-white">{CATALOG_SUMMARY.templateCount}</div>
                <div className="text-xs text-slate-400">Komponen unik</div>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
                <div className="text-2xl font-bold text-emerald-300">{CATALOG_SUMMARY.doneCount}</div>
                <div className="text-xs text-slate-400">Selesai</div>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
                <div className="text-2xl font-bold text-amber-300">
                  {CATALOG_SUMMARY.templateCount - CATALOG_SUMMARY.doneCount}
                </div>
                <div className="text-xs text-slate-400">Sisa</div>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
                <div className="font-mono text-sm font-bold text-white">{CATALOG_SUMMARY.referenceSize}</div>
                <div className="text-xs text-slate-400">Patokan</div>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-8 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
            Sedang dikerjakan · #{catalogNumber(focusIndex)}
          </div>
          <CatalogCard item={activeItem} index={focusIndex} />
        </section>

        <nav className="mb-6 rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daftar lengkap (01–{catalogNumber(PROCESS_COMPONENT_CATALOG.length - 1)})</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROCESS_COMPONENT_CATALOG.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`rounded border px-2 py-1 text-[11px] transition ${
                  index === focusIndex
                    ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-200"
                    : "border-slate-600/60 bg-slate-800/70 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200"
                }`}
              >
                {catalogNumber(index)} {item.name}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-4">
          {PROCESS_COMPONENT_CATALOG.map((item, index) => (
            <CatalogCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
