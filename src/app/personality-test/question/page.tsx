import React from "react";
import { Metadata } from "next";
import PersonalityTestTabs from "@/components/personality-test/PersonalityTestTabs";
import QuestionTable from "@/components/personality-test/QuestionTable";

export const metadata: Metadata = {
  title: "Question | Personality Test | Counsel India Admin",
  description: "Assessment questions, answer choices and trait mappings",
};

export default function QuestionPage() {
  return (
    <PersonalityTestTabs
      title="Question"
      subtitle="Configure test questions, 4 multiple-choice answers, and psychological archetype value mappings."
    >
      <QuestionTable />
    </PersonalityTestTabs>
  );
}
