import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Certificate Data List | Counsel India Admin",
  description: "Certificate issuance and verification requests",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "S.No", align: "center" as const },
  { key: "name", label: "User Name" },
  { key: "courseName", label: "Course Name" },
  { key: "marks", label: "Marks" },
  { key: "email", label: "Recipient Email" },
  { key: "certificateType", label: "Certificate Type" },
  { key: "viewPath", label: "View Path" },
  { key: "addedOn", label: "Created at", align: "right" as const },
];

export default function CertificateDataListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#6366f1" }} />
        </div>
      }
    >
      <LeadsTable
        category="certificate-data"
        title="Certificate Data List"
        description="Certificate issuance and verification requests"
        columns={COLUMNS}
        accentColor="#6366f1"
      />
    </Suspense>
  );
}
