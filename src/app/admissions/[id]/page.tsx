"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  BookOpen,
  MapPin,
  Target,
  GraduationCap,
  CheckCircle2,
  Building,
  ChevronRight,
} from "lucide-react";
import { INITIAL_ADMISSIONS } from "@/lib/initialData";
import { downloadLearnerPDF } from "@/lib/generateLearnerPdf";

export default function LearnerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [learner, setLearner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "personal" | "address" | "expectations" | "academic"
  >("personal");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admissions/" + id);
        const json = await res.json();
        if (json.success && json.data) {
          setLearner(json.data);
        } else {
          const found = INITIAL_ADMISSIONS.find(
            (a) => a.id === id || String(a.sNo) === id
          );
          setLearner(found || INITIAL_ADMISSIONS[0]);
        }
      } catch {
        const found = INITIAL_ADMISSIONS.find(
          (a) => a.id === id || String(a.sNo) === id
        );
        setLearner(found || INITIAL_ADMISSIONS[0]);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  const handleDownload = () => {
    if (!learner) return;
    setDownloading(true);
    try {
      downloadLearnerPDF(learner);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#09A64A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading learner details...</p>
        </div>
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 max-w-xl mx-auto mt-12">
        <h2 className="text-lg font-bold text-gray-900">Learner Not Found</h2>
        <p className="text-sm text-gray-500 mt-1">The requested learner profile could not be located.</p>
        <Link
          href="/admissions"
          className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 bg-[#1e293b] text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Learner List
        </Link>
      </div>
    );
  }

  const p = learner.personalDetails || {};
  const addr = learner.address || {};
  const expectations: string[] = Array.isArray(learner.courseExpectations)
    ? learner.courseExpectations
    : [];
  const education: any[] = Array.isArray(learner.educationHistory)
    ? learner.educationHistory
    : [];

  return (
    <div className="flex flex-col gap-7 w-full max-w-6xl mx-auto pb-16 pt-2">
      {/* Top Header: Breadcrumbs, Learner Details title, Description & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="space-y-1.5">
          {/* Breadcrumb: Learner List > Learner Details */}
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
            <Link
              href="/admissions"
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              Learner List
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-800 font-semibold">Learner Details</span>
          </div>

          {/* Heading replacing "Profile" with "Learner Details" */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B0F29] tracking-tight">
            Learner Details
          </h1>

          {/* Descriptive Subtitle */}
          <p className="text-sm text-gray-500 font-medium mt-1">
            Comprehensive personal records, qualification history, and course enrollment profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admissions"
            className="flex items-center gap-2 px-4.5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 text-sm font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Learner List</span>
          </Link>

          {/* Download as PDF Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#09A64A] hover:bg-[#089341] disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? "Generating PDF..." : "Download as PDF"}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-7 sm:p-9">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 pb-7">
          {/* Circular Avatar */}
          <div className="w-20 h-20 rounded-full bg-[#0a192f] text-white font-extrabold text-2xl flex items-center justify-center ring-4 ring-slate-100 shadow-sm shrink-0">
            {learner.name ? learner.name.slice(0, 2).toUpperCase() : "CI"}
          </div>

          <div className="flex-1 space-y-3">
            {/* Name & Status */}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight">
                Full Name: {learner.name}
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#09A64A] border border-emerald-200">
                {learner.status || "Enrolled"}
              </span>
            </div>

            {/* Course & Batch */}
            <div className="flex flex-wrap items-center gap-2.5 text-[14.5px] font-semibold text-gray-700">
              <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                {learner.courseName
                  ? learner.courseName.replace(/_/g, " ")
                  : "Counselling Master Course"}
              </span>
              {learner.batchName && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
                  {learner.batchName}
                </span>
              )}
            </div>

            {/* Contact Information */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-sm text-gray-600">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#09A64A]" />
                Mobile: <strong className="text-gray-900 font-semibold">{learner.mobile}</strong>
              </span>
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#09A64A]" />
                Email: <strong className="text-gray-900 font-semibold">{learner.email}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 4 Clean Tabs Bar with Active Underline Indicator matching live Counsel India */}
        <div className="border-t border-gray-100 pt-4 -mb-2">
          <div className="flex items-center gap-6 sm:gap-9 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("personal")}
              className={`pb-3 text-[14px] font-bold transition-all cursor-pointer shrink-0 border-b-2 relative ${
                activeTab === "personal"
                  ? "text-[#09A64A] border-[#09A64A]"
                  : "text-gray-500 hover:text-gray-900 border-transparent"
              }`}
            >
              Personal Details
            </button>

            <button
              onClick={() => setActiveTab("address")}
              className={`pb-3 text-[14px] font-bold transition-all cursor-pointer shrink-0 border-b-2 relative ${
                activeTab === "address"
                  ? "text-[#09A64A] border-[#09A64A]"
                  : "text-gray-500 hover:text-gray-900 border-transparent"
              }`}
            >
              Address
            </button>

            <button
              onClick={() => setActiveTab("expectations")}
              className={`pb-3 text-[14px] font-bold transition-all cursor-pointer shrink-0 border-b-2 relative ${
                activeTab === "expectations"
                  ? "text-[#09A64A] border-[#09A64A]"
                  : "text-gray-500 hover:text-gray-900 border-transparent"
              }`}
            >
              Expectations from the Course
            </button>

            <button
              onClick={() => setActiveTab("academic")}
              className={`pb-3 text-[14px] font-bold transition-all cursor-pointer shrink-0 border-b-2 relative ${
                activeTab === "academic"
                  ? "text-[#09A64A] border-[#09A64A]"
                  : "text-gray-500 hover:text-gray-900 border-transparent"
              }`}
            >
              Academic Details
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Personal Details */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-7 sm:p-9">
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                DOB :
              </span>
              <span className="font-semibold text-gray-900 text-[14.5px]">
                {p.dob || "1989-02-08"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                Age :
              </span>
              <span className="font-semibold text-gray-900 text-[14.5px]">
                {p.age || 37}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                Academic Counselor Name :
              </span>
              <span className="font-bold text-[#09A64A] text-[14.5px]">
                {learner.academicCounselor || "Anand Prakash"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                Gender :
              </span>
              <span className="font-semibold text-gray-900 text-[14.5px]">
                {p.gender || "Female"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                Marital Status :
              </span>
              <span className="font-semibold text-gray-900 text-[14.5px]">
                {p.maritalStatus || "Married"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                Nationality :
              </span>
              <span className="font-semibold text-gray-900 text-[14.5px]">
                {p.nationality || "Indian"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                Aadhar Number :
              </span>
              <span className="font-mono font-semibold text-gray-900 text-[14.5px]">
                {p.aadharNumber || "9422-4733-8489"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                PAN Number :
              </span>
              <span className="font-mono font-semibold text-gray-900 text-[14.5px]">
                {p.panNumber || "ABCPS8912K"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                Category :
              </span>
              <span className="font-semibold text-gray-900 text-[14.5px]">
                {p.category || "General"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                Father&apos;s Name :
              </span>
              <span className="font-semibold text-gray-900 text-[14.5px]">
                {p.fatherName || "S K Dayananda Shetty"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-bold text-gray-500 text-[13px] uppercase tracking-wide">
                Father&apos;s Mobile :
              </span>
              <span className="font-semibold text-gray-900 text-[14.5px]">
                {p.fatherMobile || "9448123990"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Address */}
      {activeTab === "address" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Permanent Address */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-7 sm:p-9">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#09A64A]" />
              Permanent Address
            </h3>
            <div className="space-y-4">
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-wider block mb-1.5">
                  Address Line
                </span>
                <p className="font-semibold text-gray-800 text-[14.5px] leading-relaxed">
                  {addr.permanent || "Asha Nilaya Village Keyyuru Post Madavu, Near Merla Bus Stand"}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-400 text-xs uppercase block">City</span>
                  <span className="font-bold text-gray-900 text-sm mt-1 block">{addr.city || "Dakshina Kannada"}</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-400 text-xs uppercase block">State</span>
                  <span className="font-bold text-gray-900 text-sm mt-1 block">{addr.state || "Karnataka"}</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-400 text-xs uppercase block">Pincode</span>
                  <span className="font-bold text-gray-900 text-sm mt-1 block">{addr.pincode || "574210"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Correspondence Address */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-7 sm:p-9">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#09A64A]" />
              Correspondence Address
            </h3>
            <div className="space-y-4">
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-wider block mb-1.5">
                  Address Line
                </span>
                <p className="font-semibold text-gray-800 text-[14.5px] leading-relaxed">
                  {addr.correspondence || "Sector 62, Noida, Uttar Pradesh"}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-400 text-xs uppercase block">City</span>
                  <span className="font-bold text-gray-900 text-sm mt-1 block">{addr.city || "Noida"}</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-400 text-xs uppercase block">State</span>
                  <span className="font-bold text-gray-900 text-sm mt-1 block">{addr.state || "Uttar Pradesh"}</span>
                </div>
                <div className="p-3.5 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-400 text-xs uppercase block">Pincode</span>
                  <span className="font-bold text-gray-900 text-sm mt-1 block">{addr.pincode || "201309"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Expectations from the Course */}
      {activeTab === "expectations" && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-7 sm:p-9">
          <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#09A64A]" />
            Expectations from the Course
          </h3>

          <div className="space-y-3">
            {expectations.length > 0 ? (
              expectations.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="w-5.5 h-5.5 rounded-full bg-emerald-100 text-[#09A64A] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 leading-relaxed">
                    {item}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm">
                No course expectations recorded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Academic Details */}
      {activeTab === "academic" && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-7 sm:p-9">
          <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#09A64A]" />
            Academic Details
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-xs">
                  <th className="py-4 px-5">Level</th>
                  <th className="py-4 px-5">Course / Degree</th>
                  <th className="py-4 px-5">Institute</th>
                  <th className="py-4 px-5">Board / Univ</th>
                  <th className="py-4 px-5 text-center">Year</th>
                  <th className="py-4 px-5 text-center">Score / %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {education.length > 0 ? (
                  education.map((edu, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-5 font-bold text-gray-900 text-sm">
                        {edu.level || "Degree"}
                      </td>
                      <td className="py-4 px-5 font-semibold text-gray-800 text-sm">
                        {edu.courseName || "-"}
                      </td>
                      <td className="py-4 px-5 text-gray-600 text-sm">
                        {edu.instituteName || "-"}
                      </td>
                      <td className="py-4 px-5 text-gray-600 text-sm">
                        {edu.boardOrUniversity || "-"}
                      </td>
                      <td className="py-4 px-5 text-center font-medium text-gray-600 text-sm">
                        {edu.yearOfPassing || "-"}
                      </td>
                      <td className="py-4 px-5 text-center font-bold text-[#09A64A] text-sm">
                        {edu.scoreOrPercentage || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-medium text-sm">
                      No academic history recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
