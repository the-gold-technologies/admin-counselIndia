"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  Award,
  Briefcase,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { generateTeamPdf } from "@/lib/generateTeamPdf";

export interface AboutMemberItem {
  id: string;
  name: string;
  designation: string;
  image?: string | null;
  category: "core" | "advisor" | "consultant";
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MemberFormData {
  id?: string;
  name: string;
  designation: string;
  image: string;
  category: "core" | "advisor" | "consultant";
  order: number;
  isActive: boolean;
}

const emptyForm: MemberFormData = {
  name: "",
  designation: "",
  image: "",
  category: "advisor",
  order: 1,
  isActive: true,
};

function MemberAvatar({
  image,
  name,
  category,
}: {
  image?: string | null;
  name: string;
  category: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initials = (name || "M")
    .replace(/^Dr\.\s*|^Mr\.\s*|^Ms\.\s*|^Mrs\.\s*/i, "")
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
        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-[#09A64A]/30 transition-all shrink-0 shadow-xs"
        loading="lazy"
      />
    );
  }

  const categoryBg =
    category === "core"
      ? "bg-blue-50 text-blue-600 border-blue-200"
      : category === "advisor"
        ? "bg-emerald-50 text-[#09A64A] border-emerald-200"
        : "bg-purple-50 text-purple-600 border-purple-200";

  return (
    <div
      className={`w-16 h-16 rounded-2xl ${categoryBg} border flex items-center justify-center font-bold text-lg shrink-0 shadow-xs ring-2 ring-white`}
    >
      {initials || "M"}
    </div>
  );
}

function TeamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [members, setMembers] = useState<AboutMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [printing, setPrinting] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AboutMemberItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["all", "core", "advisor", "consultant"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/team?tab=${tab}`);
  };

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMembers(json.data);
      }
    } catch (err) {
      console.error("Failed to load team members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: members.length,
      core: members.filter((m) => m.category === "core").length,
      advisor: members.filter((m) => m.category === "advisor").length,
      consultant: members.filter((m) => m.category === "consultant").length,
    };
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((item) => {
      const matchTab = activeTab === "all" || item.category === activeTab;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.designation.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchTab && matchStatus && matchSearch;
    });
  }, [members, activeTab, statusFilter, search]);

  const openAddModal = (defaultCategory?: "core" | "advisor" | "consultant") => {
    setFormError(null);
    const chosenCategory =
      defaultCategory || (activeTab !== "all" ? (activeTab as any) : "advisor");
    const categoryMembers = members.filter((m) => m.category === chosenCategory);
    setFormData({
      ...emptyForm,
      category: chosenCategory,
      order: categoryMembers.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: AboutMemberItem) => {
    setFormError(null);
    setFormData({
      id: item.id,
      name: item.name,
      designation: item.designation,
      image: item.image || "",
      category: item.category,
      order: item.order,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!formData.designation.trim()) {
      setFormError("Designation is required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const isEditing = Boolean(formData.id);
      const url = isEditing ? `/api/team/${formData.id}` : "/api/team";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save member");
      }

      setModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/team/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete");
      }
      setDeleteTarget(null);
      fetchMembers();
    } catch (err: any) {
      alert(err?.message || "Failed to delete member");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (item: AboutMemberItem) => {
    try {
      await fetch(`/api/team/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchMembers();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "core":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <UserCheck className="w-3 h-3 text-blue-600" />
            Core Team
          </span>
        );
      case "advisor":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#09A64A] border border-emerald-200">
            <Award className="w-3 h-3 text-[#09A64A]" />
            Advisor
          </span>
        );
      case "consultant":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Briefcase className="w-3 h-3 text-purple-600" />
            Consultant
          </span>
        );
      default:
        return null;
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredMembers.length === 0) return;

    const headers = ["S.No", "Name", "Designation", "Category", "Display Order", "Status"].join(
      ","
    );
    const rows = filteredMembers.map((m, i) => {
      const catLabel =
        m.category === "core" ? "Core Team" : m.category === "advisor" ? "Advisor" : "Consultant";
      return [
        i + 1,
        `"${m.name.replace(/"/g, '""')}"`,
        `"${m.designation.replace(/"/g, '""')}"`,
        `"${catLabel}"`,
        m.order,
        `"${m.isActive ? "Active" : "Hidden"}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `counselindia_team_advisors_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const handleExportPDF = () => {
    if (filteredMembers.length === 0) return;
    const filterLabels: Record<string, string> = {
      all: "All Members",
      core: "Core Team",
      advisor: "Advisors",
      consultant: "Consultants",
    };
    generateTeamPdf(filteredMembers, filterLabels[activeTab] || "All Members");
  };

  // Print Window
  const handlePrint = () => {
    if (filteredMembers.length === 0) return;
    setPrinting(true);

    try {
      const printWin = window.open("", "_blank", "width=1000,height=800");
      if (!printWin) return;

      const filterLabels: Record<string, string> = {
        all: "All Members",
        core: "Core Team",
        advisor: "Advisors",
        consultant: "Consultants",
      };

      const escapeHtml = (str?: string | null) => {
        if (!str) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      const rowsHtml = filteredMembers
        .map((item, idx) => {
          const sNo = idx + 1;
          const cat =
            item.category === "core"
              ? "Core Team"
              : item.category === "advisor"
                ? "Advisor"
                : "Consultant";
          const statusText = item.isActive ? "Active" : "Hidden";
          const details =
            `Name:${escapeHtml(item.name)} ` +
            `Designation:${escapeHtml(item.designation)} ` +
            `Category:${escapeHtml(cat)} ` +
            `Order:${item.order} ` +
            `Status:${statusText}`;
          return `<tr><td style="text-align: center; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #4b5563; vertical-align: top;">${sNo}</td><td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #1f2937; vertical-align: top;">${details}</td></tr>`;
        })
        .join("");

      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Team & Advisors - Exported data</title>
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
                Filter: <strong>${filterLabels[activeTab] || "All Members"}</strong> &bull; Total: <strong>${filteredMembers.length}</strong> records
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
    <div className="space-y-7 pb-12 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#09A64A]">
              Team &amp; Leadership Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Team &amp; Advisors</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage Core Team members, Advisors, and Consultants displayed on the website About Us
            page.
          </p>
        </div>

        {/* Action Buttons matching other admin pages */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openAddModal()}
            className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Member</span>
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

          <button
            onClick={fetchMembers}
            title="Refresh Table"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards matching Alumni & Counsellors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* All Members */}
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
              All Members
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{counts.all}</span>
            <span className="text-[11px] text-[#09A64A] font-semibold mt-0.5 block">
              Complete Directory
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#09A64A] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Core Team */}
        <div
          onClick={() => handleTabChange("core")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "core"
              ? "bg-white border-blue-500 ring-2 ring-blue-500/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Core Team
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{counts.core}</span>
            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
              Internal Leadership
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Advisors */}
        <div
          onClick={() => handleTabChange("advisor")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "advisor"
              ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Advisors
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{counts.advisor}</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              Advisory Board
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Consultants */}
        <div
          onClick={() => handleTabChange("consultant")}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === "consultant"
              ? "bg-white border-purple-500 ring-2 ring-purple-500/20"
              : "bg-white border-gray-200/80 hover:border-gray-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Consultants
            </span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">
              {counts.consultant}
            </span>
            <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
              Legal &amp; Experts
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters and Controls Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
          {[
            { id: "all", label: `All (${counts.all})` },
            { id: "core", label: `Core Team (${counts.core})` },
            { id: "advisor", label: `Advisors (${counts.advisor})` },
            { id: "consultant", label: `Consultants (${counts.consultant})` },
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

        {/* Status Dropdown & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="appearance-none pl-3.5 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Hidden Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member by name or role..."
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs font-medium text-gray-500 whitespace-nowrap pl-1">
            Total: <strong className="text-gray-900">{filteredMembers.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Content Area: High-End Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Loading team members...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center shadow-xs">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No members found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {search
              ? "No member matches your current search criteria. Try a different keyword."
              : "No members have been added to this category yet."}
          </p>
          <button
            onClick={() => openAddModal()}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#09A64A] hover:underline cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add your first member
          </button>
        </div>
      ) : (
        /* Cards Grid - Full Width without cramped horizontal margins */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredMembers.map((item) => {
            const isActive = item.isActive;
            const categoryAccent =
              item.category === "core"
                ? "hover:border-blue-300"
                : item.category === "advisor"
                  ? "hover:border-emerald-300"
                  : "hover:border-purple-300";

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs hover:shadow-md flex flex-col justify-between group relative overflow-hidden ${
                  isActive
                    ? `border-gray-200/80 ${categoryAccent}`
                    : "border-gray-200/70 bg-gray-50/50 opacity-85"
                }`}
              >
                {/* Top Category & Order Row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div>{getCategoryBadge(item.category)}</div>
                    <div className="flex items-center gap-1.5">
                      <span
                        title="Display Order"
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200/70"
                      >
                        Order #{item.order}
                      </span>
                    </div>
                  </div>

                  {/* Member Profile Block */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <MemberAvatar image={item.image} name={item.name} category={item.category} />
                      <span
                        title={isActive ? "Active on website" : "Hidden from website"}
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                          isActive ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                    </div>

                    {/* Member Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-[15px] group-hover:text-[#09A64A] transition-colors truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-600 font-medium line-clamp-2 mt-1 leading-snug">
                        {item.designation}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400 font-medium">
                        <span>
                          {item.category === "core"
                            ? "Core Team"
                            : item.category === "advisor"
                              ? "Advisors & Consultants"
                              : "Advisors & Consultants"}
                        </span>
                        {item.createdAt && (
                          <>
                            <span>&bull;</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Status Toggle & Actions */}
                <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                  {/* Status Toggle Button matching other pages */}
                  <button
                    type="button"
                    onClick={() => toggleStatus(item)}
                    title={`Click to ${isActive ? "Hide from website" : "Show on website"}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                      isActive
                        ? "bg-emerald-50 text-[#09A64A] border border-emerald-200 hover:bg-emerald-100"
                        : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Edit and Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      title="Edit Member"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      title="Delete Member"
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#09A64A]">
                {formData.id ? "Update Member" : "New Member"}
              </span>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">
              {formData.id ? "Edit Team Member" : "Add Team Member"}
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Fill in member details to display in the Core Team, Advisors, or Consultants section.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Category / Section *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.category === "core"
                        ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value="core"
                      checked={formData.category === "core"}
                      onChange={() => setFormData({ ...formData, category: "core" })}
                      className="sr-only"
                    />
                    Core Team
                  </label>
                  <label
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.category === "advisor"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value="advisor"
                      checked={formData.category === "advisor"}
                      onChange={() => setFormData({ ...formData, category: "advisor" })}
                      className="sr-only"
                    />
                    Advisor
                  </label>
                  <label
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.category === "consultant"
                        ? "bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-500/20"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value="consultant"
                      checked={formData.category === "consultant"}
                      onChange={() => setFormData({ ...formData, category: "consultant" })}
                      className="sr-only"
                    />
                    Consultant
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Nitin Dev Purohit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strategic Advisor / Legal Consultant / Marketing Manager"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
                />
              </div>

              {/* Profile Photo */}
              <div>
                <ImageUploadField
                  label="Profile Photo"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-medium border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#09A64A] focus:ring-[#09A64A] border-gray-300 cursor-pointer"
                    />
                    <span>Active on Website</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#09A64A] hover:bg-[#089341] text-white rounded-xl text-xs font-bold shadow-md shadow-[#09A64A]/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Save Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900">Delete Member?</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-gray-800">{deleteTarget.name}</strong>? This action will
              permanently remove the member from the website.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  "Delete Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-3 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-gray-500">Loading Team &amp; Advisors...</p>
        </div>
      }
    >
      <TeamContent />
    </Suspense>
  );
}
