"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DEFAULT_PANEL_METRICS,
  TREND_METRICS,
  TREND_RANGES,
  TREND_SERIES,
  createAllTrendSeries,
  createTrendEvents,
  getMetric,
  latestStrip,
  stepAllTrendSeries,
  type TrendEvent,
  type TrendLayoutId,
  type TrendMetricId,
  type TrendPoint,
  type TrendRangeId,
  type TrendSeriesId,
} from "@/lib/hmi/trending-simulation";

const PAGE_BG = "#eef0f3";
const GRID = "#e6e8ec";
const AXIS = "#6b7280";
const BORDER = "#d5d9e0";
const SYNC_ID = "voltara-trend-sync";

type HoverTooltipContent = {
  label: string;
  items: { name: string; value: number | string; color: string }[];
};

/** Shared cursor position — updated without React setState to avoid render loops. */
const cursorPos = { x: 0, y: 0 };
let cursorListening = false;
function ensureCursorListener() {
  if (cursorListening || typeof window === "undefined") return;
  cursorListening = true;
  window.addEventListener(
    "mousemove",
    (e) => {
      cursorPos.x = e.clientX;
      cursorPos.y = e.clientY;
    },
    { passive: true }
  );
}

function FloatingTooltip({ content }: { content: HoverTooltipContent | null }) {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureCursorListener();
    if (!content) {
      if (elRef.current) elRef.current.style.visibility = "hidden";
      return;
    }

    let raf = 0;
    const tick = () => {
      const el = elRef.current;
      if (el) {
        const width = el.offsetWidth || 200;
        const height = el.offsetHeight || 80;
        const left = Math.min(window.innerWidth - width - 8, Math.max(8, cursorPos.x + 14));
        const top = Math.min(window.innerHeight - height - 8, Math.max(8, cursorPos.y - height - 8));
        el.style.visibility = "visible";
        el.style.transform = `translate(${left}px, ${top}px)`;
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [content]);

  if (!content || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={elRef}
      className="pointer-events-none fixed top-0 left-0 z-[99999] min-w-[180px] rounded-md border border-[#d5d9e0] bg-white px-2.5 py-2 text-[11px] text-[#111827] shadow-[0_14px_34px_rgba(15,23,42,0.2)]"
      style={{ visibility: "hidden", willChange: "transform" }}
    >
      <div className="mb-1.5 font-semibold text-[#6b7280]">{content.label}</div>
      <div className="space-y-1">
        {content.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.name}
            </span>
            <span className="font-semibold tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}

function ChartTooltipBridge({
  active,
  payload,
  label,
  enabled,
  onHover,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    name?: string | number;
    dataKey?: string | number;
    value?: unknown;
    color?: string;
  }>;
  label?: string | number;
  enabled: boolean;
  onHover: (next: HoverTooltipContent | null) => void;
}) {
  const lastKeyRef = useRef("");

  useEffect(() => {
    ensureCursorListener();

    if (!enabled || !active || !payload?.length) {
      if (lastKeyRef.current !== "") {
        lastKeyRef.current = "";
        onHover(null);
      }
      return;
    }

    const items = payload.map((entry) => ({
      name: String(entry.name ?? entry.dataKey),
      value: entry.value as number | string,
      color: String(entry.color ?? "#64748b"),
    }));
    const key = `${label}|${items.map((i) => `${i.name}:${i.value}`).join(",")}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;
    onHover({ label: String(label ?? ""), items });
  }, [active, payload, label, enabled, onHover]);

  return null;
}

function ChartSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-[#d5d9e0] bg-white shadow-sm">
      <div className="border-b border-[#e6e8ec] px-3 py-3">
        <div className="mx-auto h-3 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mx-auto mt-2 h-2 w-64 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="flex flex-1 items-end gap-1 px-4 pb-4 pt-6">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t bg-slate-100"
            style={{ height: `${30 + ((i * 17) % 55)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ZoomBrush({
  length,
  startIndex,
  endIndex,
  onChange,
}: {
  length: number;
  startIndex: number;
  endIndex: number;
  onChange: (startIndex: number, endIndex: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"start" | "end" | "window" | null>(null);
  const originRef = useRef({ pointerIdx: 0, start: 0, end: 0 });
  const startRef = useRef(startIndex);
  const endRef = useRef(endIndex);
  const onChangeRef = useRef(onChange);
  startRef.current = startIndex;
  endRef.current = endIndex;
  onChangeRef.current = onChange;

  const max = Math.max(1, length - 1);
  const leftPct = (startIndex / max) * 100;
  const rightPct = (endIndex / max) * 100;
  const widthPct = Math.max(2, rightPct - leftPct);

  const indexFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(1, rect.width)));
    return Math.round(ratio * max);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const mode = dragRef.current;
      if (!mode) return;
      const idx = indexFromClientX(e.clientX);
      const start = startRef.current;
      const end = endRef.current;

      if (mode === "start") {
        onChangeRef.current(Math.min(idx, end - 1), end);
        return;
      }
      if (mode === "end") {
        onChangeRef.current(start, Math.max(idx, start + 1));
        return;
      }

      const delta = idx - originRef.current.pointerIdx;
      const span = originRef.current.end - originRef.current.start;
      let nextStart = originRef.current.start + delta;
      let nextEnd = originRef.current.end + delta;
      if (nextStart < 0) {
        nextStart = 0;
        nextEnd = span;
      }
      if (nextEnd > max) {
        nextEnd = max;
        nextStart = max - span;
      }
      onChangeRef.current(nextStart, nextEnd);
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // max is derived from length; remount listeners when length changes
  }, [max]);

  return (
    <div className="flex h-[34px] shrink-0 items-center border-t border-[#eef0f3] px-3">
      <div ref={trackRef} className="relative h-2.5 w-full rounded-sm bg-[#e8eef8]">
        <div
          className="absolute top-0 h-full cursor-grab rounded-sm bg-[#93c5fd] active:cursor-grabbing"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          onPointerDown={(e) => {
            e.preventDefault();
            dragRef.current = "window";
            originRef.current = {
              pointerIdx: indexFromClientX(e.clientX),
              start: startIndex,
              end: endIndex,
            };
          }}
        />
        <button
          type="button"
          aria-label="Zoom start"
          className="absolute top-1/2 h-3.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-white bg-[#2563eb] shadow"
          style={{ left: `${leftPct}%` }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragRef.current = "start";
          }}
        />
        <button
          type="button"
          aria-label="Zoom end"
          className="absolute top-1/2 h-3.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-white bg-[#2563eb] shadow"
          style={{ left: `${rightPct}%` }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragRef.current = "end";
          }}
        />
      </div>
    </div>
  );
}

function TrendChart({
  panelKey,
  metricId,
  data,
  events,
  layout,
  focusUnit,
  showBrush,
  brushIndexes,
  onBrushChange,
  onMetricChange,
  onHoverTooltip,
  tooltipEnabled,
}: {
  panelKey: string;
  metricId: TrendMetricId;
  data: TrendPoint[];
  events: TrendEvent[];
  layout: TrendLayoutId;
  focusUnit: TrendSeriesId;
  showBrush?: boolean;
  brushIndexes: { startIndex: number; endIndex: number };
  onBrushChange: (startIndex: number, endIndex: number) => void;
  onMetricChange: (next: TrendMetricId) => void;
  onHoverTooltip: (next: HoverTooltipContent | null) => void;
  tooltipEnabled: boolean;
}) {
  const metric = getMetric(metricId);
  const series =
    layout === "focus" ? TREND_SERIES.filter((s) => s.id === focusUnit) : TREND_SERIES;
  const strip = latestStrip(
    data,
    metric,
    layout === "focus" ? [focusUnit] : undefined
  );

  const visible = useMemo(() => {
    const start = Math.max(0, brushIndexes.startIndex);
    const end = Math.min(data.length - 1, brushIndexes.endIndex);
    if (data.length === 0) return data;
    return data.slice(start, end + 1);
  }, [data, brushIndexes]);

  const visibleEvents = useMemo(() => {
    return events.filter(
      (e) => e.idx >= brushIndexes.startIndex && e.idx <= brushIndexes.endIndex
    );
  }, [events, brushIndexes]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-[#d5d9e0] bg-white shadow-sm">
      <div className="shrink-0 border-b border-[#e6e8ec] bg-white px-3 py-2">
        <div className="flex items-center justify-center gap-2">
          <label className="sr-only" htmlFor={`metric-${panelKey}`}>
            Parameter
          </label>
          <select
            id={`metric-${panelKey}`}
            value={metricId}
            onChange={(e) => onMetricChange(e.target.value as TrendMetricId)}
            className="rounded border border-[#d5d9e0] bg-[#f8fafc] px-2 py-1 text-[12px] font-semibold text-[#374151] outline-none hover:border-[#93c5fd] focus:border-[#2563eb]"
          >
            {TREND_METRICS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] tabular-nums text-[#6b7280]">
          {strip.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
              <span className="font-medium text-[#374151]">{s.text}</span>
            </span>
          ))}
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 px-1 pb-1 pt-2"
        onMouseEnter={() => {
          /* host marker handled by parent via panelKey callback */
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visible}
            syncId={SYNC_ID}
            syncMethod="value"
            margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            onMouseLeave={() => {
              if (tooltipEnabled) onHoverTooltip(null);
            }}
          >
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: AXIS, fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: BORDER }}
              minTickGap={24}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[metric.yMin, metric.yMax]}
              tick={{ fill: AXIS, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              cursor={{ stroke: "#2563eb", strokeWidth: 1, strokeDasharray: "4 4" }}
              content={(props) => (
                <ChartTooltipBridge
                  active={props.active}
                  payload={props.payload as never}
                  label={props.label}
                  enabled={tooltipEnabled}
                  onHover={onHoverTooltip}
                />
              )}
            />
            {layout === "comparison" ? (
              <Legend
                verticalAlign="top"
                height={20}
                wrapperStyle={{ fontSize: 10, color: AXIS, paddingBottom: 2 }}
              />
            ) : null}

            {visibleEvents.map((ev) => (
              <ReferenceLine
                key={`${ev.kind}-${ev.idx}-${ev.title}`}
                x={ev.label}
                stroke={ev.kind === "trip" ? "#dc2626" : "#f59e0b"}
                strokeDasharray="3 3"
                strokeWidth={1.25}
                label={{
                  value: ev.title,
                  position: "insideTopRight",
                  fill: ev.kind === "trip" ? "#b91c1c" : "#b45309",
                  fontSize: 9,
                }}
              />
            ))}

            {series.map((s) => (
              <Line
                key={`${metricId}-${s.id}`}
                type="monotone"
                dataKey={s.id}
                name={s.label}
                stroke={s.color}
                strokeDasharray={s.strokeDasharray}
                dot={false}
                strokeWidth={1.8}
                isAnimationActive={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showBrush ? (
        <ZoomBrush
          length={data.length}
          startIndex={brushIndexes.startIndex}
          endIndex={brushIndexes.endIndex}
          onChange={onBrushChange}
        />
      ) : (
        <div className="mx-3 mb-2 h-1.5 overflow-hidden rounded-sm bg-[#eef0f3]">
          <div
            className="h-full rounded-sm bg-[#3b82f6]"
            style={{
              width: `${Math.max(
                8,
                ((brushIndexes.endIndex - brushIndexes.startIndex + 1) / Math.max(1, data.length)) *
                  100
              )}%`,
              marginLeft: `${(brushIndexes.startIndex / Math.max(1, data.length - 1)) * (100 - 8)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export function TrendingDashboard() {
  const router = useRouter();
  const [rangeId, setRangeId] = useState<TrendRangeId>("1h");
  const [layout, setLayout] = useState<TrendLayoutId>("comparison");
  const [focusUnit, setFocusUnit] = useState<TrendSeriesId>("gtg1");
  const [panelMetrics, setPanelMetrics] = useState<TrendMetricId[]>(DEFAULT_PANEL_METRICS);
  const [clock, setClock] = useState("");
  const [loading, setLoading] = useState(true);
  const [seriesMap, setSeriesMap] = useState<Record<TrendMetricId, TrendPoint[]> | null>(null);
  const [brush, setBrush] = useState({ startIndex: 0, endIndex: 0 });
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltipContent | null>(null);
  const [hoverHost, setHoverHost] = useState<string | null>(null);

  const onHoverTooltip = useCallback((next: HoverTooltipContent | null) => {
    setHoverTooltip((prev) => {
      if (prev == null && next == null) return prev;
      if (prev && next && prev.label === next.label) {
        const same =
          prev.items.length === next.items.length &&
          prev.items.every(
            (item, i) =>
              item.name === next.items[i]?.name &&
              item.value === next.items[i]?.value &&
              item.color === next.items[i]?.color
          );
        if (same) return prev;
      }
      return next;
    });
  }, []);

  const primaryPoints = seriesMap?.[panelMetrics[0]] ?? seriesMap?.mw ?? [];
  const events = useMemo(() => createTrendEvents(primaryPoints), [primaryPoints]);

  // Client-only data init / range change — avoids SSR hydration mismatch from Date.now()
  const isFirstLoad = useRef(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const delay = isFirstLoad.current ? 0 : 280;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      const next = createAllTrendSeries(rangeId);
      setSeriesMap(next);
      setBrush({ startIndex: 0, endIndex: Math.max(0, next.mw.length - 1) });
      setLoading(false);
      isFirstLoad.current = false;
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [rangeId]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-GB", { hour12: false }) +
          " · " +
          now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const liveReady = seriesMap != null && !loading;
  useEffect(() => {
    if (!liveReady) return;
    const id = setInterval(() => {
      // Length stays constant — do not touch brush here (avoids Recharts Brush update loops)
      setSeriesMap((prev) => (prev ? stepAllTrendSeries(prev, rangeId) : prev));
    }, 1600);
    return () => clearInterval(id);
  }, [rangeId, liveReady]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const rangeMeta = useMemo(() => TREND_RANGES.find((r) => r.id === rangeId)!, [rangeId]);

  const setPanelMetric = (slot: number, metricId: TrendMetricId) => {
    setPanelMetrics((prev) => {
      const next = [...prev];
      next[slot] = metricId;
      return next;
    });
  };

  const onBrushChange = useCallback(
    (startIndex: number, endIndex: number) => {
      const max = Math.max(0, primaryPoints.length - 1);
      const nextStart = Math.max(0, Math.min(startIndex, max));
      const nextEnd = Math.max(0, Math.min(endIndex, max));
      setBrush((prev) => {
        if (prev.startIndex === nextStart && prev.endIndex === nextEnd) return prev;
        return { startIndex: nextStart, endIndex: nextEnd };
      });
    },
    [primaryPoints.length]
  );

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden font-sans text-[#111827] animate-[hmi-fade-in_280ms_ease-out]"
      style={{ background: PAGE_BG }}
    >
      <FloatingTooltip content={hoverTooltip} />
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#d5d9e0] bg-white px-4 py-2.5 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded border border-[#d5d9e0] bg-[#f8fafc] px-3 py-1.5 text-[12px] font-semibold text-[#374151] transition hover:border-[#93c5fd] hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
          >
            ← Back to Home
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#6b7280]">
              <Link href="/" className="hover:text-[#111827]">
                Plant Overview
              </Link>
              <span className="text-[#9ca3af]">›</span>
              <span className="font-medium text-[#111827]">Trending Multi Parameter</span>
              <span className="text-[#9ca3af]">·</span>
              <Link href="/analysis" className="hover:text-[#2563eb]">
                Analysis
              </Link>
            </div>
            <div className="text-[11px] text-[#9ca3af]">
              Sync crosshair · event markers · brush zoom · dummy live feed
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
          <span className="font-mono text-[11px] tabular-nums text-[#6b7280]">{clock}</span>
          <Link
            href="/analysis"
            className="rounded border border-[#d5d9e0] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#374151] hover:bg-white"
          >
            Analysis →
          </Link>

          <div className="flex items-center gap-1 rounded border border-[#d5d9e0] bg-[#f8fafc] p-0.5">
            {(
              [
                { id: "comparison", label: "Comparison" },
                { id: "focus", label: "Single unit" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLayout(opt.id)}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                  layout === opt.id
                    ? "bg-[#0f172a] text-white"
                    : "text-[#6b7280] hover:bg-white hover:text-[#111827]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {layout === "focus" ? (
            <select
              value={focusUnit}
              onChange={(e) => setFocusUnit(e.target.value as TrendSeriesId)}
              className="rounded border border-[#d5d9e0] bg-white px-2 py-1 text-[11px] font-semibold text-[#374151]"
            >
              {TREND_SERIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          ) : null}

          <div className="flex items-center gap-1 rounded border border-[#d5d9e0] bg-[#f8fafc] p-0.5">
            {TREND_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRangeId(r.id)}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                  rangeId === r.id
                    ? "bg-[#2563eb] text-white"
                    : "text-[#6b7280] hover:bg-white hover:text-[#111827]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-2 text-[11px] text-[#6b7280] lg:flex">
            <span className="rounded border border-[#d5d9e0] bg-[#f8fafc] px-2 py-1">
              now-{rangeMeta.label} → now
            </span>
            <button
              type="button"
              onClick={() =>
                setBrush({ startIndex: 0, endIndex: Math.max(0, primaryPoints.length - 1) })
              }
              className="rounded border border-[#d5d9e0] bg-[#f8fafc] px-2 py-1 font-semibold hover:bg-white"
            >
              Reset zoom
            </button>
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)] gap-2 overflow-hidden p-2 md:p-3">
        {loading || !seriesMap ? (
          <>
            <ChartSkeleton />
            <div className="grid min-h-0 grid-cols-1 gap-2 lg:grid-cols-2">
              <ChartSkeleton />
              <div className="grid min-h-0 grid-rows-2 gap-2">
                <ChartSkeleton />
                <ChartSkeleton />
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="min-h-0"
              onMouseEnter={() => setHoverHost("p0")}
              onMouseLeave={() => {
                setHoverHost((h) => (h === "p0" ? null : h));
                setHoverTooltip(null);
              }}
            >
              <TrendChart
                panelKey="p0"
                metricId={panelMetrics[0]}
                data={seriesMap[panelMetrics[0]]}
                events={events}
                layout={layout}
                focusUnit={focusUnit}
                showBrush
                brushIndexes={brush}
                onBrushChange={onBrushChange}
                onMetricChange={(m) => setPanelMetric(0, m)}
                onHoverTooltip={onHoverTooltip}
                tooltipEnabled={hoverHost === "p0"}
              />
            </div>

            <div className="grid min-h-0 grid-cols-1 gap-2 lg:grid-cols-2">
              <div
                className="min-h-0"
                onMouseEnter={() => setHoverHost("p1")}
                onMouseLeave={() => {
                  setHoverHost((h) => (h === "p1" ? null : h));
                  setHoverTooltip(null);
                }}
              >
                <TrendChart
                  panelKey="p1"
                  metricId={panelMetrics[1]}
                  data={seriesMap[panelMetrics[1]]}
                  events={events}
                  layout={layout}
                  focusUnit={focusUnit}
                  brushIndexes={brush}
                  onBrushChange={onBrushChange}
                  onMetricChange={(m) => setPanelMetric(1, m)}
                  onHoverTooltip={onHoverTooltip}
                  tooltipEnabled={hoverHost === "p1"}
                />
              </div>
              <div className="grid min-h-0 grid-rows-2 gap-2">
                <div
                  className="min-h-0"
                  onMouseEnter={() => setHoverHost("p2")}
                  onMouseLeave={() => {
                    setHoverHost((h) => (h === "p2" ? null : h));
                    setHoverTooltip(null);
                  }}
                >
                  <TrendChart
                    panelKey="p2"
                    metricId={panelMetrics[2]}
                    data={seriesMap[panelMetrics[2]]}
                    events={events}
                    layout={layout}
                    focusUnit={focusUnit}
                    brushIndexes={brush}
                    onBrushChange={onBrushChange}
                    onMetricChange={(m) => setPanelMetric(2, m)}
                    onHoverTooltip={onHoverTooltip}
                    tooltipEnabled={hoverHost === "p2"}
                  />
                </div>
                <div
                  className="min-h-0"
                  onMouseEnter={() => setHoverHost("p3")}
                  onMouseLeave={() => {
                    setHoverHost((h) => (h === "p3" ? null : h));
                    setHoverTooltip(null);
                  }}
                >
                  <TrendChart
                    panelKey="p3"
                    metricId={panelMetrics[3]}
                    data={seriesMap[panelMetrics[3]]}
                    events={events}
                    layout={layout}
                    focusUnit={focusUnit}
                    brushIndexes={brush}
                    onBrushChange={onBrushChange}
                    onMetricChange={(m) => setPanelMetric(3, m)}
                    onHoverTooltip={onHoverTooltip}
                    tooltipEnabled={hoverHost === "p3"}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
