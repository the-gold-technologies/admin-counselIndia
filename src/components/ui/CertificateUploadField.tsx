"use client";

import React, { useRef, useState } from "react";
import { FileText, CloudUpload, X, Eye, Loader2, CheckCircle2 } from "lucide-react";

interface CertificateUploadFieldProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  containerClassName?: string;
}

export const CertificateUploadField: React.FC<CertificateUploadFieldProps> = ({
  label = "Proof of CV / Certificate",
  value = "",
  onChange,
  containerClassName = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (value && typeof value === "string" && value.includes("cloudinary.com")) {
        formData.append("oldUrl", value);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        const localUrl = URL.createObjectURL(file);
        onChange(localUrl);
      }
    } catch {
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    if (value && typeof value === "string" && value.includes("cloudinary.com")) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      }).catch((err) => console.warn("Failed to delete Cloudinary file:", err));
    }
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isPdf = typeof value === "string" && (value.endsWith(".pdf") || value.includes("application/pdf"));
  const displayName =
    typeof value === "string" && value
      ? value.split("/").pop() || "Uploaded Certificate"
      : "";

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
          {label}
        </label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        accept=".pdf,image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {value ? (
        /* Preview Card */
        <div className="w-full border border-gray-200 rounded-2xl bg-white p-3.5 shadow-2xs flex items-center justify-between gap-4 group">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0 flex items-center justify-center text-[#09A64A]">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-gray-900 font-bold text-xs truncate max-w-[220px]">
                {displayName}
              </span>
              <span className="text-[11px] text-[#09A64A] font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Certificate / CV attached</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={value ? encodeURI(decodeURI(value)) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:text-[#09A64A] hover:bg-emerald-50 transition-colors"
              title="View document"
            >
              <Eye className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remove document"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone matching Kumar Power CMS style */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer group ${
            isDragging
              ? "border-[#09A64A] bg-emerald-50/50"
              : "border-gray-200 bg-gray-50/60 hover:bg-gray-100/70 hover:border-gray-300"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-[#09A64A]">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-bold">Uploading certificate...</span>
            </div>
          ) : (
            <>
              <div
                className={`p-3 rounded-2xl shadow-2xs mb-3 transition-transform ${
                  isDragging
                    ? "bg-[#09A64A] text-white scale-110"
                    : "bg-white text-[#09A64A] group-hover:scale-105"
                }`}
              >
                <CloudUpload className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <p className="text-gray-700 text-xs font-semibold text-center mb-1">
                <span className="text-[#09A64A] font-bold hover:underline mr-1">
                  Click to upload
                </span>
                or drag and drop
              </p>
              <p className="text-gray-400 text-[11px] font-medium text-center">
                PDF, PNG, JPG (Max 25MB)
              </p>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <span className="text-[11px] text-rose-500 font-medium">
          {uploadError}
        </span>
      )}
    </div>
  );
};
