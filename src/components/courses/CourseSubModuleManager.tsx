"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  X,
  Sparkles,
  Layers,
  Award,
  ListOrdered,
  Image as ImageIcon,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  ExternalLink,
  Check,
} from "lucide-react";
import { Course, SubModuleItem } from "@/types/course";
import { generateSubModulePdf } from "@/lib/generateSubModulePdf";

interface Props {
  courseId: string;
  moduleKey: "overview" | "learning-objectives" | "credentials" | "curriculum";
  moduleTitle: string;
  moduleSubtitle: string;
  dataField: "overviewData" | "learnData" | "credentialData" | "curriculumData";
  countField: "overviewCount" | "learnCount" | "credentialCount" | "curriculumCount";
  defaultType: string;
  typeOptions?: string[];
}

export default function CourseSubModuleManager({
  courseId,
  moduleKey,
  moduleTitle,
  moduleSubtitle,
  dataField,
  countField,
  defaultType,
  typeOptions = [],
}: Props) {
  const [course, setCourse] = useState<Course | null>(null);
  const [items, setItems] = useState<SubModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemType, setItemType] = useState(defaultType);
  const [itemPosition, setItemPosition] = useState("1");
  const [itemStatus, setItemStatus] = useState("Active");
  const [itemImage, setItemImage] = useState("");

  // Upload Excel Modal State
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"append" | "replace">("append");
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [excelError, setExcelError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to load course details");
      const data: Course = await res.json();
      setCourse(data);
      const subItems = (data[dataField] as SubModuleItem[]) || [];
      const sorted = [...subItems].sort((a, b) => {
        const posA = Number(a.position) || 0;
        const posB = Number(b.position) || 0;
        return posA - posB;
      });
      setItems(sorted);
    } catch (err: any) {
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (it) =>
        (it.title || "").toLowerCase().includes(q) ||
        (it.type || "").toLowerCase().includes(q) ||
        String(it.position || "").includes(q) ||
        (it.status || "").toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Total pages
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const startEntry = filteredItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endEntry = Math.min(currentPage * pageSize, filteredItems.length);

  // Pagination page buttons helper
  const getPaginationRange = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const range: (number | string)[] = [];
    const delta = 1;
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setItemTitle("");
    setItemType(defaultType);
    setItemPosition(String(items.length + 1));
    setItemStatus("Active");
    setItemImage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (globalIndex: number) => {
    const it = items[globalIndex];
    if (!it) return;
    setEditingIndex(globalIndex);
    setItemTitle(it.title || "");
    setItemType(it.type || defaultType);
    setItemPosition(String(it.position || globalIndex + 1));
    setItemStatus(it.status || "Active");
    setItemImage(it.image || "");
    setIsModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemTitle.trim()) {
      alert("Please enter a title or description");
      return;
    }

    const newItem: SubModuleItem = {
      title: itemTitle.trim(),
      type: itemType.trim() || defaultType,
      position: itemPosition || String(items.length + 1),
      status: itemStatus || "Active",
      image: itemImage || "",
    };

    let updatedList: SubModuleItem[] = [];
    if (editingIndex !== null) {
      updatedList = items.map((it, idx) => (idx === editingIndex ? newItem : it));
    } else {
      updatedList = [...items, newItem];
    }

    await persistList(
      updatedList,
      editingIndex !== null ? "Item updated successfully!" : "New item added successfully!"
    );
    setIsModalOpen(false);
  };

  const handleDeleteItem = async (globalIndex: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const updatedList = items.filter((_, idx) => idx !== globalIndex);
    await persistList(updatedList, "Item deleted successfully!");
  };

  const handleToggleStatus = async (globalIndex: number) => {
    const updatedList = items.map((it, idx) => {
      if (idx === globalIndex) {
        const current = (it.status || "Active").toLowerCase();
        return {
          ...it,
          status: current === "active" ? "Inactive" : "Active",
        };
      }
      return it;
    });
    await persistList(updatedList, "Status toggled!");
  };

  const persistList = async (updatedList: SubModuleItem[], successMsg: string) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [dataField]: updatedList,
          [countField]: updatedList.length,
        }),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      setItems(updatedList);
      setSuccess(successMsg);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update sub-module items");
    } finally {
      setSaving(false);
    }
  };

  // 1. Export CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (items.length === 0) {
      alert("No items to export");
      return;
    }
    const headers = ["#ID", "Type", "Title", "Position", "Status", "Image"];
    const rows = items.map((it, idx) => [
      idx + 1,
      `"${(it.type || defaultType).replace(/"/g, '""')}"`,
      `"${(it.title || "").replace(/"/g, '""')}"`,
      it.position || idx + 1,
      it.status || "Active",
      `"${(it.image || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${course?.slug || "course"}_${moduleKey}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Export Excel (.xls HTML table format with UTF-8 BOM)
  const handleExportExcel = () => {
    if (items.length === 0) {
      alert("No items to export");
      return;
    }
    const rowsHtml = items
      .map(
        (it, idx) => `<tr>
          <td style="text-align: center; border: 1px solid #ccc; padding: 6px;">${idx + 1}</td>
          <td style="border: 1px solid #ccc; padding: 6px;">${(it.type || defaultType).replace(/</g, "&lt;")}</td>
          <td style="border: 1px solid #ccc; padding: 6px;">${(it.title || "").replace(/</g, "&lt;")}</td>
          <td style="text-align: center; border: 1px solid #ccc; padding: 6px;">${it.position || idx + 1}</td>
          <td style="text-align: center; border: 1px solid #ccc; padding: 6px;">${it.status || "Active"}</td>
          <td style="border: 1px solid #ccc; padding: 6px;">${(it.image || "").replace(/</g, "&lt;")}</td>
        </tr>`
      )
      .join("");

    const excelHtml = `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
      </head>
      <body>
        <h3>Counsel India - ${moduleTitle}</h3>
        <p>Course: ${course?.name || ""} | Total Items: ${items.length}</p>
        <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif;">
          <thead>
            <tr style="background-color: #1f2937; color: #ffffff;">
              <th style="padding: 8px; border: 1px solid #ccc;">#ID</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Type</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Title</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Position</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Status</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Image</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
    </html>`;

    const blob = new Blob([excelHtml], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${course?.slug || "course"}_${moduleKey}_${Date.now()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 3. Export PDF using jsPDF
  const handleExportPDF = () => {
    if (items.length === 0) {
      alert("No items to export");
      return;
    }
    generateSubModulePdf(items, course?.name || "Course", moduleTitle, course?.slug || "course");
  };

  // 4. Print Handler matching Course Leads and Counsellors dedicated print window
  const handlePrint = () => {
    if (items.length === 0) {
      alert("No items to print");
      return;
    }

    const printWin = window.open("", "_blank", "width=1000,height=800");
    if (!printWin) return;

    const escapeHtml = (str?: string | null) => {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const rowsHtml = items
      .map((item, idx) => {
        const id = idx + 1;
        const type = escapeHtml(item.type || defaultType);
        const title = escapeHtml(item.title || "");
        const pos = escapeHtml(String(item.position || idx + 1));
        const status = escapeHtml(item.status || "Active");
        const image = escapeHtml(item.image || "No-image");

        return `<tr>
          <td style="text-align: center; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #4b5563; vertical-align: middle;">${id}</td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 12px; font-family: monospace; color: #374151; vertical-align: middle;">${type}</td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.5; color: #111827; vertical-align: middle;">${title}</td>
          <td style="text-align: center; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #374151; vertical-align: middle;">${pos}</td>
          <td style="text-align: center; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 12px; font-weight: bold; color: ${status.toLowerCase() === "active" ? "#09a64a" : "#6b7280"}; vertical-align: middle;">${status}</td>
          <td style="text-align: center; padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 11px; color: #6b7280; vertical-align: middle; max-width: 140px; word-break: break-all;">${image}</td>
        </tr>`;
      })
      .join("");

    printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Exported data - ${escapeHtml(moduleTitle)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px 30px;
            color: #222;
            margin: 0;
          }
          .header {
            margin-bottom: 20px;
          }
          h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 6px 0;
            color: #111;
          }
          .course-info {
            font-size: 14px;
            font-weight: 600;
            color: #09a64a;
            margin-bottom: 6px;
          }
          .meta {
            font-size: 13px;
            color: #666;
            margin-bottom: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e2e8f0;
          }
          th {
            background-color: #1f2937;
            color: #ffffff;
            border: 1px solid #374151;
            padding: 10px 12px;
            font-size: 13px;
            font-weight: bold;
            text-align: left;
          }
          th.center {
            text-align: center;
          }
          @media print {
            body {
              padding: 10px;
            }
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Exported data - ${escapeHtml(moduleTitle)}</h1>
          <div class="course-info">Course: ${escapeHtml(course?.name || "Counsel India Course")}</div>
          <div class="meta">
            Total: <strong>${items.length}</strong> records | Printed on: ${new Date().toLocaleDateString()}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th class="center" style="width: 50px;">#ID</th>
              <th style="width: 120px;">Type</th>
              <th>Title / Description</th>
              <th class="center" style="width: 60px;">Position</th>
              <th class="center" style="width: 80px;">Status</th>
              <th class="center" style="width: 140px;">Image</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
    `);
    printWin.document.close();
  };

  // 5. Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const headers = ["Type", "Title", "Position", "Status", "Image"];
    const sampleRows = [
      [
        `"${defaultType}"`,
        `"Comprehensive Curriculum The program offers a broad..."`,
        "1",
        "Active",
        `""`,
      ],
      [
        `"${defaultType}"`,
        `"Expert-Led Classes Classes are delivered by seasoned professionals..."`,
        "2",
        "Active",
        `""`,
      ],
    ];
    const csvContent =
      "\uFEFF" + [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${moduleKey}_sample_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 6. Parse and Upload CSV File
  const handleExcelUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) {
      setExcelError("Please select a CSV or Excel file to upload.");
      return;
    }
    setExcelError("");
    setUploadingExcel(true);

    try {
      const text = await excelFile.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        throw new Error("File contains no data rows. Please use the template format.");
      }

      // Simple CSV line parser supporting quoted values
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headerCols = parseCSVLine(lines[0]).map((h) =>
        h.toLowerCase().replace(/[^a-z0-9]/g, "")
      );
      const titleColIdx = headerCols.findIndex(
        (h) => h.includes("title") || h.includes("description") || h.includes("name")
      );
      const typeColIdx = headerCols.findIndex((h) => h.includes("type"));
      const posColIdx = headerCols.findIndex((h) => h.includes("pos"));
      const statusColIdx = headerCols.findIndex((h) => h.includes("status"));
      const imgColIdx = headerCols.findIndex((h) => h.includes("img") || h.includes("image"));

      const parsedItems: SubModuleItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length === 0 || cols.every((c) => !c.trim())) continue;

        const title =
          titleColIdx !== -1 && cols[titleColIdx] ? cols[titleColIdx] : cols[1] || cols[0] || "";
        if (!title.trim()) continue;

        const type = typeColIdx !== -1 && cols[typeColIdx] ? cols[typeColIdx] : defaultType;
        const pos =
          posColIdx !== -1 && cols[posColIdx] ? cols[posColIdx] : String(parsedItems.length + 1);
        const status = statusColIdx !== -1 && cols[statusColIdx] ? cols[statusColIdx] : "Active";
        const img = imgColIdx !== -1 && cols[imgColIdx] ? cols[imgColIdx] : "";

        parsedItems.push({
          title: title.trim(),
          type: type.trim() || defaultType,
          position: pos.trim(),
          status: status.trim() || "Active",
          image: img.trim(),
        });
      }

      if (parsedItems.length === 0) {
        throw new Error(
          "Could not parse any valid items from file. Please ensure title/content column is present."
        );
      }

      const finalList = uploadMode === "append" ? [...items, ...parsedItems] : parsedItems;
      await persistList(
        finalList,
        `Successfully imported ${parsedItems.length} items from ${excelFile.name}!`
      );

      setIsExcelModalOpen(false);
      setExcelFile(null);
    } catch (err: any) {
      setExcelError(err.message || "Failed to parse file. Please verify CSV format.");
    } finally {
      setUploadingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-gray-500 gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-[#09A64A]" />
        <p className="text-sm font-semibold text-gray-600">Loading {moduleTitle}...</p>
      </div>
    );
  }

  // Live Portal Header Titles mapping
  const livePortalHeading =
    moduleKey === "overview"
      ? "Course Key Features / Key Differentiations List"
      : moduleKey === "learning-objectives"
        ? "Course Learning Objectives / Clinical Competencies List"
        : moduleKey === "credentials"
          ? "Course Certifications / Credentials List"
          : "Course Curriculum / Syllabus Modules List";

  return (
    <div className="space-y-6">
      {/* Top Header matching Live Portal: Title on left, Action buttons on right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <Link
              href="/courses"
              className="hover:text-gray-800 transition-colors flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Courses</span>
            </Link>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-[260px] font-medium">{course?.name}</span>
            <span>/</span>
            <span className="text-[#09A64A] font-bold">{moduleTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {livePortalHeading}
          </h1>
        </div>

        {/* Top Right Action Buttons matching Live Portal: Upload Excel & Add */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setExcelFile(null);
              setExcelError("");
              setIsExcelModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-[#09A64A] hover:bg-[#07883b] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-lg bg-[#09A64A] hover:bg-[#07883b] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add</span>
          </button>
        </div>
      </div>

      {/* Course Context Card & Quick Tabs */}
      {course && (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-md px-2.5 py-0.5">
                {course.category || "General"}
              </span>
              {course.liveId && (
                <span className="text-xs font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                  ID: #{course.liveId}
                </span>
              )}
              <span className="text-xs text-gray-400 font-mono">slug: {course.slug}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {course.name}
            </h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-2xl">{moduleSubtitle}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href={`/courses/${courseId}/edit`}
              className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Course</span>
            </Link>

            {/* Quick Sub-Module Nav Tabs */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <Link
                href={`/courses/${courseId}/overview`}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  moduleKey === "overview"
                    ? "bg-[#09A64A] text-white shadow-xs font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Overview</span>
              </Link>
              <Link
                href={`/courses/${courseId}/learning-objectives`}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  moduleKey === "learning-objectives"
                    ? "bg-[#09A64A] text-white shadow-xs font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Objectives</span>
              </Link>
              <Link
                href={`/courses/${courseId}/credentials`}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  moduleKey === "credentials"
                    ? "bg-[#09A64A] text-white shadow-xs font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Credentials</span>
              </Link>
              <Link
                href={`/courses/${courseId}/curriculum`}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  moduleKey === "curriculum"
                    ? "bg-[#09A64A] text-white shadow-xs font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Curriculum</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Table Card matching Live Portal layout in Screenshot 1 */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-4">
        {/* Row matching Screenshot 1: Dark Action buttons on left, Search on right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Action buttons matching Screenshot 1: CSV, Excel, PDF, Print */}
          <div className="flex items-center gap-1 bg-[#1f2937] p-1 rounded-lg shadow-2xs">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-md text-white hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
              title="Export as CSV"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-md text-white hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
              title="Export as Excel"
            >
              Excel
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3.5 py-1.5 rounded-md text-white hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
              title="Export as PDF"
            >
              PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-md text-white hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
              title="Print Table"
            >
              Print
            </button>
          </div>

          {/* Search Box matching Screenshot 1 */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-700">Search:</span>
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder=""
                className="w-full h-9 px-3 text-xs rounded-lg border border-gray-300 bg-white hover:border-[#09A64A] focus:border-[#09A64A] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table matching Screenshot 1 Columns */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#1f2937] text-white font-bold text-xs tracking-wider border-b border-gray-300 select-none">
                <th className="py-3 px-3.5 w-14 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>#ID</span>
                    <span className="text-[10px] opacity-70">⇅</span>
                  </div>
                </th>
                <th className="py-3 px-3.5 w-36">
                  <div className="flex items-center gap-1">
                    <span>Type</span>
                    <span className="text-[10px] opacity-70">⇅</span>
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <span>Title</span>
                    <span className="text-[10px] opacity-70">⇅</span>
                  </div>
                </th>
                <th className="py-3 px-2 text-center w-16">
                  <div className="flex items-center justify-center gap-1">
                    <span>Icon</span>
                    <span className="text-[10px] opacity-70">⇅</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-20">
                  <div className="flex items-center justify-center gap-1">
                    <span>Position</span>
                    <span className="text-[10px] opacity-70">⇅</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-24">
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    <span className="text-[10px] opacity-70">⇅</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-28">
                  <div className="flex items-center justify-center gap-1">
                    <span>Image</span>
                    <span className="text-[10px] opacity-70">⇅</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-24">
                  <div className="flex items-center justify-center gap-1">
                    <span>Action</span>
                    <span className="text-[10px] opacity-70">⇅</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-400">
                    <p className="font-semibold text-gray-600 mb-1">No matching records found</p>
                    <p className="text-xs text-gray-400 mb-3">
                      {searchQuery
                        ? "Try clearing your search query"
                        : "Upload an Excel file or click + Add to create items"}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#09A64A] hover:bg-[#07883b] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Item</span>
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, pIndex) => {
                  const globalIndex = (currentPage - 1) * pageSize + pIndex;
                  const isActive = (item.status || "Active").toLowerCase() === "active";
                  const imageUrl = item.image ? encodeURI(decodeURI(item.image)) : "";

                  return (
                    <tr
                      key={globalIndex}
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      {/* #ID */}
                      <td className="py-3.5 px-3.5 text-center font-bold text-gray-600 text-xs">
                        {globalIndex + 1}
                      </td>

                      {/* Type (e.g. key_features) */}
                      <td className="py-3.5 px-3.5">
                        <span className="text-xs font-medium text-gray-800">
                          {item.type || defaultType}
                        </span>
                      </td>

                      {/* Title (Full content description - natural wrapping) */}
                      <td className="py-3.5 px-4">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                          {item.title}
                        </p>
                      </td>

                      {/* Icon */}
                      <td className="py-3.5 px-2 text-center text-xs text-gray-400">-</td>

                      {/* Position */}
                      <td className="py-3.5 px-3 text-center text-xs font-bold text-gray-700">
                        {item.position || globalIndex + 1}
                      </td>

                      {/* Status (Clickable Green Active badge matching Screenshot 1) */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(globalIndex)}
                          className={`px-3 py-1 rounded text-xs font-bold text-white transition-all cursor-pointer shadow-2xs active:scale-95 ${
                            isActive
                              ? "bg-[#09A64A] hover:bg-[#07883b]"
                              : "bg-gray-400 hover:bg-gray-500"
                          }`}
                          title="Click to toggle status"
                        >
                          {isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Image Thumbnail / No-image placeholder matching Screenshot 1 */}
                      <td className="py-3.5 px-3 text-center">
                        {imageUrl ? (
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block group"
                            title="Click to view full image"
                          >
                            <div className="w-12 h-12 rounded border border-gray-200 bg-gray-50 overflow-hidden mx-auto flex items-center justify-center group-hover:ring-2 group-hover:ring-[#09A64A] transition-all">
                              <img
                                src={imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">No-image</span>
                        )}
                      </td>

                      {/* Action: Amber Edit & Rose Delete Buttons matching Screenshot 1 */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(globalIndex)}
                            className="w-7 h-7 rounded bg-[#F59E0B] hover:bg-[#D97706] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(globalIndex)}
                            className="w-7 h-7 rounded bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Pagination matching Screenshot 1 */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-medium pt-2 gap-3">
          <div className="flex items-center gap-3">
            <span>
              Showing {startEntry} to {endEntry} of {filteredItems.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-gray-300 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-[#09A64A] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Pagination controls - ALWAYS rendered with Prev, Numbers, Next */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 rounded border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
            >
              Previous
            </button>

            {getPaginationRange().map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-1 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(Number(p))}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === p
                      ? "bg-[#09A64A] text-white shadow-2xs"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Upload Excel / CSV Modal */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Upload Excel / CSV - {moduleTitle}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bulk import records for {course?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleExcelUploadSubmit} className="p-6 space-y-4">
              {/* Sample Template Download Box */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Need the upload format?</h4>
                  <p className="text-[11px] text-emerald-700">
                    Download sample CSV template with required columns
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-lg bg-[#09A64A] hover:bg-[#07883b] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* File Drop Area */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Select File (.csv, .xlsx, .xls) *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    excelFile
                      ? "border-[#09A64A] bg-emerald-50/30"
                      : "border-gray-300 hover:border-[#09A64A] bg-gray-50/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .xlsx, .xls, text/csv, application/vnd.ms-excel"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setExcelFile(e.target.files[0]);
                        setExcelError("");
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#09A64A] flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  {excelFile ? (
                    <div>
                      <p className="text-xs font-bold text-gray-800">{excelFile.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {(excelFile.size / 1024).toFixed(1)} KB &bull; Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Click to browse or drag and drop file here
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Supported: CSV, Excel (.xlsx, .xls)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Import Mode: Append or Replace */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Import Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`border rounded-xl p-3 flex items-start gap-2.5 cursor-pointer transition-colors ${
                      uploadMode === "append"
                        ? "border-[#09A64A] bg-emerald-50/40 text-emerald-900"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="uploadMode"
                      value="append"
                      checked={uploadMode === "append"}
                      onChange={() => setUploadMode("append")}
                      className="mt-0.5 text-[#09A64A] focus:ring-[#09A64A]"
                    />
                    <div>
                      <div className="text-xs font-bold">Append Items</div>
                      <div className="text-[10px] text-gray-500">Add rows to existing items</div>
                    </div>
                  </label>

                  <label
                    className={`border rounded-xl p-3 flex items-start gap-2.5 cursor-pointer transition-colors ${
                      uploadMode === "replace"
                        ? "border-rose-400 bg-rose-50/40 text-rose-900"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="uploadMode"
                      value="replace"
                      checked={uploadMode === "replace"}
                      onChange={() => setUploadMode("replace")}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold">Replace All</div>
                      <div className="text-[10px] text-gray-500">Overwrite existing list</div>
                    </div>
                  </label>
                </div>
              </div>

              {excelError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{excelError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingExcel || !excelFile}
                  className="px-5 py-2 rounded-xl bg-[#09A64A] hover:bg-[#07883b] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {uploadingExcel ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import Records</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <h3 className="font-bold text-gray-900 text-base">
                {editingIndex !== null ? "Edit Item" : "Add New Item"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Title / Content *
                </label>
                <textarea
                  rows={3}
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="Enter title or feature description..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#09A64A] focus:ring-2 focus:ring-[#09A64A]/10 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Type
                  </label>
                  {typeOptions.length > 0 ? (
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#09A64A] font-semibold text-gray-800 bg-white"
                    >
                      {typeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      placeholder="e.g. key_features"
                      className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#09A64A]"
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Position
                  </label>
                  <input
                    type="number"
                    value={itemPosition}
                    onChange={(e) => setItemPosition(e.target.value)}
                    min="1"
                    className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#09A64A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setItemStatus(itemStatus === "Active" ? "Inactive" : "Active")}
                    className={`w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      itemStatus === "Active"
                        ? "bg-[#09A64A] text-white shadow-2xs"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {itemStatus === "Active" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <span>Inactive</span>
                    )}
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    placeholder="https://... or /images/..."
                    className="w-full h-10 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#09A64A]"
                  />
                </div>
              </div>

              {itemImage && (
                <div className="p-2 border border-gray-200 rounded-xl bg-gray-50 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0">
                    <img
                      src={encodeURI(decodeURI(itemImage))}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-700 truncate">{itemImage}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Image preview</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItemImage("")}
                    className="p-1 text-gray-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveItem}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#09A64A] hover:bg-[#07883b] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Item</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
