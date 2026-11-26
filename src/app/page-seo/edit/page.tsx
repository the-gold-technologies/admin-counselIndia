"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ChevronLeft, ExternalLink } from "lucide-react";
import PageSeoForm from "@/components/page-seo/PageSeoForm";
import {
  EMPTY_PAGE_SEO,
  PageSeoFormValues,
  PageSeoItem,
  buildPageRows,
  normalisePagePath,
  pageSeoToFormValues,
  websitePageUrl,
} from "@/lib/pageSeo";
import { DEFAULTS_PATH, findWebsitePage } from "@/lib/websitePages";

function EditPageSeo() {
  const router = useRouter();
  const params = useSearchParams();
  const isNewCustom = params.get("new") === "1";
  const path = isNewCustom ? "" : normalisePagePath(params.get("path") || "") || "";
  // "Add page" can start with an address prefix, e.g. /events/ from the Event pages card
  const prefill = isNewCustom ? params.get("path") || "" : "";
  const isDefaults = path === DEFAULTS_PATH;
  const known = findWebsitePage(path);

  const [saved, setSaved] = useState<PageSeoItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/page-seo")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) setSaved(json.data);
        else setLoadError(json.error || "Could not load page SEO.");
      })
      .catch(() => setLoadError("Could not load page SEO."));
  }, []);

  const goBack = () => {
    router.push("/page-seo");
    router.refresh();
  };

  const handleSave = async (values: PageSeoFormValues) => {
    // A new custom page must not silently overwrite a page that already has SEO
    if (isNewCustom && saved?.some((s) => s.path === values.path)) {
      throw new Error(`SEO for ${values.path} already exists. Edit it from the list instead.`);
    }
    const res = await fetch("/api/page-seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to save");
    goBack();
  };

  const row = saved?.find((s) => s.path === path) || null;

  const handleReset = async () => {
    if (!row) return;
    const res = await fetch(`/api/page-seo/${row.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to reset");
    goBack();
  };

  const title = isDefaults
    ? "Site-wide SEO defaults"
    : isNewCustom
      ? "Add SEO for a custom page"
      : `SEO · ${row?.pageName || known?.name || path}`;
  const liveUrl = websitePageUrl(path);

  let body: React.ReactNode;
  if (!isNewCustom && !path) {
    body = <ErrorBox text="No page selected." />;
  } else if (loadError) {
    body = <ErrorBox text={loadError} />;
  } else if (!saved) {
    body = (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center shadow-xs">
        <div className="w-8 h-8 border-3 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-600">Loading…</p>
      </div>
    );
  } else {
    const { rows, defaults } = buildPageRows(saved);
    const initial: PageSeoFormValues = row
      ? pageSeoToFormValues(row)
      : {
          ...EMPTY_PAGE_SEO,
          path: isDefaults ? DEFAULTS_PATH : path || prefill,
          pageName: isDefaults ? "Site-wide defaults" : known?.name || "",
          // Result pages start hidden from Google
          noIndex: !!known?.hideFromGoogle,
          noFollow: !!known?.hideFromGoogle,
        };
    body = (
      <PageSeoForm
        key={path || "new"}
        initialValues={initial}
        isDefaults={isDefaults}
        pathEditable={isNewCustom}
        builtInTitle={known?.builtInTitle}
        suggestHide={known?.hideFromGoogle}
        defaults={isDefaults ? null : defaults}
        allPages={rows.map((r) => r.effective)}
        savedId={row?.id}
        onSubmit={handleSave}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="space-y-6 pb-16 w-full">
      <div>
        <Link
          href="/page-seo"
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#09A64A] hover:text-[#089341] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO PAGE SEO</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-[13px]">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{title}</h1>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#09A64A]"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View page
            </a>
          )}
        </div>
        {row?.updatedBy && (
          <p className="text-xs text-gray-500 mt-1">
            Last saved by {row.updatedBy} on{" "}
            {new Date(row.updatedAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>
      {body}
    </div>
  );
}

const ErrorBox = ({ text }: { text: string }) => (
  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-medium">
    <AlertCircle className="w-5 h-5 shrink-0" />
    <span>{text}</span>
  </div>
);

export default function EditPageSeoPage() {
  return (
    <Suspense fallback={null}>
      <EditPageSeo />
    </Suspense>
  );
}
