"use client";

import React, { useState } from "react";
import { X, Plus, User, Mail, Phone, BookOpen } from "lucide-react";

interface AddCourseLeadModalProps {
  isOpen: boolean;
  courses: string[];
  onClose: () => void;
  onLeadAdded: () => void;
}

export default function AddCourseLeadModal({
  isOpen,
  courses,
  onClose,
  onLeadAdded,
}: AddCourseLeadModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [courseName, setCourseName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please provide both name and email.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const res = await fetch("/api/course-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          courseName: courseName.trim() || "General Course Enquiry",
          notes: notes.trim(),
          source: "Admin Manual Entry",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create lead");
      }

      onLeadAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Add New Course Lead
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Record manual offline, walk-in, or phone lead
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="px-6 py-2.5 bg-red-50 text-red-600 text-xs font-semibold border-b border-red-100">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Full Name"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Mobile Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Mobile / Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Target Course *
            </label>
            <div className="space-y-2">
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="">
                  -- Select from existing courses or type below --
                </option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Or type custom course name..."
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Initial Remarks / Query
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enquiry details, preferred batches, discount discussed..."
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400 resize-none"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Add Lead"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
