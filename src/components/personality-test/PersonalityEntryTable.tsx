"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PersonalityEntryItem {
  id: string;
  sNo: number;
  liveId?: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  age: string;
  proBackground: string;
  purposeGiveTest: string;
  state: string;
  date: string;
  result: string;
  hereFrom: string;
}

export default function PersonalityEntryTable() {
  const [entries, setEntries] = useState<PersonalityEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEntry, setSelectedEntry] =
    useState<PersonalityEntryItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
      });
      const res = await fetch(`/api/personality-test/entries?${q.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data);
        setTotal(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (e) {
      console.error("Failed to load personality entries:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleExportCSV = () => {
    const headers = [
      "#Id",
      "Name",
      "Email",
      "Mobile",
      "Gender",
      "Age",
      "Pro Background",
      "Purpose Give Test",
      "State",
      "Date",
      "Result",
      "Here From",
    ];

    const rows = entries.map((e) => [
      e.liveId || e.sNo,
      `"${e.name.replace(/"/g, '""')}"`,
      e.email,
      e.mobile,
      e.gender,
      e.age,
      `"${e.proBackground.replace(/"/g, '""')}"`,
      `"${e.purposeGiveTest.replace(/"/g, '""')}"`,
      `"${e.state.replace(/"/g, '""')}"`,
      `"${e.date}"`,
      e.result,
      `"${e.hereFrom}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `counselindia_personality_entries_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Export Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or mobile..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 outline-none"
            >
              <option value="15">15 rows</option>
              <option value="25">25 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-[#111827] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-3.5 w-16 text-center">#Id</th>
                <th className="py-3.5 px-3.5 w-44">Name</th>
                <th className="py-3.5 px-3.5 w-48">Email</th>
                <th className="py-3.5 px-3.5 w-32">Mobile</th>
                <th className="py-3.5 px-3 w-20 text-center">Gender</th>
                <th className="py-3.5 px-3 w-16 text-center">Age</th>
                <th className="py-3.5 px-3.5 w-48">Pro Background</th>
                <th className="py-3.5 px-3.5 w-56">Purpose Give Test</th>
                <th className="py-3.5 px-3 w-28 text-center">Date</th>
                <th className="py-3.5 px-3 w-20 text-center">Result</th>
                <th className="py-3.5 px-3 w-28 text-center">Here From</th>
                <th className="py-3.5 px-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td
                    colSpan={12}
                    className="py-12 text-center text-gray-400 font-medium"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#09A64A]" />
                    Loading personality test entries...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="py-12 text-center text-gray-400 font-medium"
                  >
                    No entries found matching your search.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-3.5 text-center font-bold text-gray-400">
                      {entry.liveId || entry.sNo}
                    </td>
                    <td className="py-3.5 px-3.5 font-bold text-gray-900">
                      {entry.name}
                    </td>
                    <td
                      className="py-3.5 px-3.5 text-gray-600 truncate max-w-[180px]"
                      title={entry.email}
                    >
                      {entry.email}
                    </td>
                    <td className="py-3.5 px-3.5 font-medium text-gray-700">
                      {entry.mobile}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                          entry.gender === "Female"
                            ? "bg-pink-50 text-pink-700 border border-pink-200"
                            : entry.gender === "Male"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-50 text-gray-600",
                        )}
                      >
                        {entry.gender || "-"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-gray-600 font-bold">
                      {entry.age || "-"}
                    </td>
                    <td
                      className="py-3.5 px-3.5 text-gray-600 truncate max-w-[180px]"
                      title={entry.proBackground}
                    >
                      {entry.proBackground || "-"}
                    </td>
                    <td
                      className="py-3.5 px-3.5 text-gray-600 truncate max-w-[200px]"
                      title={entry.purposeGiveTest}
                    >
                      {entry.purposeGiveTest || "-"}
                    </td>
                    <td className="py-3.5 px-3 text-center text-[11px] text-gray-500 font-medium whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {entry.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-gray-600 font-medium">
                      {entry.hereFrom || "-"}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        title="View Details"
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-[#09A64A] hover:bg-[#09A64A] hover:text-white transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 bg-[#fafafa]">
          <span className="text-xs text-gray-500 font-medium">
            Showing{" "}
            <span className="font-bold text-gray-800">
              {entries.length ? (page - 1) * limit + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-gray-800">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-bold text-gray-800">{total}</span> entries
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-700 px-3">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#09A64A] flex items-center justify-center">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {selectedEntry.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Entry ID: #{selectedEntry.liveId || selectedEntry.sNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase">
                    Email
                  </span>
                  <p className="font-semibold text-gray-800 break-all mt-0.5">
                    {selectedEntry.email}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase">
                    Mobile
                  </span>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {selectedEntry.mobile}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase">
                    Gender
                  </span>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {selectedEntry.gender || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase">
                    Age
                  </span>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {selectedEntry.age || "Not specified"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">
                  Professional Background
                </span>
                <p className="font-medium text-gray-800 p-2.5 bg-gray-50 rounded-xl mt-1 border border-gray-100">
                  {selectedEntry.proBackground || "-"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">
                  Purpose of Giving Test
                </span>
                <p className="font-medium text-gray-800 p-2.5 bg-gray-50 rounded-xl mt-1 border border-gray-100">
                  {selectedEntry.purposeGiveTest || "-"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Date
                  </span>
                  <p className="font-semibold text-gray-700 text-[11px] mt-0.5">
                    {selectedEntry.date}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Result Score
                  </span>
                  <p className="font-bold text-emerald-700 text-[11px] mt-0.5">
                    {selectedEntry.result}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Source
                  </span>
                  <p className="font-semibold text-gray-700 text-[11px] mt-0.5">
                    {selectedEntry.hereFrom || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
