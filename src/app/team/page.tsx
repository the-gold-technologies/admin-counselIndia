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
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

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

function TeamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [members, setMembers] = useState<AboutMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
        !q || item.name.toLowerCase().includes(q) || item.designation.toLowerCase().includes(q);
      return matchTab && matchStatus && matchSearch;
    });
  }, [members, activeTab, statusFilter, search]);

  const openAddModal = (defaultCategory?: "core" | "advisor" | "consultant") => {
    setFormError(null);
    setFormData({
      ...emptyForm,
      category: defaultCategory || (activeTab !== "all" ? (activeTab as any) : "advisor"),
      order: members.length + 1,
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Core Team
          </span>
        );
      case "advisor":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Advisor
          </span>
        );
      case "consultant":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Consultant
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team &amp; Advisors</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage Core Team members, Advisors, and Consultants displayed on the website About Us
            page.
          </p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="inline-flex items-center gap-2 bg-[#09A64A] hover:bg-[#07883b] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Filter Tabs / Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleTabChange("all")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-[#09A64A]/5 border-[#09A64A] ring-1 ring-[#09A64A]"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              All Members
            </span>
            <Users
              className={`w-4 h-4 ${activeTab === "all" ? "text-[#09A64A]" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.all}</div>
        </button>

        <button
          onClick={() => handleTabChange("core")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeTab === "core"
              ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Core Team
            </span>
            <UserCheck
              className={`w-4 h-4 ${activeTab === "core" ? "text-blue-600" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.core}</div>
        </button>

        <button
          onClick={() => handleTabChange("advisor")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeTab === "advisor"
              ? "bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Advisors
            </span>
            <Award
              className={`w-4 h-4 ${activeTab === "advisor" ? "text-emerald-600" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.advisor}</div>
        </button>

        <button
          onClick={() => handleTabChange("consultant")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeTab === "consultant"
              ? "bg-purple-50/70 border-purple-500 ring-1 ring-purple-500"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Consultants
            </span>
            <Briefcase
              className={`w-4 h-4 ${activeTab === "consultant" ? "text-purple-600" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.consultant}</div>
        </button>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="relative sm:w-48">
            <select
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value)}
              aria-label="Filter by Category"
              className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A] cursor-pointer"
            >
              <option value="all">All Categories ({counts.all})</option>
              <option value="core">Core Team ({counts.core})</option>
              <option value="advisor">Advisors ({counts.advisor})</option>
              <option value="consultant">Consultants ({counts.consultant})</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Hidden Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 shrink-0 self-end md:self-center">
          Showing <span className="font-semibold text-gray-700">{filteredMembers.length}</span>{" "}
          member
          {filteredMembers.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Member Cards / Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#09A64A] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading team members...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No members found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {search
              ? "No member matching your search query. Try searching with a different keyword."
              : "No members have been added to this category yet."}
          </p>
          <button
            onClick={() => openAddModal()}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#09A64A] hover:underline cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add your first member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between ${
                item.isActive ? "border-gray-200" : "border-gray-200 bg-gray-50/60 opacity-80"
              }`}
            >
              <div>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                        onError={(e) => {
                          // Fallback to placeholder on image load failure
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#09A64A]/10 text-[#09A64A] flex items-center justify-center font-bold text-lg border border-[#09A64A]/20">
                        {item.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}
                    <span
                      title={item.isActive ? "Active on website" : "Hidden from website"}
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        item.isActive ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getCategoryBadge(item.category)}
                      <span className="text-xs text-gray-400">Order #{item.order}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.designation}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => toggleStatus(item)}
                  className={`inline-flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                    item.isActive
                      ? "text-gray-500 hover:text-gray-700"
                      : "text-amber-600 hover:text-amber-700"
                  }`}
                >
                  {item.isActive ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hidden
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    title="Edit Member"
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    title="Delete Member"
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {formData.id ? "Edit Team Member" : "Add Team Member"}
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Fill in member information to show in the Core Team, Advisors, or Consultants section.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category / Section *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      formData.category === "core"
                        ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
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
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      formData.category === "advisor"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500"
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
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      formData.category === "consultant"
                        ? "bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prem sir / Dr. Nitin Dev Purohit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strategic Advisor / Legal Consultant / Marketing Manager"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                />
              </div>

              {/* Photo Upload */}
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
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

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#09A64A] hover:bg-[#07883b] text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Delete Member?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to remove{" "}
              <strong className="text-gray-800">{deleteTarget.name}</strong>? This action will
              remove the member from the website.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Deleting...
                  </>
                ) : (
                  "Delete"
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
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#09A64A] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading...</p>
        </div>
      }
    >
      <TeamContent />
    </Suspense>
  );
}
