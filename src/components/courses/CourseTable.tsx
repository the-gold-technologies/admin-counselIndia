"use client";

import React from "react";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  Layers,
  Award,
  ListOrdered,
  GraduationCap,
} from "lucide-react";
import { Course } from "@/types/course";

interface CourseTableProps {
  courses: Course[];
  currentPage: number;
  totalPages?: number;
  pageSize: number;
  totalCourses?: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDelete: (id: string, name?: string) => void;
  onToggleStatus: (course: Course) => void;
}

const CourseInitials = ({ name }: { name: string }) => {
  const words = name.trim().split(" ");
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  const colors = [
    "bg-emerald-600",
    "bg-teal-600",
    "bg-blue-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-cyan-600",
  ];
  const charCode = name.charCodeAt(0) || 0;
  const bg = colors[charCode % colors.length];

  return (
    <div
      className={`w-12 h-12 rounded-xl ${bg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs tracking-wider`}
    >
      {initials}
    </div>
  );
};

export const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  currentPage,
  totalPages,
  pageSize,
  totalCourses,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onDelete,
  onToggleStatus,
}) => {
  const safeTotal =
    typeof totalCourses === "number"
      ? totalCourses
      : typeof totalItems === "number"
      ? totalItems
      : courses.length;
  const safeTotalPages =
    totalPages && totalPages > 0
      ? totalPages
      : Math.ceil(safeTotal / (pageSize || 15)) || 1;

  const startIdx = safeTotal > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIdx = Math.min(currentPage * pageSize, safeTotal);

  const getPaginationRange = (): (number | string)[] => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }
    const range: (number | string)[] = [];
    const delta = 1;
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(safeTotalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < safeTotalPages - 1) range.push("...");
    range.unshift(1);
    if (safeTotalPages > 1) range.push(safeTotalPages);
    return range;
  };

  const formatPrice = (val?: string | number | null) => {
    if (!val) return null;
    const num = Number(val);
    if (isNaN(num) || num === 0) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Table Container - Fits 100% width with 6 Columns matching Live Portal */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#09A64A] text-white font-semibold text-[13.5px] tracking-wide">
              <th className="py-4 px-3.5 w-14 text-center">#ID</th>
              <th className="py-4 px-4 w-[38%]">Course Name</th>
              <th className="py-4 px-4 w-[38%]">Details</th>
              <th className="py-4 px-3 text-center w-20">Position</th>
              <th className="py-4 px-3 text-center w-24">Status</th>
              <th className="py-4 px-3 text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-500" />
                    <p className="text-base font-semibold text-gray-600 mb-1">
                      No courses found
                    </p>
                    <p className="text-xs text-gray-400">
                      Try adjusting your search query, category, or status filter
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              courses.map((course, index) => {
                const sNoDisplay = (currentPage - 1) * pageSize + index + 1;
                const isActive = (course.status || "").toLowerCase() === "active";
                const feeDisplay = formatPrice(course.totalDiscountFee || course.totalProgramFee);

                return (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50/70 transition-colors duration-150 group"
                  >
                    {/* #ID */}
                    <td className="py-3.5 px-3.5 text-center font-bold text-gray-500 text-sm">
                      {sNoDisplay}
                    </td>

                    {/* Course Name - No Truncate, Natural 2-Line Wrapping + Metrics */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        {course.coverImage ? (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center mt-0.5">
                            <img
                              src={encodeURI(decodeURI(course.coverImage))}
                              alt={course.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <CourseInitials name={course.name} />
                        )}
                        <div className="min-w-0 flex-1">
                          {/* Course Title (Wraps naturally in 2 lines, no dotting) */}
                          <div className="flex items-start gap-2">
                            <p className="font-bold text-gray-900 group-hover:text-[#09A64A] transition-colors text-[14px] leading-snug">
                              {course.name}
                            </p>
                            {course.rating && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0 mt-0.5">
                                ★ {course.rating}
                              </span>
                            )}
                          </div>

                          {/* Line 2: Duration, Lessons, Fee */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5 flex-wrap font-normal leading-tight">
                            {(course.listDuration || course.duration) && (
                              <span className="flex items-center gap-1 shrink-0">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>{course.listDuration || course.duration}</span>
                              </span>
                            )}
                            {course.lessons && (
                              <span className="flex items-center gap-1 shrink-0">
                                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                                <span>{course.lessons} Lessons</span>
                              </span>
                            )}
                            {feeDisplay && (
                              <span className="font-semibold text-[#09A64A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                {feeDisplay}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Details - Category, Date, & 4 Sub-Module Buttons in 2x2 Grid */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-2">
                        {/* Line 1: Category Badge & Added Date */}
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-lg px-2.5 py-0.5 text-xs truncate max-w-[200px]">
                            {course.category || "General"}
                          </span>
                          {course.addedOn && (
                            <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{course.addedOn.split(" ")[0]}</span>
                            </span>
                          )}
                        </div>

                        {/* Line 2 & 3: 4 Sub-Modules in Clean 2x2 Grid with Original Color Palette */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {/* Overview / Key Features */}
                          <Link
                            href={`/courses/${course.id}/overview`}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors flex items-center justify-between gap-1.5 group/btn"
                            title="View Overview & Key Features"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Sparkles className="w-3.5 h-3.5 text-[#09A64A] shrink-0" />
                              <span className="text-xs font-semibold truncate">Overview</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                                {course.overviewCount || 0}
                              </span>
                              <span className="text-[11px] text-[#09A64A] font-bold underline">View</span>
                            </div>
                          </Link>

                          {/* Learning Objectives */}
                          <Link
                            href={`/courses/${course.id}/learning-objectives`}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/80 transition-colors flex items-center justify-between gap-1.5 group/btn"
                            title="View Learning Objectives"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span className="text-xs font-semibold truncate">Objectives</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-900 font-bold text-[10px]">
                                {course.learnCount || 0}
                              </span>
                              <span className="text-[11px] text-purple-700 font-bold underline">View</span>
                            </div>
                          </Link>

                          {/* Credentials */}
                          <Link
                            href={`/courses/${course.id}/credentials`}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 transition-colors flex items-center justify-between gap-1.5 group/btn"
                            title="View Credentials"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="text-xs font-semibold truncate">Credentials</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 text-indigo-900 font-bold text-[10px]">
                                {course.credentialCount || 0}
                              </span>
                              <span className="text-[11px] text-indigo-700 font-bold underline">View</span>
                            </div>
                          </Link>

                          {/* Curriculum */}
                          <Link
                            href={`/courses/${course.id}/curriculum`}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 transition-colors flex items-center justify-between gap-1.5 group/btn"
                            title="View Curriculum"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <ListOrdered className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="text-xs font-semibold truncate">Curriculum</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="px-1.5 py-0.2 rounded-full bg-blue-200 text-blue-900 font-bold text-[10px]">
                                {course.curriculumCount || 0}
                              </span>
                              <span className="text-[11px] text-blue-700 font-bold underline">View</span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 font-bold text-gray-700 text-xs border border-gray-200">
                        {course.position || 1}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(course)}
                        title={`Click to change to ${isActive ? "Inactive" : "Active"}`}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs transition-all duration-150 cursor-pointer ${
                          isActive
                            ? "bg-emerald-50 text-[#09A64A] border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-[#09A64A]" : "bg-gray-400"
                          }`}
                        />
                        <span>{course.status || (isActive ? "Active" : "Inactive")}</span>
                      </button>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/courses/${course.id}/edit`}
                          className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs"
                          title="Edit Course"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => onDelete(course.id, course.name)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                          title="Delete Course"
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

      {/* Footer with Stats & Pagination */}
      <div className="py-3.5 px-6 bg-gray-50/70 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-4 flex-wrap">
          <span>
            Showing <strong className="text-gray-800">{startIdx}</strong> to{" "}
            <strong className="text-gray-800">{endIdx}</strong> of{" "}
            <strong className="text-gray-800">{safeTotal}</strong> courses
          </span>

          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-gray-200 text-gray-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-[#09A64A] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Pagination buttons - ALWAYS rendered */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium cursor-pointer"
          >
            Prev
          </button>

          {getPaginationRange().map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="px-1 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === p
                    ? "bg-[#09A64A] text-white shadow-2xs font-bold"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
            disabled={currentPage >= safeTotalPages}
            className="px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseTable;
