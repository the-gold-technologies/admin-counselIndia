"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
  Award,
  ListOrdered,
} from "lucide-react";
import { Course, DynamicHeading } from "@/types/course";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { CertificateUploadField } from "@/components/ui/CertificateUploadField";
import { CmsEditor } from "@/components/ui/CmsEditor";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Diploma Programs");
  const [position, setPosition] = useState("1");
  const [status, setStatus] = useState("Active");
  const [rating, setRating] = useState("5.0");
  const [nextBatchDate, setNextBatchDate] = useState("");
  const [listDuration, setListDuration] = useState("");
  const [duration, setDuration] = useState("");
  const [lessons, setLessons] = useState("");
  const [enrolmentSeats, setEnrolmentSeats] = useState("");
  const [whoCanJoin, setWhoCanJoin] = useState("");

  // Pricing & Commercials
  const [totalProgramFee, setTotalProgramFee] = useState("");
  const [totalDiscountFee, setTotalDiscountFee] = useState("");
  const [totalDiscountPercent, setTotalDiscountPercent] = useState("");
  const [oneTimeFee, setOneTimeFee] = useState("");
  const [oneTimeDiscountFee, setOneTimeDiscountFee] = useState("");
  const [oneTimeDiscountPercent, setOneTimeDiscountPercent] = useState("");
  const [startRange, setStartRange] = useState("");
  const [endRange, setEndRange] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  // Media & Documents
  const [coverImage, setCoverImage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [coverImageApp, setCoverImageApp] = useState("");
  const [backgroundImageApp, setBackgroundImageApp] = useState("");
  const [brochure, setBrochure] = useState("");
  const [scSchemePdf, setScSchemePdf] = useState("");
  const [dreamJob, setDreamJob] = useState("");

  // Dynamic Key Features (heading[] & headingvalue[])
  const [headings, setHeadings] = useState<DynamicHeading[]>([]);

  // Dynamic Course Outlines (cheading[] & cheadingvalue[])
  const [cheadings, setCheadings] = useState<DynamicHeading[]>([]);

  // Content Textareas
  const [subdescription, setSubdescription] = useState("");
  const [aboutUs, setAboutUs] = useState("");
  const [mepscAbout, setMepscAbout] = useState("");
  const [universityAdvantage, setUniversityAdvantage] = useState("");
  const [howWillBenefit, setHowWillBenefit] = useState("");
  const [ojt, setOjt] = useState("");
  const [mentorshipGuide, setMentorshipGuide] = useState("");

  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data: Course = await res.json();
        setCourse(data);
        setName(data.name || "");
        setSlug(data.slug || "");
        setCategory(data.category || "Diploma Programs");
        setPosition(String(data.position || 1));
        setStatus(data.status || "Active");
        setRating(String(data.rating || 5.0));
        setNextBatchDate(data.nextBatchDate || "");
        setListDuration(data.listDuration || "");
        setDuration(data.duration || "");
        setLessons(data.lessons || "");
        setEnrolmentSeats(data.enrolmentSeats || "");
        setWhoCanJoin(data.whoCanJoin || "");
        setTotalProgramFee(data.totalProgramFee || "");
        setTotalDiscountFee(data.totalDiscountFee || "");
        setTotalDiscountPercent(data.totalDiscountPercent || "");
        setOneTimeFee(data.oneTimeFee || "");
        setOneTimeDiscountFee(data.oneTimeDiscountFee || "");
        setOneTimeDiscountPercent(data.oneTimeDiscountPercent || "");
        setStartRange(data.startRange || "");
        setEndRange(data.endRange || "");
        setPaymentLink(data.paymentLink || "");
        setHeadings(
          Array.isArray(data.headings) && data.headings.length > 0
            ? data.headings
            : [{ heading: "Credentials", value: "" }],
        );
        setCheadings(
          Array.isArray(data.cheadings) && data.cheadings.length > 0
            ? data.cheadings
            : [{ heading: "Months", value: "" }],
        );
        setSubdescription(data.subdescription || "");
        setAboutUs(data.aboutUs || "");
        setMepscAbout(data.mepscAbout || "");
        setUniversityAdvantage(data.universityAdvantage || "");
        setHowWillBenefit(data.howWillBenefit || "");
        setOjt(data.ojt || "");
        setMentorshipGuide(data.mentorshipGuide || "");
        setDreamJob(data.dreamJob || "");
        setCoverImage(data.coverImage || "");
        setBackgroundImage(data.backgroundImage || "");
        setCoverImageApp(data.coverImageApp || "");
        setBackgroundImageApp(data.backgroundImageApp || "");
        setBrochure(data.brochure || "");
        setScSchemePdf(data.scSchemePdf || "");
      } catch (err: any) {
        setError(err.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id]);

  // Dynamic Add / Remove Headings
  const addHeading = () =>
    setHeadings([...headings, { heading: "", value: "" }]);
  const updateHeading = (
    index: number,
    field: "heading" | "value",
    val: string,
  ) => {
    const next = [...headings];
    next[index][field] = val;
    setHeadings(next);
  };
  const removeHeading = (index: number) => {
    setHeadings(headings.filter((_, i) => i !== index));
  };

  // Dynamic Add / Remove Cheadings
  const addCheading = () =>
    setCheadings([...cheadings, { heading: "", value: "" }]);
  const updateCheading = (
    index: number,
    field: "heading" | "value",
    val: string,
  ) => {
    const next = [...cheadings];
    next[index][field] = val;
    setCheadings(next);
  };
  const removeCheading = (index: number) => {
    setCheadings(cheadings.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      const payload = {
        name,
        slug,
        category,
        position: parseInt(position) || 1,
        status,
        rating: parseFloat(rating) || 5.0,
        nextBatchDate,
        listDuration,
        duration,
        lessons,
        enrolmentSeats,
        whoCanJoin,
        totalProgramFee,
        totalDiscountFee,
        totalDiscountPercent,
        oneTimeFee,
        oneTimeDiscountFee,
        oneTimeDiscountPercent,
        startRange,
        endRange,
        paymentLink,
        headings: headings.filter((h) => h.heading.trim() || h.value.trim()),
        cheadings: cheadings.filter((h) => h.heading.trim() || h.value.trim()),
        subdescription,
        aboutUs,
        mepscAbout,
        universityAdvantage,
        howWillBenefit,
        ojt,
        mentorshipGuide,
        dreamJob,
      };

      const res = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save course");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/courses");
      }, 800);
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
        <p className="text-xs font-semibold text-gray-500">
          Loading course details...
        </p>
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

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#09A64A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>
        <div className="text-xs text-gray-400">
          Content Management &bull;{" "}
          <span className="text-gray-700 font-semibold">
            Edit Course #{course?.sNo}
          </span>
        </div>
      </div>

      {/* Header matching Course Leads */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#09A64A]">
            Content Management
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Edit Course
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Update course curriculum, pricing, duration, positions, and
          publication status
        </p>
      </div>

      {/* Course Summary Info Card matching Course Leads */}
      {course && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#09A64A] border border-emerald-200 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                {(course.name || "C")[0]?.toUpperCase() || "C"}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {course.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-gray-400" />
                    <span>Category: {course.category || "General"}</span>
                  </span>
                  {course.addedOn && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>Added: {course.addedOn}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 flex flex-col items-start sm:items-end gap-1.5">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-1 inline-block">
                Live ID: #{course.liveId || course.sNo}
              </span>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <Sparkles className="w-3 h-3 text-[#09A64A]" />{" "}
                  {course.overviewCount || 0} Overview
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 text-indigo-700">
                  <Award className="w-3 h-3 text-indigo-600" />{" "}
                  {course.credentialCount || 0} Credentials
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 text-blue-700">
                  <ListOrdered className="w-3 h-3 text-blue-600" />{" "}
                  {course.curriculumCount || 0} Modules
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Course updated successfully! Redirecting...</span>
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              1. Basic Course Information
            </h3>
            <p className="text-xs text-gray-400">
              Core identity and categorization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Course Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Slug <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Position
              </label>
              <input
                type="number"
                min="1"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] cursor-pointer transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Structure, Durations & Eligibility */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              2. Structure, Schedule &amp; Eligibility
            </h3>
            <p className="text-xs text-gray-400">
              Duration formats, lessons, seats, and target audience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Duration For List (e.g. 3 Months)
              </label>
              <input
                type="text"
                value={listDuration}
                onChange={(e) => setListDuration(e.target.value)}
                placeholder="e.g. 24 Months"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Duration (Hours)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2160 hr"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Lessons Count
              </label>
              <input
                type="text"
                value={lessons}
                onChange={(e) => setLessons(e.target.value)}
                placeholder="e.g. 320"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Enrollment Seats
              </label>
              <input
                type="text"
                value={enrolmentSeats}
                onChange={(e) => setEnrolmentSeats(e.target.value)}
                placeholder="e.g. 100"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Next Batch Date
              </label>
              <input
                type="date"
                value={nextBatchDate}
                onChange={(e) => setNextBatchDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5 md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Who all can join?
              </label>
              <input
                type="text"
                value={whoCanJoin}
                onChange={(e) => setWhoCanJoin(e.target.value)}
                placeholder="e.g. All Manager, All Professionals, Coordinators, VPs, Psychologists..."
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Key Feature Headings (heading[] & headingvalue[]) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#09A64A]" />
                3. Key Feature Headings &amp; Values (heading[])
              </h3>
              <p className="text-xs text-gray-400">
                Dynamic credentials, eligibility, and core highlights shown on
                course landing
              </p>
            </div>
            <button
              type="button"
              onClick={addHeading}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#09A64A] hover:bg-emerald-100 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Heading</span>
            </button>
          </div>

          <div className="space-y-3">
            {headings.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-[#f8fafc] p-3 rounded-xl border border-gray-200/80"
              >
                <div className="w-1/3">
                  <input
                    type="text"
                    value={item.heading}
                    onChange={(e) =>
                      updateHeading(idx, "heading", e.target.value)
                    }
                    placeholder="Heading Name (e.g. Credentials)"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#09A64A]"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) =>
                      updateHeading(idx, "value", e.target.value)
                    }
                    placeholder="Value (e.g. Grade A Certification)"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#09A64A]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeHeading(idx)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Dynamic Course Outlines (cheading[] & cheadingvalue[]) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                4. Course Outline &amp; Highlights (cheading[])
              </h3>
              <p className="text-xs text-gray-400">
                Months, Core Modules, Topics, and Live Sessions statistics
              </p>
            </div>
            <button
              type="button"
              onClick={addCheading}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Outline</span>
            </button>
          </div>

          <div className="space-y-3">
            {cheadings.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-[#f8fafc] p-3 rounded-xl border border-gray-200/80"
              >
                <div className="w-1/3">
                  <input
                    type="text"
                    value={item.heading}
                    onChange={(e) =>
                      updateCheading(idx, "heading", e.target.value)
                    }
                    placeholder="Metric Name (e.g. Months)"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#09A64A]"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) =>
                      updateCheading(idx, "value", e.target.value)
                    }
                    placeholder="Metric Value (e.g. 3)"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#09A64A]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCheading(idx)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Pricing, Discounts & Payment Gateways */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              5. Pricing, Discounts &amp; Payments
            </h3>
            <p className="text-xs text-gray-400">
              Total fees, one-time fees, discounts, and payment links
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Total Program Fee (₹)
              </label>
              <input
                type="text"
                value={totalProgramFee}
                onChange={(e) => setTotalProgramFee(e.target.value)}
                placeholder="24775"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Total Discount Fee (₹)
              </label>
              <input
                type="text"
                value={totalDiscountFee}
                onChange={(e) => setTotalDiscountFee(e.target.value)}
                placeholder="14617"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-emerald-700 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Total Discount Percent (%)
              </label>
              <input
                type="text"
                value={totalDiscountPercent}
                onChange={(e) => setTotalDiscountPercent(e.target.value)}
                placeholder="50"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                One Time Fee (₹)
              </label>
              <input
                type="text"
                value={oneTimeFee}
                onChange={(e) => setOneTimeFee(e.target.value)}
                placeholder="13860"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                One Time Discount Fee (₹)
              </label>
              <input
                type="text"
                value={oneTimeDiscountFee}
                onChange={(e) => setOneTimeDiscountFee(e.target.value)}
                placeholder="12474"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                One Time Discount Percent (%)
              </label>
              <input
                type="text"
                value={oneTimeDiscountPercent}
                onChange={(e) => setOneTimeDiscountPercent(e.target.value)}
                placeholder="10"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Placement Start Range (₹)
              </label>
              <input
                type="text"
                value={startRange}
                onChange={(e) => setStartRange(e.target.value)}
                placeholder="4000"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Placement End Range (₹)
              </label>
              <input
                type="text"
                value={endRange}
                onChange={(e) => setEndRange(e.target.value)}
                placeholder="10000"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Payment Link
              </label>
              <input
                type="text"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="https://rzp.io/rzp/..."
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-[#f8fafc] hover:border-[#09A64A] focus:outline-none focus:ring-1 focus:ring-[#09A64A] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Detailed Content, Syllabus & Frameworks (CMS Rich Text) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                6. Descriptions &amp; Marketing Frameworks
              </h3>
              <p className="text-xs text-gray-400">
                Rich CMS formatted text for public marketing copy, program
                frameworks, and job benefits
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#09A64A] text-xs font-bold border border-emerald-200">
              CMS Editor Enabled
            </span>
          </div>

          <div className="space-y-5">
            <CmsEditor
              label="Sub Description *"
              value={subdescription}
              onChange={setSubdescription}
              placeholder="Course description and key overview..."
            />

            <CmsEditor
              label="About / Program Framework *"
              value={aboutUs}
              onChange={setAboutUs}
              placeholder="Detailed HTML or syllabus framework..."
            />

            <CmsEditor
              label="How will this program benefit you?"
              value={howWillBenefit}
              onChange={setHowWillBenefit}
              placeholder="Specific career and learning benefits..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CmsEditor
                label="Proficiency: On Job Training (OJT)"
                value={ojt}
                onChange={setOjt}
                placeholder="Hands-on training details..."
              />

              <CmsEditor
                label="Mentorship Guide"
                value={mentorshipGuide}
                onChange={setMentorshipGuide}
                placeholder="Mentorship guide details..."
              />
            </div>

            <CmsEditor
              label="Get Your Dream Job (Career Support)"
              value={dreamJob}
              onChange={setDreamJob}
              placeholder="Placement assistance, resume building, and job interview support..."
            />
          </div>
        </div>

        {/* Section 7: Course Media & Document Uploads */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              7. Course Media &amp; Documents
            </h3>
            <p className="text-xs text-gray-400">
              Upload cover banners, app responsive graphics, program brochure,
              and scholarship guidelines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadField
              label="Cover Image (Desktop Banner)"
              value={coverImage}
              onChange={setCoverImage}
            />

            <ImageUploadField
              label="Background Image (Desktop)"
              value={backgroundImage}
              onChange={setBackgroundImage}
            />

            <ImageUploadField
              label="Cover Image (App - 650 x 330)"
              value={coverImageApp}
              onChange={setCoverImageApp}
            />

            <ImageUploadField
              label="Background Image (App - 750 x 397)"
              value={backgroundImageApp}
              onChange={setBackgroundImageApp}
            />

            <CertificateUploadField
              label="Course Brochure (PDF / Document)"
              value={brochure}
              onChange={setBrochure}
            />

            <CertificateUploadField
              label="Scholarship Scheme (PDF)"
              value={scSchemePdf}
              onChange={setScSchemePdf}
            />
          </div>
        </div>

        {/* Action Buttons matching Course Leads */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
                <span>Submit form</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
