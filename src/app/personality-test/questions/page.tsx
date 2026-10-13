import React from "react";
import { Metadata } from "next";
import QuestionTable from "@/components/personality-test/QuestionTable";

export const metadata: Metadata = {
  title: "Questions | Personality Test | Counsel India Admin",
  description: "Assessment questions, answer choices and trait mappings",
};

export default function QuestionsPage() {
  return (
    <div className="w-full  pt-2 pb-10">
      <QuestionTable />
    </div>
  );
}
