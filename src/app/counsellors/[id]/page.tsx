"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ArrowLeft,
  Edit2,
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
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  Download,
  Calendar,
} from "lucide-react";
import { CounselorItem } from "@/types/counsellor";

export default function CounsellorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [counsellor, setCounsellor] = useState<CounselorItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "pricing" | "banking">(
    "overview"
  );

  useEffect(() => {
    if (!id) return;
    const fetchCounsellor = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/counsellors/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setCounsellor(json.data);
        } else {
          setError(json.error || "Counselor not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load counsellor");
      } finally {
        setLoading(false);
      }
    };

    fetchCounsellor();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-gray-500">Loading counsellor dossier...</p>
      </div>
    );
  }

  if (error || !counsellor) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Counsellor Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">
          {error || "Could not retrieve counsellor profile."}
        </p>
        <Link
          href="/counsellors"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#09A64A] text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Counsellors List</span>
        </Link>
      </div>
    );
  }

  const isOnline = Boolean(counsellor.isOnline);
  const isActive = counsellor.status === "Active";
  const isApproved = counsellor.isApproved !== false;

  const initials = (counsellor.name || "C")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const safeImageUrl = counsellor.image ? encodeURI(counsellor.image.trim()) : null;

  return (
    <div className="space-y-6 pb-20 w-full">
      {/* Top Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link
            href="/counsellors"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#09A64A] hover:text-[#089341] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK TO COUNSELLORS LIST</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-2">
            Counsellor Profile
          </h1>
        </div>

        <div>
          <Link
            href={`/counsellors/${counsellor.id}/edit`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white text-xs font-bold transition-all shadow-md shadow-[#09A64A]/20 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Profile Container - Simple, Clean, Only Green and Slate (Alumni style) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Profile Header */}
        <div className="p-7 border-b border-gray-100 flex items-center justify-between flex-wrap gap-5">
          <div className="flex items-center gap-4">
            {safeImageUrl && !imgError ? (
              <img
                src={safeImageUrl}
                alt={counsellor.name}
                onError={() => setImgError(true)}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#09A64A]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#09A64A] text-white flex items-center justify-center font-black text-xl shrink-0">
                {initials || "C"}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{counsellor.name}</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-emerald-50 text-[#09A64A] border border-emerald-200"
                      : "bg-rose-50 text-rose-600 border border-rose-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-[#09A64A]" : "bg-rose-500"
                    }`}
                  />
                  {counsellor.status || "Active"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? "bg-[#09A64A] animate-pulse" : "bg-gray-400"
                    }`}
                  />
                  {isOnline ? "Online" : "Offline"}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isApproved
                      ? "bg-emerald-50 text-[#09A64A] border border-emerald-200"
                      : "bg-amber-50 text-amber-600 border border-amber-200"
                  }`}
                >
                  {isApproved ? "Approved" : "Pending"}
                </span>
              </div>

              <p className="text-xs text-gray-500 font-medium mt-1">
                {counsellor.specialty || counsellor.designation || "Counselor"}
              </p>
            </div>
          </div>

          {/* Quick Contact Chips */}
          <div className="flex items-center gap-3 flex-wrap">
            {counsellor.mobile && (
              <div className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-700">
                <Phone className="w-3.5 h-3.5 text-[#09A64A]" />
                <span>{counsellor.mobile}</span>
              </div>
            )}
            {counsellor.email && (
              <div className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-700">
                <Mail className="w-3.5 h-3.5 text-[#09A64A]" />
                <span>{counsellor.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="px-7 pt-3 bg-white border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Bio" },
            { id: "documents", label: "Verification Documents" },
            { id: "pricing", label: "Sessions & Pricing" },
            { id: "banking", label: "Banking Details" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#09A64A] text-[#09A64A]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-7 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Basic Details Grid */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Basic Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-xs text-gray-500 block">Designation</span>
                    <span className="text-sm font-bold text-gray-900 block mt-0.5">
                      {counsellor.designation || "-"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-xs text-gray-500 block">Education / Qualification</span>
                    <span className="text-sm font-bold text-gray-900 block mt-0.5">
                      {counsellor.education || "-"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-xs text-gray-500 block">Experience</span>
                    <span className="text-sm font-bold text-gray-900 block mt-0.5">
                      {counsellor.experience ? `${counsellor.experience} years` : "-"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-xs text-gray-500 block">Primary Specialty</span>
                    <span className="text-sm font-bold text-gray-900 block mt-0.5">
                      {counsellor.specialty || "-"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-xs text-gray-500 block">Secondary Specialty</span>
                    <span className="text-sm font-bold text-gray-900 block mt-0.5">
                      {counsellor.specialty2 || "-"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-xs text-gray-500 block">Location / City</span>
                    <span className="text-sm font-bold text-gray-900 block mt-0.5">
                      {[counsellor.city, counsellor.country].filter(Boolean).join(", ") || "-"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-xs text-gray-500 block">Languages Spoken</span>
                    <span className="text-sm font-bold text-gray-900 block mt-0.5">
                      {counsellor.language || "-"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-xs text-gray-500 block">Added On</span>
                    <span className="text-sm font-bold text-gray-900 block mt-0.5">
                      {counsellor.addedOn || "-"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-xs text-gray-500 block">Updated On</span>
                    <span className="text-sm font-bold text-gray-900 block mt-0.5">
                      {counsellor.updatedOn || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & About */}
              {counsellor.about && (
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    About / Professional Bio
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {counsellor.about}
                  </p>
                </div>
              )}

              {/* Achievements */}
              {counsellor.achievements && (
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Key Achievements
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {counsellor.achievements}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Verification Documents &amp; Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Profile Photo */}
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-900 block">Profile Photo</span>
                    <span className="text-[11px] text-gray-500 block">
                      {counsellor.image ? "Uploaded on file" : "No photo attached"}
                    </span>
                  </div>
                  {counsellor.image ? (
                    <a
                      href={encodeURI(counsellor.image.trim())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#09A64A] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#089341]"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 font-semibold">Missing</span>
                  )}
                </div>

                {/* Identity Proof */}
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-900 block">
                      Identity Proof (Aadhaar / ID)
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {counsellor.identityImage
                        ? "Official ID verification document"
                        : "Not uploaded"}
                    </span>
                  </div>
                  {counsellor.identityImage ? (
                    <a
                      href={encodeURI(counsellor.identityImage.trim())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#09A64A] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#089341]"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 font-semibold">Missing</span>
                  )}
                </div>

                {/* Qualification Proof */}
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-900 block">
                      Qualification Proof
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {counsellor.qualificationProof
                        ? "Degree / Certificate marksheet"
                        : "Not uploaded"}
                    </span>
                  </div>
                  {counsellor.qualificationProof ? (
                    <a
                      href={encodeURI(counsellor.qualificationProof.trim())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#09A64A] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#089341]"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 font-semibold">Missing</span>
                  )}
                </div>

                {/* CV / Resume */}
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-900 block">
                      CV / Resume Document
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {counsellor.cvUrl ? "Professional Curriculum Vitae" : "Not uploaded"}
                    </span>
                  </div>
                  {counsellor.cvUrl ? (
                    <a
                      href={encodeURI(counsellor.cvUrl.trim())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#09A64A] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#089341]"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 font-semibold">Missing</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Session Modes &amp; Pricing Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-[#09A64A]" />
                    <span className="text-xs font-bold text-gray-900">Video Consultation</span>
                  </div>
                  <span className="text-lg font-black text-gray-900 block">
                    ₹{counsellor.videoPrice || 0}
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Status: {counsellor.videoStatus ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4 text-[#09A64A]" />
                    <span className="text-xs font-bold text-gray-900">Audio Consultation</span>
                  </div>
                  <span className="text-lg font-black text-gray-900 block">
                    ₹{counsellor.audioPrice || 0}
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Status: {counsellor.audioStatus ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-[#09A64A]" />
                    <span className="text-xs font-bold text-gray-900">Chat Consultation</span>
                  </div>
                  <span className="text-lg font-black text-gray-900 block">
                    ₹{counsellor.chatPrice || 0}
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Status: {counsellor.chatStatus ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <span className="text-xs text-gray-500 block">Expected Charges</span>
                  <span className="text-base font-bold text-gray-900 block mt-0.5">
                    ₹{counsellor.expectedCharges || 0}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <span className="text-xs text-gray-500 block">Counsel India Fees</span>
                  <span className="text-base font-bold text-gray-900 block mt-0.5">
                    ₹{counsellor.councellFees || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BANKING */}
          {activeTab === "banking" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Payout &amp; Bank Account Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <span className="text-xs text-gray-500 block">Bank Name</span>
                  <span className="text-sm font-bold text-gray-900 block mt-0.5">
                    {counsellor.bankName || "-"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <span className="text-xs text-gray-500 block">Account Number</span>
                  <span className="text-sm font-bold text-gray-900 block mt-0.5">
                    {counsellor.accountNumber || "-"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <span className="text-xs text-gray-500 block">IFSC Code</span>
                  <span className="text-sm font-bold text-gray-900 block mt-0.5">
                    {counsellor.ifscCode || "-"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <span className="text-xs text-gray-500 block">Account Type</span>
                  <span className="text-sm font-bold text-gray-900 block mt-0.5">
                    {counsellor.accountType || "-"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 sm:col-span-2">
                  <span className="text-xs text-gray-500 block">Account Holder Name</span>
                  <span className="text-sm font-bold text-gray-900 block mt-0.5">
                    {counsellor.accountHolderName || "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
