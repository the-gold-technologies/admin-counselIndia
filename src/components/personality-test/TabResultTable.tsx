"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabResultItem {
  id: string;
  liveId?: string;
  name: string;
  description: string;
  points?: string;
  status: string;
}

export default function TabResultTable() {
  const [items, setItems] = useState<TabResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TabResultItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points: "1",
    status: "Active",
  });

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

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      points: "1",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: TabResultItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      points: item.points || "1",
      status: item.status || "Active",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingItem) {
        const res = await fetch("/api/personality-test/tab-result", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingItem.id, ...formData }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await fetch("/api/personality-test/tab-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (e) {
      console.error("Failed to save tab result:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/personality-test/tab-result?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (e) {
      console.error("Failed to delete tab result:", e);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      (i.points && i.points.includes(search))
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by archetype, points or description..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A]"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#09A64A] hover:bg-[#089341] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tab Result</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#ID</th>
                <th className="py-3.5 px-4 w-52">Name</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 w-24 text-center">Points</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#09A64A]" />
                    Loading tab results...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    No tab results found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-gray-400">
                      {item.liveId || index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 leading-relaxed max-w-xl">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {item.points || "1"} pts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                          item.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit"
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-[#09A64A] hover:bg-[#09A64A] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Delete"
                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingItem ? "Edit Tab Result" : "Add New Tab Result"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Name (Archetype / Personality Profile) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. The Achiever"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed psychological personality profile description..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Points *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#09A64A] hover:bg-[#089341] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Update Result" : "Create Result"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
