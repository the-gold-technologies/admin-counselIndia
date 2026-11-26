import React from "react";
import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { ErrorState } from "@/components/layout/ErrorState";

export const metadata: Metadata = { title: "Access denied | Counsel India Admin" };

// Shown (with HTTP 403) when a staff member opens a section their role doesn't include.
// src/proxy.ts serves this page in place of the requested one; the address bar is unchanged.
export default function AccessDeniedPage() {
  return (
    <ErrorState
      code="403"
      title="Access denied"
      icon={<ShieldAlert className="w-10 h-10 text-rose-500" />}
      message={
        <>
          You don&apos;t have permission to open this page. If you need it for your work, ask a
          Super Admin to add this section to your role in <b>Staff &amp; Roles</b>.
        </>
      }
    />
  );
}
