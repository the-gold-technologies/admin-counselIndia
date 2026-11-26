import { slugify } from "@/lib/utils";

const BLOG_STATUSES = ["Published", "Draft"] as const;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const optional = (v: unknown) => str(v) || null;

/** "a, b ,a,, c" -> "a, b, c" (null when empty) */
export function normaliseList(v: unknown): string | null {
  const seen = new Set<string>();
  const items = str(v)
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x && !seen.has(x.toLowerCase()) && seen.add(x.toLowerCase()));
  return items.length ? items.join(", ") : null;
}

/**
 * Normalises an (untrusted) blog request body into Prisma data.
 * `partial` = PATCH: only keys present in the body are returned.
 * Returns an error message instead when validation fails.
 */
export function buildBlogData(
  body: Record<string, unknown>,
  partial: boolean
): { data: Record<string, unknown> } | { error: string } {
  const data: Record<string, unknown> = {};
  const has = (k: string) => !partial || k in body;

  if (has("title")) {
    const title = str(body.title);
    if (!title) return { error: "Title is required." };
    data.title = title;
  }
  if (has("slug") || (!partial && "title" in data)) {
    const slug = slugify(str(body.slug) || str(body.title));
    if (!slug) return { error: "Web address (slug) is required." };
    data.slug = slug;
  }
  if (has("content")) {
    const content = str(body.content);
    // An editor left "empty" often still contains markup like <p><br></p>
    if (!/<img\s/i.test(content) && !content.replace(/<[^>]*>|&nbsp;/g, "").trim())
      return { error: "Blog content is required." };
    data.content = content;
  }
  if (has("authorName")) data.authorName = str(body.authorName) || "Counsel India";
  if (has("status")) {
    const status = str(body.status) || "Published";
    if (!BLOG_STATUSES.includes(status as (typeof BLOG_STATUSES)[number]))
      return { error: "Status must be Published or Draft." };
    data.status = status;
  }
  if (has("publishedAt")) {
    const raw = str(body.publishedAt);
    const d = raw ? new Date(raw) : new Date();
    if (isNaN(d.getTime())) return { error: "Publish date is not a valid date." };
    data.publishedAt = d;
  }
  for (const key of [
    "excerpt",
    "coverImage",
    "category",
    "metaTitle",
    "metaDescription",
    "ogImage",
  ]) {
    if (has(key)) data[key] = optional(body[key]);
  }
  if (has("canonicalUrl")) {
    const url = str(body.canonicalUrl);
    if (url && !/^https?:\/\/\S+$/i.test(url))
      return { error: "Canonical URL must be a full link starting with https://" };
    data.canonicalUrl = url || null;
  }
  // Keywords / tags: comma-separated, trimmed, duplicates removed
  for (const key of ["metaKeywords", "tags"]) {
    if (has(key)) data[key] = normaliseList(body[key]);
  }
  return { data };
}
