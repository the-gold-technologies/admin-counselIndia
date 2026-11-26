"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  Globe,
  EyeOff,
  CheckCircle2,
  Circle,
  ExternalLink,
  Info,
} from "lucide-react";
import { Course, DynamicHeading } from "@/types/course";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { CertificateUploadField } from "@/components/ui/CertificateUploadField";
import { CmsEditor } from "@/components/ui/CmsEditor";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { slugify } from "@/lib/utils";
import { DEFAULT_MAIN_CATEGORY, MAIN_CATEGORIES } from "@/lib/courseCategories";

/* -------------------------------------------------------------------------- */
/*  Form values + helpers (shared by the Create and Edit course pages)        */
/* -------------------------------------------------------------------------- */

export interface CourseFormValues {
  name: string;
  slug: string;
  mainCategory: string;
  category: string;
  position: string;
  status: string;
  rating: string;
  nextBatchDate: string;
  listDuration: string;
  duration: string;
  lessons: string;
  enrolmentSeats: string;
  whoCanJoin: string;
  totalProgramFee: string;
  totalDiscountFee: string;
  totalDiscountPercent: string;
  oneTimeFee: string;
  oneTimeDiscountFee: string;
  oneTimeDiscountPercent: string;
  startRange: string;
  endRange: string;
  paymentLink: string;
  coverImage: string;
  backgroundImage: string;
  coverImageApp: string;
  backgroundImageApp: string;
  brochure: string;
  scSchemePdf: string;
  headings: DynamicHeading[];
  cheadings: DynamicHeading[];
  subdescription: string;
  aboutUs: string;
  mepscAbout: string;
  universityAdvantage: string;
  howWillBenefit: string;
  ojt: string;
  mentorshipGuide: string;
  dreamJob: string;
}

/** The website course card cuts the short description off after this many characters. */
export const CARD_DESCRIPTION_LIMIT = 175;

export const emptyCourseValues: CourseFormValues = {
  name: "",
  slug: "",
  mainCategory: DEFAULT_MAIN_CATEGORY,
  category: "",
  position: "1",
  status: "Active",
  rating: "5.0",
  nextBatchDate: "",
  listDuration: "",
  duration: "",
  lessons: "",
  enrolmentSeats: "",
  whoCanJoin: "",
  totalProgramFee: "",
  totalDiscountFee: "",
  totalDiscountPercent: "",
  oneTimeFee: "",
  oneTimeDiscountFee: "",
  oneTimeDiscountPercent: "",
  startRange: "",
  endRange: "",
  paymentLink: "",
  coverImage: "",
  backgroundImage: "",
  coverImageApp: "",
  backgroundImageApp: "",
  brochure: "",
  scSchemePdf: "",
  headings: [
    { heading: "Duration", value: "" },
    { heading: "Eligibility", value: "" },
    { heading: "Credentials", value: "" },
  ],
  cheadings: [
    { heading: "Months", value: "" },
    { heading: "Modules", value: "" },
    { heading: "Live Sessions", value: "" },
  ],
  subdescription: "",
  aboutUs: "",
  mepscAbout: "",
  universityAdvantage: "",
  howWillBenefit: "",
  ojt: "",
  mentorshipGuide: "",
  dreamJob: "",
};

/** The website shows the short description as plain text, so strip any HTML from older records. */
function toPlainText(html: string): string {
  return html
    .replace(/<\/(p|div|li)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function courseToFormValues(c: Course): CourseFormValues {
  const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  return {
    name: s(c.name),
    slug: s(c.slug),
    mainCategory: s(c.mainCategory) || DEFAULT_MAIN_CATEGORY,
    category: s(c.category),
    position: s(c.position || 1),
    status: c.status || "Active",
    rating: s(c.rating || 5.0),
    nextBatchDate: s(c.nextBatchDate),
    listDuration: s(c.listDuration),
    duration: s(c.duration),
    lessons: s(c.lessons),
    enrolmentSeats: s(c.enrolmentSeats),
    whoCanJoin: s(c.whoCanJoin),
    totalProgramFee: s(c.totalProgramFee),
    totalDiscountFee: s(c.totalDiscountFee),
    totalDiscountPercent: s(c.totalDiscountPercent),
    oneTimeFee: s(c.oneTimeFee),
    oneTimeDiscountFee: s(c.oneTimeDiscountFee),
    oneTimeDiscountPercent: s(c.oneTimeDiscountPercent),
    startRange: s(c.startRange),
    endRange: s(c.endRange),
    paymentLink: s(c.paymentLink),
    coverImage: s(c.coverImage),
    backgroundImage: s(c.backgroundImage),
    coverImageApp: s(c.coverImageApp),
    backgroundImageApp: s(c.backgroundImageApp),
    brochure: s(c.brochure),
    scSchemePdf: s(c.scSchemePdf),
    headings:
      Array.isArray(c.headings) && c.headings.length > 0
        ? c.headings.map((h) => ({ heading: s(h.heading), value: s(h.value) }))
        : [{ heading: "", value: "" }],
    cheadings:
      Array.isArray(c.cheadings) && c.cheadings.length > 0
        ? c.cheadings.map((h) => ({ heading: s(h.heading), value: s(h.value) }))
        : [{ heading: "", value: "" }],
    subdescription: toPlainText(s(c.subdescription)),
    aboutUs: s(c.aboutUs),
    mepscAbout: s(c.mepscAbout),
    universityAdvantage: s(c.universityAdvantage),
    howWillBenefit: s(c.howWillBenefit),
    ojt: s(c.ojt),
    mentorshipGuide: s(c.mentorshipGuide),
    dreamJob: s(c.dreamJob),
  };
}

/** Builds the JSON body sent to POST /api/courses and PATCH /api/courses/[id]. */
export function toCoursePayload(v: CourseFormValues) {
  const keep = (rows: DynamicHeading[]) =>
    rows
      .map((h) => ({ heading: h.heading.trim(), value: h.value.trim() }))
      .filter((h) => h.heading || h.value);
  return {
    ...v,
    name: v.name.trim(),
    slug: slugify(v.slug || v.name),
    category: v.category.trim(),
    mainCategory: v.mainCategory || DEFAULT_MAIN_CATEGORY,
    position: parseInt(v.position) || 1,
    rating: parseFloat(v.rating) || 5.0,
    subdescription: v.subdescription.trim(),
    paymentLink: v.paymentLink.trim(),
    headings: keep(v.headings),
    cheadings: keep(v.cheadings),
  };
}

/** Returns the first blocking problem, or null when the course can be saved. */
export function validateCourseValues(v: CourseFormValues): string | null {
  if (!v.name.trim()) return "Course name is required.";
  if (!slugify(v.slug || v.name)) return "Website URL (slug) is required.";
  if (!v.category.trim()) return "Category is required.";
  if (v.paymentLink.trim() && !/^https?:\/\//i.test(v.paymentLink.trim()))
    return "Enroll / payment link must start with http:// or https://";
  const r = parseFloat(v.rating);
  if (v.rating && (isNaN(r) || r < 1 || r > 5)) return "Rating must be between 1 and 5.";
  return null;
}

export function websiteCourseUrl(slug: string): string | null {
  const base = (process.env.NEXT_PUBLIC_WEBSITE_URL || "").replace(/\/+$/, "");
  if (!base || base === "*" || !slug) return null;
  return `${base}/courses/${slug}`;
}

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                               */
/* -------------------------------------------------------------------------- */

const inputCls =
  "w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors";

function Field({
  label,
  required,
  hint,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-bold text-gray-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 leading-snug">{hint}</p>}
    </div>
  );
}

function Section({
  step,
  title,
  where,
  children,
  action,
}: {
  step: number;
  title: string;
  where: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#09A64A] border border-emerald-200 font-black text-xs flex items-center justify-center shrink-0">
            {step}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Globe className="w-3 h-3" /> {where}
            </p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function PairListEditor({
  rows,
  onChange,
  firstPlaceholder,
  secondPlaceholder,
  addLabel,
  firstLabel,
  secondLabel,
}: {
  rows: DynamicHeading[];
  onChange: (rows: DynamicHeading[]) => void;
  firstPlaceholder: string;
  secondPlaceholder: string;
  addLabel: string;
  firstLabel: string;
  secondLabel: string;
}) {
  const update = (i: number, field: keyof DynamicHeading, val: string) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  return (
    <div className="space-y-2">
      <div className="hidden sm:flex gap-3 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        <span className="w-1/3">{firstLabel}</span>
        <span className="flex-1">{secondLabel}</span>
        <span className="w-8" />
      </div>
      {rows.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 bg-[#f8fafc] p-2.5 rounded-xl border border-gray-200/80"
        >
          <input
            type="text"
            value={item.heading}
            onChange={(e) => update(idx, "heading", e.target.value)}
            placeholder={firstPlaceholder}
            className="w-1/3 h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#09A64A]"
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => update(idx, "value", e.target.value)}
            placeholder={secondPlaceholder}
            className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#09A64A]"
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, i) => i !== idx))}
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Remove row"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { heading: "", value: "" }])}
        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#09A64A] hover:bg-emerald-100 text-xs font-bold border border-emerald-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{addLabel}</span>
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Website readiness checklist                                               */
/* -------------------------------------------------------------------------- */

export interface SubModuleCounts {
  overview: number;
  objectives: number;
  credentials: number;
  curriculum: number;
}

export function CourseWebsiteChecklist({
  values,
  counts,
  savedSlug,
  onOpenTab,
}: {
  values: CourseFormValues;
  /** Only known after the course exists (edit page). */
  counts?: SubModuleCounts;
  /** Slug as currently saved in the database, used for the preview link. */
  savedSlug?: string;
  onOpenTab?: (tab: "overview" | "objectives" | "credentials" | "curriculum") => void;
}) {
  const isLive = values.status.toLowerCase() === "active";
  const required = [
    { label: "Name, URL & category", done: !!(values.name.trim() && values.category.trim()) },
    { label: "Short description (course card)", done: !!values.subdescription.trim() },
    { label: "Cover image (course card)", done: !!values.coverImage },
    { label: "Fee", done: !!(values.totalDiscountFee || values.totalProgramFee) },
    { label: "Enroll / payment link", done: !!values.paymentLink.trim() },
  ];
  const recommended: {
    label: string;
    done: boolean;
    tab?: "overview" | "objectives" | "credentials" | "curriculum";
  }[] = [
    { label: "Banner image (course page)", done: !!values.backgroundImage },
    { label: "About the program", done: !!toPlainText(values.aboutUs) },
    { label: "Highlights", done: values.headings.some((h) => h.heading.trim() && h.value.trim()) },
    { label: "Brochure PDF", done: !!values.brochure },
  ];
  if (counts) {
    recommended.push(
      { label: "Course overview points", done: counts.overview > 0, tab: "overview" },
      { label: "Learning objectives", done: counts.objectives > 0, tab: "objectives" },
      { label: "Certificates", done: counts.credentials > 0, tab: "credentials" },
      { label: "Curriculum modules", done: counts.curriculum > 0, tab: "curriculum" }
    );
  }
  const doneCount = [...required, ...recommended].filter((i) => i.done).length;
  const total = required.length + recommended.length;
  const previewUrl = websiteCourseUrl(savedSlug || "");

  const Item = ({
    label,
    done,
    tab,
  }: {
    label: string;
    done: boolean;
    tab?: "overview" | "objectives" | "credentials" | "curriculum";
  }) => (
    <li className="flex items-center gap-1.5 text-[11px]">
      {done ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#09A64A] shrink-0" />
      ) : (
        <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
      )}
      {tab && !done && onOpenTab ? (
        <button
          type="button"
          onClick={() => onOpenTab(tab)}
          className="text-blue-600 hover:underline font-semibold cursor-pointer text-left"
        >
          {label} →
        </button>
      ) : (
        <span className={done ? "text-gray-500" : "text-gray-800 font-semibold"}>{label}</span>
      )}
    </li>
  );

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
              isLive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {isLive ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {isLive ? "Visible on website" : "Hidden from website"}
          </span>
          <span className="text-xs text-gray-500 font-semibold">
            Website readiness: {doneCount}/{total}
          </span>
        </div>
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
            title="Opens the saved version of this course on the public website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview on website
          </a>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-[#09A64A] transition-all"
          style={{ width: `${Math.round((doneCount / total) * 100)}%` }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Needed for the course card
          </div>
          <ul className="space-y-1">
            {required.map((i) => (
              <Item key={i.label} {...i} />
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Makes the course page complete
          </div>
          <ul className="space-y-1">
            {recommended.map((i) => (
              <Item key={i.label} {...i} />
            ))}
          </ul>
        </div>
      </div>
      {isLive && !required.every((i) => i.done) && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
          This course is set to show on the website but some card details are missing. Visitors will
          see placeholders until they are filled in — or set Visibility to &ldquo;Hidden&rdquo;
          until it is ready.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  The form itself                                                           */
/* -------------------------------------------------------------------------- */

export function CourseForm({
  values,
  onChange,
  autoSlug = false,
}: {
  values: CourseFormValues;
  /**
   * A React state setter. Updates are always applied to the latest state, because uploads
   * finish asynchronously and must not overwrite fields typed while they were in progress.
   */
  onChange: React.Dispatch<React.SetStateAction<CourseFormValues>>;
  /** When true (new course), the slug follows the name until the user edits it. */
  autoSlug?: boolean;
}) {
  const [slugEdited, setSlugEdited] = useState(!autoSlug);
  const [showMore, setShowMore] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/courses?limit=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.stats?.categories) {
          setCategories(d.stats.categories.map((c: { name: string }) => c.name));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof CourseFormValues>(key: K, val: CourseFormValues[K]) =>
    onChange((prev) => ({ ...prev, [key]: val }));

  const setName = (name: string) =>
    onChange((prev) => ({ ...prev, name, slug: slugEdited ? prev.slug : slugify(name) }));

  // Keep the discount % in step with the two fees so the "% OFF" badge is always right.
  const setFee = (key: "totalProgramFee" | "totalDiscountFee", val: string) =>
    onChange((prev) => {
      const next = { ...prev, [key]: val };
      const full = parseFloat(next.totalProgramFee);
      const disc = parseFloat(next.totalDiscountFee);
      if (full > 0 && disc >= 0 && disc < full) {
        next.totalDiscountPercent = String(Math.round((1 - disc / full) * 100));
      } else if (full > 0 && disc >= full) {
        next.totalDiscountPercent = "";
      }
      return next;
    });

  const websiteBase = (process.env.NEXT_PUBLIC_WEBSITE_URL || "").replace(/\/+$/, "");
  const shownBase = websiteBase && websiteBase !== "*" ? websiteBase : "website";
  const isLive = values.status.toLowerCase() === "active";
  const descLen = values.subdescription.trim().length;
  const audience = values.whoCanJoin
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* 1. Basics */}
      <Section step={1} title="Basics" where="Course name, web address, and category badge">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Course name" required className="md:col-span-2">
            <input
              type="text"
              value={values.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master's in Clinical Psychology"
              className={inputCls}
            />
          </Field>

          <Field
            label="Website URL"
            required
            hint={
              <>
                Course page address: {shownBase}/courses/
                <span className="font-bold text-gray-600">
                  {slugify(values.slug) || "your-course"}
                </span>
              </>
            }
          >
            <input
              type="text"
              value={values.slug}
              onChange={(e) => {
                setSlugEdited(true);
                set("slug", e.target.value);
              }}
              onBlur={() => onChange((prev) => ({ ...prev, slug: slugify(prev.slug) }))}
              placeholder="masters-in-clinical-psychology"
              className={inputCls}
            />
          </Field>

          <Field
            label="Main category"
            required
            hint="Top-level group in the website's course menu."
          >
            <SearchableSelect
              value={values.mainCategory}
              onChange={(val) => set("mainCategory", val)}
              options={MAIN_CATEGORIES.map((c) => ({ value: c, label: c }))}
              searchPlaceholder="Search main categories..."
              buttonClassName="py-2.5 text-sm font-medium"
            />
          </Field>

          <Field
            label="Sub-category"
            required
            hint="e.g. Masters Programs, PG Diploma Programs, Certification Programs, Entrepreneurship Programs."
          >
            <input
              type="text"
              list="course-category-options"
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Select or type a category"
              className={inputCls}
            />
            <datalist id="course-category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Visibility" className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  value: "Active",
                  icon: Globe,
                  title: "Show on website",
                  desc: "Listed on the courses page as soon as it is saved.",
                },
                {
                  value: "Inactive",
                  icon: EyeOff,
                  title: "Hidden (draft)",
                  desc: "Only visible here. Switch on when the course is ready.",
                },
              ].map((opt) => {
                const selected = (opt.value === "Active") === isLive;
                const Icon = opt.icon;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => set("status", opt.value)}
                    className={`text-left p-3 rounded-xl border transition-colors cursor-pointer flex gap-3 ${
                      selected
                        ? "border-[#09A64A] bg-emerald-50/60 ring-1 ring-[#09A64A]"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 shrink-0 ${selected ? "text-[#09A64A]" : "text-gray-400"}`}
                    />
                    <span>
                      <span className="block text-xs font-bold text-gray-900">{opt.title}</span>
                      <span className="block text-[11px] text-gray-500">{opt.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </Section>

      {/* 2. Course card */}
      <Section
        step={2}
        title="Course card"
        where="What visitors see in the course list on the website"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field
            label="Short description"
            required
            className="md:col-span-3"
            hint={
              <span className={descLen > CARD_DESCRIPTION_LIMIT ? "text-amber-600" : ""}>
                {descLen}/{CARD_DESCRIPTION_LIMIT} characters fit on the course card. Also shown at
                the top of the course page.
              </span>
            }
          >
            <textarea
              rows={3}
              value={values.subdescription}
              onChange={(e) => set("subdescription", e.target.value)}
              placeholder="One or two sentences on what the learner gets from this course."
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors resize-y"
            />
          </Field>

          <Field label="Duration" hint="Shown on the card, e.g. 3 Months">
            <input
              type="text"
              value={values.listDuration}
              onChange={(e) => set("listDuration", e.target.value)}
              placeholder="e.g. 6 Months"
              className={inputCls}
            />
          </Field>

          <Field label="Next batch date">
            <input
              type="date"
              value={values.nextBatchDate}
              onChange={(e) => set("nextBatchDate", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Seats left" hint='Shown as "N Seats Left"'>
            <input
              type="number"
              min="0"
              value={values.enrolmentSeats}
              onChange={(e) => set("enrolmentSeats", e.target.value)}
              placeholder="e.g. 25"
              className={inputCls}
            />
          </Field>

          <Field label="Rating (1–5)">
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={values.rating}
              onChange={(e) => set("rating", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploadField
            label="Cover image (course card) *"
            value={values.coverImage}
            onChange={(url) => set("coverImage", url)}
          />
          <ImageUploadField
            label="Banner image (top of course page)"
            value={values.backgroundImage}
            onChange={(url) => set("backgroundImage", url)}
          />
        </div>
      </Section>

      {/* 3. Fees */}
      <Section
        step={3}
        title="Fees & enrollment"
        where="Price on the card and the Enroll Now button"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Original fee (₹)" hint="Full price before discount">
            <input
              type="number"
              min="0"
              value={values.totalProgramFee}
              onChange={(e) => setFee("totalProgramFee", e.target.value)}
              placeholder="e.g. 60000"
              className={inputCls}
            />
          </Field>
          <Field label="Discounted fee (₹)" hint="The price shown on the website">
            <input
              type="number"
              min="0"
              value={values.totalDiscountFee}
              onChange={(e) => setFee("totalDiscountFee", e.target.value)}
              placeholder="e.g. 45000"
              className={inputCls}
            />
          </Field>
          <Field
            label="Discount %"
            hint={
              values.totalDiscountPercent
                ? `Shows a "${values.totalDiscountPercent}% OFF" badge. Calculated from the fees; you can change it.`
                : "Calculated from the two fees. Leave empty for no badge."
            }
          >
            <input
              type="number"
              min="0"
              max="100"
              value={values.totalDiscountPercent}
              onChange={(e) => set("totalDiscountPercent", e.target.value)}
              placeholder="auto"
              className={inputCls}
            />
          </Field>
          <Field
            label="Enroll / payment link"
            className="md:col-span-3"
            hint='Where the "Enroll Now" button on the course page goes.'
          >
            <input
              type="url"
              value={values.paymentLink}
              onChange={(e) => set("paymentLink", e.target.value)}
              placeholder="https://rzp.io/..."
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* 4. Course page */}
      <Section step={4} title="Course page content" where="Sections on the course detail page">
        <Field
          label="Highlights"
          hint="Short facts shown as cards near the top of the course page."
        >
          <PairListEditor
            rows={values.headings}
            onChange={(rows) => set("headings", rows)}
            firstLabel="Title"
            secondLabel="Detail"
            firstPlaceholder="e.g. Eligibility"
            secondPlaceholder="e.g. Graduation (any stream)"
            addLabel="Add highlight"
          />
        </Field>

        <CmsEditor
          label="About the program"
          value={values.aboutUs}
          onChange={(v) => set("aboutUs", v)}
          placeholder="Describe the program, its structure and approach..."
        />

        <CmsEditor
          label="How will this program benefit you?"
          value={values.howWillBenefit}
          onChange={(v) => set("howWillBenefit", v)}
          placeholder="Career and learning benefits..."
        />

        <Field
          label="Who can join?"
          hint={
            audience.length > 0 ? (
              <span className="flex flex-wrap gap-1 pt-0.5">
                {audience.map((a) => (
                  <span
                    key={a}
                    className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-semibold"
                  >
                    {a}
                  </span>
                ))}
              </span>
            ) : (
              "Separate each group with a comma. Each one is shown as its own item."
            )
          }
        >
          <input
            type="text"
            value={values.whoCanJoin}
            onChange={(e) => set("whoCanJoin", e.target.value)}
            placeholder="e.g. Psychology Graduates, HR Professionals, Career Changers"
            className={inputCls}
          />
        </Field>

        <Field
          label="Curriculum numbers"
          hint='Shown in the Curriculum section as "20 Program Credits", "5 Subjects", etc.'
        >
          <PairListEditor
            rows={values.cheadings}
            onChange={(rows) => set("cheadings", rows)}
            firstLabel="Label"
            secondLabel="Number"
            firstPlaceholder="e.g. Live Sessions"
            secondPlaceholder="e.g. 120"
            addLabel="Add number"
          />
        </Field>

        <Field label="Total lessons" hint="Shown as total sessions in the Curriculum section">
          <input
            type="text"
            value={values.lessons}
            onChange={(e) => set("lessons", e.target.value)}
            placeholder="e.g. 60"
            className={`${inputCls} md:max-w-xs`}
          />
        </Field>
      </Section>

      {/* 5. Downloads */}
      <Section step={5} title="Downloads" where="Download Brochure and Scholarship buttons">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CertificateUploadField
            label="Course brochure (PDF)"
            value={values.brochure}
            onChange={(url) => set("brochure", url)}
          />
          <CertificateUploadField
            label="Scholarship scheme (PDF)"
            value={values.scSchemePdf}
            onChange={(url) => set("scSchemePdf", url)}
          />
        </div>
      </Section>

      {/* More options: fields the website does not use */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs">
        <button
          type="button"
          onClick={() => setShowMore((s) => !s)}
          className="w-full flex items-center justify-between gap-3 p-5 cursor-pointer text-left"
        >
          <div>
            <h3 className="text-sm font-bold text-gray-900">More options</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Mobile app images, one-time fees, placement range, and other fields not shown on the
              website. Optional.
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${showMore ? "rotate-180" : ""}`}
          />
        </button>

        {showMore && (
          <div className="px-6 pb-6 space-y-5 border-t border-gray-100 pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField
                label="App cover image (650 x 330)"
                value={values.coverImageApp}
                onChange={(url) => set("coverImageApp", url)}
              />
              <ImageUploadField
                label="App background image (750 x 397)"
                value={values.backgroundImageApp}
                onChange={(url) => set("backgroundImageApp", url)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="One-time fee (₹)">
                <input
                  type="text"
                  value={values.oneTimeFee}
                  onChange={(e) => set("oneTimeFee", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="One-time discounted fee (₹)">
                <input
                  type="text"
                  value={values.oneTimeDiscountFee}
                  onChange={(e) => set("oneTimeDiscountFee", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="One-time discount %">
                <input
                  type="text"
                  value={values.oneTimeDiscountPercent}
                  onChange={(e) => set("oneTimeDiscountPercent", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Placement salary from (₹)">
                <input
                  type="text"
                  value={values.startRange}
                  onChange={(e) => set("startRange", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Placement salary to (₹)">
                <input
                  type="text"
                  value={values.endRange}
                  onChange={(e) => set("endRange", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Duration in hours">
                <input
                  type="text"
                  value={values.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  placeholder="e.g. 570 hours"
                  className={inputCls}
                />
              </Field>
              <Field label="Position">
                <input
                  type="number"
                  min="1"
                  value={values.position}
                  onChange={(e) => set("position", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <CmsEditor
              label="On Job Training (OJT)"
              value={values.ojt}
              onChange={(v) => set("ojt", v)}
            />
            <CmsEditor
              label="Mentorship guide"
              value={values.mentorshipGuide}
              onChange={(v) => set("mentorshipGuide", v)}
            />
            <CmsEditor
              label="Get your dream job (career support)"
              value={values.dreamJob}
              onChange={(v) => set("dreamJob", v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
