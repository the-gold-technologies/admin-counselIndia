"use client";

import { useState } from "react";
import { Search, Plus, RefreshCw, Bell, Shield } from "lucide-react";

interface AdminHeaderProps {
  onRefresh?: () => void;
  onAddAdmission?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function AdminHeader({
  onRefresh,
  onAddAdmission,
  searchQuery = "",
  onSearchChange,
}: AdminHeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="flex flex-col gap-6">
      <header className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0B0F29] flex items-center gap-2">
            Welcome back <span className="text-[#07a64b]">Superadmin</span>
            <span className="text-2xl animate-bounce origin-bottom-right delay-700">👋</span>
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            <span>{todayFormatted}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Data"
              className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <div className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-xs cursor-pointer">
              <Bell className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full border border-white">
              4233
            </span>
          </div>

          <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm">
            SA
          </div>
        </div>
      </header>
    </section>
  );
}

export default AdminHeader;
