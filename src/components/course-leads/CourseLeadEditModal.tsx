"use client";

import React, { useState, useEffect } from "react";
import { X, Save, User, Mail, Phone, BookOpen, Clock } from "lucide-react";
import { CourseLeadItem } from "@/types/courseLead";

interface CourseLeadEditModalProps {
  lead: CourseLeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLead: Partial<CourseLeadItem>) => Promise<void>;
}

export default function CourseLeadEditModal({
  lead,
  isOpen,
  onClose,
  onSave,
}: CourseLeadEditModalProps) {
  const [status, setStatus] = useState("New");
  const [relationshipManager, setRelationshipManager] = useState("");
  const [customerSuccessManager, setCustomerSuccessManager] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status || "New");
      setRelationshipManager(lead.relationshipManager || "");
      setCustomerSuccessManager(lead.customerSuccessManager || "");
      setNotes(lead.notes || "");
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSave({
        status,
        relationshipManager,
        customerSuccessManager,
        notes,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update course lead:", error);
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
              Edit Course Lead
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Lead #{lead.sNo} &bull; {lead.courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Summary Info */}
        <div className="px-6 py-4 bg-emerald-50/40 border-b border-emerald-100/50 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              {lead.name}
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lead.addedOn}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            {lead.email && (
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {lead.email}
              </span>
            )}
            {lead.mobile && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {lead.mobile}
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Lead Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Completed">Completed</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Relationship Manager */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Relationship Manager (RM)
            </label>
            <input
              type="text"
              value={relationshipManager}
              onChange={(e) => setRelationshipManager(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Customer Success Manager */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Customer Success Manager (CSM)
            </label>
            <input
              type="text"
              value={customerSuccessManager}
              onChange={(e) => setCustomerSuccessManager(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Notes / Remarks */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Internal Notes & Comments
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add follow-up notes, call summary, or discussion details..."
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
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
