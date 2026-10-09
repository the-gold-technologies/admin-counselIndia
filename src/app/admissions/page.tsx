"use client";

import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import AdmissionsTable, {
  formatAdmissionDateTime,
} from "@/components/admissions/AdmissionsTable";
import { INITIAL_ADMISSIONS } from "@/lib/initialData";

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admissions");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setAdmissions(json.data);
      } else {
        setAdmissions(INITIAL_ADMISSIONS);
      }
    } catch {
      setAdmissions(INITIAL_ADMISSIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  // Export to CSV matching the live Export button
  const handleExportCSV = () => {
    const headers = ["S.No", "Name", "Email", "Mobile", "Course Name", "Date"];
    const rows = admissions.map((a, i) => [
      a.sNo || i + 1,
      "\"" + a.name + "\"",
      a.email,
      a.mobile,
      "\"" + a.courseName + "\"",
      "\"" + formatAdmissionDateTime(a.admissionDate) + "\"",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "counselindia_learner_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pt-1">
      {/* Top Header: Title with descriptive subtitle and Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0B0F29] tracking-tight">
            Learner List
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage verified student admissions, track enrollments, and export learner records.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1f2937] hover:bg-[#111827] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* Main Table: S.No, Name, Email, Mobile, Course Name, Date with Time, Action */}
      <AdmissionsTable admissions={admissions} />
    </div>
  );
}
