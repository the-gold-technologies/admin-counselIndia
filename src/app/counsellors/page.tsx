"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Search,
  Plus,
  Download,
  Printer,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import CounsellorTable from "@/components/counsellors/CounsellorTable";
import { generateCounsellorPdf } from "@/lib/generateCounsellorPdf";
import { CounselorItem } from "@/types/counsellor";

function CounsellorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Status param from URL or default to "verified"
  const initialStatus = searchParams.get("status")?.toLowerCase() || "verified";
  const [activeTab, setActiveTab] = useState<string>(initialStatus);

  const [counsellors, setCounsellors] = useState<CounselorItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({
    verified: 74,
    pending: 20,
    inactive: 515,
    all: 609,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [search, setSearch] = useState("");

  // Sync tab with URL
  useEffect(() => {
    const urlStatus = searchParams.get("status")?.toLowerCase();
    if (urlStatus && ["verified", "pending", "inactive", "all"].includes(urlStatus)) {
      setActiveTab(urlStatus);
    }
  }, [searchParams]);

  const handleTabChange = (status: string) => {
    setActiveTab(status);
    setCurrentPage(1);
    router.push(`/counsellors?status=${status}`);
  };

  const fetchCounsellors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: activeTab,
        page: String(currentPage),
        limit: String(pageSize),
      });
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const res = await fetch(`/api/counsellors?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setCounsellors(json.data);
        setTotalCount(json.pagination?.total || json.data.length);
        if (json.counts) {
          setCounts(json.counts);
        }
      }
    } catch (err) {
      console.error("Failed to load counsellors:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, search]);

  useEffect(() => {
    fetchCounsellors();
  }, [fetchCounsellors]);

  // Status toggle handler (Active <-> Inactive)
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`/api/counsellors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setCounsellors((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
        );
        fetchCounsellors();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/counsellors?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setCounsellors((prev) => prev.filter((item) => item.id !== id));
        fetchCounsellors();
      }
    } catch (err) {
      console.error("Failed to delete counsellor:", err);
    }
  };

  // Tab label helper
  const getTabLabel = (tab: string) => {
    const map: Record<string, string> = {
      verified: "Verified Counsellors",
      pending: "Pending Counsellors",
      inactive: "Inactive Counsellors",
      all: "All Counsellors",
    };
    return map[tab] || "Counsellors";
  };

  // Export current active filter to CSV
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({ status: activeTab, all: "true" });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/counsellors?${params.toString()}`);
      const json = await res.json();
      const exportList: CounselorItem[] = json.success ? json.data : counsellors;

      const headers = [
        "S.No",
        "Name",
        "Email",
        "Mobile",
        "Specialty",
        "Designation",
        "City",
        "Education",
        "Experience",
        "Status",
        "Approval",
        "Online",
        "Councell Fees",
        "Added On",
        "Updated On",
      ].join(",");

      const rows = exportList.map((c, i) => {
        return [
          c.sNo || i + 1,
          `"${(c.name || "").replace(/"/g, '""')}"`,
          `"${c.email || ""}"`,
          `"${c.mobile || ""}"`,
          `"${(c.specialty || "").replace(/"/g, '""')}"`,
          `"${(c.designation || "").replace(/"/g, '""')}"`,
          `"${(c.city || "").replace(/"/g, '""')}"`,
          `"${(c.education || "").replace(/"/g, '""')}"`,
          `"${c.experience || ""}"`,
          `"${c.status || "Active"}"`,
          `"${c.isApproved ? "Approved" : "Pending"}"`,
          `"${c.isOnline ? "Online" : "Offline"}"`,
          c.councellFees || 0,
          `"${c.addedOn || ""}"`,
          `"${c.updatedOn || ""}"`,
        ].join(",");
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `counselindia_counsellors_${activeTab}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV failed:", err);
    }
  };

  // Export PDF for the active filter
  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams({ status: activeTab, all: "true" });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/counsellors?${params.toString()}`);
      const json = await res.json();
      const exportList: CounselorItem[] = json.success ? json.data : counsellors;
      generateCounsellorPdf(exportList);
    } catch (err) {
      console.error("Export PDF failed:", err);
    }
  };

  // Print matching live Counsel India "Exported data" layout 1:1 for the selected filter
  const handlePrint = async () => {
    try {
      setPrinting(true);
      const params = new URLSearchParams({ status: activeTab, all: "true" });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/counsellors?${params.toString()}`);
      const json = await res.json();
      const exportList: CounselorItem[] =
        json.success && Array.isArray(json.data) ? json.data : counsellors;

      if (exportList.length === 0) {
        alert("No counsellors to print for this selection.");
        return;
      }

      const printWin = window.open("", "_blank", "width=1000,height=800");
      if (!printWin) return;

      const currentFilterLabel = getTabLabel(activeTab);

      const escapeHtml = (str?: string | null) => {
        if (!str) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      const rowsHtml = exportList
        .map((item, idx) => {
          const sNo = item.sNo || idx + 1;
          const isApprovedText = item.isApproved !== false ? "Yes" : "Pending";
          const specialtyText = item.specialty || item.designation || "-";
          const addedOnText = item.addedOn || "-";
          const updatedOnText = item.updatedOn || "-";
          const statusText = item.status || "Active";

          const details =
            `Name:${escapeHtml(item.name)} ` +
            `Email:${escapeHtml(item.email)} ` +
            `Mobile:${escapeHtml(item.mobile)} ` +
            `Specialty:${escapeHtml(specialtyText)} ` +
            `Added On:${escapeHtml(addedOnText)} ` +
            `Updated On:${escapeHtml(updatedOnText)} ` +
            `Is Approved:${escapeHtml(isApprovedText)} ` +
            `Status:${escapeHtml(statusText)}`;

          return `<tr><td style="text-align: center; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #4b5563; vertical-align: top;">${sNo}</td><td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #1f2937; vertical-align: top;">${details}</td></tr>`;
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
            .header {
              margin-bottom: 20px;
            }
            h1 {
              font-size: 26px;
              font-weight: bold;
              margin: 0 0 6px 0;
              color: #111;
            }
            .meta {
              font-size: 13px;
              color: #666;
              margin-bottom: 16px;
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
              color: #111;
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
          <div class="header">
            <h1>Exported data</h1>
            <div class="meta">
              Filter: <strong>${currentFilterLabel}</strong> &bull; Total: <strong>${exportList.length}</strong> records
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name &amp; Details</th>
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
    } catch (err) {
      console.error("Print failed:", err);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="space-y-7 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#09A64A]">
              Counselor Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Counsellors Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified counsellors, pending applications, and clinical practitioner directory
          </p>
        </div>

        {/* Action Buttons: Navigate to separate /counsellors/create page */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/counsellors/create"
            className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Counsellor</span>
          </Link>

          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Export Excel"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            title="Export PDF"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={printing}
            title="Print List"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {printing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#09A64A]" />
            ) : (
              <Printer className="w-3.5 h-3.5" />
            )}
            <span>{printing ? "Printing..." : "Print"}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards matching Alumni styling */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Verified Counsellors */}
        <div
          onClick={() => handleTabChange("verified")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "verified"
              ? "bg-white border-[#09A64A] ring-2 ring-[#09A64A]/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Verified Counsellors
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {counts.verified}
            </span>
            <span className="text-[11px] text-[#09A64A] font-semibold mt-0.5 block">
              Live &amp; Approved
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#09A64A] flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Counsellors */}
        <div
          onClick={() => handleTabChange("pending")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "pending"
              ? "bg-white border-amber-500 ring-2 ring-amber-500/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Pending Counsellors
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {counts.pending}
            </span>
            <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
              Awaiting Review
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Inactive Counsellors */}
        <div
          onClick={() => handleTabChange("inactive")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "inactive"
              ? "bg-white border-rose-500 ring-2 ring-rose-500/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Inactive Counsellors
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {counts.inactive}
            </span>
            <span className="text-[11px] text-gray-500 font-semibold mt-0.5 block">
              Deactivated Accounts
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        {/* All Counsellors */}
        <div
          onClick={() => handleTabChange("all")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "all"
              ? "bg-white border-blue-500 ring-2 ring-blue-500/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              All Counsellors
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {counts.all}
            </span>
            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
              Complete Directory
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
          {[
            { id: "verified", label: `Verified (${counts.verified})` },
            { id: "pending", label: `Pending (${counts.pending})` },
            { id: "inactive", label: `Inactive (${counts.inactive})` },
            { id: "all", label: `All (${counts.all})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, mobile..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#f8fafc] border border-gray-200 rounded-xl pl-9.5 pr-4 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] transition-all"
            />
          </div>

          <button
            onClick={() => fetchCounsellors()}
            title="Refresh List"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#09A64A]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      {loading && counsellors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-2 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-gray-500">
            Loading {getTabLabel(activeTab)}...
          </p>
        </div>
      ) : (
        <CounsellorTable
          counsellors={counsellors}
          totalItems={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}

export default function CounsellorsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-gray-500">Loading module...</p>
        </div>
      }
    >
      <CounsellorsContent />
    </Suspense>
  );
}
