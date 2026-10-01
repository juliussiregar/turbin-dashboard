import { PersonalDashboardLoader } from "@/components/hmi/personal-dashboard-loader";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PersonalDashboardPage({ params }: PageProps) {
  const { id } = await params;
  return <PersonalDashboardLoader id={id} />;
}
