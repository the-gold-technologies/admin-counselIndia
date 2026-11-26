"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Video,
  Play,
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
  User,
  Clock,
  Radio,
} from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { CustomSelect } from "@/components/ui/CustomSelect";

export interface PodcastItem {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId?: string | null;
  thumbnail?: string | null;
  guest?: string | null;
  host?: string | null;
  duration?: string | null;
  description?: string | null;
  category?: string | null;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  id?: string;
  title: string;
  youtubeUrl: string;
  thumbnail: string;
  guest: string;
  host: string;
  duration: string;
  description: string;
  category: string;
  order: number;
  isActive: boolean;
}

const emptyForm: FormData = {
  title: "",
  youtubeUrl: "",
  thumbnail: "",
  guest: "",
  host: "Counsel India Podcast",
  duration: "",
  description: "",
  category: "Mental Health",
  order: 1,
  isActive: true,
};

function PodcastsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<PodcastItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPodcasts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/podcasts");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPodcasts(json.data);
      }
    } catch (err) {
      console.error("Failed to load podcasts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const counts = useMemo(() => {
    return {
      all: podcasts.length,
      active: podcasts.filter((p) => p.isActive).length,
      inactive: podcasts.filter((p) => !p.isActive).length,
    };
  }, [podcasts]);

  const filteredPodcasts = useMemo(() => {
    return podcasts.filter((item) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.guest && item.guest.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [podcasts, statusFilter, search]);

  const openAddModal = () => {
    setFormError(null);
    setFormData({
      ...emptyForm,
      order: podcasts.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: PodcastItem) => {
    setFormError(null);
    setFormData({
      id: item.id,
      title: item.title,
      youtubeUrl: item.youtubeUrl,
      thumbnail: item.thumbnail || "",
      guest: item.guest || "",
      host: item.host || "Counsel India Podcast",
      duration: item.duration || "",
      description: item.description || "",
      category: item.category || "Mental Health",
      order: item.order,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Podcast title is required.");
      return;
    }
    if (!formData.youtubeUrl.trim()) {
      setFormError("YouTube link is required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const isEditing = Boolean(formData.id);
      const url = isEditing ? `/api/podcasts/${formData.id}` : "/api/podcasts";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save podcast");
      }

      setModalOpen(false);
      fetchPodcasts();
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
      const res = await fetch(`/api/podcasts/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete");
      }
      setDeleteTarget(null);
      fetchPodcasts();
    } catch (err: any) {
      alert(err?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (item: PodcastItem) => {
    try {
      await fetch(`/api/podcasts/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchPodcasts();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="space-y-7 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#09A64A]">
              Media &amp; Video Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">YouTube Podcasts</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage Counsel India video podcasts shown on the website homepage.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Podcast</span>
        </button>
      </div>

      {/* Filter Tabs / Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-[#09A64A]/5 border-[#09A64A] ring-1 ring-[#09A64A]"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Podcasts
            </span>
            <Radio
              className={`w-4 h-4 ${statusFilter === "all" ? "text-[#09A64A]" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.all}</div>
        </button>

        <button
          onClick={() => setStatusFilter("active")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            statusFilter === "active"
              ? "bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active on Homepage
            </span>
            <Eye
              className={`w-4 h-4 ${statusFilter === "active" ? "text-emerald-600" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.active}</div>
        </button>

        <button
          onClick={() => setStatusFilter("inactive")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            statusFilter === "inactive"
              ? "bg-gray-100 border-gray-400 ring-1 ring-gray-400"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hidden / Draft
            </span>
            <EyeOff
              className={`w-4 h-4 ${statusFilter === "inactive" ? "text-gray-700" : "text-gray-400"}`}
            />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{counts.inactive}</div>
        </button>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search podcast by title, guest, topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
            />
          </div>

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
          Showing <span className="font-semibold text-gray-700">{filteredPodcasts.length}</span>{" "}
          podcast
          {filteredPodcasts.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#09A64A] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading podcasts...</p>
        </div>
      ) : filteredPodcasts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No podcasts found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {search
              ? "No podcast matching your search keyword."
              : "No podcasts added yet. Click below to add your first YouTube episode."}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#09A64A] hover:underline cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add your first Podcast
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPodcasts.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                item.isActive ? "border-gray-200" : "border-gray-200 bg-gray-50/60 opacity-80"
              }`}
            >
              <div>
                {/* Thumbnail Preview */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden group">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                      <Video className="w-10 h-10" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </a>

                  {item.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {item.duration}
                    </span>
                  )}

                  {item.category && (
                    <span className="absolute top-2 left-2 bg-[#09A64A] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Order #{item.order}</span>
                    <span>{item.host || "Counsel India"}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {item.guest && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-700">{item.guest}</span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
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
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Watch on YouTube"
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
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
              {formData.id ? "Edit Podcast" : "Add YouTube Podcast"}
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Paste the YouTube video link to showcase on the homepage podcasts section.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Podcast Episode Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Psychology of Mental Resilience"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  YouTube Link / URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  YouTube thumbnail and video ID will be auto-generated from this link.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Guest / Speaker
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Bobby Thakur"
                    value={formData.guest}
                    onChange={(e) => setFormData({ ...formData, guest: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration / Ep
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 35 mins / Ep. 12"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mental Health / Career Guidance"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                  />
                </div>

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
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key takeaways or summary of the episode..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09A64A]/30 focus:border-[#09A64A]"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Custom Thumbnail (Optional - defaults to YouTube cover)"
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#09A64A] focus:ring-[#09A64A] border-gray-300 cursor-pointer"
                  />
                  <span>Active on Website Homepage</span>
                </label>
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
                      <Check className="w-3.5 h-3.5" /> Save Podcast
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
            <h3 className="text-base font-bold text-gray-900">Delete Podcast?</h3>
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

export default function PodcastsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#09A64A] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading...</p>
        </div>
      }
    >
      <PodcastsContent />
    </Suspense>
  );
}
