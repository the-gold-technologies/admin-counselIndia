import React from "react";
import { Metadata } from "next";
import TabResultTable from "@/components/personality-test/TabResultTable";

export const metadata: Metadata = {
  title: "Tab Result | Personality Test | Counsel India Admin",
  description: "Assessment outcome archetypes, scores and result profiles",
};

export default function TabResultPage() {
  return (
    <div className="w-full  pt-2 pb-10">
      <TabResultTable />
    </div>
  );
}
