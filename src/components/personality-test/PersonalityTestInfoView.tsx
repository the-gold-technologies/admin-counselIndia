"use client";

import React, { useState, useEffect } from "react";
import { Edit3, CheckCircle, AlertCircle, X, Loader2, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PersonalityTestInfoData {
  id: string;
  liveId?: string;
  name: string;
  totalQuestions: number;
  subtitle?: string;
  instruction?: string;
  status: string;
}

export default function PersonalityTestInfoView() {
  const [info, setInfo] = useState<PersonalityTestInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    totalQuestions: 10,
    subtitle: "",
    instruction: "",
    status: "Active",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/personality-test/info");
      const json = await res.json();
      if (json.success && json.data) {
        setInfo(json.data);
      }
    } catch (e) {
      console.error("Failed to load personality test info:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = () => {
    if (!info) return;
    setFormData({
      name: info.name,
      totalQuestions: info.totalQuestions || 10,
      subtitle: info.subtitle || "",
      instruction: info.instruction || "",
      status: info.status || "Active",
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/personality-test/info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setInfo(json.data);
        setIsEditModalOpen(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to update test info:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Personality Test Info updated successfully.</span>
        </div>
      )}

      {/* Main Table View Matching Live Counsel India Admin */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">
            PersonalityTestInfo List
          </h2>
          {info && (
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#09A64A] hover:bg-[#089341] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Configuration</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#ID</th>
                <th className="py-3.5 px-4 w-56">Name</th>
                <th className="py-3.5 px-4 w-32 text-center">Total Question</th>
                <th className="py-3.5 px-4 w-40">Subtitle</th>
                <th className="py-3.5 px-4">Instruction</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#09A64A]" />
                    Loading test info...
                  </td>
                </tr>
              ) : !info ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    No configuration found.
                  </td>
                </tr>
              ) : (
                <tr className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-4 text-center font-bold text-gray-400">
                    {info.liveId || "1"}
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-900">
                    {info.name}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-800">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200">
                      {info.totalQuestions} Questions
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-700">
                    {info.subtitle || "-"}
                  </td>
                  <td className="py-4 px-4 text-gray-600 leading-relaxed max-w-md">
                    {info.instruction || "-"}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                        info.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      )}
                    >
                      {info.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={openEditModal}
                      title="Edit"
                      className="w-8 h-8 rounded-lg bg-emerald-50 text-[#09A64A] hover:bg-[#09A64A] hover:text-white transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overview Card */}
      {info && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Test Name</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{info.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{info.subtitle || "Standard Assessment"}</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Questions</span>
            <h3 className="text-lg font-bold text-emerald-600 mt-1">{info.totalQuestions} Questions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Scored on multi-trait archetypes</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Status</span>
            <div className="mt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● {info.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Live and visible on website</p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Edit Personality Test Info
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Total Questions *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalQuestions}
                    onChange={(e) =>
                      setFormData({ ...formData, totalQuestions: Number(e.target.value) || 10 })
                    }
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Instruction
                </label>
                <textarea
                  rows={4}
                  value={formData.instruction}
                  onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                  placeholder="e.g. Know yourself better"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Status *
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
