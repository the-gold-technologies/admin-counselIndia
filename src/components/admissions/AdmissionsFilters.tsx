import React from "react";
import { Search, Download, Upload, Plus, Filter } from "lucide-react";

interface AdmissionsFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  course: string;
  onCourseChange: (val: string) => void;
  coursesList: string[];
  onOpenAddModal: () => void;
  onOpenUploadModal: () => void;
  onExportCSV: () => void;
}

export default function AdmissionsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  course,
  onCourseChange,
  coursesList,
  onOpenAddModal,
  onOpenUploadModal,
  onExportCSV,
}: AdmissionsFiltersProps) {
  const statusTabs = [
    "All",
    "Enrolled",
    "Verified",
    "Pending",
    "Completed",
    "Dropped",
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      {/* Top Bar: Search, Course dropdown, and Action buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search learner by name, email, mobile, or ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Course Filter Dropdown */}
        <div className="w-full lg:w-72">
          <select
            value={course}
            onChange={(e) => onCourseChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          >
            <option value="All">All Courses</option>
            {coursesList.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons matching live Counsel India actions: Add, Upload Excel, Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            title="Export current data to CSV"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#07a64b] hover:bg-[#068f40] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            title="Upload bulk learners via Excel"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload Excel</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Bottom Filter Pills: Status tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Status:
        </span>
        {statusTabs.map((tab) => {
          const isSelected = status === tab;
          return (
            <button
              key={tab}
              onClick={() => onStatusChange(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${isSelected ? "bg-emerald-600 text-white font-semibold shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
