import React from "react";
import { Metadata } from "next";
import PersonalityTestTabs from "@/components/personality-test/PersonalityTestTabs";
import PersonalityEntryTable from "@/components/personality-test/PersonalityEntryTable";

export const metadata: Metadata = {
  title: "Personality Entry | Personality Test | Counsel India Admin",
  description: "Student submissions, test responses and respondent background",
};

export default function PersonalityEntryPage() {
  return (
    <PersonalityTestTabs
      title="Personality Entry"
      subtitle="Track user submissions, demographic background and calculated personality test results."
    >
      <PersonalityEntryTable />
    </PersonalityTestTabs>
  );
}
