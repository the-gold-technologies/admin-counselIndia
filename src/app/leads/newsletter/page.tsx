import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Newsletter List | Counsel India Admin",
  description: "Counsel India newsletter subscriber leads",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "S.No", align: "center" as const },
  { key: "medium", label: "Type" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "addedOn", label: "Date" },
  { key: "newsletterName", label: "Newsletter Name", align: "right" as const },
];

export default function NewsletterListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#06b6d4" }} />
        </div>
      }
    >
      <LeadsTable
        category="newsletter"
        title="Newsletter List"
        description="Counsel India newsletter subscriber leads"
        columns={COLUMNS}
        accentColor="#06b6d4"
      />
    </Suspense>
  );
}
