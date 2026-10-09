"use client";

import React from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

export interface AdmissionRow {
  id: string;
  sNo?: number;
  name: string;
  email: string;
  mobile: string;
  courseName: string;
  admissionDate: string;
  status?: string;
  academicCounselor?: string;
}

interface AdmissionsTableProps {
  admissions: AdmissionRow[];
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function splitAdmissionDateTime(dateStr?: string | Date | null): {
  date: string;
  time: string;
} {
  if (!dateStr) return { date: "-", time: "" };
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const monthShort = MONTHS[d.getMonth()];
      const year = d.getFullYear();

      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, "0");

      return {
        date: `${day} ${monthShort} ${year}`,
        time: `${formattedHours}:${minutes} ${ampm}`,
      };
    }

    const parts = String(dateStr).split(" ");
    if (parts.length >= 2) {
      return {
        date: parts[0],
        time: parts.slice(1).join(" "),
      };
    }
    return { date: String(dateStr), time: "" };
  } catch {
    return { date: String(dateStr), time: "" };
  }
}

export function formatAdmissionDateTime(dateStr?: string | Date | null): string {
  const { date, time } = splitAdmissionDateTime(dateStr);
  return time ? `${date} ${time}` : date;
}

export default function AdmissionsTable({ admissions }: AdmissionsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1e293b] text-white font-semibold text-[13.5px] tracking-wide">
              <th className="py-4.5 px-6 w-18 text-center">S.No</th>
              <th className="py-4.5 px-6 min-w-[160px]">Name</th>
              <th className="py-4.5 px-6 min-w-[200px]">Email</th>
              <th className="py-4.5 px-6 min-w-[140px]">Mobile</th>
              <th className="py-4.5 px-6 min-w-[240px]">Course Name</th>
              <th className="py-4.5 px-6 min-w-[140px]">Date</th>
              <th className="py-4.5 px-6 text-center w-24">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {admissions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-16 text-center text-gray-400 font-medium text-sm"
                >
                  No learner records found.
                </td>
              </tr>
            ) : (
              admissions.map((row, idx) => {
                const sNumber = row.sNo || idx + 1;
                const dt = splitAdmissionDateTime(row.admissionDate);

                return (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-gray-50/70 transition-colors duration-150"
                  >
                    {/* S.No */}
                    <td className="py-4.5 px-6 text-center font-bold text-gray-500 text-[14px]">
                      {sNumber}
                    </td>

                    {/* Name */}
                    <td className="py-4.5 px-6">
                      <Link
                        href={`/admissions/${row.id}`}
                        className="font-bold text-gray-900 hover:text-[#07a64b] transition-colors text-left text-[14.5px] leading-snug inline-block"
                      >
                        {row.name}
                      </Link>
                    </td>

                    {/* Email */}
                    <td className="py-4.5 px-6 text-gray-600 text-[14px] font-normal">
                      {row.email}
                    </td>

                    {/* Mobile */}
                    <td className="py-4.5 px-6 text-gray-700 font-medium text-[14px] whitespace-nowrap">
                      {row.mobile}
                    </td>

                    {/* Course Name */}
                    <td className="py-4.5 px-6">
                      <span className="font-semibold text-gray-800 text-[14px] leading-snug line-clamp-2 max-w-[320px] block">
                        {row.courseName.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Date: e.g. "09 Oct 2026" on 1st line, "11:42 am" on 2nd line */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-[14px]">
                          {dt.date}
                        </span>
                        {dt.time && (
                          <span className="text-[12.5px] text-gray-500 font-medium mt-0.5">
                            {dt.time}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-4.5 px-6 text-center">
                      <Link
                        href={`/admissions/${row.id}`}
                        title="View Profile"
                        className="w-9 h-9 rounded-xl bg-[#07a64b] hover:bg-[#068f40] text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 font-medium">
        <span>Showing {admissions.length} entries</span>
        <div className="flex items-center gap-2">
          <button className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer shadow-2xs text-xs font-semibold">
            Previous
          </button>
          <span className="px-3.5 py-1.5 rounded-xl bg-[#07a64b] text-white font-bold text-xs shadow-xs">
            1
          </span>
          <button className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer shadow-2xs text-xs font-semibold">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
