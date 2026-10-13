"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarPlus,
  GraduationCap,
  CreditCard,
  User,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { CourseLeadItem } from "@/types/courseLead";

const BATCH_OPTIONS = [
  "Weekend Batch (Batch 24) - Saturday & Sunday",
  "Weekday Morning Batch (10:00 AM - 12:00 PM)",
  "Weekday Evening Batch (06:00 PM - 08:00 PM)",
  "Fast Track Intensive Batch",
];

const COUNSELOR_OPTIONS = [
  "Ramesh Kumar",
  "Priya Sharma",
  "Amit Patel",
  "Sneha Gupta",
  "Rahul Verma",
  "Pooja Mehta",
];

export default function CreateBookingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<CourseLeadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Booking Form fields matching live website
  const [courseName, setCourseName] = useState("");
  const [batchName, setBatchName] = useState(BATCH_OPTIONS[0]);
  const [academicCounselor, setAcademicCounselor] = useState("");
  const [feeAmount, setFeeAmount] = useState("14999");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMode, setPaymentMode] = useState("Online / UPI");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchLead() {
      try {
        setLoading(true);
        const res = await fetch(`/api/course-leads/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          const item = data.data;
          setLead(item);
          setCourseName(item.courseName || "General Course");
          setAcademicCounselor(item.relationshipManager || "");
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
    if (!lead) return;

    try {
      setSubmitting(true);
      setError("");

      // 1. Create admission record
      const admissionRes = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          mobile: lead.mobile,
          courseName: courseName,
          feeAmount: parseFloat(feeAmount) || 0,
          paymentStatus: paymentStatus,
          batchName: batchName,
          academicCounselor: academicCounselor,
          status: "Enrolled",
        }),
      });

      const admissionData = await admissionRes.json();
      if (!admissionData.success) {
        throw new Error(admissionData.error || "Failed to create admission");
      }

      // 2. Mark course lead as Enrolled
      await fetch(`/api/course-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Enrolled",
          relationshipManager: academicCounselor,
          notes: `Converted to booking on ${new Date().toLocaleDateString()}. Fee: ₹${feeAmount} (${paymentStatus}, ${paymentMode})${
            transactionId ? ` | Txn: ${transactionId}` : ""
          } ${notes ? ` | Notes: ${notes}` : ""}`,
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/course-leads");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#09A64A] mb-3" />
        <p className="text-xs font-semibold text-gray-500">
          Loading booking information...
        </p>
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
          Content Management &bull;{" "}
          <span className="text-gray-700 font-semibold">
            Create Booking #{lead?.sNo}
          </span>
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
          Create A Booking
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Convert student enquiry into an official admission & course enrollment
        </p>
      </div>

      {/* Student Details Summary Card */}
      {lead && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#09A64A] border border-emerald-200 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
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
                Enquiry ID: #{lead.sNo}
              </span>
              <div className="text-[11px] text-gray-400 mt-1">
                Source: {lead.source || "Website"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-6"
      >
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Booking created successfully! Lead converted to Enrolled.
              Redirecting...
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Name */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Enrolling Course <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
            />
          </div>

          {/* Batch Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Select Batch <span className="text-rose-500">*</span>
            </label>
            <select
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] cursor-pointer"
            >
              {BATCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Counselor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Academic Counselor / RM
            </label>
            <select
              value={academicCounselor}
              onChange={(e) => setAcademicCounselor(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] cursor-pointer"
            >
              <option value="">Select Counselor</option>
              {COUNSELOR_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              {academicCounselor &&
                !COUNSELOR_OPTIONS.includes(academicCounselor) && (
                  <option value={academicCounselor}>{academicCounselor}</option>
                )}
            </select>
          </div>

          {/* Fee Amount */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Fee Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
            />
          </div>

          {/* Payment Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Payment Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] cursor-pointer"
            >
              <option value="Paid">Full Paid</option>
              <option value="Partial">Partial Paid</option>
              <option value="Pending">Payment Pending</option>
            </select>
          </div>

          {/* Payment Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Payment Mode <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] cursor-pointer"
            >
              <option value="Online / UPI">Online / UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
              <option value="EMI / Finance">EMI / Loan Finance</option>
              <option value="Cheque / DD">Cheque / Demand Draft</option>
            </select>
          </div>

          {/* Transaction ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Transaction / Reference ID
            </label>
            <input
              type="text"
              placeholder="e.g. UPI-938210398210"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Internal Admission Remarks
            </label>
            <textarea
              rows={2}
              placeholder="Add any special notes or discount details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 bg-[#f8fafc] focus:outline-none focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarPlus className="w-4 h-4" />
            )}
            <span>Confirm Booking & Enroll Student</span>
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
