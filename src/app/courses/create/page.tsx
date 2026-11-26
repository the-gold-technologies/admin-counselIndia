"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import {
  CourseForm,
  CourseFormValues,
  CourseWebsiteChecklist,
  emptyCourseValues,
  toCoursePayload,
  validateCourseValues,
} from "@/components/courses/CourseForm";

export default function CreateCoursePage() {
  const router = useRouter();
  const [values, setValues] = useState<CourseFormValues>(emptyCourseValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, continueToModules: boolean = true) => {
    if (e) e.preventDefault();
    const problem = validateCourseValues(values);
    if (problem) {
      setError(problem);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      setError("");

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toCoursePayload(values)),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to create course");
      }

      const newCourse = await res.json();
      setSuccess(true);

      setTimeout(() => {
        if (continueToModules && newCourse?.id) {
          router.push(`/courses/${newCourse.id}/edit?tab=overview&created=1`);
        } else {
          router.push("/courses");
        }
      }, 700);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating course");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Sticky header & save bar */}
      <div className="sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-md py-3 -mt-3 border-b border-gray-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Courses</span>
          </Link>
          <div className="min-w-0 hidden sm:block">
            <div className="text-[11px] text-gray-400 font-semibold truncate">
              New Course &bull; Step 1 of 2
            </div>
            <div className="text-xs font-bold text-gray-900 truncate max-w-xs md:max-w-md">
              {values.name || "Untitled Course"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {success && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Created!</span>
            </span>
          )}
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            Save &amp; Exit
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-[#09A64A] hover:bg-[#078a3d] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save &amp; Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add a New Course</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Fields marked <span className="text-rose-500 font-bold">*</span> are required. Each
          section tells you where it appears on the website.
        </p>
      </div>

      {/* Two-step guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl p-4 border border-emerald-200/80 bg-emerald-50/50">
          <div className="w-8 h-8 rounded-xl bg-[#09A64A] text-white font-bold flex items-center justify-center text-sm shrink-0">
            1
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Course details (this page)</h4>
            <p className="text-[11px] text-gray-500">
              Name, card, fees, page content and downloads.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl p-4 border border-gray-200 bg-white">
          <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 font-bold flex items-center justify-center text-sm shrink-0">
            2
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-700">
              Benefits, objectives, certificates, curriculum &amp; SEO
            </h4>
            <p className="text-[11px] text-gray-500">
              Opens automatically after you click &ldquo;Save &amp; Continue&rdquo;.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <CourseWebsiteChecklist values={values} />

      <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-6">
        <CourseForm values={values} onChange={setValues} autoSlug />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/courses"
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            Save &amp; Exit
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#078a3d] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Course...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save &amp; Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
