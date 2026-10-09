"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Edit2, Trash2, Award } from "lucide-react";

export interface AlumniItem {
  id: string;
  sNo?: number;
  name: string;
  email: string;
  mobile: string;
  programName: string;
  certificateNumber?: string;
  profession?: string;
  skills?: string;
  isOnline: boolean;
  status: string; // Active, Inactive
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AlumniTableProps {
  alumni: AlumniItem[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
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

function formatDate(dateStr?: string | Date | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = MONTHS[d.getMonth()];
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
      return `${day} ${month} ${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    }
    return String(dateStr);
  } catch {
    return String(dateStr);
  }
}

export default function AlumniTable({
  alumni,
  onDelete,
  onToggleStatus,
}: AlumniTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [alumni.length]);

  const totalItems = alumni.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedAlumni = alumni.slice(startIndex, endIndex);

  // Pagination page numbers with smart ellipsis windowing
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
              <th className="py-4.5 px-6 min-w-[240px]">Name & Details</th>
              <th className="py-4.5 px-6 min-w-[260px]">Program & Certificate</th>
              <th className="py-4.5 px-6 text-center w-36">Online Status</th>
              <th className="py-4.5 px-6 text-center w-32">Status</th>
              <th className="py-4.5 px-6 text-center w-36">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedAlumni.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-16 text-center text-gray-400 font-medium text-sm"
                >
                  No alumni records found.
                </td>
              </tr>
            ) : (
              paginatedAlumni.map((row, idx) => {
                const sNumber = row.sNo || (startIndex + idx + 1);
                const isActive = row.status === "Active";

                return (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-gray-50/70 transition-colors duration-150"
                  >
                    {/* S.No */}
                    <td className="py-4.5 px-6 text-center font-bold text-gray-500 text-[14px]">
                      {sNumber}
                    </td>

                    {/* Name & Details matching live format */}
                    <td className="py-4.5 px-6">
                      <div className="space-y-1 text-[13.5px]">
                        <Link
                          href={`/alumni/${row.id}`}
                          className="font-bold text-gray-900 hover:text-[#09A64A] transition-colors text-left text-[14.5px] block"
                        >
                          {row.name}
                        </Link>
                        <div className="text-gray-600 text-xs">
                          Email: <span className="font-medium text-gray-800">{row.email}</span>
                        </div>
                        <div className="text-gray-600 text-xs">
                          Mobile: <span className="font-medium text-gray-800">{row.mobile}</span>
                        </div>
                        <div className="text-gray-400 text-[11px] pt-0.5">
                          Added On: {formatDate(row.createdAt)}
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[11px] text-gray-500 font-medium">Is Approved:</span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                              row.isApproved ? "text-[#09A64A]" : "text-amber-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                row.isApproved ? "bg-[#09A64A]" : "bg-amber-500"
                              }`}
                            />
                            {row.isApproved ? "Yes" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Program & Certificate */}
                    <td className="py-4.5 px-6">
                      <div className="space-y-1.5">
                        <span className="font-semibold text-gray-800 text-[14px] leading-snug line-clamp-2 max-w-[280px] block">
                          {row.programName}
                        </span>
                        {row.certificateNumber && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-[#09A64A] border border-emerald-200 text-xs font-semibold">
                            <Award className="w-3 h-3 shrink-0" />
                            <span>Cert #{row.certificateNumber}</span>
                          </div>
                        )}
                        {row.profession && (
                          <div className="text-xs text-gray-500 font-medium">
                            {row.profession}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Online Status matching live */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            row.isOnline ? "bg-[#09A64A] animate-pulse" : "bg-gray-400"
                          }`}
                        />
                        <span>{row.isOnline ? "Online" : "Offline"}</span>
                      </div>
                    </td>

                    {/* Status Toggle Button matching live */}
                    <td className="py-4.5 px-6 text-center">
                      <button
                        onClick={() => onToggleStatus(row.id, row.status)}
                        title={`Click to ${isActive ? "Deactivate" : "Activate"}`}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          isActive
                            ? "bg-emerald-50 text-[#09A64A] border border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {row.status}
                      </button>
                    </td>

                    {/* Actions: View (Eye), Edit (Pencil), Delete (Trash) */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button -> Separate View Page */}
                        <Link
                          href={`/alumni/${row.id}`}
                          title="View Profile"
                          className="w-8 h-8 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit Button -> Separate Edit Page */}
                        <Link
                          href={`/alumni/${row.id}/edit`}
                          title="Edit Alumni"
                          className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDelete(row.id)}
                          title="Delete Alumni"
                          className="w-8 h-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
        {/* Left Side: Showing entries & Page Size dropdown with generous spacing */}
        <div className="flex items-center gap-5 sm:gap-6">
          <span className="text-gray-700 text-[13.5px]">
            Showing <span className="font-bold text-gray-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
            <span className="font-bold text-gray-900">{endIndex}</span> of{" "}
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

        {/* Right Side: Page navigation controls */}
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
