"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import { CmsEditor } from "@/components/ui/CmsEditor";

export default function EditPersonalityTestInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    totalQuestions: 10,
    subtitle: "",
    instruction: "",
    status: "Active",
  });

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/personality-test/info");
        const json = await res.json();
        if (json.success && json.data) {
          const item = json.data;
          setFormData({
            name: item.name || "",
            totalQuestions: item.totalQuestions || 10,
            subtitle: item.subtitle || "",
            instruction: item.instruction || "",
            status: item.status || "Active",
          });
        }
      } catch (err) {
        console.error("Failed to load personality test info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/personality-test/info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/personality-test/personality-test-info");
      } else {
        alert(json.error || "Failed to update configuration");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-gray-500">Loading assessment configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* Top Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link
            href="/personality-test/personality-test-info"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#09A64A] hover:text-[#089341] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK TO INFORMATION</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-2">
            Edit Personality Test Info
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure primary assessment metadata, question count, and candidate instructions.
          </p>
        </div>
      </div>

      {/* Main Form Container - Full Width */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              1. Assessment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Assessment Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Personality Test One"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Total Questions <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.totalQuestions}
                  onChange={(e) =>
                    setFormData({ ...formData, totalQuestions: Number(e.target.value) || 10 })
                  }
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Test"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Instructions with CMS Rich Text Editor */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              2. Candidate Instructions
            </h2>

            <div>
              <CmsEditor
                label="Instruction Content *"
                placeholder="Enter comprehensive instructions for the assessment..."
                value={formData.instruction}
                onChange={(html: string) => setFormData({ ...formData, instruction: html })}
              />
              <p className="text-[12px] text-gray-400 mt-1.5">
                Rich text will be formatted and presented directly to users on the assessment introduction page.
              </p>
            </div>
          </div>

          {/* Section 3: Status & Visibility */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              3. Status &amp; Availability
            </h2>

            <div className="max-w-xs text-xs">
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Assessment Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-bold cursor-pointer text-xs"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Save Configuration</span>
            </button>

            <Link
              href="/personality-test/personality-test-info"
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
