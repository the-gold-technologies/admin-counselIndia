"use client";

import React, { useRef, useState } from "react";
import { CloudUpload, X, Eye, Loader2, RefreshCw } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  tooltip?: string;
  containerClassName?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = "Image",
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

  // Resolve display URL
  const displayUrl = value
    ? value.startsWith("http") || value.startsWith("/")
      ? value
      : `/uploads/${value}`
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
        accept="image/png, image/jpeg, image/webp, image/x-icon, image/vnd.microsoft.icon, .ico, .png, .jpg"
        className="hidden"
      />

      {value ? (
        /* Prominent Preview Card matching live admin */
        <div className="w-full border border-gray-200/90 rounded-2xl bg-white p-4 shadow-xs flex flex-col gap-3 group transition-all">
          <div className="flex items-center gap-4">
            {/* Visual Image Box with subtle background for transparency */}
            <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-2 relative">
              <img
                src={displayUrl}
                alt="Brand asset preview"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  // Fallback to live admin url if local fails
                  const filename = value.split("/").pop();
                  if (filename && !(e.target as HTMLImageElement).src.includes("adminassets")) {
                    (e.target as HTMLImageElement).src =
                      `https://admin.counselindia.com/project/public/adminassets/images/${filename}`;
                  }
                }}
              />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-gray-900 font-bold text-xs truncate">
                {value.split("/").pop() || "Active asset"}
              </span>
              <span className="text-[11px] text-[#09A64A] font-semibold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#09A64A] inline-block" />
                Active brand asset
              </span>
              <p className="text-[10px] text-gray-400 mt-1">Ready for browser and header display</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#09A64A] hover:text-white text-gray-700 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Replace File</span>
            </button>

            <div className="flex items-center gap-1.5">
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-500 hover:text-[#09A64A] hover:bg-emerald-50 transition-colors"
                title="View full image"
              >
                <Eye className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
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
              <span className="text-xs font-bold">Uploading file...</span>
            </div>
          ) : (
            <>
              <div
                className={`p-3 rounded-2xl shadow-2xs mb-2 transition-transform ${
                  isDragging
                    ? "bg-[#09A64A] text-white scale-110"
                    : "bg-white text-[#09A64A] group-hover:scale-105"
                }`}
              >
                <CloudUpload className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <p className="text-gray-700 text-xs font-semibold text-center mb-0.5">
                <span className="text-[#09A64A] font-bold hover:underline mr-1">Choose file</span>
                or drag & drop
              </p>
              <p className="text-gray-400 text-[10px] font-medium text-center">
                PNG, ICO, JPG, WEBP (Max 10MB)
              </p>
            </>
          )}
        </div>
      )}

      {uploadError && <span className="text-[11px] text-rose-500 font-medium">{uploadError}</span>}
    </div>
  );
};
