"use client";

import React from "react";
import { X, Award, Mail, Phone, Calendar, CheckCircle2, ShieldCheck, Briefcase, ExternalLink, Printer } from "lucide-react";
import { AlumniItem } from "./AlumniTable";

interface AlumniDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumni: AlumniItem | null;
  onEdit?: (item: AlumniItem) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatDate(dateStr?: string | Date | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = MONTHS[d.getMonth()];
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
      return `${day} ${month} ${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    }
    return String(dateStr);
  } catch {
    return String(dateStr);
  }
}

export default function AlumniDetailModal({
  isOpen,
  onClose,
  alumni,
  onEdit,
}: AlumniDetailModalProps) {
  if (!isOpen || !alumni) return null;

  const skillsList = alumni.skills
    ? alumni.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="bg-linear-to-r from-[#1e293b] via-[#0f172a] to-[#1e293b] text-white p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-5">
            {/* Avatar Image or Circle */}
            {alumni.image ? (
              <img
                src={alumni.image}
                alt={alumni.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-xl shrink-0 border-2 border-white/20"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#09A64A] text-white flex items-center justify-center font-black text-2xl shadow-xl shrink-0 border-2 border-white/20">
                {alumni.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}

            <div className="space-y-1.5 flex-1 pr-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {alumni.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#09A64A]/20 text-emerald-400 border border-[#09A64A]/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Alumni
                </span>
              </div>
              <p className="text-sm text-gray-300 font-medium">
                {alumni.profession || "Counsel India Graduate"}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      alumni.isOnline ? "bg-[#09A64A] animate-pulse" : "bg-gray-400"
                    }`}
                  />
                  {alumni.isOnline ? "Online Directory" : "Offline"}
                </span>
                <span>•</span>
                <span>Status: <strong className="text-white">{alumni.status}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-7 space-y-6 overflow-y-auto flex-1">
          {/* Certificate Badge Card */}
          <div className="p-4.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#09A64A] text-white flex items-center justify-center shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Official Credential
                </span>
                <span className="text-base font-extrabold text-gray-900 block">
                  Certificate #{alumni.certificateNumber || "Verified"}
                </span>
              </div>
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"}/learners-network?search=${encodeURIComponent(alumni.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-[#09A64A] hover:bg-emerald-100/50 text-xs font-bold transition-all shadow-2xs"
            >
              <span>View on Network</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Program Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Program Completed
            </h3>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-semibold text-sm">
              {alumni.programName}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
              </span>
              <p className="font-bold text-gray-900 text-sm">{alumni.email}</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> Mobile Number
              </span>
              <p className="font-bold text-gray-900 text-sm">{alumni.mobile}</p>
            </div>
          </div>

          {/* Skills / Specializations */}
          {skillsList.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Specialized Competencies & Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Added On: {formatDate(alumni.createdAt)}</span>
            <span>Last Updated: {formatDate(alumni.updatedAt)}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-gray-50/80 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Profile</span>
          </button>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(alumni);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
