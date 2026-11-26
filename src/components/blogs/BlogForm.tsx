"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { CmsEditor } from "@/components/ui/CmsEditor";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { slugify } from "@/lib/utils";
import { LengthMeter } from "@/components/page-seo/PageSeoForm";
import { DESCRIPTION_RANGE, TITLE_RANGE } from "@/lib/pageSeo";

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  authorName: string;
  category?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  tags?: string | null;
  status: string; // Published, Draft
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFormValues {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogImage: string;
  tags: string;
  status: string;
  publishedAt: string; // yyyy-mm-dd
}

const today = () => new Date().toISOString().slice(0, 10);

export const EMPTY_BLOG: BlogFormValues = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",
  authorName: "",
  category: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
  ogImage: "",
  tags: "",
  status: "Published",
  publishedAt: today(),
};

export function blogToFormValues(b: BlogItem): BlogFormValues {
  return {
    title: b.title || "",
    slug: b.slug || "",
    content: b.content || "",
    excerpt: b.excerpt || "",
    coverImage: b.coverImage || "",
    authorName: b.authorName || "",
    category: b.category || "",
    metaTitle: b.metaTitle || "",
    metaDescription: b.metaDescription || "",
    metaKeywords: b.metaKeywords || "",
    canonicalUrl: b.canonicalUrl || "",
    ogImage: b.ogImage || "",
    tags: b.tags || "",
    status: b.status || "Published",
    publishedAt: b.publishedAt ? String(b.publishedAt).slice(0, 10) : today(),
  };
}

// Live site domain for canonical links (same default the website uses)
const PUBLIC_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.counselindia.com"
).replace(/\/+$/, "");

const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** Cut to ~160 chars on a word boundary */
const shorten = (text: string, max = 160) =>
  text.length <= max
    ? text
    : text.slice(
        0,
        text.lastIndexOf(" ", max - 1) > 80 ? text.lastIndexOf(" ", max - 1) : max - 1
      ) + "…";

/**
 * Suggested SEO for an existing post whose SEO fields are empty — the same values the website
 * falls back to. Returns the filled values and which fields were suggested.
 */
export function withSuggestedSeo(v: BlogFormValues): {
  values: BlogFormValues;
  suggested: (keyof BlogFormValues)[];
} {
  const out = { ...v };
  const suggested: (keyof BlogFormValues)[] = [];
  const suggest = (key: keyof BlogFormValues, value: string) => {
    if (!out[key].trim() && value.trim()) {
      out[key] = value.trim();
      suggested.push(key);
    }
  };
  suggest("metaTitle", v.title ? `${v.title} | Counsel India` : "");
  suggest("metaDescription", shorten(v.excerpt.trim() || plainText(v.content)));
  suggest("metaKeywords", v.tags || v.category);
  suggest("canonicalUrl", v.slug ? `${PUBLIC_SITE_URL}/blog-detail/${v.slug}` : "");
  return { values: out, suggested };
}

export function websiteBlogUrl(slug: string): string | null {
  const base = (process.env.NEXT_PUBLIC_WEBSITE_URL || "").replace(/\/+$/, "");
  if (!base || base === "*" || !slug) return null;
  return `${base}/blog-detail/${slug}`;
}

const splitList = (v: string) =>
  v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const inputCls =
  "w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900";
const labelCls = "block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5";

interface BlogFormProps {
  initialValues: BlogFormValues;
  /** New post: the web address follows the title until the user edits it. */
  isNew: boolean;
  submitLabel: string;
  onSubmit: (values: BlogFormValues) => Promise<void>;
}

export default function BlogForm({ initialValues, isNew, submitLabel, onSubmit }: BlogFormProps) {
  // Existing posts with empty SEO get suggested values (saved only when the user clicks Save)
  const [{ values: startValues, suggested }] = useState(() =>
    isNew
      ? { values: initialValues, suggested: [] as (keyof BlogFormValues)[] }
      : withSuggestedSeo(initialValues)
  );
  const [values, setValues] = useState<BlogFormValues>(startValues);
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authors, setAuthors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Suggest authors / categories already used on other posts (plain text — no separate setup needed)
  useEffect(() => {
    fetch("/api/blogs?summary=1")
      .then((r) => r.json())
      .then((json) => {
        if (!json?.success || !Array.isArray(json.data)) return;
        const uniq = (list: (string | null | undefined)[]) =>
          [...new Set(list.map((x) => (x || "").trim()).filter(Boolean))].sort();
        setAuthors(uniq(json.data.map((b: BlogItem) => b.authorName)));
        setCategories(uniq(json.data.map((b: BlogItem) => b.category)));
      })
      .catch(() => {});
  }, []);

  const set = <K extends keyof BlogFormValues>(key: K, val: BlogFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const handleTitle = (title: string) =>
    setValues((prev) => ({ ...prev, title, slug: slugEdited ? prev.slug : slugify(title) }));

  const handleSubmit = async (e: React.FormEvent, statusOverride?: string) => {
    e.preventDefault();
    setError(null);
    const v = statusOverride ? { ...values, status: statusOverride } : values;
    if (!v.title.trim()) return setError("Please enter a title.");
    if (!slugify(v.slug || v.title)) return setError("Please enter a web address (slug).");
    if (!/<img\s/i.test(v.content) && !v.content.replace(/<[^>]*>|&nbsp;/g, "").trim())
      return setError("Please write the blog content.");

    setSaving(true);
    try {
      await onSubmit({ ...v, slug: slugify(v.slug || v.title) });
    } catch (err: any) {
      setError(err?.message || "Something went wrong while saving the blog.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const liveUrl = websiteBlogUrl(values.slug);

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: writing area */}
      <div className="xl:col-span-2 space-y-6">
        {suggested.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-sm">
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
            <span>
              Some SEO fields were empty for this post, so suggested values were filled in (
              {suggested
                .map(
                  (k) =>
                    ({
                      metaTitle: "meta title",
                      metaDescription: "meta description",
                      metaKeywords: "keywords",
                      canonicalUrl: "canonical URL",
                    })[k as string] || k
                )
                .join(", ")}
              ). Review them in the SEO section and click <b>Save Changes</b> to keep them.
            </span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-5">
          <div>
            <label className={labelCls}>
              Title<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={values.title}
              onChange={(e) => handleTitle(e.target.value)}
              placeholder="e.g. 10 Best Career Options in Psychology"
              className={`${inputCls} text-base font-bold`}
            />
          </div>

          <div>
            <label className={labelCls}>Web address (slug)</label>
            <input
              type="text"
              value={values.slug}
              onChange={(e) => {
                setSlugEdited(true);
                set("slug", e.target.value);
              }}
              onBlur={() => set("slug", slugify(values.slug))}
              placeholder="10-best-career-options-in-psychology"
              className={`${inputCls} font-mono text-xs`}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Filled automatically from the title. Page: /blog-detail/{values.slug || "…"}
            </p>
          </div>

          <CmsEditor
            label="Blog Content *"
            value={values.content}
            onChange={(html) => set("content", html)}
            placeholder="Start writing your blog here…"
            allowImages
            tall
          />

          <div>
            <label className={labelCls}>Short summary</label>
            <textarea
              rows={3}
              value={values.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="1–2 lines shown on the blog list card (optional)"
              className={`${inputCls} resize-y`}
            />
          </div>
        </div>

        {/* SEO — same layout as the course / counsellor SEO sections */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-5">
          <div>
            <h3 className="text-sm font-black text-gray-900">SEO (Google search)</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Optional. Anything left empty falls back to the blog title, summary and cover image.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Meta title</label>
                <input
                  type="text"
                  value={values.metaTitle}
                  onChange={(e) => set("metaTitle", e.target.value)}
                  placeholder={
                    values.title
                      ? `${values.title} | Counsel India`
                      : "Title shown in Google results"
                  }
                  className={inputCls}
                />
                <LengthMeter length={values.metaTitle.trim().length} {...TITLE_RANGE} />
              </div>
              <div>
                <label className={labelCls}>Meta description</label>
                <textarea
                  rows={3}
                  value={values.metaDescription}
                  onChange={(e) => set("metaDescription", e.target.value)}
                  placeholder="One or two sentences that make people click"
                  className={`${inputCls} resize-y`}
                />
                <LengthMeter length={values.metaDescription.trim().length} {...DESCRIPTION_RANGE} />
              </div>
              <div>
                <label className={labelCls}>Keywords</label>
                <input
                  type="text"
                  value={values.metaKeywords}
                  onChange={(e) => set("metaKeywords", e.target.value)}
                  placeholder="psychology, career in psychology, counselling"
                  className={inputCls}
                />
                <p className="text-[11px] text-gray-400 mt-1">Separate with commas.</p>
              </div>
            </div>

            <div className="space-y-5">
              <ImageUploadField
                label="Share image (WhatsApp, Facebook, LinkedIn)"
                value={values.ogImage}
                onChange={(url) => set("ogImage", url)}
              />
              <p className="text-[11px] text-gray-400 -mt-3">
                Optional. If empty, the cover image is used when the link is shared.
              </p>
            </div>
          </div>

          <div>
            <label className={labelCls}>Canonical URL</label>
            <input
              type="url"
              value={values.canonicalUrl}
              onChange={(e) => set("canonicalUrl", e.target.value)}
              placeholder={liveUrl || "https://www.counselindia.com/blog-detail/…"}
              className={`${inputCls} font-mono text-xs`}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Leave empty to use this post&apos;s own page address. Only set it if this article is a
              copy of a page published elsewhere.
            </p>
          </div>
        </div>
      </div>

      {/* Right: publish settings */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-5 xl:sticky xl:top-24">
          <h3 className="text-sm font-black text-gray-900">Publish</h3>

          <div>
            <label className={labelCls}>Status</label>
            <div className="grid grid-cols-2 gap-2">
              {["Published", "Draft"].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => set("status", s)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    values.status === s
                      ? s === "Published"
                        ? "bg-emerald-50 border-[#09A64A] text-[#09A64A]"
                        : "bg-amber-50 border-amber-400 text-amber-700"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s === "Published" ? "Published (live)" : "Draft (hidden)"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Publish date</label>
            <input
              type="date"
              value={values.publishedAt}
              onChange={(e) => set("publishedAt", e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Author name</label>
            <input
              type="text"
              list="blog-author-options"
              value={values.authorName}
              onChange={(e) => set("authorName", e.target.value)}
              placeholder="e.g. Sohini"
              className={inputCls}
            />
            <datalist id="blog-author-options">
              {authors.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
            <p className="text-[11px] text-gray-400 mt-1">
              Type any name. Leave empty for &quot;Counsel India&quot;.
            </p>
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <input
              type="text"
              list="blog-category-options"
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Career in Psychology"
              className={inputCls}
            />
            <datalist id="blog-category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className={labelCls}>Tags</label>
            <input
              type="text"
              value={values.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="Career in Psychology, Child Psychologist"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Separate with commas. Shown at the end of the post.
            </p>
            {splitList(values.tags).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {splitList(values.tags).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[11px] font-semibold text-[#09A64A]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <ImageUploadField
            label="Cover image"
            value={values.coverImage}
            onChange={(url) => set("coverImage", url)}
          />

          <div className="pt-2 border-t border-gray-100 space-y-2.5">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 rounded-xl bg-[#09A64A] hover:bg-[#089341] disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{submitLabel}</span>
            </button>
            {values.status === "Published" && (
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, "Draft")}
                className="w-full px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors cursor-pointer"
              >
                Save as Draft
              </button>
            )}
            <Link
              href="/blogs"
              className="block text-center w-full px-6 py-2.5 rounded-xl text-gray-500 hover:text-gray-800 font-semibold text-sm transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
