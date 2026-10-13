"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabResultItem {
  id: string;
  liveId?: string;
  name: string;
  description: string;
  points: string;
  status: string;
}

export default function TabResultTable() {
  const [items, setItems] = useState<TabResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination states (10-10 format)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/personality-test/tab-result");
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
      }
    } catch (e) {
      console.error("Failed to load tab results:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Are you sure you want to delete tab result "${name}"?`)
    )
      return;
    try {
      const res = await fetch(`/api/personality-test/tab-result?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error || "Failed to delete result");
      }
    } catch (e) {
      console.error("Failed to delete result:", e);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.points.includes(search),
  );

  // Pagination calculations
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

  // Export CSV
  const handleExportCSV = () => {
    try {
      const headers = ["#ID,Name,Description,Points,Status"];
      const rows = filtered.map((item, idx) => {
        const id = item.liveId || idx + 1;
        const name = `"${(item.name || "").replace(/"/g, '""')}" `;
        const desc = `"${(item.description || "").replace(/"/g, '""')}" `;
        const pts = `"${(item.points || "").replace(/"/g, '""')}" `;
        const st = `"${item.status || "Active"}" `;
        return [id, name, desc, pts, st].join(",");
      });

      const csvContent =
        "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `personality_tab_results_${Date.now()}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV failed:", err);
    }
  };

  const handleExportExcel = () => {
    handleExportCSV();
  };

  const handleExportPDF = () => {
    const printWin = window.open("", "_blank", "width=1000,height=800");
    if (!printWin) return;

    const rowsHtml = filtered
      .map(
        (item, idx) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.liveId || idx + 1}</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${item.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.description}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.points}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.status}</td>
        </tr>
      `,
      )
      .join("");

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Personality Tab Results - Counsel India</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #111; }
            h2 { color: #09A64A; margin-bottom: 4px; }
            p { font-size: 13px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
            th { background-color: #09A64A; color: #fff; padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <h2>Counsel India - Personality Tab Results</h2>
          <p>Export Date: ${new Date().toLocaleString()} | Total Records: ${filtered.length}</p>
          <table>
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#ID</th>
                <th style="width: 180px;">Name</th>
                <th>Description</th>
                <th style="width: 80px; text-align: center;">Points</th>
                <th style="width: 90px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handlePrint = () => {
    handleExportPDF();
  };

  return (
    <div className="flex flex-col gap-5 w-full pt-1">
      {/* Top Header matching Counsellors & Alumni toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0B0F29] tracking-tight">
            Tab Result
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Scoring outcome classifications, psychological archetype thresholds,
            and profiles.
          </p>
        </div>

        {/* Action Buttons in single organized horizontal row */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <Link
            href="/personality-test/tab-result/create"
            className="px-4 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Tab Result</span>
          </Link>

          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            title="Export Excel"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            title="Export PDF"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            title="Print List"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tab results by name, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl pl-9.5 pr-4 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] transition-all"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium px-2">
          Total:{" "}
          <span className="font-bold text-gray-800">
            {filtered.length} Archetypes
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#09A64A] text-white font-semibold text-[13.5px] tracking-wide">
                <th className="py-4.5 px-6 w-20 text-center">#ID</th>
                <th className="py-4.5 px-6 min-w-[200px]">Name</th>
                <th className="py-4.5 px-6 min-w-[340px]">Description</th>
                <th className="py-4.5 px-6 w-24 text-center">Points</th>
                <th className="py-4.5 px-6 w-28 text-center">Status</th>
                <th className="py-4.5 px-6 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-gray-400 font-medium text-sm"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#09A64A]" />
                    Loading tab results...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-gray-400 font-medium text-sm"
                  >
                    No results found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const displayIndex = startIndex + index + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 transition-colors duration-150"
                    >
                      <td className="py-4.5 px-6 text-center font-bold text-gray-500 text-[14px]">
                        {item.liveId || displayIndex}
                      </td>
                      <td className="py-4.5 px-6 font-bold text-gray-900 text-[14.5px]">
                        {item.name}
                      </td>
                      <td className="py-4.5 px-6 text-gray-600 text-[14px] leading-relaxed">
                        {item.description}
                      </td>
                      <td className="py-4.5 px-6 text-center text-gray-700 font-bold text-[14px]">
                        {item.points || "1"}
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                            item.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200",
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/personality-test/tab-result/${item.id}/edit`}
                            title="Edit Result"
                            className="w-9 h-9 rounded-xl bg-emerald-50 text-[#09A64A] hover:bg-[#09A64A] hover:text-white transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Delete Result"
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
              <span className="font-bold text-gray-900">
                {totalItems > 0 ? startIndex + 1 : 0}
              </span>{" "}
              to <span className="font-bold text-gray-900">{endIndex}</span> of{" "}
              <span className="font-bold text-gray-900">{totalItems}</span>{" "}
              entries
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
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
