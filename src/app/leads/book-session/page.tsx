import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Counsellor Contact List | Counsel India Admin",
  description: "Counsellor session bookings and leads",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "S.No", align: "center" as const },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "countryCode", label: "Country Code", align: "center" as const },
  { key: "mobile", label: "mobile" },
  { key: "state", label: "State" },
  { key: "city", label: "City" },
  { key: "hearFrom", label: "Hear From" },
  { key: "addedOn", label: "Created at", align: "right" as const },
];

export default function CounsellorContactListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#8b5cf6" }} />
        </div>
      }
    >
      <LeadsTable
        category="book-session"
        title="Counsellor Contact List"
        description="Counsellor session bookings and leads"
        columns={COLUMNS}
        accentColor="#8b5cf6"
      />
    </Suspense>
  );
}
