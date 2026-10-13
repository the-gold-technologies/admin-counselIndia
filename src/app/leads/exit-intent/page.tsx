import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Exit Intent leads | Counsel India Admin",
  description: "Website exit intent popup submissions",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "S.No", align: "center" as const },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Phone Number" },
  { key: "medium", label: "Medium" },
  { key: "addedOn", label: "created At", align: "right" as const },
];

export default function ExitIntentleadsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#f59e0b" }}
          />
        </div>
      }
    >
      <LeadsTable
        category="exit-intent"
        title="Exit Intent leads"
        description="Website exit intent popup submissions"
        columns={COLUMNS}
        accentColor="#f59e0b"
      />
    </Suspense>
  );
}
