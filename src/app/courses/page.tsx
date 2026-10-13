"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Layers,
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
import CourseTable from "@/components/courses/CourseTable";
import { generateCoursesPdf } from "@/lib/generateCoursesPdf";
import { Course, CourseStats } from "@/types/course";

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStatus = searchParams.get("status")?.toLowerCase() || "all";
  const [activeTab, setActiveTab] = useState<string>(initialStatus);

  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<CourseStats>({
    total: 0,
    active: 0,
    inactive: 0,
    categoriesCount: 0,
    categories: [],
  });

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  // Delete State
  const [courseToDelete, setCourseToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch Courses
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeTab && activeTab !== "all") params.set("status", activeTab);
      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory && selectedCategory !== "all")
        params.set("category", selectedCategory);
      params.set("page", String(currentPage));
      params.set("limit", String(pageSize));

      const res = await fetch(`/api/courses?${params.toString()}`);
      const data = await res.json();

      if (data.courses) {
        setCourses(data.courses);
        setTotalCount(data.total);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, search, selectedCategory, currentPage, pageSize]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleTabChange = (status: string) => {
    setActiveTab(status);
    setCurrentPage(1);
    const params = new URLSearchParams(window.location.search);
    if (status === "all") params.delete("status");
    else params.set("status", status);
    router.replace(`/courses?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  // Toggle Course Active / Inactive
  const handleToggleStatus = async (course: Course) => {
    try {
      const newStatus =
        (course.status || "").toLowerCase() === "active"
          ? "Inactive"
          : "Active";
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchCourses();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Delete Course
  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      const res = await fetch(`/api/courses/${courseToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCourseToDelete(null);
        fetchCourses();
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({ all: "true" });
      if (activeTab && activeTab !== "all") params.set("status", activeTab);
      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory && selectedCategory !== "all")
        params.set("category", selectedCategory);

      const res = await fetch(`/api/courses?${params.toString()}`);
      const json = await res.json();
      const exportList: Course[] = json.courses || courses;

      const headers = [
        "S.No",
        "Course Name",
        "Category",
        "Position",
        "Status",
        "Duration",
        "Total Fee",
        "Discount Fee",
        "Rating",
        "Added On",
        "Slug",
      ].join(",");

      const rows = exportList.map((c, i) => {
        return [
          c.sNo || i + 1,
          `"${(c.name || "").replace(/"/g, '""')}"`,
          `"${(c.category || "").replace(/"/g, '""')}"`,
          c.position || 1,
          `"${c.status || "Active"}"`,
          `"${c.listDuration || c.duration || ""}"`,
          `"${c.totalProgramFee || ""}"`,
          `"${c.totalDiscountFee || ""}"`,
          c.rating || 5,
          `"${c.addedOn || ""}"`,
          `"${c.slug || ""}"`,
        ].join(",");
      });

      const csvContent =
        "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `counselindia_courses_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV failed:", err);
    }
  };

  const handleExportExcel = async () => {
    await handleExportCSV();
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams({ all: "true" });
      if (activeTab && activeTab !== "all") params.set("status", activeTab);
      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory && selectedCategory !== "all")
        params.set("category", selectedCategory);

      const res = await fetch(`/api/courses?${params.toString()}`);
      const json = await res.json();
      const exportList: Course[] = json.courses || courses;
      generateCoursesPdf(exportList);
    } catch (err) {
      console.error("Export PDF failed:", err);
    }
  };

  // Print Handler
  const handlePrint = async () => {
    try {
      setPrinting(true);
      const params = new URLSearchParams({ all: "true" });
      if (activeTab && activeTab !== "all") params.set("status", activeTab);
      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory && selectedCategory !== "all")
        params.set("category", selectedCategory);

      const res = await fetch(`/api/courses?${params.toString()}`);
      const json = await res.json();
      const exportList: Course[] = json.courses || courses;

      if (exportList.length === 0) {
        alert("No courses to print for this selection.");
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
            `Category:${escapeHtml(item.category || "-")} ` +
            `Duration:${escapeHtml(item.listDuration || item.duration || "-")} ` +
            `Fee:₹${escapeHtml(item.totalDiscountFee || item.totalProgramFee || "-")} ` +
            `Position:${escapeHtml(String(item.position || 1))} ` +
            `Status:${escapeHtml(item.status || "Active")} ` +
            `Added On:${escapeHtml(item.addedOn || "-")}`;

          return `<tr><td style="text-align: center; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #4b5563; vertical-align: top;">${sNo}</td><td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #1f2937; vertical-align: top;">${details}</td></tr>`;
        })
        .join("");

      printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exported data - Courses</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px 30px; color: #222; margin: 0; }
            .header { margin-bottom: 20px; }
            h1 { font-size: 26px; font-weight: bold; margin: 0 0 6px 0; color: #111; }
            .meta { font-size: 13px; color: #666; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; }
            th { background-color: #fff; border: 1px solid #e2e8f0; padding: 10px 12px; font-size: 13px; font-weight: bold; text-align: left; color: #111; }
            th:first-child { text-align: center; width: 60px; }
            @media print { body { padding: 10px; } @page { size: A4 portrait; margin: 12mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Exported data - Courses</h1>
            <div class="meta">Total: <strong>${exportList.length}</strong> records</div>
          </div>
          <table>
            <thead><tr><th>S.No</th><th>Course Name &amp; Details</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>window.onload = function() { window.print(); };</script>
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
            Course Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage academic programs, masterclasses, curriculums, credentials,
            and admissions
          </p>
        </div>

        {/* Action Button: Add Course */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/courses/create"
            className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#078a3d] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards matching Course Leads & Counsellors styling - All First */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* All Courses (First) */}
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
              All Courses
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {stats.total || 43}
            </span>
            <span className="text-[11px] text-[#09A64A] font-semibold mt-0.5 block">
              Complete Directory
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#09A64A] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Active Courses (Second) */}
        <div
          onClick={() => handleTabChange("active")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "active"
              ? "bg-white border-[#09A64A] ring-2 ring-[#09A64A]/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Active Courses
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {stats.active}
            </span>
            <span className="text-[11px] text-[#09A64A] font-semibold mt-0.5 block">
              Live &amp; Enrolling
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#09A64A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Inactive Courses */}
        <div
          onClick={() => handleTabChange("inactive")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "inactive"
              ? "bg-white border-[#09A64A] ring-2 ring-[#09A64A]/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Inactive Courses
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {stats.inactive}
            </span>
            <span className="text-[11px] text-gray-500 font-semibold mt-0.5 block">
              Draft / Archived
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-2xl p-5 border shadow-xs flex items-center justify-between bg-white border-gray-200/80">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Categories
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {stats.categoriesCount || 12}
            </span>
            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
              Diploma, Masters &amp; Certs
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Category Dropdown */}
        <div className="w-full sm:w-72">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] cursor-pointer transition-colors"
          >
            <option value="all">
              All Categories ({stats.categories.length})
            </option>
            {stats.categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
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
              placeholder="Search by course name, category, slug..."
              className="w-full h-11 pl-10 pr-9 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 placeholder-gray-400 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchCourses}
            disabled={isLoading}
            title="Refresh Courses"
            className="w-11 h-11 rounded-xl bg-[#f8fafc] border border-gray-200 hover:border-[#09A64A] hover:bg-white text-gray-600 hover:text-[#09A64A] flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin text-[#09A64A]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Main Course Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#09A64A] mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">
            Loading courses...
          </p>
        </div>
      ) : (
        <CourseTable
          courses={courses}
          totalCourses={totalCount}
          totalItems={totalCount}
          totalPages={Math.ceil(totalCount / pageSize) || 1}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          onToggleStatus={handleToggleStatus}
          onDelete={(id, name) =>
            setCourseToDelete({ id, name: name || "Course" })
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Delete Course
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-gray-800 font-bold">
                "{courseToDelete.name}"
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors"
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

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#09A64A] mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">
            Loading course directory...
          </p>
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
