"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { CertificateUploadField } from "@/components/ui/CertificateUploadField";

export default function CreateAlumniPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    programName: "",
    certificateNumber: "",
    skills: "",
    status: "Active",
    image: "",
    certificateUrl: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [certFileName, setCertFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setFormData((prev) => ({ ...prev, image: file.name }));
    }
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertFileName(file.name);
      setFormData((prev) => ({ ...prev, certificateUrl: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to create alumni");
      }

      router.push("/alumni");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong while saving alumni.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* Top Header matching CMS reference */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link
            href="/alumni"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#09A64A] hover:text-[#089341] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK TO ALUMNI LIST</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-[13px]">
            Add New Alumni
          </h1>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Name<span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email<span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mobile<span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Enter mobile number"
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900"
              />
            </div>

            {/* Image Upload */}
            <ImageUploadField
              label="Profile Image"
              value={formData.image}
              onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
            />

            {/* Certificate Upload */}
            <CertificateUploadField
              label="Proof of CV / Certificate"
              value={formData.certificateUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, certificateUrl: url }))}
            />

            {/* Certificate Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Certificate Number
              </label>
              <input
                type="text"
                value={formData.certificateNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    certificateNumber: e.target.value,
                  })
                }
                placeholder="e.g. 10892"
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900"
              />
            </div>

            {/* Program Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Program name
              </label>
              <input
                type="text"
                value={formData.programName}
                onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                placeholder="e.g. Counselling Master Course Advance"
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Skills
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. Anxiety, Stress, Depression, Relationship Counseling"
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Submit Button matching live styling */}
          <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-sm shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Submit</span>
            </button>

            <Link
              href="/alumni"
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
