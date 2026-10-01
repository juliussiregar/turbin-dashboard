import { notFound } from "next/navigation";

import { PerformanceDashboard } from "@/components/hmi/performance-dashboard";

const PRESET_IDS = ["performance", "generator", "condition"] as const;
type PresetId = (typeof PRESET_IDS)[number];

type PageProps = {
  params: Promise<{ preset: string }>;
};

export function generateStaticParams() {
  return PRESET_IDS.map((preset) => ({ preset }));
}

export default async function DashboardPresetPage({ params }: PageProps) {
  const { preset } = await params;
  if (!PRESET_IDS.includes(preset as PresetId)) {
    notFound();
  }

  return <PerformanceDashboard presetId={preset as PresetId} />;
}
