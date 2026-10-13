"use client";

import Link from "next/link";
import { User, Mail, Tag, Calendar, ArrowRight, Loader2 } from "lucide-react";

interface RecentItem {
  id: string;
  name: string;
  email: string;
  courseName?: string;
  category?: string;
  enquiryDate?: string;
  admissionDate?: string;
  addedOn?: string;
  createdAt?: string;
}

interface RecentSubmissionsProps {
  items?: RecentItem[];
  loading?: boolean;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Recent";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function RecentSubmissions({
  items = [],
  loading,
}: RecentSubmissionsProps) {
  const displayItems = (items || []).slice(0, 5);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg text-[#0B0F29]">
            Recent Enquiries & Admissions
          </h3>
          <p className="text-xs font-medium text-gray-400 mt-0.5">
            Latest incoming candidate enrollments, brochure inquiries, and test
            submissions.
          </p>
        </div>
        <Link
          href="/admissions"
          className="text-xs font-bold text-[#09A64A] hover:text-[#068f40] flex items-center gap-1 bg-emerald-50/70 px-3 py-1.5 rounded-xl transition-all"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#09A64A]" />
        </div>
      ) : displayItems.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-xs italic">
          No enquiries or admissions received yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-gray-50/30 rounded-xl px-2 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-50 text-[#09A64A] flex items-center justify-center font-bold text-sm shrink-0">
                  {item.name ? (
                    item.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B0F29] group-hover:text-[#09A64A] transition-colors">
                    {item.name || "Anonymous Learner"}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 font-medium flex-wrap">
                    {item.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-300" />
                        {item.email}
                      </span>
                    )}
                    {(item.courseName || item.category) && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-gray-300" />
                        {(item.courseName || item.category || "").replace(
                          /_/g,
                          " ",
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 pl-14 md:pl-0 shrink-0">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(
                    item.enquiryDate ||
                      item.admissionDate ||
                      item.addedOn ||
                      item.createdAt,
                  )}
                </span>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentSubmissions;
