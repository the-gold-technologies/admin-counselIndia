"use client";

import Link from "next/link";
import { GraduationCap, MessageSquare, Star } from "lucide-react";

interface OverviewStatsProps {
  stats?: {
    admissions?: number;
    inquiries?: number;
    counselors?: number;
    courses?: number;
  };
  loading?: boolean;
}

export function OverviewStats({ stats, loading }: OverviewStatsProps) {
  const admissionsCount = stats?.admissions ?? 0;
  const inquiriesCount = stats?.inquiries ?? 0;
  const counselorsCount = stats?.counselors ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0B0F29]">Overview Stats</h2>
        <Link
          href="/admissions"
          className="text-sm font-semibold text-gray-500 hover:text-[#0B0F29] underline decoration-gray-300 underline-offset-4 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Stat Card 1: Active Admissions */}
        <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-gray-100 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#d1fadf] text-[#12b76a] flex items-center justify-center">
              <GraduationCap className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-bold text-[#0B0F29] text-[15px]">
                Active Admissions
              </h3>
              <p className="text-[13px] font-medium text-gray-400 mt-0.5">
                {loading
                  ? "..."
                  : `${admissionsCount.toLocaleString()} Enrolled Learners`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <p className="text-[13px] font-bold text-[#0B0F29]">Online</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Verification
              </p>
              <p className="text-[13px] font-bold text-[#09A64A]">Verified</p>
            </div>
          </div>
        </div>

        {/* Stat Card 2: Student Enquiries */}
        <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-gray-100 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#f0f9ff] text-[#0ea5e9] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-bold text-[#0B0F29] text-[15px]">
                Student Enquiries
              </h3>
              <p className="text-[13px] font-medium text-gray-400 mt-0.5">
                {loading
                  ? "..."
                  : `${inquiriesCount.toLocaleString()} Submissions`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Response
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-[13px] font-bold text-[#0B0F29]">
                  Active
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Network
              </p>
              <p className="text-[13px] font-bold text-[#0B0F29]">
                {counselorsCount} Counsellors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewStats;
