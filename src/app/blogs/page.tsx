"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  CheckCircle2,
  FilePen,
  Tags,
  Search,
  Plus,
  Download,
  Printer,
  RefreshCw,
  FileText,
  Edit2,
  Trash2,
  ImageOff,
} from "lucide-react";
import { BlogItem, websiteBlogUrl } from "@/components/blogs/BlogForm";
import { generateBlogsPdf, formatBlogDate } from "@/lib/generateBlogsPdf";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blogs?summary=1");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setBlogs(json.data);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const categories = useMemo(
    () => [...new Set(blogs.map((b) => b.category).filter(Boolean) as string[])].sort(),
    [blogs]
  );

  // Filtering is done in the browser so search feels instant
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter(
      (b) =>
        (statusFilter === "All" || b.status === statusFilter) &&
        (categoryFilter === "All" || b.category === categoryFilter) &&
        (!q ||
          b.title.toLowerCase().includes(q) ||
          (b.authorName || "").toLowerCase().includes(q) ||
          (b.category || "").toLowerCase().includes(q))
    );
  }, [blogs, search, statusFilter, categoryFilter]);

  useEffect(() => setPage(1), [search, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startIndex = (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, filtered.length);

  const getPaginationRange = () => {
    if (totalPages <= 1) return [1];
    const delta = 2;
    const range: (number | string)[] = [];
    for (
      let i = Math.max(2, safePage - delta);
      i <= Math.min(totalPages - 1, safePage + delta);
      i++
    ) {
      range.push(i);
    }
    if (safePage - delta > 2) range.unshift("...");
    if (safePage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    range.push(totalPages);
    return range;
  };

  const handleToggleStatus = async (blog: BlogItem) => {
    const next = blog.status === "Published" ? "Draft" : "Published";
    const res = await fetch(`/api/blogs/${blog.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const json = await res.json();
    if (json.success) setBlogs((prev) => prev.map((b) => (b.id === blog.id ? json.data : b)));
    else alert(json.error || "Could not change status");
  };

  const handleDelete = async (blog: BlogItem) => {
    if (!confirm(`Delete the blog "${blog.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/blogs/${blog.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
    else alert(json.error || "Could not delete blog");
  };

  // Exports use the currently filtered list
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = [
      "S.No",
      "Title",
      "Author",
      "Category",
      "Status",
      "Published",
      "Web address",
      "Tags",
      "Meta title",
      "Meta description",
      "Meta keywords",
      "Canonical URL",
    ];
    const rows = filtered.map((b, i) =>
      [
        i + 1,
        b.title,
        b.authorName,
        b.category || "",
        b.status,
        formatBlogDate(b.publishedAt),
        websiteBlogUrl(b.slug) || b.slug,
        b.tags || "",
        b.metaTitle || "",
        b.metaDescription || "",
        b.metaKeywords || "",
        b.canonicalUrl || "",
      ]
        .map(q)
        .join(",")
    );
    // BOM so Excel opens Indian/Unicode characters correctly
    const blob = new Blob(["﻿" + [header.map(q).join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `counselindia_blogs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (filtered.length === 0) return;
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) return;
    const rows = filtered
      .map(
        (b, i) => `<tr>
          <td class="c">${i + 1}</td>
          <td><b>${escapeHtml(b.title)}</b></td>
          <td>${escapeHtml(b.authorName || "-")}</td>
          <td>${escapeHtml(b.category || "-")}</td>
          <td>${escapeHtml(formatBlogDate(b.publishedAt))}</td>
          <td>${escapeHtml(b.status)}</td>
        </tr>`
      )
      .join("");
    win.document.write(`<!DOCTYPE html><html><head><title>Blogs</title><style>
      body{font-family:Arial,sans-serif;padding:24px 30px;color:#222;margin:0}
      h1{font-size:24px;margin:0 0 4px}
      p{margin:0 0 16px;color:#64748b;font-size:12px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #e2e8f0;padding:8px 10px;font-size:12.5px;text-align:left;vertical-align:top}
      th{background:#09A64A;color:#fff}
      .c{text-align:center;width:40px}
      @media print{body{padding:0}@page{size:A4 portrait;margin:12mm}th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body>
      <h1>Blogs</h1><p>${filtered.length} posts · Printed ${escapeHtml(formatBlogDate(new Date()))}</p>
      <table><thead><tr><th class="c">S.No</th><th>Title</th><th>Author</th><th>Category</th><th>Published</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`);
    win.document.close();
  };

  const publishedCount = blogs.filter((b) => b.status === "Published").length;
  const draftCount = blogs.length - publishedCount;

  const btn =
    "px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50";

  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Blogs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Write and publish articles shown on the Counsel India website blog
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/blogs/create"
            className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Blog</span>
          </Link>
          <button
            onClick={() => generateBlogsPdf(filtered)}
            disabled={filtered.length === 0}
            title="Export PDF"
            className={btn}
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span>PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            title="Export CSV"
            className={btn}
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={filtered.length === 0}
            title="Print list"
            className={btn}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Blogs",
            value: blogs.length,
            icon: Newspaper,
            cls: "bg-emerald-50 text-[#09A64A]",
            filterStatus: "All" as string | undefined,
            activeBorder: "border-[#09A64A] ring-2 ring-[#09A64A]/20",
          },
          {
            label: "Published",
            value: publishedCount,
            icon: CheckCircle2,
            cls: "bg-blue-50 text-blue-600",
            filterStatus: "Published" as string | undefined,
            activeBorder: "border-blue-500 ring-2 ring-blue-500/20",
          },
          {
            label: "Drafts",
            value: draftCount,
            icon: FilePen,
            cls: "bg-amber-50 text-amber-600",
            filterStatus: "Draft" as string | undefined,
            activeBorder: "border-amber-500 ring-2 ring-amber-500/20",
          },
          {
            label: "Categories",
            value: categories.length,
            icon: Tags,
            cls: "bg-purple-50 text-purple-600",
            filterStatus: undefined,
            activeBorder: "",
          },
        ].map((s) => {
          const isActive = s.filterStatus !== undefined && statusFilter === s.filterStatus;
          const Tag = s.filterStatus !== undefined ? "button" : "div";
          return (
            <Tag
              key={s.label}
              {...(s.filterStatus !== undefined
                ? {
                    type: "button" as const,
                    onClick: () => setStatusFilter(s.filterStatus!),
                  }
                : {})}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex items-center justify-between text-left transition-all ${
                s.filterStatus !== undefined ? "cursor-pointer hover:shadow-md" : ""
              } ${isActive ? s.activeBorder : "border-gray-200/80"}`}
            >
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  {s.label}
                </span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">{s.value}</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.cls}`}>
                <s.icon className="w-6 h-6" />
              </div>
            </Tag>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit">
          {["All", "Published", "Draft"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchableSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: "All", label: "All categories" },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
            searchPlaceholder="Search categories..."
            emptyText="No categories found"
            className="min-w-44 max-w-60"
            buttonClassName="py-2 bg-gray-50 hover:border-gray-300"
            dropdownClassName="w-64 right-auto"
          />
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, author, category..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
            />
          </div>
          <button
            onClick={fetchBlogs}
            title="Refresh"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#09A64A] text-white font-semibold text-[13.5px] tracking-wide">
                <th className="py-4 px-5 w-16 text-center">S.No</th>
                <th className="py-4 px-5 w-[380px]">Blog</th>
                <th className="py-4 px-5 min-w-[140px]">Author</th>
                <th className="py-4 px-5 min-w-[150px]">Category</th>
                <th className="py-4 px-5 w-36">Published</th>
                <th className="py-4 px-5 text-center w-32">Status</th>
                <th className="py-4 px-5 text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && blogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm font-semibold text-gray-500">
                    Loading blogs...
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 font-medium text-sm">
                    {blogs.length === 0 ? (
                      <>
                        No blogs yet.{" "}
                        <Link
                          href="/blogs/create"
                          className="text-[#09A64A] font-bold hover:underline"
                        >
                          Write the first one
                        </Link>
                      </>
                    ) : (
                      "No blogs match your filters."
                    )}
                  </td>
                </tr>
              ) : (
                pageItems.map((b, idx) => {
                  const isPublished = b.status === "Published";
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-5 text-center font-bold text-gray-500 text-sm">
                        {(safePage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-4 px-5 w-[380px] max-w-[380px]">
                        <div className="flex items-start gap-3">
                          {b.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={b.coverImage}
                              alt=""
                              className="w-16 h-11 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                              <ImageOff className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/blogs/${b.id}/edit`}
                              title={b.title}
                              className="font-bold text-gray-900 hover:text-[#09A64A] text-[14px] leading-snug line-clamp-3 break-words whitespace-normal"
                            >
                              {b.title}
                            </Link>
                            <div
                              className="text-[11px] text-gray-400 font-mono line-clamp-1 break-all mt-0.5"
                              title={`/${b.slug}`}
                            >
                              /{b.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-700 font-medium">
                        {b.authorName}
                      </td>
                      <td className="py-4 px-5">
                        {b.category ? (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                            {b.category}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-xs text-gray-600 font-medium">
                        {formatBlogDate(b.publishedAt)}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleToggleStatus(b)}
                          title={isPublished ? "Click to move to Draft" : "Click to publish"}
                          className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-colors ${
                            isPublished
                              ? "bg-emerald-50 text-[#09A64A] border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {b.status}
                        </button>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/blogs/${b.id}/edit`}
                            title="Edit"
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(b)}
                            title="Delete"
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer Pagination Bar */}
        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filtered.length > 0 ? startIndex : 0}
              </span>{" "}
              to <span className="font-bold text-gray-900">{endIndex}</span> of{" "}
              <span className="font-bold text-gray-900">{filtered.length}</span> entries
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-semibold"
              >
                Previous
              </button>

              {getPaginationRange().map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-gray-400 font-bold text-xs select-none"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${p}`}
                    onClick={() => setPage(Number(p))}
                    className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      safePage === p
                        ? "bg-[#09A64A] text-white shadow-xs"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-semibold"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
