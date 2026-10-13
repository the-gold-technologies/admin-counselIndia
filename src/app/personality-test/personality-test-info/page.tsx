import React from "react";
import { Metadata } from "next";
import PersonalityTestInfoView from "@/components/personality-test/PersonalityTestInfoView";

export const metadata: Metadata = {
  title: "Personality Test Info | Counsel India Admin",
  description: "Test configuration, instructions and status settings",
};

export default function PersonalityTestInfoPage() {
  return (
    <div className="w-full  pt-2 pb-10">
      <PersonalityTestInfoView />
    </div>
  );
}
