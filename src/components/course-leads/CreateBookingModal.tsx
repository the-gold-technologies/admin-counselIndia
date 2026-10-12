"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, GraduationCap, CreditCard, User, Mail, Phone, BookOpen } from "lucide-react";
import { CourseLeadItem } from "@/types/courseLead";

interface CreateBookingModalProps {
  lead: CourseLeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
}

export default function CreateBookingModal({
  lead,
  isOpen,
  onClose,
  onBookingCreated,
}: CreateBookingModalProps) {
  const [courseName, setCourseName] = useState("");
  const [batchName, setBatchName] = useState("Weekend Batch (Batch 24)");
  const [feeAmount, setFeeAmount] = useState("14999");
  const [paymentMode, setPaymentMode] = useState("Online / UPI");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [academicCounselor, setAcademicCounselor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lead) {
      setCourseName(lead.courseName || "General Course");
      setAcademicCounselor(lead.relationshipManager || "");
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
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
      await fetch(`/api/course-leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Enrolled",
          notes: `Converted to active admission on ${new Date().toLocaleDateString()}. Fee: ₹${feeAmount} (${paymentStatus})`,
        }),
      });

      onBookingCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to convert lead to booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#09A64A]/10 to-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#09A64A] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Create A Booking</h3>
              <p className="text-xs text-gray-500">
                Convert lead #{lead.sNo} to official enrolled student
              </p>
            </div>
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

        {/* Student Details Pill */}
        <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-xs">
          <div>
            <strong className="text-gray-900">{lead.name}</strong>
            <span className="text-gray-400 mx-2">&bull;</span>
            <span className="text-gray-500">{lead.email}</span>
          </div>
          <span className="font-semibold text-gray-700">{lead.mobile}</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Course Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Course Enrolling Into *
            </label>
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Batch & Counselor Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Batch *
              </label>
              <select
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="Weekend Batch (Batch 24)">Weekend Batch (Batch 24)</option>
                <option value="Weekday Evening Batch">Weekday Evening Batch</option>
                <option value="Fast Track Fast-Track">Fast Track Intensive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Academic Counselor
              </label>
              <input
                type="text"
                value={academicCounselor}
                onChange={(e) => setAcademicCounselor(e.target.value)}
                placeholder="Counselor Name"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Fee & Payment Status Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Fee (₹) *
              </label>
              <input
                type="number"
                required
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="Paid">Full Paid</option>
                <option value="Partial">Partial (EMI)</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full h-11 px-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="Online / UPI">Online / UPI</option>
                <option value="Credit Card / Debit">Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash / Cheque">Cash / Cheque</option>
              </select>
            </div>
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
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? "Converting..." : "Confirm & Enroll"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
