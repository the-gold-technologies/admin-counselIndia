"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
    BookOpen,
  Search,
  Plus,
  Download,
  Printer,
  RefreshCw,
  FileText,
} from "lucide-react";
import AlumniTable, { AlumniItem } from "@/components/alumni/AlumniTable";
import { generateAlumniPdf } from "@/lib/generateAlumniPdf";

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<AlumniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAlumni = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "All") params.set("status", statusFilter);

      const res = await fetch(`/api/alumni?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAlumni(json.data);
      }
    } catch (err) {
      console.error("Failed to load alumni:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  // Status toggle handler
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`/api/alumni/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setAlumni((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: nextStatus } : item
          )
        );
      }
    } catch (e) {
      console.error("Failed to toggle status:", e);
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this alumni record?")) return;
    try {
      const res = await fetch(`/api/alumni/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setAlumni((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete alumni:", e);
    }
  };

  // Print handler matching live Counsel India "Exported data" 1:1
  const handlePrint = () => {
    if (alumni.length === 0) return;

    const printWin = window.open("", "_blank", "width=1000,height=800");
    if (!printWin) return;

    const formatPrintDate = (dStr?: string | Date | null) => {
      if (!dStr) return "-";
      try {
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return dStr;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch {
        return dStr;
      }
    };

    const rowsHtml = alumni
      .map((item, idx) => {
        const sNo = item.sNo || idx + 1;
        const addedOn = formatPrintDate(item.createdAt);
        const updatedOn = formatPrintDate(item.updatedAt);
        const details = `Name:${item.name} Email:${item.email} Mobile:${item.mobile} Added On:${addedOn} Updated On:${updatedOn}`;
        return `<tr><td style="text-align: center; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px;">${sNo}</td><td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.5;">${details}</td></tr>`;
      })
      .join("");

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exported data</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px 30px;
              color: #222;
              margin: 0;
            }
            h1 {
              font-size: 26px;
              font-weight: bold;
              margin: 0 0 20px 0;
              color: #111;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e2e8f0;
            }
            th {
              background-color: #fff;
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              font-size: 13px;
              font-weight: bold;
              text-align: left;
            }
            th:first-child {
              text-align: center;
              width: 60px;
            }
            @media print {
              body {
                padding: 10px;
              }
              @page {
                size: A4 portrait;
                margin: 12mm;
              }
            }
          </style>
        </head>
        <body>
          <h1>Exported data</h1>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name & Details</th>
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

  // CSV Export matching live Counsel India format 1:1
  const handleExportCSV = () => {
    if (alumni.length === 0) return;

    const formatCsvDate = (dStr?: string | Date | null) => {
      if (!dStr) return "-";
      try {
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return String(dStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch {
        return String(dStr);
      }
    };

    const headers = [
      '"S.No"',
      '"Name & Details"',
      '"Online Status"',
      '"Status"',
      '"Action"'
    ].join(",");

    const rows = alumni.map((a, i) => {
      const sNo = a.sNo || i + 1;
      const addedOn = formatCsvDate(a.createdAt);
      const updatedOn = formatCsvDate(a.updatedAt);
      const isApproved = a.isApproved ? "Yes" : "No";

      const details = `Name:${a.name}                                                             Email:${a.email}                                                             Mobile:${a.mobile}                                                                                                                          Added On:${addedOn}                                                             Updated On:${updatedOn}                                                             Is Approved:                                                                                                                                     ${isApproved}`;

      return [
        `"${sNo}"`,
        `"${details.replace(/"/g, '""')}"`,
        `"Online:"`,
        `"${a.status}"`,
        `""`
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `counselindia_alumni_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation
  const totalCount = alumni.length;
  const activeCount = alumni.filter((a) => a.status === "Active").length;
  const onlineCount = alumni.filter((a) => a.isOnline).length;
  const uniquePrograms = new Set(alumni.map((a) => a.programName)).size;

  return (
    <div className="space-y-7 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Alumni Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Certified graduates displayed on Counsel India Network directory & verified credential database
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Navigate directly to dedicated /alumni/create page */}
          <Link
            href="/alumni/create"
            className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Alumni</span>
          </Link>

          <button
            onClick={() => generateAlumniPdf(alumni)}
            title="Export PDF"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span>PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            title="Print List"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Alumni */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Total Alumni
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {totalCount}
            </span>
            <span className="text-[11px] text-[#09A64A] font-medium mt-0.5 block">
              Verified Graduates
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#09A64A] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Alumni */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Active Status
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {activeCount}
            </span>
            <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
              Approved Profiles
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Programs */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Programs
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {uniquePrograms}
            </span>
            <span className="text-[11px] text-gray-500 font-medium mt-0.5 block">
              Disciplines & Degrees
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
          {["All", "Active", "Inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, cert #, program..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
            />
          </div>

          <button
            onClick={fetchAlumni}
            title="Refresh Table"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      {loading && alumni.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Loading alumni records...</p>
        </div>
      ) : (
        <AlumniTable
          alumni={alumni}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}
