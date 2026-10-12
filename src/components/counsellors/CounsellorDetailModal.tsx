"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  CreditCard,
  Video,
  Mic,
  MessageSquare,
  Award,
  ExternalLink,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { CounselorItem } from "@/types/counsellor";

interface CounsellorDetailModalProps {
  counsellor: CounselorItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (counsellor: CounselorItem) => void;
}

export default function CounsellorDetailModal({
  counsellor,
  isOpen,
  onClose,
  onEdit,
}: CounsellorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "pricing" | "banking">(
    "overview"
  );

  if (!isOpen || !counsellor) return null;

  const isOnline = Boolean(counsellor.isOnline);
  const isApproved = counsellor.isApproved !== false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Top Header Card */}
        <div className="bg-[#0c1424] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
            {counsellor.image ? (
              <img
                src={counsellor.image}
                alt={counsellor.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#09A64A] shadow-lg shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#09A64A]/20 border border-[#09A64A]/40 text-[#09A64A] flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                {counsellor.name ? counsellor.name.charAt(0).toUpperCase() : "C"}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {counsellor.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#09A64A] text-white">
                  {counsellor.designation || "Counselor"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    counsellor.status === "Active"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {counsellor.status || "Active"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#09A64A]" />
                  {counsellor.mobile}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#09A64A]" />
                  {counsellor.email}
                </span>
                {(counsellor.city || counsellor.country) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#09A64A]" />
                    {[counsellor.city, counsellor.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(counsellor);
                }}
                className="mt-2 sm:mt-0 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/10 overflow-x-auto pb-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-[#09A64A] text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Overview &amp; Bio
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "documents"
                  ? "border-[#09A64A] text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Documents &amp; Proofs
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "pricing"
                  ? "border-[#09A64A] text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Sessions &amp; Pricing
            </button>
            <button
              onClick={() => setActiveTab("banking")}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "banking"
                  ? "border-[#09A64A] text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Banking Details
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Tab Content (2 Columns) */}
            <div className="lg:col-span-2 space-y-5">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {/* Basic Credentials Card */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Academic &amp; Professional Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block">Education:</span>
                        <span className="font-bold text-gray-800">
                          {counsellor.education || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Experience:</span>
                        <span className="font-bold text-gray-800">
                          {counsellor.experience ? `${counsellor.experience} Year(s)` : "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Language(s):</span>
                        <span className="font-bold text-gray-800">
                          {counsellor.language || "Hindi, English"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">RCI Number:</span>
                        <span className="font-bold text-gray-800">
                          {counsellor.rciNumber || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* About */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      About
                    </h3>
                    <div
                      className="text-xs text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          counsellor.about ||
                          "<p class='text-gray-400 italic'>No bio provided yet.</p>",
                      }}
                    />
                  </div>

                  {/* Achievements */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Achievements
                    </h3>
                    <div
                      className="text-xs text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          counsellor.achievements ||
                          "<p class='text-gray-400 italic'>No achievements listed.</p>",
                      }}
                    />
                  </div>

                  {/* What Brings You */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      What Brings You to Counsel India
                    </h3>
                    <div
                      className="text-xs text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          counsellor.whatBringsYou ||
                          "<p class='text-gray-400 italic'>Not specified.</p>",
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Uploaded Verification Documents
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Identity Image */}
                      <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-800">
                              Identity Proof (Aadhaar / Passport)
                            </span>
                            <ShieldCheck className="w-4 h-4 text-[#09A64A]" />
                          </div>
                          {counsellor.identityImage ? (
                            <img
                              src={counsellor.identityImage}
                              alt="Identity proof"
                              className="w-full h-32 object-cover rounded-xl border border-gray-200 mb-3"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-32 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 mb-3">
                              No image uploaded
                            </div>
                          )}
                        </div>
                        {counsellor.identityImage && (
                          <a
                            href={counsellor.identityImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#09A64A] shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Full Document
                          </a>
                        )}
                      </div>

                      {/* Proof of Qualification */}
                      <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-800">
                              Proof of Qualification
                            </span>
                            <GraduationCap className="w-4 h-4 text-[#09A64A]" />
                          </div>
                          {counsellor.qualificationProof ? (
                            <img
                              src={counsellor.qualificationProof}
                              alt="Qualification proof"
                              className="w-full h-32 object-cover rounded-xl border border-gray-200 mb-3"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-32 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 mb-3">
                              No proof uploaded
                            </div>
                          )}
                        </div>
                        {counsellor.qualificationProof && (
                          <a
                            href={counsellor.qualificationProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#09A64A] shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Qualification Proof
                          </a>
                        )}
                      </div>

                      {/* Proof of CV */}
                      <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between sm:col-span-2">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-800">
                              Proof of CV / Resume
                            </span>
                            <FileText className="w-4 h-4 text-[#09A64A]" />
                          </div>
                          {counsellor.cvUrl ? (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 mb-3">
                              <FileText className="w-8 h-8 text-rose-500 shrink-0" />
                              <div className="flex-1 truncate">
                                <span className="text-xs font-bold text-gray-900 block truncate">
                                  {counsellor.cvUrl.split("/").pop()}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  Official Uploaded Resume
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full py-6 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 mb-3">
                              No CV uploaded
                            </div>
                          )}
                        </div>
                        {counsellor.cvUrl && (
                          <a
                            href={counsellor.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-[#09A64A] text-white text-xs font-bold hover:bg-[#07883b] shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open / Download CV Document
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Session Types &amp; Pricing Structure
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Video Session */}
                      <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-emerald-600" /> Video Session
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              counsellor.videoStatus ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                          />
                        </div>
                        <p className="text-lg font-black text-gray-900">
                          ₹{counsellor.videoPrice || 0}
                        </p>
                        <span className="text-[11px] text-gray-400 block">
                          Status: {counsellor.videoStatus ? "Available" : "Disabled"}
                        </span>
                      </div>

                      {/* Audio Session */}
                      <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <Mic className="w-4 h-4 text-blue-600" /> Audio Session
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              counsellor.audioStatus ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                          />
                        </div>
                        <p className="text-lg font-black text-gray-900">
                          ₹{counsellor.audioPrice || 0}
                        </p>
                        <span className="text-[11px] text-gray-400 block">
                          Status: {counsellor.audioStatus ? "Available" : "Disabled"}
                        </span>
                      </div>

                      {/* Chat Session */}
                      <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-amber-600" /> Chat Session
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              counsellor.chatStatus ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                          />
                        </div>
                        <p className="text-lg font-black text-gray-900">
                          ₹{counsellor.chatPrice || 0}
                        </p>
                        <span className="text-[11px] text-gray-400 block">
                          Status: {counsellor.chatStatus ? "Available" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 block">Excepted Charges Fees:</span>
                        <span className="font-extrabold text-sm text-gray-800">
                          ₹{counsellor.expectedCharges || 0}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 block">Councell Fees:</span>
                        <span className="font-extrabold text-sm text-[#09A64A]">
                          ₹{counsellor.councellFees || 0}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 block">Commission:</span>
                        <span className="font-extrabold text-sm text-gray-800">
                          {counsellor.commission || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "banking" && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Bank Account Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 block">Bank Name:</span>
                        <span className="font-bold text-gray-800">
                          {counsellor.bankName || "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Account Number:</span>
                        <span className="font-bold text-gray-800">
                          {counsellor.accountNumber || "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">IFSC Code:</span>
                        <span className="font-bold text-gray-800">
                          {counsellor.ifscCode || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Account Type:</span>
                        <span className="font-bold text-gray-800">
                          {counsellor.accountType || "Savings"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400 block">Account Holder Name:</span>
                        <span className="font-bold text-gray-800">
                          {counsellor.accountHolderName || counsellor.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Widgets (1 Column) */}
            <div className="space-y-4">
              {/* Specialty & Expertise */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Specialty &amp; Expertise
                </h4>
                {counsellor.specialty ? (
                  <span className="inline-block px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    {counsellor.specialty}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 italic">None specified</span>
                )}

                {counsellor.expertise && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400 block mb-1">Expertise:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {counsellor.expertise}
                    </span>
                  </div>
                )}
              </div>

              {/* Status List Widget */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Live Platform Status
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Online Status</span>
                    <span className="flex items-center gap-1.5 font-bold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOnline ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Video Session</span>
                    <span className="flex items-center gap-1.5 font-bold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          counsellor.videoStatus ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {counsellor.videoStatus ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Audio Session</span>
                    <span className="flex items-center gap-1.5 font-bold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          counsellor.audioStatus ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {counsellor.audioStatus ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Chat Session</span>
                    <span className="flex items-center gap-1.5 font-bold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          counsellor.chatStatus ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {counsellor.chatStatus ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-gray-600">Admin Approval</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isApproved ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Pending
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Earnings Widget */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Earnings &amp; Payouts
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-[#09A64A] text-white rounded-xl">
                    <span className="text-[11px] uppercase tracking-wider opacity-90 block">
                      Total Earning
                    </span>
                    <span className="text-lg font-black">INR 0</span>
                  </div>
                  <div className="p-3 bg-blue-600 text-white rounded-xl">
                    <span className="text-[11px] uppercase tracking-wider opacity-90 block">
                      Total Balance
                    </span>
                    <span className="text-lg font-black">INR 0</span>
                  </div>
                  <div className="p-3 bg-emerald-700 text-white rounded-xl">
                    <span className="text-[11px] uppercase tracking-wider opacity-90 block">
                      Total Payout
                    </span>
                    <span className="text-lg font-black">INR 0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
