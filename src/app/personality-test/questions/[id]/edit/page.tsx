"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const PERSONALITY_TYPES = [
  "Achiever",
  "Empath",
  "Logical",
  "Enthusiast",
  "Initiator",
];

export default function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const questionId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answers: [
      { answer: "", value: "Achiever" },
      { answer: "", value: "Enthusiast" },
      { answer: "", value: "Logical" },
      { answer: "", value: "Empath" },
    ],
    position: 1,
    status: "Active",
  });

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/personality-test/questions?id=${questionId}`,
        );
        const json = await res.json();
        if (json.success && json.data) {
          const item = json.data;
          const parsedAnswers = Array.isArray(item.answers)
            ? item.answers
            : typeof item.answers === "string"
              ? JSON.parse(item.answers)
              : [];

          setFormData({
            question: item.question || "",
            answers:
              parsedAnswers.length >= 4
                ? parsedAnswers
                : [
                    ...parsedAnswers,
                    ...Array(Math.max(0, 4 - parsedAnswers.length)).fill({
                      answer: "",
                      value: "Achiever",
                    }),
                  ],
            position: item.position || 1,
            status: item.status || "Active",
          });
        } else {
          alert("Question not found");
          router.push("/personality-test/questions");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [questionId, router]);

  const handleAnswerChange = (
    idx: number,
    field: "answer" | "value",
    val: string,
  ) => {
    const nextAnswers = [...formData.answers];
    nextAnswers[idx] = { ...nextAnswers[idx], [field]: val };
    setFormData({ ...formData, answers: nextAnswers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/personality-test/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId, ...formData }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/personality-test/questions");
      } else {
        alert(json.error || "Failed to update question");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-16 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#09A64A]" />
        <span className="text-sm font-semibold">
          Loading question details...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* Top Breadcrumb & Heading */}
      <div className="flex items-center gap-4">
        <Link
          href="/personality-test/questions"
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-2xs"
          title="Back to Questions"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-0.5">
            <Link
              href="/personality-test/questions"
              className="hover:text-[#09A64A]"
            >
              Personality Test
            </Link>
            <span>/</span>
            <Link
              href="/personality-test/questions"
              className="hover:text-[#09A64A]"
            >
              Questions
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-bold">Edit Question</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Edit Personality Test Question
          </h1>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-8">
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Section: Question Prompt */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Question Text *
            </label>
            <textarea
              rows={3}
              required
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="e.g. How do you typically respond to stressful situations?"
              className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
            />
          </div>

          {/* Section: 4 Options and Trait Mappings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Answer Options &amp; Psychological Trait Mappings *
              </label>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                4 Required Options
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {formData.answers.map((ans, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#f8fafc] border border-gray-200 rounded-2xl flex flex-col md:flex-row gap-3 md:items-center"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-7 h-7 rounded-xl bg-[#09A64A] text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-700 md:hidden">
                      Option {idx + 1}
                    </span>
                  </div>

                  <input
                    type="text"
                    required
                    value={ans.answer}
                    onChange={(e) =>
                      handleAnswerChange(idx, "answer", e.target.value)
                    }
                    placeholder={`Answer option ${idx + 1}...`}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-gray-500">
                      Trait:
                    </span>
                    <select
                      value={ans.value}
                      onChange={(e) =>
                        handleAnswerChange(idx, "value", e.target.value)
                      }
                      className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all cursor-pointer"
                    >
                      {PERSONALITY_TYPES.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Position & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Display Order / Position
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.position}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    position: Number(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Update Question</span>
            </button>

            <Link
              href="/personality-test/questions"
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
