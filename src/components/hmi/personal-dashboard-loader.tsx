"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { PerformanceDashboard, type PersonalPresetConfig } from "@/components/hmi/performance-dashboard";

const STORAGE_KEY = "voltara-personal-dashboard-presets";

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot() {
  return "[]";
}

export function PersonalDashboardLoader({ id }: { id: string }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const presets = useMemo(() => {
    try {
      return JSON.parse(raw) as PersonalPresetConfig[];
    } catch {
      return [];
    }
  }, [raw]);
  const preset = presets.find((item) => item.id === id);

  if (!preset) {
    return <div className="flex h-dvh items-center justify-center bg-slate-100 p-6"><div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-bold text-slate-900">Personal preset not found</h1><p className="mt-2 text-sm leading-6 text-slate-500">This preset is stored in the browser where it was created and may have been removed.</p><Link href="/dashboard" className="mt-5 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white">Back to dashboards</Link></div></div>;
  }

  return <PerformanceDashboard personalPreset={preset} />;
}
