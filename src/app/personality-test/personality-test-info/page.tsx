import React from "react";
import { Metadata } from "next";
import PersonalityTestTabs from "@/components/personality-test/PersonalityTestTabs";
import PersonalityTestInfoView from "@/components/personality-test/PersonalityTestInfoView";

export const metadata: Metadata = {
  title: "Personality Test Info | Personality Test | Counsel India Admin",
  description: "Test configuration, instructions and status settings",
};

export default function PersonalityTestInfoPage() {
  return (
    <PersonalityTestTabs
      title="Personality Test Info"
      subtitle="Configure test title, question count, student instructions, and live assessment status."
    >
      <PersonalityTestInfoView />
    </PersonalityTestTabs>
  );
}
