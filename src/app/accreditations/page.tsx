"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Award,
  GraduationCap,
  Globe,
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { CustomSelect } from "@/components/ui/CustomSelect";

export interface AccreditationItem {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  logo?: string | null;
  link?: string | null;
  category: "ugc_university" | "association" | "accreditation" | "international";
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  logo: string;
  link: string;
  category: "ugc_university" | "association" | "accreditation" | "international";
  order: number;
  isActive: boolean;
}

const emptyForm: FormData = {
  title: "",
  subtitle: "",
  description: "",
  logo: "",
  link: "",
  category: "ugc_university",
  order: 1,
  isActive: true,
};

function AccreditationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [items, setItems] = useState<AccreditationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<AccreditationItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["all", "ugc_university", "international", "association", "accreditation"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/accreditations?tab=${tab}`);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accreditations");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Failed to load accreditations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      ugc_university: items.filter((i) => i.category === "ugc_university").length,
      international: items.filter((i) => i.category === "international").length,
      association: items.filter(
        (i) => i.category === "association" || i.category === "accreditation"
      ).length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchTab = activeTab === "all" || item.category === activeTab;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchTab && matchStatus && matchSearch;
    });
  }, [items, activeTab, statusFilter, search]);

  const openAddModal = () => {
    setFormError(null);
    setFormData({
      ...emptyForm,
      category: activeTab !== "all" ? (activeTab as any) : "ugc_university",
      order: items.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: AccreditationItem) => {
    setFormError(null);
    setFormData({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || "",
      description: item.description || "",
      logo: item.logo || "",
      link: item.link || "",
      category: item.category,
      order: item.order,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Title / Institution name is required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const isEditing = Boolean(formData.id);
      const url = isEditing ? `/api/accreditations/${formData.id}` : "/api/accreditations";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save");
      }

      setModalOpen(false);
      fetchItems();
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
      const res = await fetch(`/api/accreditations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete");
      }
      setDeleteTarget(null);
      fetchItems();
    } catch (err: any) {
      alert(err?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (item: AccreditationItem) => {
    try {
      await fetch(`/api/accreditations/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchItems();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "ugc_university":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            UGC Approved University
          </span>
        );
      case "international":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            International Body
          </span>
        );
      case "association":
      case "accreditation":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Association
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-7 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#09A64A]">
              Accreditations &amp; Associations Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Accreditations, Associations &amp; UGC Universities
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage UGC approved universities, international associations, and accreditations
            displayed on the website.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Institution</span>
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
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">All</span>
            <Award
              className={`w-4 h-4 ${activeTab === "all" ? "text-[#09A64A]" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.all}</div>
        </button>

        <button
          onClick={() => handleTabChange("ugc_university")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeTab === "ugc_university"
              ? "bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              UGC Universities
            </span>
            <GraduationCap
              className={`w-4 h-4 ${activeTab === "ugc_university" ? "text-emerald-600" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.ugc_university}</div>
        </button>

        <button
          onClick={() => handleTabChange("international")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeTab === "international"
              ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              International
            </span>
            <Globe
              className={`w-4 h-4 ${activeTab === "international" ? "text-blue-600" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.international}</div>
        </button>

        <button
          onClick={() => handleTabChange("association")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            activeTab === "association"
              ? "bg-purple-50/70 border-purple-500 ring-1 ring-purple-500"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Associations
            </span>
            <Building2
              className={`w-4 h-4 ${activeTab === "association" ? "text-purple-600" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.association}</div>
        </button>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by institution name, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
            />
          </div>

          {/* Category Dropdown */}
          <CustomSelect
            value={activeTab}
            onChange={(val) => handleTabChange(val)}
            className="w-full sm:w-64"
            ariaLabel="Filter by Category"
            options={[
              { value: "all", label: "All Categories", count: counts.all },
              {
                value: "ugc_university",
                label: "UGC Approved Universities",
                count: counts.ugc_university,
              },
              {
                value: "international",
                label: "International",
                count: counts.international,
              },
              {
                value: "association",
                label: "Associations",
                count: counts.association,
              },
            ]}
          />

          {/* Status Dropdown */}
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            className="w-full sm:w-44"
            ariaLabel="Filter by Status"
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active Only" },
              { value: "inactive", label: "Hidden Only" },
            ]}
          />
        </div>

        <div className="text-xs text-gray-500 shrink-0 self-end md:self-center">
          Showing <span className="font-semibold text-gray-700">{filteredItems.length}</span> item
          {filteredItems.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#09A64A] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading accreditations...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No institutions found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {search
              ? "No item matching your search keyword."
              : "No institutions added in this category yet."}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#09A64A] hover:underline cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add UGC University / Association
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                item.isActive ? "border-gray-200" : "border-gray-200 bg-gray-50/60 opacity-80"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150";
                        }}
                      />
                    ) : (
                      <Award className="w-7 h-7 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getCategoryBadge(item.category)}
                    <span className="text-xs text-gray-400">Order #{item.order}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 text-base">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-xs font-medium text-emerald-700 mt-0.5">{item.subtitle}</p>
                )}
                {item.description && (
                  <p className="text-xs text-gray-500 line-clamp-3 mt-2">{item.description}</p>
                )}

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#09A64A] hover:underline mt-3"
                  >
                    <span>Visit Official Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
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
                    title="Edit"
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    title="Delete"
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
              {formData.id ? "Edit Institution" : "Add Institution / University"}
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Add UGC Approved University, International Partner, or Association details.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                <CustomSelect
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val as any })}
                  className="w-full"
                  options={[
                    { value: "ugc_university", label: "UGC Approved University" },
                    { value: "international", label: "International Body / Partner" },
                    { value: "association", label: "Association / Accreditation" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chandigarh University / EIMT"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subtitle / Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. UGC Approved • NAAC A+ University"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of recognition, partnership, or accreditation..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Website Link
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Institution Logo"
                  value={formData.logo}
                  onChange={(url) => setFormData({ ...formData, logo: url })}
                />
              </div>

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

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
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
                      <Check className="w-3.5 h-3.5" /> Save Institution
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Delete Institution?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to remove{" "}
              <strong className="text-gray-800">{deleteTarget.title}</strong>?
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

export default function AccreditationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#09A64A] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading...</p>
        </div>
      }
    >
      <AccreditationsContent />
    </Suspense>
  );
}
