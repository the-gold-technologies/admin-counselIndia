"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { AlumniItem } from "./AlumniTable";

interface AddAlumniModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  alumniToEdit?: AlumniItem | null;
}

export default function AddAlumniModal({
  isOpen,
  onClose,
  onSuccess,
  alumniToEdit,
}: AddAlumniModalProps) {
  const isEditing = !!alumniToEdit;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    programName: "Counselling Master Course - Foundation",
    certificateNumber: "",
    profession: "",
    skills: "",
    status: "Active",
    isOnline: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (alumniToEdit) {
      setFormData({
        name: alumniToEdit.name || "",
        email: alumniToEdit.email || "",
        mobile: alumniToEdit.mobile || "",
        programName:
          alumniToEdit.programName || "Counselling Master Course - Foundation",
        certificateNumber: alumniToEdit.certificateNumber || "",
        profession: alumniToEdit.profession || "",
        skills: alumniToEdit.skills || "",
        status: alumniToEdit.status || "Active",
        isOnline: alumniToEdit.isOnline ?? true,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        mobile: "",
        programName: "Counselling Master Course - Foundation",
        certificateNumber: "",
        profession: "",
        skills: "",
        status: "Active",
        isOnline: true,
      });
    }
    setError(null);
  }, [alumniToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditing && alumniToEdit) {
        // PATCH
        const res = await fetch("/api/alumni", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: alumniToEdit.id,
            ...formData,
          }),
        });
        const json = await res.json();
        if (!json.success)
          throw new Error(json.error || "Failed to update alumni");
      } else {
        // POST
        const res = await fetch("/api/alumni", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!json.success)
          throw new Error(json.error || "Failed to add alumni");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1e293b] text-white px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#09A64A]/20 flex items-center justify-center text-[#09A64A]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {isEditing ? "Edit Alumni Profile" : "Add New Alumni"}
              </h2>
              <p className="text-xs text-gray-400">
                {isEditing
                  ? "Update credentials and details for this graduate"
                  : "Register a certified graduate into the Counsel India network"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-7 space-y-5 flex-1"
        >
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Dr. Ramesh Kumar"
                className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="e.g. ramesh@example.com"
                className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium"
              />
            </div>

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
                className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium"
              />
            </div>
          </div>

          {/* Program Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Program Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.programName}
              onChange={(e) =>
                setFormData({ ...formData, programName: e.target.value })
              }
              placeholder="e.g. Counselling Master Course - Foundation"
              className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium"
            />
          </div>

          {/* Profession */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Profession / Current Role
            </label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) =>
                setFormData({ ...formData, profession: e.target.value })
              }
              placeholder="e.g. Practicing Mental Health Counselor"
              className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Key Skills / Specializations
            </label>
            <textarea
              rows={2}
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              placeholder="e.g. Anxiety, Stress Management, CBT Therapy, Relationship Counseling"
              className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium"
            />
          </div>

          {/* Status & Online Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Live Online Visibility
              </label>
              <select
                value={formData.isOnline ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isOnline: e.target.value === "true",
                  })
                }
                className="w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium cursor-pointer"
              >
                <option value="true">Online (Visible to seekers)</option>
                <option value="false">Offline</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-sm shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isEditing ? "Save Changes" : "Create Alumni"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
