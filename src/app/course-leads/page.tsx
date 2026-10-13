"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  TrendingUp,
  Inbox,
  PhoneCall,
  UserCheck,
  Search,
  Plus,
  Download,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import CourseLeadTable from "@/components/course-leads/CourseLeadTable";
import CourseLeadEditModal from "@/components/course-leads/CourseLeadEditModal";
import AddCourseLeadModal from "@/components/course-leads/AddCourseLeadModal";
import CreateBookingModal from "@/components/course-leads/CreateBookingModal";
import { generateCourseLeadsPdf } from "@/lib/generateCourseLeadsPdf";
import { CourseLeadItem } from "@/types/courseLead";

function CourseLeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStatus = searchParams.get("status")?.toLowerCase() || "all";
  const [activeTab, setActiveTab] = useState<string>(initialStatus);

  const [leads, setLeads] = useState<CourseLeadItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({
    all: 0,
    new: 0,
    contacted: 0,
    enrolled: 0,
    completed: 0,
  });
  const [coursesList, setCoursesList] = useState<string[]>([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CourseLeadItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLead, setBookingLead] = useState<CourseLeadItem | null>(null);

  // Delete State
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  // Fetch Course Leads
  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeTab && activeTab !== "all") params.set("status", activeTab);
      if (search.trim()) params.set("search", search.trim());
      if (selectedCourse && selectedCourse !== "all") params.set("course", selectedCourse);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("page", String(currentPage));
      params.set("limit", String(pageSize));

      const res = await fetch(`/api/course-leads?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLeads(data.data || []);
        setTotalCount(data.pagination?.total || 0);
        if (data.counts) setCounts(data.counts);
        if (data.courses) setCoursesList(data.courses);
      }
    } catch (error) {
      console.error("Failed to load course leads:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, search, selectedCourse, startDate, endDate, currentPage, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle Tab Switch
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("status");
    } else {
      params.set("status", tab);
    }
    router.replace(`/course-leads?${params.toString()}`);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setSelectedCourse("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Edit Handlers
  const handleEdit = (lead: CourseLeadItem) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedFields: Partial<CourseLeadItem>) => {
    if (!editingLead) return;
    try {
      const res = await fetch(`/api/course-leads/${editingLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
        setIsEditModalOpen(false);
        setEditingLead(null);
      }
    } catch (error) {
      console.error("Failed to update course lead:", error);
    }
  };

  // Booking Handlers
  const handleOpenBooking = (lead: CourseLeadItem) => {
    setBookingLead(lead);
    setIsBookingModalOpen(true);
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    try {
      const res = await fetch(`/api/course-leads/${leadToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
        setLeadToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete course lead:", error);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({ all: "true" });
      if (activeTab && activeTab !== "all") params.set("status", activeTab);
      if (search.trim()) params.set("search", search.trim());
      if (selectedCourse && selectedCourse !== "all") params.set("course", selectedCourse);

      const res = await fetch(`/api/course-leads?${params.toString()}`);
      const json = await res.json();
      const exportList: CourseLeadItem[] = json.success ? json.data : leads;

      const headers = [
        "S.No",
        "Name",
        "Email",
        "Mobile",
        "Course Name",
        "RM Details",
        "CSM Details",
        "Status",
        "Source",
        "Added On",
      ].join(",");

      const rows = exportList.map((l, i) => {
        return [
          l.sNo || i + 1,
          `"${(l.name || "").replace(/"/g, '""')}"`,
          `"${l.email || ""}"`,
          `"${l.mobile || ""}"`,
          `"${(l.courseName || "").replace(/"/g, '""')}"`,
          `"${(l.relationshipManager || "").replace(/"/g, '""')}"`,
          `"${(l.customerSuccessManager || "").replace(/"/g, '""')}"`,
          `"${l.status || "New"}"`,
          `"${(l.source || "").replace(/"/g, '""')}"`,
          `"${l.addedOn || ""}"`,
        ].join(",");
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `counselindia_course_leads_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV failed:", err);
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    await handleExportCSV();
  };

  // Export PDF
  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams({ all: "true" });
      if (activeTab && activeTab !== "all") params.set("status", activeTab);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/course-leads?${params.toString()}`);
      const json = await res.json();
      const exportList: CourseLeadItem[] = json.success ? json.data : leads;
      generateCourseLeadsPdf(exportList);
    } catch (err) {
      console.error("Export PDF failed:", err);
    }
  };

  // Print Handler matching Counsellors & Alumni print layout
  const handlePrint = async () => {
    try {
      setPrinting(true);
      const params = new URLSearchParams({ all: "true" });
      if (activeTab && activeTab !== "all") params.set("status", activeTab);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/course-leads?${params.toString()}`);
      const json = await res.json();
      const exportList: CourseLeadItem[] = json.success ? json.data : leads;

      if (exportList.length === 0) {
        alert("No course leads to print for this selection.");
        return;
      }

      const printWin = window.open("", "_blank", "width=1000,height=800");
      if (!printWin) return;

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
          const details =
            `Name:${escapeHtml(item.name)} ` +
            `Email:${escapeHtml(item.email)} ` +
            `Mobile:${escapeHtml(item.mobile)} ` +
            `Course:${escapeHtml(item.courseName)} ` +
            `RM:${escapeHtml(item.relationshipManager || "-")} ` +
            `CSM:${escapeHtml(item.customerSuccessManager || "-")} ` +
            `Status:${escapeHtml(item.status || "New")} ` +
            `Added On:${escapeHtml(item.addedOn || "-")}`;

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
            <h1>Exported data - Course Leads</h1>
            <div class="meta">
              Total: <strong>${exportList.length}</strong> records
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
      {/* Top Header matching Counsellors & Alumni layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#09A64A]">
              Content Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Course Leads Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage course enquiries, brochure downloads, assignments, and conversion to admissions
          </p>
        </div>

        {/* Action Buttons: Add Lead + Export buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
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

      {/* Metric Cards matching Counsellors/Alumni styling - All First */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* All Leads (First) */}
        <div
          onClick={() => handleTabChange("all")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "all"
              ? "bg-white border-[#09A64A] ring-2 ring-[#09A64A]/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              All Leads
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{counts.all}</span>
            <span className="text-[11px] text-[#09A64A] font-semibold mt-0.5 block">
              Complete Directory
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#09A64A] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* New Leads */}
        <div
          onClick={() => handleTabChange("new")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "new"
              ? "bg-white border-[#09A64A] ring-2 ring-[#09A64A]/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              New Leads
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{counts.new}</span>
            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
              Awaiting Follow-up
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Contacted */}
        <div
          onClick={() => handleTabChange("contacted")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "contacted"
              ? "bg-white border-[#09A64A] ring-2 ring-[#09A64A]/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Contacted Leads
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{counts.contacted}</span>
            <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
              In Communication
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>

        {/* Enrolled */}
        <div
          onClick={() => handleTabChange("enrolled")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "enrolled"
              ? "bg-white border-[#09A64A] ring-2 ring-[#09A64A]/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Enrolled Leads
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{counts.enrolled}</span>
            <span className="text-[11px] text-[#09A64A] font-semibold mt-0.5 block">
              Converted Admissions
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#09A64A] flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Course Dropdown */}
        <div className="w-full sm:w-72">
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] cursor-pointer transition-colors"
          >
            <option value="all">All Courses ({coursesList.length})</option>
            {coursesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Search Box + Refresh */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 sm:max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by student name, email, mobile..."
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] transition-all placeholder:text-gray-400 bg-[#f8fafc]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={fetchLeads}
            title="Refresh List"
            className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs hover:border-[#09A64A] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#09A64A]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <CourseLeadTable
        leads={leads}
        totalItems={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onDelete={(id) => setLeadToDelete(id)}
      />

      {/* Delete Confirmation Pop-up Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Course Lead?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
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

export default function CourseLeadsPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-gray-400">Loading Course Leads...</div>}
    >
      <CourseLeadsContent />
    </Suspense>
  );
}
