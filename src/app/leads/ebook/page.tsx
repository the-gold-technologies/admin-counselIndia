import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Ebook List | Counsel India Admin",
  description: "Ebook download inquiries and leads",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "S.No", align: "center" as const },
  { key: "courseType", label: "Course Type" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "addedOn", label: "Date" },
  { key: "hearFrom", label: "Here From" },
  { key: "ebookName", label: "Ebook Name", align: "right" as const },
];

export default function EbookListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#14b8a6" }} />
        </div>
      }
    >
      <LeadsTable
        category="ebook"
        title="Ebook List"
        description="Ebook download inquiries and leads"
        columns={COLUMNS}
        accentColor="#14b8a6"
      />
    </Suspense>
  );
}
