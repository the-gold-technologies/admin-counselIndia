"use client";

import React from "react";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  CalendarPlus,
  Phone,
  Mail,
  Award,
} from "lucide-react";
import { CourseLeadItem } from "@/types/courseLead";

interface CourseLeadTableProps {
  leads: CourseLeadItem[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit?: (lead: CourseLeadItem) => void;
  onDelete: (id: string) => void;
  onCreateBooking?: (lead: CourseLeadItem) => void;
}

function UserInitials({ name }: { name: string }) {
  const initial = (name || "G").trim().charAt(0).toUpperCase() || "G";

  return (
    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
      {initial}
    </div>
  );
}

export default function CourseLeadTable({
  leads,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onCreateBooking,
}: CourseLeadTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "new") {
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
    }
    if (s === "contacted") {
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
    }
    if (s === "enrolled" || s === "completed") {
      return "bg-emerald-50 text-[#09A64A] border-emerald-200 hover:bg-emerald-100";
    }
    if (s === "inactive" || s === "closed") {
      return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200";
    }
    return "bg-emerald-50 text-[#09A64A] border-emerald-200 hover:bg-emerald-100";
  };

  const getPaginationRange = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const range: (number | string)[] = [];
    const delta = 1;
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Table Container - no fixed oversized min-widths, avoids horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#09A64A] text-white font-semibold text-[13.5px] tracking-wide">
              <th className="py-4.5 px-4 w-16 text-center">S.No</th>
              <th className="py-4.5 px-4">Name &amp; Details</th>
              <th className="py-4.5 px-4">Course &amp; Managers</th>
              <th className="py-4.5 px-3 text-center w-28">Status</th>
              <th className="py-4.5 px-3 text-center w-32">Added On</th>
              <th className="py-4.5 px-3 text-center w-36">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-500" />
                    <p className="text-base font-semibold text-gray-600 mb-1">
                      No course leads found
                    </p>
                    <p className="text-xs text-gray-400">
                      Try adjusting your search query, status tab, or date filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead, index) => {
                const sNoDisplay = lead.sNo ?? ((currentPage - 1) * pageSize + index + 1);

                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50/70 transition-colors duration-150 group"
                  >
                    {/* S.No */}
                    <td className="py-4 px-4 text-center font-bold text-gray-500 text-[14px]">
                      {sNoDisplay}
                    </td>

                    {/* Name & Details (Avatar, Name, Email, Phone matching user screenshot) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <UserInitials name={lead.name} />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 group-hover:text-[#09A64A] transition-colors text-sm leading-tight">
                            {lead.name || "Guest"}
                          </p>
                          {lead.email && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <a
                                href={`mailto:${lead.email}`}
                                className="hover:underline truncate max-w-[220px]"
                                title={lead.email}
                              >
                                {lead.email}
                              </a>
                            </div>
                          )}
                          {lead.mobile && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <a
                                href={`tel:${lead.mobile}`}
                                className="hover:underline"
                              >
                                {lead.mobile}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Course & Managers - 2 lines instead of separate columns */}
                    <td className="py-4 px-4">
                      <div className="space-y-1 max-w-[320px]">
                        {/* Line 1: Course Name */}
                        <div className="font-semibold text-gray-900 text-[13.5px] leading-snug line-clamp-2">
                          {lead.courseName || "General Course Enquiry"}
                        </div>
                        {/* Line 2: RM & CSM & Source */}
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-gray-400 font-medium">RM:</span>
                            <span className="text-gray-700 font-semibold">
                              {lead.relationshipManager || "Unassigned"}
                            </span>
                          </span>
                          <span className="text-gray-300">&bull;</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="text-gray-400 font-medium">CSM:</span>
                            <span className="text-gray-700 font-semibold">
                              {lead.customerSuccessManager || "-"}
                            </span>
                          </span>
                          {lead.source && (
                            <>
                              <span className="text-gray-300">&bull;</span>
                              <span className="text-gray-400 text-[11px]">{lead.source}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Badge linking to Edit page */}
                    <td className="py-4 px-3 text-center">
                      <Link
                        href={`/course-leads/${lead.id}/edit`}
                        title="Click to edit status"
                        className={`inline-block px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        {lead.status || "New"}
                      </Link>
                    </td>

                    {/* Added On (2 Lines: Date & Time) */}
                    <td className="py-4 px-3 text-center">
                      <div className="text-xs text-gray-700 font-medium">
                        {lead.addedOn ? lead.addedOn.split(" ")[0] : "-"}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {lead.addedOn && lead.addedOn.split(" ").length > 1
                          ? lead.addedOn.split(" ").slice(1).join(" ")
                          : ""}
                      </div>
                    </td>

                    {/* Action Buttons in 2 lines: Line 1 Edit & Delete, Line 2 Create A Booking */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        {/* Line 1: Edit & Delete buttons */}
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/course-leads/${lead.id}/edit`}
                            title="Edit Lead"
                            className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => onDelete(lead.id)}
                            title="Delete Lead"
                            className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line 2: Create A Booking button */}
                        <Link
                          href={`/course-leads/${lead.id}/booking`}
                          title="Create A Booking"
                          className="px-2.5 py-1 rounded-lg bg-[#09A64A] hover:bg-[#089341] text-white transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-95 whitespace-nowrap"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          <span>Create A Booking</span>
                        </Link>
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
      <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            Showing <span className="font-bold text-gray-900">{totalItems > 0 ? startItem : 0}</span> to{" "}
            <span className="font-bold text-gray-900">{endItem}</span> of{" "}
            <span className="font-bold text-gray-900">{totalItems}</span> entries
          </span>

          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-200">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 shadow-2xs hover:border-[#09A64A] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>per page</span>
          </div>
        </div>

        {/* Navigation buttons */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-semibold"
            >
              Previous
            </button>

            {getPaginationRange().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 font-bold text-xs select-none">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(Number(page))}
                  className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-[#09A64A] text-white shadow-md shadow-[#09A64A]/20"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-semibold"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
