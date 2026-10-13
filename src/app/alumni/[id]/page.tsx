"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ArrowLeft,
  Edit2,
  Mail,
  Phone,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  User,
  Clock,
  Briefcase,
} from "lucide-react";

interface AlumniDetail {
  id: string;
  sNo?: number;
  name: string;
  email: string;
  mobile: string;
  programName: string;
  certificateNumber?: string;
  certificateUrl?: string;
  profession?: string;
  skills?: string;
  image?: string;
  isOnline: boolean;
  status: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
      return `${day} ${month} ${year}, ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    }
    return String(dateStr);
  } catch {
    return String(dateStr);
  }
}

export default function ViewAlumniPage() {
  const params = useParams();
  const id = params?.id as string;

  const [alumni, setAlumni] = useState<AlumniDetail | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/alumni/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setAlumni(json.data);
        } else {
          setError(json.error || "Alumni record not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load alumni");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-gray-500">Loading alumni profile...</p>
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Alumni Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">
          {error || "Could not retrieve details for this ID."}
        </p>
        <Link
          href="/alumni"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#09A64A] text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Alumni List</span>
        </Link>
      </div>
    );
  }

  const skillsList = alumni.skills
    ? alumni.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const initials = alumni.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const isActive = alumni.status === "Active";

  return (
    <div className="space-y-6 pb-20 w-full">
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
            Alumni Profile
          </h1>
        </div>

        <div>
          <Link
            href={`/alumni/${alumni.id}/edit`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white text-xs font-bold transition-all shadow-md shadow-[#09A64A]/20 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Single Card - Simple, Clean, Only Green and Slate */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Profile Header */}
        <div className="p-7 border-b border-gray-100 flex items-center justify-between flex-wrap gap-5">
          <div className="flex items-center gap-4">
            {alumni.image && !imgError ? (
              <img
                src={alumni.image}
                alt={alumni.name}
                onError={() => setImgError(true)}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#09A64A]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#09A64A] text-white flex items-center justify-center font-black text-xl shrink-0">
                {initials}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900">{alumni.name}</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-emerald-50 text-[#09A64A] border border-emerald-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-[#09A64A]" : "bg-gray-400"
                    }`}
                  />
                  {alumni.status}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      alumni.isOnline ? "bg-[#09A64A]" : "bg-gray-400"
                    }`}
                  />
                  {alumni.isOnline ? "Online" : "Offline"}
                </span>
              </div>

              <p className="text-xs text-gray-500 font-medium mt-1">
                {alumni.profession || "Counsel India Graduate"}
              </p>
            </div>
          </div>

          {/* Certificate Badge */}
          {alumni.certificateNumber && (
            <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Certificate Number
              </span>
              <span className="text-sm font-extrabold text-[#09A64A] block">
                #{alumni.certificateNumber}
              </span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="p-7 space-y-6">
          {/* Key Details Grid */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Basic Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                <span className="text-xs text-gray-500 block">Email Address</span>
                <span className="text-sm font-bold text-gray-900 block mt-0.5">{alumni.email}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                <span className="text-xs text-gray-500 block">Mobile Number</span>
                <span className="text-sm font-bold text-gray-900 block mt-0.5">
                  {alumni.mobile}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 sm:col-span-2">
                <span className="text-xs text-gray-500 block">Program Name</span>
                <span className="text-sm font-bold text-gray-900 block mt-0.5">
                  {alumni.programName}
                </span>
              </div>
            </div>
          </div>

          {/* Skills Section - Clean Green Pills */}
          {skillsList.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                Skills & Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#09A64A]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification Timestamps */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500 font-medium">
            <span>
              Added On: <strong className="text-gray-700">{formatDate(alumni.createdAt)}</strong>
            </span>
            <span>
              Updated On: <strong className="text-gray-700">{formatDate(alumni.updatedAt)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
