import { HmiApp } from "@/components/hmi/hmi-app";

type PageProps = {
  searchParams: Promise<{ unit?: string; demo?: string }>;
};

export default async function TurbinePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const unit = params.unit === "gtg2" ? "gtg2" : "gtg1";
  const demo = params.demo === "trip_demo" || params.demo === "load_ramp" ? params.demo : undefined;

  return <HmiApp currentScreenId="main" unitId={unit} demo={demo} />;
}
