"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnswerOption {
  answer: string;
  value: string;
}

export interface QuestionItem {
  id: string;
  liveId?: string;
  question: string;
  answers: AnswerOption[] | any;
  position: number;
  status: string;
}

export default function QuestionTable() {
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/personality-test/questions");
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
      }
    } catch (e) {
      console.error("Failed to load questions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, question: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this question?\n\n"${question.slice(0, 60)}..."`
      )
    )
      return;
    try {
      const res = await fetch(`/api/personality-test/questions?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error || "Failed to delete question");
      }
    } catch (e) {
      console.error("Failed to delete question:", e);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.question.toLowerCase().includes(search.toLowerCase()) || String(i.position).includes(search)
  );

  // Pagination calculation
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginated = filtered.slice(startIndex, endIndex);

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
    if (safePage - delta > 2) range.unshift("...");
    if (safePage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="flex flex-col gap-5 w-full pt-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0B0F29] tracking-tight">
            Questions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Configure assessment questions, answer choices, and psychological trait value mappings.
          </p>
        </div>

        <Link
          href="/personality-test/questions/create"
          className="px-4.5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Question</span>
        </Link>
      </div>

      {/* Filter / Search Bar Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by text, position..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl pl-9.5 pr-4 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] transition-all"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium px-2">
          Total: <span className="font-bold text-gray-800">{filtered.length} Questions</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#09A64A] text-white font-semibold text-[13.5px] tracking-wide">
                <th className="py-4.5 px-6 w-20 text-center">#ID</th>
                <th className="py-4.5 px-6 min-w-[260px]">Question</th>
                <th className="py-4.5 px-6 min-w-[340px]">Answer Options &amp; Trait Mappings</th>
                <th className="py-4.5 px-6 w-24 text-center">Position</th>
                <th className="py-4.5 px-6 w-28 text-center">Status</th>
                <th className="py-4.5 px-6 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 font-medium text-sm">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#09A64A]" />
                    Loading questions...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 font-medium text-sm">
                    No questions found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const answers: AnswerOption[] = Array.isArray(item.answers)
                    ? item.answers
                    : typeof item.answers === "string"
                      ? JSON.parse(item.answers || "[]")
                      : [];

                  const displayIndex = startIndex + index + 1;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 transition-colors duration-150"
                    >
                      <td className="py-4.5 px-6 text-center font-bold text-gray-500 text-[14px]">
                        {item.liveId || displayIndex}
                      </td>
                      <td className="py-4.5 px-6 font-bold text-gray-900 text-[14.5px] leading-snug">
                        {item.question}
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex flex-col gap-1.5 py-1">
                          {answers.map((ans, aIdx) => (
                            <div
                              key={aIdx}
                              className="text-[13px] text-gray-700 flex items-center justify-between gap-2 p-1.5 rounded-lg bg-gray-50/90 border border-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-400 text-xs">{aIdx + 1}.</span>
                                <span>{ans.answer}</span>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                                {ans.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-center text-gray-700 font-bold text-[14px]">
                        #{item.position}
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                            item.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/personality-test/questions/${item.id}/edit`}
                            title="Edit Question"
                            className="w-9 h-9 rounded-xl bg-emerald-50 text-[#09A64A] hover:bg-[#09A64A] hover:text-white transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.question)}
                            title="Delete Question"
                            className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs"
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

        {/* 10-10 Pagination Footer */}
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
    </div>
  );
}
