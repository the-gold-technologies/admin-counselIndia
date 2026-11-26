"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  CircleAlert,
  CircleX,
  EyeOff,
  Globe,
  ImageOff,
  RotateCcw,
  Wand2,
} from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import {
  DESCRIPTION_RANGE,
  EffectiveSeo,
  PageSeoFormValues,
  PageSeoItem,
  PUBLIC_SITE_URL,
  TITLE_RANGE,
  findDuplicates,
  gradeClasses,
  normalisePagePath,
  scorePageSeo,
} from "@/lib/pageSeo";
import { normaliseList } from "@/lib/blogPayload";

const inputCls =
  "w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900";
const labelCls = "block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5";
const cardCls = "bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-5";

/** Length meter: grey when empty, amber when too short/long, green inside the range. */
export function LengthMeter({ length, min, max }: { length: number; min: number; max: number }) {
  const ok = length >= min && length <= max;
  const color = length === 0 ? "bg-gray-200" : ok ? "bg-[#09A64A]" : "bg-amber-500";
  const text = length === 0 ? "text-gray-400" : ok ? "text-[#09A64A]" : "text-amber-600";
  return (
    <div className="flex items-center gap-3 mt-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(100, (length / max) * 100)}%` }}
        />
      </div>
      <span className={`text-[11px] font-semibold tabular-nums ${text}`}>
        {length} / {min}–{max}
      </span>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <span>
        <span className="block text-sm font-bold text-gray-900">{title}</span>
        <span className="block text-[11px] text-gray-500 mt-0.5">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer ${
          checked ? "bg-rose-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}

const CheckIcon = ({ level }: { level: "pass" | "warn" | "fail" }) =>
  level === "pass" ? (
    <CheckCircle2 className="w-4 h-4 text-[#09A64A] shrink-0" />
  ) : level === "warn" ? (
    <CircleAlert className="w-4 h-4 text-amber-500 shrink-0" />
  ) : (
    <CircleX className="w-4 h-4 text-rose-500 shrink-0" />
  );

interface PageSeoFormProps {
  initialValues: PageSeoFormValues;
  /** Editing the site-wide defaults instead of one page. */
  isDefaults?: boolean;
  /** Custom page not yet saved: the address can be typed. */
  pathEditable?: boolean;
  /** Title hard-coded in the website, used while no title is saved here. */
  builtInTitle?: string;
  /** Suggest hiding this page from Google (result pages). */
  suggestHide?: boolean;
  defaults: PageSeoItem | null;
  /** Every other page (for the duplicate title / description check). */
  allPages: EffectiveSeo[];
  /** Saved row id — enables "Reset to built-in". */
  savedId?: string;
  onSubmit: (values: PageSeoFormValues) => Promise<void>;
  onReset?: () => Promise<void>;
}

export default function PageSeoForm({
  initialValues,
  isDefaults = false,
  pathEditable = false,
  builtInTitle,
  suggestHide,
  defaults,
  allPages,
  savedId,
  onSubmit,
  onReset,
}: PageSeoFormProps) {
  const [values, setValues] = useState<PageSeoFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof PageSeoFormValues>(key: K, val: PageSeoFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const path = normalisePagePath(values.path) || values.path;
  const pageUrl = isDefaults ? PUBLIC_SITE_URL : `${PUBLIC_SITE_URL}${path === "/" ? "" : path}`;

  // What the website will actually output (same fallback order as the website)
  const effTitle =
    values.metaTitle.trim() || builtInTitle || defaults?.metaTitle || "Counsel India";
  const effDescription = values.metaDescription.trim() || defaults?.metaDescription || "";
  const effImage = values.ogImage.trim() || (isDefaults ? "" : defaults?.ogImage || "");
  const shareTitle = values.ogTitle.trim() || effTitle;
  const shareDescription = values.ogDescription.trim() || effDescription;

  const score = useMemo(() => {
    const me: EffectiveSeo = {
      path,
      name: values.pageName,
      title: values.metaTitle.trim() || builtInTitle || "",
      description: values.metaDescription,
    };
    return scorePageSeo({
      metaTitle: me.title,
      metaDescription: values.metaDescription,
      metaKeywords: values.metaKeywords,
      ogImage: effImage,
      noIndex: values.noIndex,
      ...(isDefaults ? {} : findDuplicates(me, allPages)),
    });
  }, [values, builtInTitle, effImage, allPages, path, isDefaults]);

  const keywords = normaliseList(values.metaKeywords)?.split(", ") || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isDefaults && !normalisePagePath(values.path))
      return setError("Enter a page address like /about.");
    if (!values.pageName.trim()) return setError("Enter a page name.");
    if (values.canonicalUrl.trim() && !/^https?:\/\/\S+$/i.test(values.canonicalUrl.trim()))
      return setError("Canonical URL must be a full link starting with https://");

    setSaving(true);
    try {
      await onSubmit({ ...values, path: isDefaults ? "*" : normalisePagePath(values.path)! });
    } catch (err: any) {
      setError(err?.message || "Something went wrong while saving.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!onReset) return;
    if (
      !confirm(
        isDefaults
          ? "Remove the site-wide defaults?"
          : `Remove the saved SEO for "${values.pageName}"? The page goes back to its built-in title and the site-wide defaults.`
      )
    )
      return;
    setSaving(true);
    try {
      await onReset();
    } catch (err: any) {
      setError(err?.message || "Could not reset.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isDefaults ? (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            These values are used on <b>every page</b> that leaves a field empty — for example the
            share image appears whenever a page has none of its own. Keep the description general
            and give important pages their own.
          </div>
        ) : (
          suggestHide &&
          !values.noIndex && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-sm">
              <EyeOff className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="flex-1">
                This is a personal result page. Pages like this are usually hidden from Google.
              </span>
              <button
                type="button"
                onClick={() => setValues((v) => ({ ...v, noIndex: true, noFollow: true }))}
                className="text-xs font-bold underline cursor-pointer shrink-0"
              >
                Hide it
              </button>
            </div>
          )
        )}

        {/* Page */}
        {!isDefaults && (
          <div className={cardCls}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  Page name<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={values.pageName}
                  onChange={(e) => set("pageName", e.target.value)}
                  placeholder="e.g. Summer Landing Page"
                  className={inputCls}
                />
                <p className="text-[11px] text-gray-400 mt-1">Only shown here in the admin.</p>
              </div>
              <div>
                <label className={labelCls}>
                  Page address<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={values.path}
                  readOnly={!pathEditable}
                  onChange={(e) => set("path", e.target.value)}
                  onBlur={() => set("path", normalisePagePath(values.path) || values.path)}
                  placeholder="/landing/summer-offer"
                  className={`${inputCls} font-mono text-xs ${!pathEditable ? "text-gray-500 cursor-not-allowed" : ""}`}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  {pathEditable
                    ? "You can paste the full link — only the part after the domain is kept."
                    : "Fixed website page."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Google */}
        <div className={cardCls}>
          <div>
            <h3 className="text-sm font-black text-gray-900">
              {isDefaults ? "Default search details" : "Google search"}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              What people see in Google results before they click.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`${labelCls} mb-0`}>
                {isDefaults ? "Default title" : "Meta title"}
              </label>
              {builtInTitle && !values.metaTitle && (
                <button
                  type="button"
                  onClick={() => set("metaTitle", builtInTitle)}
                  className="text-[11px] font-bold text-[#09A64A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Wand2 className="w-3 h-3" /> Start from current title
                </button>
              )}
            </div>
            <input
              type="text"
              value={values.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder={builtInTitle || "e.g. Online Psychology Courses | Counsel India"}
              className={inputCls}
            />
            <LengthMeter length={values.metaTitle.trim().length} {...TITLE_RANGE} />
            {!values.metaTitle && builtInTitle && (
              <p className="text-[11px] text-gray-400 mt-1">
                Empty — the website keeps using its current title shown above.
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>
              {isDefaults ? "Default description" : "Meta description"}
            </label>
            <textarea
              rows={3}
              value={values.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              placeholder={
                defaults?.metaDescription && !isDefaults
                  ? `Empty — uses the site-wide default: ${defaults.metaDescription}`
                  : "One or two sentences that make people want to click"
              }
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
              placeholder="online psychology course, counselling course india"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Separate with commas. Green = appears in the title or description.
            </p>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {keywords.map((k) => {
                  const used = (values.metaTitle + " " + values.metaDescription)
                    .toLowerCase()
                    .includes(k.toLowerCase());
                  return (
                    <span
                      key={k}
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                        used
                          ? "bg-emerald-50 border-emerald-100 text-[#09A64A]"
                          : "bg-gray-50 border-gray-200 text-gray-500"
                      }`}
                    >
                      {k}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {!isDefaults && (
            <div>
              <label className={labelCls}>Canonical URL</label>
              <input
                type="url"
                value={values.canonicalUrl}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                placeholder={pageUrl}
                className={`${inputCls} font-mono text-xs`}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Leave empty to use this page&apos;s own address. Only set it when this page is a
                copy of another page (e.g. /career → /careers).
              </p>
            </div>
          )}
        </div>

        {/* Social */}
        <div className={cardCls}>
          <div>
            <h3 className="text-sm font-black text-gray-900">Social sharing</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              The card shown when the link is shared on WhatsApp, Facebook or LinkedIn.
              {isDefaults ? "" : " Leave empty to reuse the Google title and description."}
            </p>
          </div>
          {!isDefaults && (
            <>
              <div>
                <label className={labelCls}>Share title</label>
                <input
                  type="text"
                  value={values.ogTitle}
                  onChange={(e) => set("ogTitle", e.target.value)}
                  placeholder={effTitle}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Share description</label>
                <textarea
                  rows={2}
                  value={values.ogDescription}
                  onChange={(e) => set("ogDescription", e.target.value)}
                  placeholder={effDescription || "Short line shown under the share title"}
                  className={`${inputCls} resize-y`}
                />
              </div>
            </>
          )}
          <ImageUploadField
            label={isDefaults ? "Default share image" : "Share image"}
            value={values.ogImage}
            onChange={(url) => set("ogImage", url)}
          />
          <p className="text-[11px] text-gray-400 -mt-3">
            Best size 1200 × 630 px.
            {!isDefaults && defaults?.ogImage ? " Empty = the site-wide default image." : ""}
          </p>
        </div>
      </div>

      {/* Right: publish, score + previews */}
      <div className="space-y-6">
        <div className="xl:sticky xl:top-24 space-y-6">
          {/* Publish — same card as the Blogs form */}
          <div className={cardCls}>
            <h3 className="text-sm font-black text-gray-900">Publish</h3>

            {!isDefaults && (
              <>
                <div>
                  <label className={labelCls}>Google</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { hidden: false, label: "Visible on Google" },
                      { hidden: true, label: "Hidden from Google" },
                    ].map((o) => (
                      <button
                        type="button"
                        key={o.label}
                        onClick={() => set("noIndex", o.hidden)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          values.noIndex === o.hidden
                            ? o.hidden
                              ? "bg-rose-50 border-rose-400 text-rose-600"
                              : "bg-emerald-50 border-[#09A64A] text-[#09A64A]"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Hide thank-you, result and private pages (adds “noindex”).
                  </p>
                </div>

                <Toggle
                  checked={values.noFollow}
                  onChange={(v) => set("noFollow", v)}
                  title="Don’t follow links"
                  description="Adds “nofollow”. Rarely needed — leave off unless your SEO team asks."
                />
              </>
            )}

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
                <span>Save SEO</span>
              </button>
              {savedId && onReset && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleReset}
                  className="w-full px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isDefaults ? "Remove defaults" : "Reset to built-in"}
                </button>
              )}
              <Link
                href="/page-seo"
                className="block text-center w-full px-6 py-2.5 rounded-xl text-gray-500 hover:text-gray-800 font-semibold text-sm transition-colors"
              >
                Cancel
              </Link>
              <p className="text-[11px] text-gray-400 text-center">
                The website picks up changes within about a minute.
              </p>
            </div>
          </div>

          <div className={cardCls}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900">SEO score</h3>
              <span
                className={`px-2.5 py-1 rounded-full border text-xs font-bold ${gradeClasses[score.grade]}`}
              >
                {score.score} · {score.grade}
              </span>
            </div>
            <ul className="space-y-2.5">
              {score.checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5">
                  <CheckIcon level={c.level} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-800">{c.label}</div>
                    {c.hint && <div className="text-[11px] text-gray-500">{c.hint}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={cardCls}>
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" /> Google preview
            </h3>
            {values.noIndex ? (
              <p className="text-xs text-rose-600 font-semibold">
                Hidden from Google — this page will not show in results.
              </p>
            ) : (
              <div className="font-[arial,sans-serif]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-[#09A64A]">
                    CI
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] text-gray-900 leading-tight">Counsel India</div>
                    <div className="text-[11px] text-gray-500 truncate leading-tight">
                      {pageUrl.replace(/^https?:\/\//, "").replace(/\//g, " › ")}
                    </div>
                  </div>
                </div>
                <div className="text-[18px] text-[#1a0dab] leading-snug mt-1.5 line-clamp-1">
                  {effTitle}
                </div>
                <div className="text-[13px] text-[#4d5156] leading-snug mt-0.5 line-clamp-2">
                  {effDescription || (
                    <span className="italic text-gray-400">
                      No description — Google will pick some text from the page.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={cardCls}>
            <h3 className="text-sm font-black text-gray-900">Share preview</h3>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {effImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={effImage} alt="" className="w-full aspect-[1.91/1] object-cover" />
              ) : (
                <div className="w-full aspect-[1.91/1] bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-1">
                  <ImageOff className="w-6 h-6" />
                  <span className="text-[11px] font-semibold">No share image</span>
                </div>
              )}
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">
                  {PUBLIC_SITE_URL.replace(/^https?:\/\//, "")}
                </div>
                <div className="text-sm font-bold text-gray-900 line-clamp-2">{shareTitle}</div>
                {shareDescription && (
                  <div className="text-xs text-gray-500 line-clamp-1">{shareDescription}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
