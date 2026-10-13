"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, X, Loader2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnswerOption {
  answer: string;
  value: string;
}

export interface QuestionItem {
  id: string;
  liveId?: string;
  question: string;
  answers: AnswerOption[] | any;
  position: number;
  status: string;
}

const PERSONALITY_TYPES = [
  "Achiever",
  "Empath",
  "Logical",
  "Enthusiast",
  "Initiator",
];

export default function QuestionTable() {
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuestionItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/personality-test/questions");
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
      }
    } catch (e) {
      console.error("Failed to load questions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      question: "",
      answers: [
        { answer: "", value: "Achiever" },
        { answer: "", value: "Enthusiast" },
        { answer: "", value: "Logical" },
        { answer: "", value: "Empath" },
      ],
      position: items.length + 1,
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: QuestionItem) => {
    setEditingItem(item);
    const parsedAnswers = Array.isArray(item.answers)
      ? item.answers
      : typeof item.answers === "string"
      ? JSON.parse(item.answers)
      : [];

    setFormData({
      question: item.question,
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
    setIsModalOpen(true);
  };

  const handleAnswerChange = (idx: number, field: "answer" | "value", val: string) => {
    const nextAnswers = [...formData.answers];
    nextAnswers[idx] = { ...nextAnswers[idx], [field]: val };
    setFormData({ ...formData, answers: nextAnswers });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) return;

    setSubmitting(true);
    try {
      if (editingItem) {
        const res = await fetch("/api/personality-test/questions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingItem.id, ...formData }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await fetch("/api/personality-test/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (e) {
      console.error("Failed to save question:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!window.confirm(`Delete question: "${question.slice(0, 50)}..."?`)) return;
    try {
      const res = await fetch(`/api/personality-test/questions?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (e) {
      console.error("Failed to delete question:", e);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.question.toLowerCase().includes(search.toLowerCase()) ||
      String(i.position).includes(search)
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by question text or position..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A]"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#09A64A] hover:bg-[#089341] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#ID</th>
                <th className="py-3.5 px-4 w-72">Question</th>
                <th className="py-3.5 px-4">Answer Options & Trait Mapping</th>
                <th className="py-3.5 px-4 w-24 text-center">Position</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#09A64A]" />
                    Loading questions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    No questions found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const answers: AnswerOption[] = Array.isArray(item.answers)
                    ? item.answers
                    : typeof item.answers === "string"
                    ? JSON.parse(item.answers || "[]")
                    : [];

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-gray-400">
                        {item.liveId || index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 leading-snug">
                        {item.question}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5 py-1">
                          {answers.map((ans, aIdx) => (
                            <div
                              key={aIdx}
                              className="flex items-start gap-2 bg-gray-50/90 hover:bg-gray-100/80 px-2.5 py-1.5 rounded-lg border border-gray-100 transition-colors"
                            >
                              <span className="w-4 h-4 rounded-full bg-white border border-gray-200 text-[10px] font-bold text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                                {aIdx + 1}
                              </span>
                              <span className="text-gray-700 font-medium flex-1 text-[11.5px] leading-snug">
                                {ans.answer}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                {ans.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700">
                          #{item.position}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                            item.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit"
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-[#09A64A] hover:bg-[#09A64A] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.question)}
                            title="Delete"
                            className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
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
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingItem ? "Edit Question" : "Add New Question"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Question Text *
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. How do you typically respond to stressful situations?"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                />
              </div>

              {/* 4 Answers */}
              <div className="flex flex-col gap-3">
                <label className="block text-xs font-bold text-gray-700">
                  Answer Options & Personality Archetype Mappings (4 Choices) *
                </label>
                {formData.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center"
                  >
                    <span className="w-6 h-6 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={ans.answer}
                      onChange={(e) => handleAnswerChange(idx, "answer", e.target.value)}
                      placeholder={`Answer option ${idx + 1}...`}
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-bold text-gray-500">Value:</span>
                      <select
                        value={ans.value}
                        onChange={(e) => handleAnswerChange(idx, "value", e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Display Position
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#09A64A] hover:bg-[#089341] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Update Question" : "Create Question"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
