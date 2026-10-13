import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Personality Entry | Personality Test | Counsel India Admin",
  description:
    "Personality assessment test entries and respondent demographics",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "#Id", align: "center" as const },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "gender", label: "Gender" },
  { key: "age", label: "Age", align: "center" as const },
  { key: "proBackground", label: "Pro Background" },
  { key: "purpose", label: "Purpose Give Test" },
  { key: "state", label: "State" },
  { key: "addedOn", label: "Date" },
  { key: "marks", label: "Result" },
  { key: "hearFrom", label: "Here From", align: "right" as const },
];

export default function PersonalityEntryPage() {
  return (
    <div className="w-full  pt-2 pb-10">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#09A64A]" />
          </div>
        }
      >
        <LeadsTable
          category="personality-test"
          title="Personality Entry"
          description="Personality assessment test entries and respondent demographics"
          columns={COLUMNS}
          accentColor="#09A64A"
        />
      </Suspense>
    </div>
  );
}
