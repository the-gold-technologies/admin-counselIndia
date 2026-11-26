"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { LengthMeter, Toggle } from "@/components/page-seo/PageSeoForm";
import { DESCRIPTION_RANGE, TITLE_RANGE } from "@/lib/pageSeo";
import type { ItemSeoValues } from "@/lib/itemSeo";
import { useAdminAccess } from "@/hooks/useAdminAccess";

const inputCls =
  "w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900";
const labelCls = "block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5";

interface ItemSeoFieldsProps {
  value: ItemSeoValues;
  onChange: (v: ItemSeoValues) => void;
  /** Website address of this item's page, e.g. /course/therapy-master-course */
  pagePath: string;
  /** What the website shows when the fields are left empty. */
  fallbackTitle: string;
  fallbackDescription?: string;
  /** Item not saved yet: the page address is only final after saving. */
  isNew?: boolean;
}

/**
 * SEO fields shown inside a course / counsellor form — the same record as Admin → Page SEO,
 * so it can be edited in either place.
 */
export function ItemSeoFields({
  value,
  onChange,
  pagePath,
  fallbackTitle,
  fallbackDescription = "",
  isNew,
}: ItemSeoFieldsProps) {
  const { canOpen } = useAdminAccess();
  const set = <K extends keyof ItemSeoValues>(k: K, v: ItemSeoValues[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Meta title</label>
            <input
              type="text"
              value={value.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder={fallbackTitle}
              className={inputCls}
            />
            <LengthMeter length={value.metaTitle.trim().length} {...TITLE_RANGE} />
          </div>
          <div>
            <label className={labelCls}>Meta description</label>
            <textarea
              rows={3}
              value={value.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              placeholder={fallbackDescription || "One or two sentences that make people click"}
              className={`${inputCls} resize-y`}
            />
            <LengthMeter length={value.metaDescription.trim().length} {...DESCRIPTION_RANGE} />
          </div>
          <div>
            <label className={labelCls}>Keywords</label>
            <input
              type="text"
              value={value.metaKeywords}
              onChange={(e) => set("metaKeywords", e.target.value)}
              placeholder="online psychology course, counselling course india"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">Separate with commas.</p>
          </div>
        </div>

        <div className="space-y-5">
          <ImageUploadField
            label="Share image (WhatsApp, Facebook, LinkedIn)"
            value={value.ogImage}
            onChange={(url) => set("ogImage", url)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <Toggle
          checked={value.noIndex}
          onChange={(v) => set("noIndex", v)}
          title="Hide this page from Google"
          description="Adds “noindex”. Use only for pages that should not appear in search."
        />
      </div>

      <p className="text-[11px] text-gray-400 flex flex-wrap items-center gap-1">
        Optional — empty fields use the name and description above. Saved together with this form
        {isNew ? " (the page address is final after the first save)" : ""}.
        {!isNew && canOpen("/page-seo") && (
          <Link
            href={`/page-seo/edit?path=${encodeURIComponent(pagePath)}`}
            className="text-[#09A64A] font-bold hover:underline inline-flex items-center gap-0.5"
          >
            More options in Page SEO <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </p>
    </div>
  );
}

/** Small status shown in a collapsed SEO section header. */
export function seoBadge(v: ItemSeoValues) {
  const set = !!(v.metaTitle.trim() || v.metaDescription.trim());
  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
        v.noIndex
          ? "bg-rose-50 text-rose-600 border-rose-200"
          : set
            ? "bg-emerald-50 text-[#09A64A] border-emerald-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      {v.noIndex ? "Hidden" : set ? "SEO set" : "Not set"}
    </span>
  );
}
