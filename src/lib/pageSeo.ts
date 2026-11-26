import { normaliseList } from "@/lib/blogPayload";
import {
  DEFAULTS_PATH,
  ItemPageGroup,
  ALL_WEBSITE_PAGES,
  WebsitePage,
  itemGroupFor,
} from "@/lib/websitePages";

/** A saved PageSeo row as returned by the API. */
export interface PageSeoItem {
  id: string;
  path: string;
  pageName: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageSeoFormValues {
  path: string;
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  noIndex: boolean;
  noFollow: boolean;
}

export const EMPTY_PAGE_SEO: PageSeoFormValues = {
  path: "",
  pageName: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  noIndex: false,
  noFollow: false,
};

export function pageSeoToFormValues(p: PageSeoItem): PageSeoFormValues {
  return {
    path: p.path,
    pageName: p.pageName || "",
    metaTitle: p.metaTitle || "",
    metaDescription: p.metaDescription || "",
    metaKeywords: p.metaKeywords || "",
    canonicalUrl: p.canonicalUrl || "",
    ogTitle: p.ogTitle || "",
    ogDescription: p.ogDescription || "",
    ogImage: p.ogImage || "",
    noIndex: !!p.noIndex,
    noFollow: !!p.noFollow,
  };
}

/** Recommended lengths (what Google shows before cutting text off). */
export const TITLE_RANGE = { min: 30, max: 60 };
export const DESCRIPTION_RANGE = { min: 70, max: 160 };

export const PUBLIC_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.counselindia.com"
).replace(/\/+$/, "");

/**
 * Cleans a page address typed by an admin into the form the website uses:
 * "https://www.counselindia.com/about/?x=1#top" -> "/about", "about" -> "/about", "" -> "/".
 * Returns null when it is not a usable address. "*" (site-wide defaults) is kept as is.
 */
export function normalisePagePath(input: unknown): string | null {
  let raw = typeof input === "string" ? input.trim() : "";
  if (raw === DEFAULTS_PATH) return DEFAULTS_PATH;
  if (/^https?:\/\//i.test(raw)) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      return null;
    }
  }
  raw = raw.split(/[?#]/)[0].replace(/\/{2,}/g, "/");
  if (!raw.startsWith("/")) raw = "/" + raw;
  raw = raw.length > 1 ? raw.replace(/\/+$/, "") : raw;
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* keep as typed */
  }
  if (raw.length > 300 || !/^\/[A-Za-z0-9\-._~/()]*$/.test(raw)) return null;
  return raw;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const optional = (v: unknown, max: number) => {
  const s = str(v);
  return s ? s.slice(0, max) : null;
};

/**
 * Validates an (untrusted) request body into Prisma data for PageSeo.
 * Every save sends the whole form, so all fields are always written.
 */
export function buildPageSeoData(
  body: Record<string, unknown>
): { data: Record<string, unknown> & { path: string } } | { error: string } {
  const path = normalisePagePath(body.path);
  if (!path)
    return {
      error: "Page address must look like /about (letters, numbers, - _ . ( ) and / only).",
    };

  const pageName = str(body.pageName).slice(0, 120) || (path === "/" ? "Home" : path);

  const canonicalUrl = str(body.canonicalUrl);
  if (canonicalUrl && !/^https?:\/\/\S+$/i.test(canonicalUrl))
    return { error: "Canonical URL must be a full link starting with https://" };

  const ogImage = str(body.ogImage);
  if (ogImage && !/^(https?:\/\/|\/)\S+$/i.test(ogImage))
    return { error: "Share image must be an uploaded image or a full https:// link." };

  return {
    data: {
      path,
      pageName,
      metaTitle: optional(body.metaTitle, 200),
      metaDescription: optional(body.metaDescription, 1000),
      metaKeywords: normaliseList(str(body.metaKeywords).slice(0, 1000)),
      canonicalUrl: canonicalUrl || null,
      ogTitle: optional(body.ogTitle, 200),
      ogDescription: optional(body.ogDescription, 1000),
      ogImage: ogImage || null,
      // Site-wide defaults never hide the whole site from Google
      noIndex: path === DEFAULTS_PATH ? false : body.noIndex === true,
      noFollow: path === DEFAULTS_PATH ? false : body.noFollow === true,
    },
  };
}

/* ------------------------------------------------------------------ */
/* SEO score                                                           */
/* ------------------------------------------------------------------ */

export type CheckLevel = "pass" | "warn" | "fail";

export interface SeoCheck {
  label: string;
  level: CheckLevel;
  hint?: string;
  weight: number;
}

export interface SeoScore {
  score: number; // 0–100
  grade: "Good" | "Needs work" | "Poor";
  checks: SeoCheck[];
}

interface ScoreInput {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string; // page image or the site-wide default
  noIndex: boolean;
  /** Other pages already using the same title / description (by page name). */
  duplicateTitleOf?: string[];
  duplicateDescriptionOf?: string[];
}

/** Scores a page's SEO. Used in the editor (live) and on the list page. */
export function scorePageSeo(v: ScoreInput): SeoScore {
  const checks: SeoCheck[] = [];
  const t = v.metaTitle.trim();
  const d = v.metaDescription.trim();

  if (!t) checks.push({ label: "Meta title", level: "fail", weight: 30, hint: "Add a title." });
  else if (t.length < TITLE_RANGE.min || t.length > TITLE_RANGE.max)
    checks.push({
      label: "Meta title length",
      level: "warn",
      weight: 30,
      hint: `${t.length} characters — aim for ${TITLE_RANGE.min}–${TITLE_RANGE.max}.`,
    });
  else checks.push({ label: "Meta title", level: "pass", weight: 30 });

  if (!d)
    checks.push({
      label: "Meta description",
      level: "fail",
      weight: 30,
      hint: "Add a description. Google writes its own when it is missing.",
    });
  else if (d.length < DESCRIPTION_RANGE.min || d.length > DESCRIPTION_RANGE.max)
    checks.push({
      label: "Meta description length",
      level: "warn",
      weight: 30,
      hint: `${d.length} characters — aim for ${DESCRIPTION_RANGE.min}–${DESCRIPTION_RANGE.max}.`,
    });
  else checks.push({ label: "Meta description", level: "pass", weight: 30 });

  checks.push(
    v.duplicateTitleOf?.length
      ? {
          label: "Unique title",
          level: "warn",
          weight: 15,
          hint: `Same title as: ${v.duplicateTitleOf.join(", ")}.`,
        }
      : { label: "Unique title", level: t ? "pass" : "fail", weight: 15 }
  );
  checks.push(
    v.duplicateDescriptionOf?.length
      ? {
          label: "Unique description",
          level: "warn",
          weight: 10,
          hint: `Same description as: ${v.duplicateDescriptionOf.join(", ")}.`,
        }
      : { label: "Unique description", level: d ? "pass" : "fail", weight: 10 }
  );

  checks.push(
    v.ogImage.trim()
      ? { label: "Social share image", level: "pass", weight: 10 }
      : {
          label: "Social share image",
          level: "warn",
          weight: 10,
          hint: "Links shared on WhatsApp / Facebook will show no picture.",
        }
  );

  const keywordFound =
    !!t &&
    normaliseList(v.metaKeywords)
      ?.split(", ")
      .some((k) => k && (t + " " + d).toLowerCase().includes(k.toLowerCase()));
  checks.push(
    keywordFound
      ? { label: "Keyword in title or description", level: "pass", weight: 5 }
      : {
          label: "Keyword in title or description",
          level: "warn",
          weight: 5,
          hint: v.metaKeywords.trim()
            ? "None of the keywords appear in the title or description."
            : "Add a few keywords people search for.",
        }
  );

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce(
    (s, c) => s + (c.level === "pass" ? c.weight : c.level === "warn" ? c.weight / 2 : 0),
    0
  );
  const score = Math.round((got / total) * 100);

  if (v.noIndex)
    checks.unshift({
      label: "Hidden from Google",
      level: "warn",
      weight: 0,
      hint: "This page will not appear in search results.",
    });

  return { score, grade: score >= 80 ? "Good" : score >= 50 ? "Needs work" : "Poor", checks };
}

/** A page as the score sees it: what Google will actually be given. */
export interface EffectiveSeo {
  path: string;
  name: string;
  title: string; // saved title, else the website's built-in title
  description: string;
}

const sameText = (a: string, b: string) =>
  !!a.trim() && a.trim().toLowerCase() === b.trim().toLowerCase();

/** Names of other pages that use the same title / description as `page`. */
export function findDuplicates(page: EffectiveSeo, all: EffectiveSeo[]) {
  const others = all.filter((o) => o.path !== page.path);
  return {
    duplicateTitleOf: others.filter((o) => sameText(o.title, page.title)).map((o) => o.name),
    duplicateDescriptionOf: others
      .filter((o) => sameText(o.description, page.description))
      .map((o) => o.name),
  };
}

/** Live website link for a page, or null when the website address is not configured. */
export function websitePageUrl(path: string): string | null {
  const base = (process.env.NEXT_PUBLIC_WEBSITE_URL || "").replace(/\/+$/, "");
  if (!base || base === "*" || !path || path === DEFAULTS_PATH) return null;
  return path === "/" ? base : base + path;
}

export const gradeClasses: Record<SeoScore["grade"], string> = {
  Good: "bg-emerald-50 text-[#09A64A] border-emerald-200",
  "Needs work": "bg-amber-50 text-amber-700 border-amber-200",
  Poor: "bg-rose-50 text-rose-600 border-rose-200",
};

/** One row of the Page SEO list: a website page (or custom page) plus its saved SEO, if any. */
export interface PageSeoRow {
  path: string;
  name: string;
  group: WebsitePage["group"] | ItemPageGroup | "Custom pages";
  builtInTitle?: string;
  hideFromGoogle?: boolean;
  saved: PageSeoItem | null;
  effective: EffectiveSeo;
}

/** Joins the known website pages with saved rows. Saved paths not in the list become custom pages. */
export function buildPageRows(saved: PageSeoItem[]): {
  rows: PageSeoRow[];
  defaults: PageSeoItem | null;
} {
  const byPath = new Map(saved.map((s) => [s.path, s]));
  const known = new Set(ALL_WEBSITE_PAGES.map((p) => p.path));
  const make = (
    path: string,
    name: string,
    group: PageSeoRow["group"],
    extra: Partial<WebsitePage> = {}
  ): PageSeoRow => {
    const row = byPath.get(path) || null;
    return {
      path,
      name: row?.pageName || name,
      group,
      builtInTitle: extra.builtInTitle,
      hideFromGoogle: extra.hideFromGoogle,
      saved: row,
      effective: {
        path,
        name: row?.pageName || name,
        title: row?.metaTitle || extra.builtInTitle || "",
        description: row?.metaDescription || "",
      },
    };
  };
  const rows = [
    ...ALL_WEBSITE_PAGES.map((p) => make(p.path, p.name, p.group, p)),
    ...saved
      .filter((s) => s.path !== DEFAULTS_PATH && !known.has(s.path))
      .map((s) => make(s.path, s.pageName, itemGroupFor(s.path) || "Custom pages")),
  ];
  return { rows, defaults: byPath.get(DEFAULTS_PATH) || null };
}

/** Score for a list row, as the editor would show it. */
export function scoreRow(row: PageSeoRow, all: PageSeoRow[], defaults: PageSeoItem | null) {
  return scorePageSeo({
    metaTitle: row.effective.title,
    metaDescription: row.effective.description,
    metaKeywords: row.saved?.metaKeywords || "",
    ogImage: row.saved?.ogImage || defaults?.ogImage || "",
    noIndex: !!row.saved?.noIndex,
    ...findDuplicates(
      row.effective,
      all.map((r) => r.effective)
    ),
  });
}
