import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "AskQuestion List | Counsel India Admin",
  description: "Q&A and student query submissions",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "S.No", align: "center" as const },
  { key: "message", label: "Question" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "hearFrom", label: "Here From" },
  { key: "addedOn", label: "Created at", align: "right" as const },
];

export default function AskQuestionListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#64748b" }}
          />
        </div>
      }
    >
      <LeadsTable
        category="ask-question"
        title="AskQuestion List"
        description="Q&A and student query submissions"
        columns={COLUMNS}
        accentColor="#64748b"
      />
    </Suspense>
  );
}
