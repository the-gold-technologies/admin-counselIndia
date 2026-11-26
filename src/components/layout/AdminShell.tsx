"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminAccessProvider } from "@/hooks/useAdminAccess";
import type { Access } from "@/lib/permissions";

export function AdminShell({
  children,
  access,
}: {
  children: React.ReactNode;
  access: Access | null;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen w-full bg-[#0B0F29]">{children}</main>;
  }

  return (
    <AdminAccessProvider access={access}>
      <div className="flex h-screen overflow-hidden font-sans p-[5px] bg-[#f8f9fa]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-10 py-8">{children}</div>
        </main>
      </div>
    </AdminAccessProvider>
  );
}

export default AdminShell;
