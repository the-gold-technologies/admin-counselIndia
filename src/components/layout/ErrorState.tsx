import React from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { BackButton } from "./BackButton";

interface ErrorStateProps {
  code: string;
  title: string;
  message: React.ReactNode;
  icon: React.ReactNode;
}

/** Full-page error message used by the 403 (no access) and 404 (not found) pages. */
export function ErrorState({ code, title, message, icon }: ErrorStateProps) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
          {icon}
        </div>
        <p className="mt-6 text-7xl font-black tracking-tight text-gray-900">{code}</p>
        <h1 className="mt-2 text-xl font-black text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-sm shadow-md shadow-[#09A64A]/20 inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
          </Link>
          <BackButton />
        </div>
      </div>
    </div>
  );
}
