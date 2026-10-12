"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { CourseLeadItem } from "@/types/courseLead";

const RM_OPTIONS = [
  "Ramesh Kumar",
  "Priya Sharma",
  "Amit Patel",
  "Sneha Gupta",
  "Rahul Verma",
  "Pooja Mehta",
  "Vikram Malhotra",
  "Ananya Singh",
];

const CSM_OPTIONS = [
  "Ankit Saxena",
  "Neha Kapoor",
  "Rohan Iyer",
  "Deepika Rao",
  "Kunal Roy",
  "Shweta Joshi",
  "Manish Tiwari",
  "Divya Nair",
];

export default function EditCourseLeadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<CourseLeadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states matching live website
  const [relationshipManager, setRelationshipManager] = useState("");
  const [customerSuccessManager, setCustomerSuccessManager] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    async function fetchLead() {
      try {
        setLoading(true);
        const res = await fetch(`/api/course-leads/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          const item = data.data;
          setLead(item);
          setRelationshipManager(item.relationshipManager || "");
          setCustomerSuccessManager(item.customerSuccessManager || "");
          setStatus(item.status === "Inactive" ? "Inactive" : "Active");
        } else {
          setError(data.error || "Course lead not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load course lead");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchLead();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const res = await fetch(`/api/course-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relationshipManager: relationshipManager.trim(),
          customerSuccessManager: customerSuccessManager.trim(),
          status: status,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to update course lead");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/course-leads");
      }, 800);
    } catch (err: any) {
      setError(err.message || "Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#09A64A] mb-3" />
        <p className="text-xs font-semibold text-gray-500">Loading lead details...</p>
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Lead Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">{error}</p>
        <Link
          href="/course-leads"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#09A64A] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Course Leads</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/course-leads"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#09A64A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Leads</span>
        </Link>
        <div className="text-xs text-gray-400">
          Content Management &bull; <span className="text-gray-700 font-semibold">Edit Lead #{lead?.sNo}</span>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#09A64A]">
            Content Management
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Edit Course Lead
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Assign Relationship Manager (RM), Customer Success Manager (CSM), and update lead status
        </p>
      </div>

      {/* Lead Summary Info Card */}
      {lead && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                {(lead.name || "G")[0]?.toUpperCase() || "G"}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {lead.name || "Guest"}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  {lead.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span>{lead.email}</span>
                    </span>
                  )}
                  {lead.mobile && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{lead.mobile}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-1 inline-block">
                {lead.courseName || "General Course"}
              </span>
              {lead.addedOn && (
                <div className="text-[11px] text-gray-400 mt-1">
                  Added: {lead.addedOn}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Edit Form matching live site */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Lead updated successfully! Redirecting...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Relationship Manager (RM) */}
          <div className="space-y-1.5">
            <label htmlFor="rm" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Relationship Manager
            </label>
            <select
              id="rm"
              value={relationshipManager}
              onChange={(e) => setRelationshipManager(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] transition-all cursor-pointer"
            >
              <option value="">Select Relationship Manager</option>
              {RM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              {relationshipManager && !RM_OPTIONS.includes(relationshipManager) && (
                <option value={relationshipManager}>{relationshipManager}</option>
              )}
            </select>
            <p className="text-[11px] text-gray-400">
              Assign counselor or RM responsible for student onboarding
            </p>
          </div>

          {/* Customer Success Manager (CSM) */}
          <div className="space-y-1.5">
            <label htmlFor="csm" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Customer Success Manager
            </label>
            <select
              id="csm"
              value={customerSuccessManager}
              onChange={(e) => setCustomerSuccessManager(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] transition-all cursor-pointer"
            >
              <option value="">Select Customer Success Manager</option>
              {CSM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              {customerSuccessManager && !CSM_OPTIONS.includes(customerSuccessManager) && (
                <option value={customerSuccessManager}>{customerSuccessManager}</option>
              )}
            </select>
            <p className="text-[11px] text-gray-400">
              Assign CSM responsible for student ongoing support & mentorship
            </p>
          </div>
        </div>

        {/* Status Option matching live site */}
        <div className="max-w-xs space-y-1.5">
          <label htmlFor="status" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Status <span className="text-rose-500">*</span>
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] transition-all cursor-pointer"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Submit Form Button matching live site */}
        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Submit form</span>
          </button>

          <Link
            href="/course-leads"
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
