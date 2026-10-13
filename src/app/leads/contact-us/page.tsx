import React, { Suspense } from "react";
import { Metadata } from "next";
import LeadsTable, { ColDef } from "@/components/leads/LeadsTable";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact List | Counsel India Admin",
  description: "Direct contact form inquiries",
};

const COLUMNS: ColDef[] = [
  { key: "sNo", label: "S.No", align: "center" as const },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "mobile" },
  { key: "message", label: "Message" },
  { key: "hearFrom", label: "Hear From" },
  { key: "addedOn", label: "Created at", align: "right" as const },
];

export default function ContactListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#3b82f6" }}
          />
        </div>
      }
    >
      <LeadsTable
        category="contact-us"
        title="Contact List"
        description="Direct contact form inquiries"
        columns={COLUMNS}
        accentColor="#3b82f6"
      />
    </Suspense>
  );
}
