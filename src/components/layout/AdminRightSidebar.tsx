"use client";

import React from "react";
import {
  Plus,
  Upload,
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";

interface AdminRightSidebarProps {
  onOpenAddModal?: () => void;
  onOpenUploadModal?: () => void;
  onExportCSV?: () => void;
}

export function AdminRightSidebar({
  onOpenAddModal,
  onOpenUploadModal,
  onExportCSV,
}: AdminRightSidebarProps) {
  const activities = [
    {
      title: "Akshatha D Shetty",
      subtitle: "Counselling Master - Intermediate",
      time: "2h ago",
      status: "Enrolled",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Dhamodharan K",
      subtitle: "Counselling Master - Foundation",
      time: "5h ago",
      status: "Enrolled",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Susmitha K S",
      subtitle: "Child Psychology Diploma",
      time: "1d ago",
      status: "Verified",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Rohit Deshmukh",
      subtitle: "PG Diploma Clinical Skills",
      time: "2d ago",
      status: "Pending",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Dark Promo Banner Card matching signature CMS layout */}
      <div className="bg-[#0a192f] rounded-[2rem] p-7 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#09A64A]/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-2 font-bold tracking-tight text-white/90 mb-5">
          <div className="w-6 h-6 rounded-full bg-white text-[#0a192f] flex items-center justify-center font-extrabold text-xs">
            CI
          </div>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Admissions Portal
          </span>
        </div>

        <h2 className="text-[24px] font-black leading-[1.15] mb-2">
          Cohort Oct-2026 <br />
          Admissions Live
        </h2>
        <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-[220px] mb-6">
          Review candidates, allocate academic counselors, and manage learner
          verifications.
        </p>

        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#09A64A] hover:bg-[#069543] text-white text-xs font-bold shadow-md shadow-[#09A64A]/30 transition-all cursor-pointer group"
          >
            <span>+ New Admission</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>

      {/* Recent Admissions Activity Stream */}
      <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Recent Admissions
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Live Stream
          </span>
        </div>

        <div className="space-y-3">
          {activities.map((act, i) => (
            <div
              key={i}
              className="flex items-start justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100 text-xs hover:bg-gray-100/60 transition-colors"
            >
              <div className="space-y-0.5 min-w-0 pr-2">
                <p className="font-bold text-gray-900 truncate">{act.title}</p>
                <p className="text-[11px] text-gray-500 truncate">
                  {act.subtitle}
                </p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {act.time}
                </p>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${act.badgeColor}`}
              >
                {act.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminRightSidebar;
