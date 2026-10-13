"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Edit2, Trash2, Award } from "lucide-react";
import { CounselorItem } from "@/types/counsellor";

interface CounsellorTableProps {
  counsellors: CounselorItem[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

function AvatarThumbnail({
  image,
  name,
}: {
  image?: string | null;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initials = (name || "C")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const safeUrl = image ? encodeURI(image.trim()) : null;

  if (safeUrl && !hasError) {
    return (
      <img
        src={safeUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/20 shrink-0 shadow-xs"
        loading="lazy"
      />
    );
  }

  return (
    <div className="w-11 h-11 rounded-full bg-emerald-50 text-[#09A64A] border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
      {initials || "C"}
    </div>
  );
}

export default function CounsellorTable({
  counsellors,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onDelete,
  onToggleStatus,
}: CounsellorTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | string)[] = [];
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
    return Array.from(new Set(range));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#09A64A] text-white font-semibold text-[13.5px] tracking-wide">
              <th className="py-4.5 px-6 w-18 text-center">S.No</th>
              <th className="py-4.5 px-6 min-w-[260px]">Name &amp; Details</th>
              <th className="py-4.5 px-6 min-w-[240px]">
                Specialty &amp; Credentials
              </th>
              <th className="py-4.5 px-6 text-center w-36">Online Status</th>
              <th className="py-4.5 px-6 text-center w-32">Status</th>
              <th className="py-4.5 px-6 text-center w-36">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {counsellors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-500" />
                  <p className="text-base font-semibold text-gray-600">
                    No counsellors found
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your search criteria or filter tabs
                  </p>
                </td>
              </tr>
            ) : (
              counsellors.map((item, index) => {
                const sNoDisplay = (currentPage - 1) * pageSize + index + 1;
                const isOnline = Boolean(item.isOnline);
                const isActive = item.status === "Active";
                const isApproved = item.isApproved !== false;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/70 transition-colors duration-150"
                  >
                    {/* S.No */}
                    <td className="py-4.5 px-6 text-center font-bold text-gray-500 text-[14px]">
                      {sNoDisplay}
                    </td>

                    {/* Name & Details */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-start gap-3.5">
                        <AvatarThumbnail image={item.image} name={item.name} />

                        <div className="space-y-1 text-[13.5px]">
                          <Link
                            href={`/counsellors/${item.id}`}
                            className="font-bold text-gray-900 hover:text-[#09A64A] transition-colors text-left text-[14.5px] block"
                          >
                            {item.name}
                          </Link>
                          <div className="text-gray-600 text-xs">
                            Email:{" "}
                            <span className="font-medium text-gray-800">
                              {item.email || "-"}
                            </span>
                          </div>
                          <div className="text-gray-600 text-xs">
                            Mobile:{" "}
                            <span className="font-medium text-gray-800">
                              {item.mobile || "-"}
                            </span>
                          </div>
                          <div className="text-gray-400 text-[11px] pt-0.5">
                            Added On: {item.addedOn || "-"}
                          </div>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-[11px] text-gray-500 font-medium">
                              Is Approved:
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                                isApproved ? "text-[#09A64A]" : "text-amber-600"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isApproved ? "bg-[#09A64A]" : "bg-amber-500"
                                }`}
                              />
                              {isApproved ? "Yes" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Specialty & Credentials */}
                    <td className="py-4.5 px-6">
                      <div className="space-y-1.5">
                        <span className="font-semibold text-gray-800 text-[14px] leading-snug block">
                          {item.specialty || item.designation || "Counselor"}
                        </span>
                        {item.education && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-[#09A64A] border border-emerald-200 text-xs font-semibold">
                            <Award className="w-3 h-3 shrink-0" />
                            <span>{item.education}</span>
                          </div>
                        )}
                        {item.experience && (
                          <div className="text-xs text-gray-500 font-medium">
                            Experience: {item.experience} yr
                            {Number(item.experience) === 1 ? "" : "s"}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Online Status */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline
                              ? "bg-[#09A64A] animate-pulse"
                              : "bg-gray-400"
                          }`}
                        />
                        <span>{isOnline ? "Online" : "Offline"}</span>
                      </div>
                    </td>

                    {/* Status Toggle matching Alumni */}
                    <td className="py-4.5 px-6 text-center">
                      <button
                        onClick={() => onToggleStatus(item.id, item.status)}
                        title={`Click to ${isActive ? "Deactivate" : "Activate"}`}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          isActive
                            ? "bg-emerald-50 text-[#09A64A] border border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {item.status || "Active"}
                      </button>
                    </td>

                    {/* Action buttons: Dedicated Pages */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button -> Separate View Page */}
                        <Link
                          href={`/counsellors/${item.id}`}
                          title="View Counsellor"
                          className="w-8 h-8 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit Button -> Separate Edit Page */}
                        <Link
                          href={`/counsellors/${item.id}/edit`}
                          title="Edit Counsellor"
                          className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          title="Delete Counsellor"
                          className="w-8 h-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Footer Pagination Bar */}
      <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            Showing{" "}
            <span className="font-bold text-gray-900">
              {totalItems > 0 ? startIndex : 0}
            </span>{" "}
            to <span className="font-bold text-gray-900">{endIndex}</span> of{" "}
            <span className="font-bold text-gray-900">{totalItems}</span>{" "}
            entries
          </span>

          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-200">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 shadow-2xs hover:border-[#09A64A] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
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
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-gray-400 font-bold text-xs select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(Number(page))}
                  className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-[#09A64A] text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-semibold"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              Delete Counsellor?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-6">
              This action cannot be undone. Are you sure you want to remove this
              counsellor from the system?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
