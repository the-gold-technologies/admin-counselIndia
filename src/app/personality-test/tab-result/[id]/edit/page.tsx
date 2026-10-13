"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function EditTabResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const resultId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points: "1",
    status: "Active",
  });

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/personality-test/tab-result?id=${resultId}`,
        );
        const json = await res.json();
        if (json.success && json.data) {
          const item = json.data;
          setFormData({
            name: item.name || "",
            description: item.description || "",
            points: item.points || "1",
            status: item.status || "Active",
          });
        } else {
          alert("Tab result not found");
          router.push("/personality-test/tab-result");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/personality-test/tab-result", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, ...formData }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/personality-test/tab-result");
      } else {
        alert(json.error || "Failed to update tab result");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-16 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#09A64A]" />
        <span className="text-sm font-semibold">Loading result profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* Top Breadcrumb & Heading */}
      <div className="flex items-center gap-4">
        <Link
          href="/personality-test/tab-result"
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-2xs"
          title="Back to Tab Results"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-0.5">
            <Link
              href="/personality-test/tab-result"
              className="hover:text-[#09A64A]"
            >
              Personality Test
            </Link>
            <span>/</span>
            <Link
              href="/personality-test/tab-result"
              className="hover:text-[#09A64A]"
            >
              Tab Result
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-bold">
              Edit Result Archetype
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Edit Tab Result
          </h1>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Archetype Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Points / Score Threshold *
              </label>
              <input
                type="text"
                required
                value={formData.points}
                onChange={(e) =>
                  setFormData({ ...formData, points: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all cursor-pointer"
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
              <span>Update Tab Result</span>
            </button>

            <Link
              href="/personality-test/tab-result"
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
