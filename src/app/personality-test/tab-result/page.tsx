import React from "react";
import { Metadata } from "next";
import PersonalityTestTabs from "@/components/personality-test/PersonalityTestTabs";
import TabResultTable from "@/components/personality-test/TabResultTable";

export const metadata: Metadata = {
  title: "Tab Result | Personality Test | Counsel India Admin",
  description: "Assessment outcome archetypes, scores and result profiles",
};

export default function TabResultPage() {
  return (
    <PersonalityTestTabs
      title="Tab Result"
      subtitle="Manage personality archetypes, points threshold and psychological outcome descriptions."
    >
      <TabResultTable />
    </PersonalityTestTabs>
  );
}
