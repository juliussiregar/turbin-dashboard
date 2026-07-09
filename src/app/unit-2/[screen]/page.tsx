import { redirect } from "next/navigation";

import { HmiApp } from "@/components/hmi/hmi-app";

type PageProps = {
  params: Promise<{ screen: string }>;
};

export default async function Unit2ScreenPage({ params }: PageProps) {
  const { screen } = await params;
  if (screen !== "main") {
    redirect("/unit-2/main");
  }

  return <HmiApp currentScreenId={screen} />;
}
