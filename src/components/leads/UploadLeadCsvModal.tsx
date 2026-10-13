"use client";

import React, { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  PlusCircle,
  Eye,
} from "lucide-react";
import { parseCsvText } from "@/lib/csvParser";

const CATEGORIES = [
  { slug: "subscription", label: "Subscribe" },
  { slug: "landing-page", label: "Landing Pages" },
  { slug: "exit-intent", label: "Exit Intent" },
  { slug: "contact-us", label: "Contact Us" },
  { slug: "book-session", label: "Book a Session" },
  { slug: "ci-business", label: "Ci For Business" },
  { slug: "personality-test", label: "Personality Test" },
  { slug: "ebook", label: "Ebook" },
  { slug: "newsletter", label: "Newsletter" },
  { slug: "courses-enquiry", label: "Courses Enquiry" },
  { slug: "utm-data", label: "utm data" },
  { slug: "landing-page-utm", label: "Landing Page UTM" },
  { slug: "course-registration", label: "course registeration" },
  { slug: "ask-question", label: "Ask Question" },
  { slug: "app-data", label: "App Data" },
  { slug: "certificate-data", label: "certificate_data" },
  { slug: "leadform-data", label: "leadform data" },
  { slug: "refer-enquiry", label: "Refer Enquiry" },
];

interface UploadLeadCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory: string;
  accentColor?: string;
  onSuccess: () => void;
}

export default function UploadLeadCsvModal({
  isOpen,
  onClose,
  defaultCategory,
  accentColor = "#10b981",
  onSuccess,
}: UploadLeadCsvModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [totalEstimatedRows, setTotalEstimatedRows] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedCategory whenever defaultCategory changes or modal opens
  useEffect(() => {
    if (defaultCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleFileSelection = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setUploadResult({
        success: false,
        message: "Please select a valid .csv file.",
      });
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);

    // Read first few chunks for instant client-side preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || "";
      try {
        const parsed = parseCsvText(content);
        if (parsed.headers.length > 0) {
          setTotalEstimatedRows(parsed.totalRows);
          setPreviewHeaders(parsed.headers);
          const sample = parsed.rows.slice(0, 5).map((rowObj) => {
            return parsed.headers.map((h) => rowObj[h] ?? "");
          });
          setPreviewRows(sample);
        }
      } catch (err) {
        console.error("Failed to parse CSV preview:", err);
      }
    };
    reader.readAsText(selectedFile);
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const uploadUrl = `/api/leads/upload?category=${encodeURIComponent(selectedCategory)}&mode=${encodeURIComponent(mode)}`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/csv",
        },
        body: file,
      });

      const data = await res.json();

      if (data.success) {
        setUploadResult({
          success: true,
          message: data.message || `Successfully imported ${data.count} leads!`,
          count: data.count,
        });
        onSuccess();
      } else {
        setUploadResult({
          success: false,
          message: data.error || "Upload failed. Please try again.",
        });
      }
    } catch (err: any) {
      setUploadResult({
        success: false,
        message: err.message || "Network error occurred during upload.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setPreviewRows([]);
    setPreviewHeaders([]);
    setTotalEstimatedRows(0);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: `${accentColor}18`, color: accentColor }}
            >
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Import Leads from CSV</h2>
              <p className="text-xs text-gray-500">
                Upload CSV exports directly into your database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Category & Mode Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Target Category Tab
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Import Behavior
              </label>
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setMode("append")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    mode === "append"
                      ? "bg-white shadow-sm text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Append
                </button>
                <button
                  type="button"
                  onClick={() => setMode("replace")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    mode === "replace"
                      ? "bg-rose-50 border border-rose-200 text-rose-700 font-bold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                  Replace All
                </button>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/40"
                  : "border-gray-200 bg-gray-50/40 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={onFileInputChange}
                className="hidden"
              />
              <div
                className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-sm"
                style={{ background: `${accentColor}15`, color: accentColor }}
              >
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">
                Click to browse or drag & drop CSV file
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Supports Counsel India live CSV exports (Id, Name, Email, Phone Number, etc.)
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 shadow-2xs">
                <span>Any file size supported</span> • <span>Bulk import</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Card */}
              <div className="flex items-center justify-between p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                      <span className="font-semibold text-emerald-700">
                        {totalEstimatedRows.toLocaleString()} rows detected
                      </span>
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    onClick={resetFile}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Data Preview */}
              {previewRows.length > 0 && (
                <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="px-3.5 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      Preview (First 5 Rows)
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {previewHeaders.length} columns
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                          {previewHeaders.map((h, i) => (
                            <th key={i} className="py-2 px-3 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {previewRows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-gray-50/40">
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="py-2 px-3 whitespace-nowrap max-w-[150px] truncate"
                              >
                                {cell || <span className="text-gray-300 italic">empty</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Status Alert */}
          {uploadResult && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 border ${
                uploadResult.success
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                  : "bg-rose-50/60 border-rose-200 text-rose-800"
              }`}
            >
              {uploadResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <p className="font-bold">
                  {uploadResult.success ? "Import Complete!" : "Import Failed"}
                </p>
                <p className="mt-0.5 opacity-90">{uploadResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {uploadResult?.success ? "Close" : "Cancel"}
          </button>

          <div className="flex items-center gap-2">
            {uploadResult?.success ? (
              <button
                type="button"
                onClick={() => {
                  resetFile();
                }}
                className="px-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-gray-500" />
                Upload Another File
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              style={{ background: accentColor }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold shadow-md hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing Data...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Start Import
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
