import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "ci for business | Counsel India Admin",
  description: "Corporate partnership and B2B counseling inquiries",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "#ID", align: "center" as const },
  { key: "name", label: "Name" },
  { key: "mobile", label: "Mobile" },
  { key: "email", label: "Email" },
  { key: "message", label: "Message" },
  { key: "source", label: "Source" },
  { key: "addedOn", label: "Date", align: "right" as const },
];

export default function ciforbusinessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#0ea5e9" }}
          />
        </div>
      }
    >
      <LeadsTable
        category="ci-business"
        title="ci for business"
        description="Corporate partnership and B2B counseling inquiries"
        columns={COLUMNS}
        accentColor="#0ea5e9"
      />
    </Suspense>
  );
}
