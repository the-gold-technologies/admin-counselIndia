"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Edit2,
  EyeOff,
  FileSearch,
  FileText,
  Globe,
  Info,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings2,
} from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { PageSeoItem, PageSeoRow, buildPageRows, gradeClasses, scoreRow } from "@/lib/pageSeo";
import { DEFAULTS_PATH, DYNAMIC_PAGES, PAGE_GROUPS } from "@/lib/websitePages";
import { generatePageSeoPdf } from "@/lib/generatePageSeoPdf";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Status pill shown in the list, PDF and print — like Published / Draft on Blogs. */
const rowStatus = (r: PageSeoRow) =>
  r.saved?.noIndex ? "Hidden" : r.saved ? "SEO set" : "Not set";
const statusClasses: Record<string, string> = {
  "SEO set": "bg-emerald-50 text-[#09A64A] border-emerald-200",
  "Not set": "bg-amber-50 text-amber-700 border-amber-200",
  Hidden: "bg-rose-50 text-rose-600 border-rose-200",
};

type StatusFilter = "All" | "Set" | "Not set" | "Needs attention" | "Hidden";

export default function PageSeoListPage() {
  const [saved, setSaved] = useState<PageSeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("All");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/page-seo");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setSaved(json.data);
    } catch (err) {
      console.error("Failed to load page SEO:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { rows, defaults } = useMemo(() => buildPageRows(saved), [saved]);
  const scored = useMemo(
    () => rows.map((r) => ({ row: r, score: scoreRow(r, rows, defaults) })),
    [rows, defaults]
  );

  const groups = useMemo(
    () => [
      ...PAGE_GROUPS,
      ...(["Course pages", "Counsellor pages", "Custom pages"] as const).filter((g) =>
        rows.some((r) => r.group === g)
      ),
    ],
    [rows]
  );

  const matchesStatus = (r: PageSeoRow, s: number, f: StatusFilter) =>
    f === "All" ||
    (f === "Set" && !!r.saved) ||
    (f === "Not set" && !r.saved) ||
    (f === "Needs attention" && s < 80 && !r.saved?.noIndex) ||
    (f === "Hidden" && !!r.saved?.noIndex);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scored.filter(
      ({ row, score }) =>
        (group === "All" || row.group === group) &&
        matchesStatus(row, score.score, status) &&
        (!q ||
          row.name.toLowerCase().includes(q) ||
          row.path.toLowerCase().includes(q) ||
          row.effective.title.toLowerCase().includes(q))
    );
  }, [scored, search, group, status]);

  // Pagination (same behaviour as the Blogs list)
  const [page, setPage] = useState(1);
  const pageSize = 10;
  useEffect(() => setPage(1), [search, group, status]);

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

  const count = (f: StatusFilter) =>
    scored.filter(({ row, score }) => matchesStatus(row, score.score, f)).length;
  const setCount = count("Set");
  const coverage = rows.length ? Math.round((setCount / rows.length) * 100) : 0;

  const handleExportCSV = () => {
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = [
      "Page",
      "Address",
      "Group",
      "SEO saved",
      "Score",
      "Title",
      "Description",
      "Keywords",
      "Canonical URL",
      "Share image",
      "Hidden from Google",
      "Last updated",
      "Updated by",
    ];
    const lines = filtered.map(({ row, score }) =>
      [
        row.name,
        row.path,
        row.group,
        row.saved ? "Yes" : "No",
        score.score,
        row.effective.title,
        row.effective.description,
        row.saved?.metaKeywords || "",
        row.saved?.canonicalUrl || "",
        row.saved?.ogImage || "",
        row.saved?.noIndex ? "Yes" : "No",
        row.saved ? new Date(row.saved.updatedAt).toLocaleString("en-IN") : "",
        row.saved?.updatedBy || "",
      ]
        .map(q)
        .join(",")
    );
    const blob = new Blob(["﻿" + [header.map(q).join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `counselindia_page_seo_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const pdfRows = () =>
    filtered.map(({ row, score }) => ({
      name: row.name,
      path: row.path,
      title: row.effective.title,
      score: score.score,
      status: rowStatus(row),
    }));

  const handlePrint = () => {
    if (filtered.length === 0) return;
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) return;
    const body = pdfRows()
      .map(
        (r, i) => `<tr>
          <td class="c">${i + 1}</td>
          <td><b>${escapeHtml(r.name)}</b><br><small>${escapeHtml(r.path)}</small></td>
          <td>${escapeHtml(r.title || "-")}</td>
          <td class="c">${r.score}</td>
          <td>${escapeHtml(r.status)}</td>
        </tr>`
      )
      .join("");
    const printed = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    win.document.write(`<!DOCTYPE html><html><head><title>Page SEO</title><style>
      body{font-family:Arial,sans-serif;padding:24px 30px;color:#222;margin:0}
      h1{font-size:24px;margin:0 0 4px}
      p{margin:0 0 16px;color:#64748b;font-size:12px}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #e2e8f0;padding:8px 10px;font-size:12.5px;text-align:left;vertical-align:top}
      th{background:#09A64A;color:#fff}
      small{color:#94a3b8;font-family:monospace}
      .c{text-align:center;width:40px}
      @media print{body{padding:0}@page{size:A4 portrait;margin:12mm}th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body>
      <h1>Page SEO</h1><p>${filtered.length} pages · Printed ${escapeHtml(printed)}</p>
      <table><thead><tr><th class="c">S.No</th><th>Page</th><th>Title shown in Google</th><th class="c">Score</th><th>Status</th></tr></thead>
      <tbody>${body}</tbody></table>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`);
    win.document.close();
  };

  const btn =
    "px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50";

  const stats: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ComponentType<{ className?: string }>;
    cls: string;
    filter: StatusFilter;
    active: string;
  }[] = [
    {
      label: "Pages",
      value: rows.length,
      icon: Globe,
      cls: "bg-emerald-50 text-[#09A64A]",
      filter: "All",
      active: "border-[#09A64A] ring-2 ring-[#09A64A]/20",
    },
    {
      label: "SEO set",
      value: setCount,
      sub: `${coverage}% of pages`,
      icon: CheckCircle2,
      cls: "bg-blue-50 text-blue-600",
      filter: "Set",
      active: "border-blue-500 ring-2 ring-blue-500/20",
    },
    {
      label: "Needs attention",
      value: count("Needs attention"),
      sub: "Score below 80",
      icon: AlertTriangle,
      cls: "bg-amber-50 text-amber-600",
      filter: "Needs attention",
      active: "border-amber-500 ring-2 ring-amber-500/20",
    },
    {
      label: "Hidden from Google",
      value: count("Hidden"),
      icon: EyeOff,
      cls: "bg-rose-50 text-rose-600",
      filter: "Hidden",
      active: "border-rose-500 ring-2 ring-rose-500/20",
    },
  ];

  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Page SEO</h1>
          <p className="text-xs text-gray-500 mt-1">
            Google titles, descriptions and share cards for every page of the website
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/page-seo/edit?new=1"
            className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Page</span>
          </Link>
          <button
            onClick={() => generatePageSeoPdf(pdfRows())}
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
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setStatus(s.filter)}
            className={`bg-white rounded-2xl p-5 border shadow-xs flex items-center justify-between text-left transition-all cursor-pointer hover:shadow-md ${
              status === s.filter ? s.active : "border-gray-200/80"
            }`}
          >
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {s.label}
              </span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">{s.value}</span>
              {s.sub && <span className="text-[11px] text-gray-400">{s.sub}</span>}
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.cls}`}>
              <s.icon className="w-6 h-6" />
            </div>
          </button>
        ))}
      </div>

      {/* Site-wide defaults */}
      <div
        className={`rounded-2xl border p-5 shadow-xs flex flex-col md:flex-row md:items-center gap-4 ${
          defaults ? "bg-white border-gray-200/80" : "bg-amber-50 border-amber-200"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          <Settings2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-gray-900">Site-wide defaults</div>
          {defaults ? (
            <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
              <div className="truncate">
                <b className="text-gray-700">Description:</b> {defaults.metaDescription || "—"}
              </div>
              <div>
                <b className="text-gray-700">Share image:</b> {defaults.ogImage ? "Set" : "Not set"}
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-800 mt-0.5">
              Not set yet. Add a default description and share image so no page is ever left without
              one.
            </div>
          )}
        </div>
        <Link href={`/page-seo/edit?path=${encodeURIComponent(DEFAULTS_PATH)}`} className={btn}>
          <Edit2 className="w-3.5 h-3.5" />
          {defaults ? "Edit defaults" : "Set defaults"}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit">
          {(["All", "Set", "Not set"] as StatusFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                status === tab
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
            value={group}
            onChange={setGroup}
            options={[
              { value: "All", label: "All sections" },
              ...groups.map((g) => ({ value: g, label: g })),
            ]}
            searchPlaceholder="Search sections..."
            emptyText="No sections found"
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
              placeholder="Search page, address or title..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
            />
          </div>
          <button
            onClick={load}
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
                <th className="py-4 px-5 min-w-[220px]">Page</th>
                <th className="py-4 px-5 min-w-[340px]">What Google shows</th>
                <th className="py-4 px-5 text-center w-28">Score</th>
                <th className="py-4 px-5 w-36">Last updated</th>
                <th className="py-4 px-5 text-center w-32">Status</th>
                <th className="py-4 px-5 text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && saved.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm font-semibold text-gray-500">
                    Loading pages...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 font-medium text-sm">
                    No pages match your filters.
                  </td>
                </tr>
              ) : (
                pageItems.map(({ row, score }, idx) => {
                  const editHref = `/page-seo/edit?path=${encodeURIComponent(row.path)}`;
                  const failing = score.checks.filter((c) => c.level !== "pass" && c.weight > 0);
                  return (
                    <tr key={row.path} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-5 text-center font-bold text-gray-500 text-sm">
                        {(safePage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-4 px-5">
                        <Link
                          href={editHref}
                          className="font-bold text-gray-900 hover:text-[#09A64A] text-[14px]"
                        >
                          {row.name}
                        </Link>
                        <div className="text-[11px] text-gray-400 font-mono break-all mt-0.5">
                          {row.path}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600">
                            {row.group}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 max-w-[480px]">
                        {row.effective.title ? (
                          <div className="text-[14px] text-[#1a0dab] font-medium line-clamp-1">
                            {row.effective.title}
                          </div>
                        ) : (
                          <div className="text-xs text-rose-500 font-semibold">No title</div>
                        )}
                        <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {row.effective.description || (
                            <span className="italic text-gray-400">No description</span>
                          )}
                        </div>
                        {!row.saved && row.builtInTitle && (
                          <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mt-1">
                            Built-in title
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span
                          title={failing
                            .map((c) => `• ${c.label}${c.hint ? ": " + c.hint : ""}`)
                            .join("\n")}
                          className={`inline-block px-2.5 py-1 rounded-full border text-xs font-bold ${gradeClasses[score.grade]}`}
                        >
                          {score.score}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1">{score.grade}</div>
                      </td>
                      <td className="py-4 px-5 text-xs text-gray-600">
                        {row.saved ? (
                          <>
                            <div className="font-medium">
                              {new Date(row.saved.updatedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            {row.saved.updatedBy && (
                              <div className="text-[11px] text-gray-400">{row.saved.updatedBy}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${statusClasses[rowStatus(row)]}`}
                        >
                          {rowStatus(row)}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={editHref}
                            title={row.saved ? "Edit SEO" : "Add SEO"}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
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
              <span className="font-bold text-gray-900">{filtered.length}</span> pages
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

      {/* Pages managed elsewhere */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-400" /> Pages built per item
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5 mb-4">
          Every blog, course and counsellor has its own separate SEO, set on the item itself. Click
          a card to manage it. Events are listed above under Event pages.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DYNAMIC_PAGES.map((d) => (
            <Link
              key={d.path}
              href={d.href}
              className="group p-4 rounded-xl border border-gray-200 hover:border-[#09A64A] hover:bg-emerald-50/30 transition-colors flex flex-col"
            >
              <div className="flex items-center justify-between gap-2 text-sm font-bold text-gray-900">
                <span className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-[#09A64A]" /> {d.name}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#09A64A] transition-colors" />
              </div>
              <div className="text-[11px] text-gray-500 mt-1.5 flex-1">{d.managedIn}</div>
              <div className="mt-2 text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1 break-all">
                {d.key}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
