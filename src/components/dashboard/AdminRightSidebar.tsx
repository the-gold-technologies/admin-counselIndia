"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

interface ActivityItem {
  type: string;
  text: string;
  time: string;
}

interface AdminRightSidebarProps {
  stats?: {
    activities?: ActivityItem[];
  };
  loading?: boolean;
}

function getRelativeTime(timeStr: string) {
  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (isNaN(date.getTime()) || diffMs < 0) return "Just now";

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch {
    return "Recent";
  }
}

export function AdminRightSidebar({ stats, loading }: AdminRightSidebarProps) {
  const activities: ActivityItem[] = stats?.activities || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Dark Promo Card matching Jaideva CMS design */}
      <div className="bg-[#0B0F29] rounded-[2rem] p-7 text-white relative overflow-hidden shadow-xl">
        {/* Decorative Bubbles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#09A64A]/25 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-2 font-bold tracking-tight text-white/90 mb-6">
          <div className="w-6 h-6 rounded-full bg-[#09A64A] text-white flex items-center justify-center font-bold text-xs">
            CI
          </div>
          Counsel India Portal
        </div>

        <h2 className="text-[26px] font-black leading-[1.1] mb-3">
          Admissions <br />
          Management
        </h2>

        <p className="text-sm font-medium text-emerald-100/80 leading-relaxed max-w-[210px] mb-8">
          Review candidates, manage verified psychologists, and monitor live
          enrollments.
        </p>

        <Link
          href="/admissions"
          className="inline-block bg-[#09A64A] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white hover:text-[#0B0F29] transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(9,166,74,0.4)] relative z-10"
        >
          Explore Portal
        </Link>

        {/* 3D Illustration matching Jaideva CMS */}
        <div className="absolute -bottom-4 right-0 w-36 h-36 opacity-90 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=CounselIndia&backgroundColor=transparent"
            className="w-full h-full object-contain filter drop-shadow-2xl"
            alt="illustration"
          />
        </div>
      </div>

      {/* Recent Activity matching Jaideva CMS */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-lg text-[#0B0F29]">Recent Activity</h3>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-6 flex justify-center items-center ring-1 ring-gray-100">
            <Loader2 className="w-5 h-5 animate-spin text-[#09A64A]" />
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center text-gray-400 text-xs italic ring-1 ring-gray-100">
            No activity tracked yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-100 space-y-4">
            {activities.map((activity, idx) => {
              const isAdmission = activity.type === "admission";
              const relativeTime = getRelativeTime(activity.time);

              return (
                <div key={idx} className="flex items-start gap-3 text-[13px]">
                  <div
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      isAdmission
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-[#09A64A]"
                    }`}
                  ></div>
                  <div className="flex flex-col flex-1 leading-snug">
                    <span className="font-bold text-[#0B0F29]">
                      {activity.text}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold mt-0.5">
                      {relativeTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRightSidebar;
