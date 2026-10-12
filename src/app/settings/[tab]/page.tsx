import { SettingsClient, SettingsTab } from "@/components/settings/SettingsClient";

interface PageProps {
  params: Promise<{ tab: string }>;
}

export default async function SettingsTabPage({ params }: PageProps) {
  const resolvedParams = await params;
  const tabParam = resolvedParams.tab;

  const validTabs: SettingsTab[] = [
    "admin",
    "config",
    "contact",
    "content",
    "footer",
  ];
  const initialTab: SettingsTab = validTabs.includes(tabParam as SettingsTab)
    ? (tabParam as SettingsTab)
    : "admin";

  return <SettingsClient initialTab={initialTab} />;
}
