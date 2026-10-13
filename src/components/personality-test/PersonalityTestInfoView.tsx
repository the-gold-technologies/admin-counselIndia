"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Edit2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PersonalityTestInfoData {
  id: string;
  liveId?: string;
  name: string;
  totalQuestions: number;
  subtitle?: string;
  instruction?: string;
  status: string;
}

export default function PersonalityTestInfoView() {
  const [info, setInfo] = useState<PersonalityTestInfoData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/personality-test/info");
      const json = await res.json();
      if (json.success && json.data) {
        setInfo(json.data);
      }
    } catch (e) {
      console.error("Failed to load personality test info:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full  pt-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0B0F29] tracking-tight">
            Personality Test Info
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            General assessment parameters, instructions, and test rules.
          </p>
        </div>

        {info && (
          <Link
            href="/personality-test/personality-test-info/edit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#09A64A] hover:bg-[#089341] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Information</span>
          </Link>
        )}
      </div>

      {/* Main Table Card matching AdmissionsTable & AlumniTable styling */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#09A64A] text-white font-semibold text-[13.5px] tracking-wide">
                <th className="py-4.5 px-6 w-20 text-center">#ID</th>
                <th className="py-4.5 px-6 min-w-[200px]">Name</th>
                <th className="py-4.5 px-6 w-36 text-center">Total Question</th>
                <th className="py-4.5 px-6 min-w-[140px]">Subtitle</th>
                <th className="py-4.5 px-6 min-w-[280px]">Instruction</th>
                <th className="py-4.5 px-6 w-28 text-center">Status</th>
                <th className="py-4.5 px-6 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-gray-400 font-medium text-sm"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#09A64A]" />
                    Loading configuration...
                  </td>
                </tr>
              ) : !info ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-gray-400 font-medium text-sm"
                  >
                    No configuration found.
                  </td>
                </tr>
              ) : (
                <tr className="hover:bg-gray-50/70 transition-colors duration-150">
                  <td className="py-4.5 px-6 text-center font-bold text-gray-500 text-[14px]">
                    {info.liveId || "1"}
                  </td>
                  <td className="py-4.5 px-6 font-bold text-gray-900 text-[14.5px]">
                    {info.name}
                  </td>
                  <td className="py-4.5 px-6 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {info.totalQuestions} Questions
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-gray-700 font-medium text-[14px]">
                    {info.subtitle || "-"}
                  </td>
                  <td className="py-4.5 px-6 text-gray-600 text-[14px] leading-relaxed max-w-md">
                    <div
                      className="line-clamp-2 prose prose-xs"
                      dangerouslySetInnerHTML={{
                        __html: info.instruction || "-",
                      }}
                    />
                  </td>
                  <td className="py-4.5 px-6 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                        info.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200",
                      )}
                    >
                      {info.status}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-center">
                    <Link
                      href="/personality-test/personality-test-info/edit"
                      title="Edit Configuration"
                      className="w-9 h-9 rounded-xl bg-emerald-50 text-[#09A64A] hover:bg-[#09A64A] hover:text-white transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 text-xs text-gray-500 font-medium flex items-center justify-between">
          <span>Showing 1 of 1 assessment master configuration</span>
          <span className="text-[#09A64A] font-bold">
            Standard Counsel India Format
          </span>
        </div>
      </div>
    </div>
  );
}
