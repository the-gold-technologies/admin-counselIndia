"use client";

import React, { useState, useEffect } from "react";
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [admissions.length]);

  const totalItems = admissions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedAdmissions = admissions.slice(startIndex, endIndex);

  const getPaginationRange = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const range: (number | string)[] = [];
    const delta = 1;

    for (
      let i = Math.max(2, safePage - delta);
      i <= Math.min(totalPages - 1, safePage + delta);
      i++
    ) {
      range.push(i);
    }

    if (safePage - delta > 2) {
      range.unshift("...");
    }
    if (safePage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#09A64A] text-white font-semibold text-[13.5px] tracking-wide">
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
            {paginatedAdmissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400 font-medium text-sm">
                  No learner records found.
                </td>
              </tr>
            ) : (
              paginatedAdmissions.map((row, idx) => {
                const sNumber = startIndex + idx + 1;
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
                        className="font-bold text-gray-900 hover:text-[#09A64A] transition-colors text-left text-[14.5px] leading-snug inline-block"
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

                    {/* Date */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-[14px]">{dt.date}</span>
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
                        className="w-9 h-9 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
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
      <div className="px-6 py-4.5 bg-gray-50/60 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 font-medium">
        <div className="flex items-center gap-5 sm:gap-6">
          <span className="text-gray-700 text-[13.5px]">
            Showing{" "}
            <span className="font-bold text-gray-900">{totalItems > 0 ? startIndex + 1 : 0}</span>{" "}
            to <span className="font-bold text-gray-900">{endIndex}</span> of{" "}
            <span className="font-bold text-gray-900">{totalItems}</span> entries
          </span>

          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 pl-5 border-l border-gray-200">
            <span className="font-medium text-gray-600">Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 shadow-2xs hover:border-[#09A64A] focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="font-medium text-gray-600">per page</span>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs text-xs font-semibold transition-all"
            >
              Previous
            </button>

            {getPaginationRange().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-gray-400 font-bold text-xs select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(Number(page))}
                  className={`min-w-8.5 h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    safePage === page
                      ? "bg-[#09A64A] text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs text-xs font-semibold transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
