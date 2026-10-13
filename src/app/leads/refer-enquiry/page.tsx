import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Refer Enquiry List | Counsel India Admin",
  description: "Referral program inquiries and recommendations",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "S.No", align: "center" as const },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "referByName", label: "Refer By Name" },
  { key: "referByEmail", label: "Refer By Email" },
  { key: "referByPhone", label: "Refer By Phone" },
  { key: "courseRefer", label: "Course Refer" },
  { key: "addedOn", label: "Date", align: "right" as const },
];

export default function ReferEnquiryListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#e11d48" }}
          />
        </div>
      }
    >
      <LeadsTable
        category="refer-enquiry"
        title="Refer Enquiry List"
        description="Referral program inquiries and recommendations"
        columns={COLUMNS}
        accentColor="#e11d48"
      />
    </Suspense>
  );
}
