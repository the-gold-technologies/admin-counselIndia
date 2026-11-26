"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
  Award,
  ListOrdered,
  FileText,
  PartyPopper,
  X,
  SearchCheck,
} from "lucide-react";
import { Course } from "@/types/course";
import CourseSubModuleManager from "@/components/courses/CourseSubModuleManager";
import {
  CourseForm,
  CourseFormValues,
  CourseWebsiteChecklist,
  courseToFormValues,
  emptyCourseValues,
  toCoursePayload,
  validateCourseValues,
} from "@/components/courses/CourseForm";
import { EMPTY_ITEM_SEO, coursePagePath, fetchItemSeo, itemSeoFrom } from "@/lib/itemSeo";
import { ItemSeoFields } from "@/components/page-seo/ItemSeoFields";

type TabKey = "details" | "overview" | "objectives" | "credentials" | "curriculum" | "seo";
const TAB_KEYS: TabKey[] = [
  "details",
  "overview",
  "objectives",
  "credentials",
  "curriculum",
  "seo",
];

function EditCourseContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const initialTab = (searchParams.get("tab") as TabKey) || "details";
  const [activeTab, setActiveTab] = useState<TabKey>(
    TAB_KEYS.includes(initialTab) ? initialTab : "details"
  );
  const [showCreatedBanner, setShowCreatedBanner] = useState(searchParams.get("created") === "1");

  const [course, setCourse] = useState<Course | null>(null);
  const [values, setValues] = useState<CourseFormValues>(emptyCourseValues);
  const [seo, setSeo] = useState(EMPTY_ITEM_SEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Sub-module counts (kept in sync by CourseSubModuleManager)
  const [overviewCount, setOverviewCount] = useState(0);
  const [learnCount, setLearnCount] = useState(0);
  const [credentialCount, setCredentialCount] = useState(0);
  const [curriculumCount, setCurriculumCount] = useState(0);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "details") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      url.searchParams.delete("created");
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data: Course = await res.json();
        setCourse(data);
        setValues(courseToFormValues(data));
        setSeo(itemSeoFrom(await fetchItemSeo(coursePagePath(data.slug))));
        setOverviewCount(data.overviewCount || 0);
        setLearnCount(data.learnCount || 0);
        setCredentialCount(data.credentialCount || 0);
        setCurriculumCount(data.curriculumCount || 0);
      } catch (err: any) {
        setError(err.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id]);

  const handleSubmit = async (e?: React.FormEvent, redirectToCourses: boolean = false) => {
    if (e) e.preventDefault();
    const problem = validateCourseValues(values);
    if (problem) {
      setError(problem);
      if (activeTab !== "details") handleTabChange("details");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      const res = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...toCoursePayload(values), seo }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save course");
      }

      const updated: Course = await res.json();
      setCourse(updated);
      setValues((v) => ({ ...v, slug: updated.slug }));
      setSuccess(true);
      if (redirectToCourses) {
        setTimeout(() => router.push("/courses"), 700);
      } else {
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#09A64A] mb-3" />
        <p className="text-xs font-semibold text-gray-500">Loading course details...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Course Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">{error}</p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#09A64A] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
        </Link>
      </div>
    );
  }

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }[] = [
    { key: "details", label: "Course Details", icon: FileText },
    {
      key: "overview",
      label: "Course Overview",
      icon: Sparkles,
      count: overviewCount,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      key: "objectives",
      label: "Learning Objectives",
      icon: Layers,
      count: learnCount,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      key: "credentials",
      label: "Certificates",
      icon: Award,
      count: credentialCount,
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      key: "curriculum",
      label: "Curriculum",
      icon: ListOrdered,
      count: curriculumCount,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    { key: "seo", label: "SEO", icon: SearchCheck },
  ];

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
              Course #{course?.sNo}
            </div>
            <div className="text-xs font-bold text-gray-900 truncate max-w-xs md:max-w-md">
              {values.name || course?.name}
            </div>
          </div>
        </div>

        {/* Course details are saved with these buttons; the other tabs save each item instantly. */}
        {(activeTab === "details" || activeTab === "seo") && (
          <div className="flex items-center gap-2 shrink-0">
            {success && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            )}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              Save &amp; Exit
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#09A64A] hover:bg-[#078a3d] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Course</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Course details are saved with &ldquo;Save Changes&rdquo;. Items in the other tabs are
            saved as soon as you add or edit them.
          </p>
        </div>
        {course?.addedOn && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3 h-3" /> Added {course.addedOn}
          </span>
        )}
      </div>

      {showCreatedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <PartyPopper className="w-5 h-5 text-[#09A64A] shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-gray-900">
              Course created. Step 2: add the course page sections.
            </h4>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Work through the tabs below: Course Overview, Learning Objectives, Certificates and
              Curriculum. Each one shows up as its own section on the website course page. Tabs you
              leave empty are not shown.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreatedBanner(false)}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <CourseWebsiteChecklist
        values={values}
        savedSlug={course?.slug}
        seoDone={!!(seo.metaTitle.trim() && seo.metaDescription.trim())}
        counts={{
          overview: overviewCount,
          objectives: learnCount,
          credentials: credentialCount,
          curriculum: curriculumCount,
        }}
        onOpenTab={handleTabChange}
      />

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              id={`tab-${tab.key}`}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#09A64A] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black border transition-colors ${
                    isActive
                      ? "bg-white/20 text-white border-white/30"
                      : tab.badgeColor || "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Course details */}
      {activeTab === "details" && (
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <CourseForm values={values} onChange={setValues} />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {success && (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
            <Link
              href="/courses"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#078a3d] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB: SEO of the course page (saved to Page SEO under /course/<slug>) */}
      {activeTab === "seo" && (
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">SEO (Google search)</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Title, description and share image of this course&apos;s page on the website
              </p>
            </div>
            <ItemSeoFields
              value={seo}
              onChange={setSeo}
              pagePath={coursePagePath(course?.slug || values.slug)}
              fallbackTitle={`${values.name || course?.name || "Course"} | Counsel India`}
              fallbackDescription={(values.subdescription || values.aboutUs)
                .replace(/<[^>]*>|&nbsp;/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 160)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {success && (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#078a3d] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? "Saving..." : "Save SEO"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Course overview points (overviewData) */}
      {activeTab === "overview" && (
        <CourseSubModuleManager
          courseId={id}
          moduleKey="overview"
          moduleTitle="Course Overview"
          moduleSubtitle='Shown as the bulleted "Course Overview" section of the website course page. Add one point per item.'
          dataField="overviewData"
          countField="overviewCount"
          defaultType="key_features"
          typeOptions={["key_features", "highlights", "roadmap", "general"]}
          embedded={true}
          onCountChange={(count) => setOverviewCount(count)}
        />
      )}

      {/* TAB 3: Learning objectives (learnData) */}
      {activeTab === "objectives" && (
        <CourseSubModuleManager
          courseId={id}
          moduleKey="learning-objectives"
          moduleTitle="Learning Objectives"
          moduleSubtitle='Shown as the "Learning Objectives" list on the website course page, next to About the program.'
          dataField="learnData"
          countField="learnCount"
          defaultType="objective"
          typeOptions={["objective", "clinical_skill", "competency", "career_outcome"]}
          embedded={true}
          onCountChange={(count) => setLearnCount(count)}
        />
      )}

      {/* TAB 4: Certificates (credentialData) */}
      {activeTab === "credentials" && (
        <CourseSubModuleManager
          courseId={id}
          moduleKey="credentials"
          moduleTitle="Certificates"
          moduleSubtitle="Each item becomes a tab in the Credentials section of the course page. Add the certificate name as the title and upload a sample image."
          dataField="credentialData"
          countField="credentialCount"
          defaultType="credential"
          typeOptions={["credential", "certificate", "recommendation_letter", "diploma"]}
          embedded={true}
          onCountChange={(count) => setCredentialCount(count)}
        />
      )}

      {/* TAB 5: Curriculum (curriculumData) */}
      {activeTab === "curriculum" && (
        <CourseSubModuleManager
          courseId={id}
          moduleKey="curriculum"
          moduleTitle="Curriculum"
          moduleSubtitle="Each item is shown as a module in the Curriculum section of the course page, e.g. Semester 1: Foundations of Psychology."
          dataField="curriculumData"
          countField="curriculumCount"
          defaultType="curriculum"
          typeOptions={["curriculum", "module", "practical", "case_study"]}
          embedded={true}
          onCountChange={(count) => setCurriculumCount(count)}
        />
      )}
    </div>
  );
}

export default function EditCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#09A64A] mb-3" />
          <p className="text-xs font-semibold text-gray-500">Loading course editor...</p>
        </div>
      }
    >
      <EditCourseContent />
    </Suspense>
  );
}
