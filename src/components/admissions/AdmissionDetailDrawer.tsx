"use client";

import React, { useState } from "react";
import {
  X,
  User,
  MapPin,
  Target,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Shield,
  CreditCard,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface AdmissionDetailProps {
  admission: any | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export default function AdmissionDetailDrawer({
  admission,
  isOpen,
  onClose,
  onStatusChange,
}: AdmissionDetailProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "education" | "about" | "post"
  >("overview");

  if (!isOpen || !admission) return null;

  // Parse expectations & education if stored as string
  let expectations: string[] = [];
  try {
    expectations =
      typeof admission.courseExpectations === "string"
        ? JSON.parse(admission.courseExpectations)
        : admission.courseExpectations || [];
  } catch {
    expectations = [
      admission.courseExpectations || "Upskilling & professional competence",
    ];
  }

  let education: any[] = [];
  try {
    education =
      typeof admission.educationHistory === "string"
        ? JSON.parse(admission.educationHistory)
        : admission.educationHistory || [];
  } catch {
    education = [];
  }

  const p = admission.personalDetails || {};
  const addr = admission.address || {};

  const tabs = [
    { id: "overview", label: "Personal Details", icon: User },
    { id: "education", label: "Address", icon: MapPin },
    { id: "about", label: "Course Expectations", icon: Target },
    { id: "post", label: "Academic Qualifications", icon: GraduationCap },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-emerald-600/20">
                {admission.name?.slice(0, 2).toUpperCase() || "LR"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {admission.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {admission.status || "Enrolled"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {admission.courseName?.replace(/_/g, " ")}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Mail className="w-3 h-3 text-slate-400" />{" "}
                    {admission.email}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3 text-slate-400" />{" "}
                    {admission.mobile}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Tabs Bar matching liveCounsel India #overview, #education, #about, #post */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-200/80 -mb-6 pb-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 ${isActive ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Personal Details */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Candidate Identification & Demographics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Date of Birth
                    </span>
                    <span className="font-bold text-slate-800">
                      {p.dob || admission.dob || "1989-02-08"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Age
                    </span>
                    <span className="font-bold text-slate-800">
                      {p.age || admission.age || "37"} Years
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Gender
                    </span>
                    <span className="font-bold text-slate-800">
                      {p.gender || admission.gender || "Female"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Marital Status
                    </span>
                    <span className="font-bold text-slate-800">
                      {p.maritalStatus || admission.maritalStatus || "Married"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Nationality
                    </span>
                    <span className="font-bold text-slate-800">
                      {p.nationality || admission.nationality || "Indian"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Category
                    </span>
                    <span className="font-bold text-slate-800">
                      {p.category || admission.category || "General"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Aadhar Number
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {p.aadharNumber ||
                        admission.aadharNumber ||
                        "9422-4733-8489"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      PAN Card Number
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {p.panNumber || admission.panNumber || "ABCPS8912K"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Family & Academic Counselor */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Guardian & Assignment
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Father / Guardian Name
                    </span>
                    <span className="font-bold text-slate-800">
                      {p.fatherName ||
                        admission.fatherName ||
                        "S K Dayananda Shetty"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Father Mobile
                    </span>
                    <span className="font-bold text-slate-800">
                      {p.fatherMobile || admission.fatherMobile || "9448123990"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Academic Counselor
                    </span>
                    <span className="font-bold text-emerald-700">
                      {admission.academicCounselor || "Anand Prakash"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      Batch Allocation
                    </span>
                    <span className="font-bold text-slate-800">
                      {admission.batchName || "Batch Oct-2026 Alpha"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee Information */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                    Enrollment Fee Status
                  </span>
                  <span className="text-base font-extrabold text-emerald-950">
                    ₹{(admission.feeAmount || 44999).toLocaleString()} (
                    {admission.paymentStatus || "Paid"})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-700 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Admission</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Address Information */}
          {activeTab === "education" && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Permanent Address</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {addr.permanent ||
                    admission.permanentAddress ||
                    "Asha Nilaya Village Keyyuru Post Madavu, Near Merla Bus Stand"}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">
                      District / City
                    </span>
                    <span className="font-bold text-slate-800">
                      {addr.city || admission.city || "Dakshina Kannada"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">
                      State
                    </span>
                    <span className="font-bold text-slate-800">
                      {addr.state || admission.state || "Karnataka"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">
                      Pincode
                    </span>
                    <span className="font-bold text-slate-800">
                      {addr.pincode || admission.pincode || "574210"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Correspondence Address</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {addr.correspondence ||
                    admission.correspondenceAddress ||
                    "Sector 62, Noida, Uttar Pradesh"}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Course Expectations */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>Learner Course Expectations & Professional Goals</span>
                </h4>
                <div className="space-y-2.5 mt-3">
                  {expectations.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No expectations specified.
                    </p>
                  ) : (
                    expectations.map((exp, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-800 font-medium shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{exp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Academic Details */}
          {activeTab === "post" && (
            <div className="space-y-4">
              {education.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  No detailed qualifications listed.
                </div>
              ) : (
                education.map((edu, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        {edu.level || "Academic Tier"}
                      </span>
                      {edu.scoreOrPercentage && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          Score: {edu.scoreOrPercentage}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-500 text-[11px] block">
                          Course Name
                        </span>
                        <span className="font-semibold text-slate-800">
                          {edu.courseName || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">
                          Institution / College
                        </span>
                        <span className="font-semibold text-slate-800">
                          {edu.instituteName || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">
                          Board / University
                        </span>
                        <span className="font-semibold text-slate-800">
                          {edu.boardOrUniversity || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">
                          Passing Year
                        </span>
                        <span className="font-semibold text-slate-800">
                          {edu.yearOfPassing || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Update Status:
            </span>
            <select
              value={admission.status}
              onChange={(e) =>
                onStatusChange && onStatusChange(admission.id, e.target.value)
              }
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Enrolled">Enrolled</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
