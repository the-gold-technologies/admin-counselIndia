import { prisma } from "@/lib/prisma";
import { cleanupReplacedCloudinaryFiles } from "@/lib/cloudinary";
import { buildPageSeoData } from "@/lib/pageSeo";
import type { ItemSeoValues } from "@/lib/itemSeo";

const SEO_KEYS: (keyof ItemSeoValues)[] = [
  "metaTitle",
  "metaDescription",
  "metaKeywords",
  "ogImage",
  "noIndex",
];

/** Reads the optional `seo` block of a course / counsellor request body. */
export function readItemSeo(body: unknown): Partial<ItemSeoValues> | undefined {
  const seo = (body as { seo?: unknown } | null)?.seo;
  if (!seo || typeof seo !== "object" || Array.isArray(seo)) return undefined;
  const out: Partial<ItemSeoValues> = {};
  for (const k of SEO_KEYS) {
    if (k in seo) (out as Record<string, unknown>)[k] = (seo as Record<string, unknown>)[k];
  }
  return out;
}

/**
 * Saves the SEO entered in an item's form to Page SEO.
 * - `oldPath`: the item's previous address (slug changed) — its SEO moves to the new address.
 * - `seo` undefined: nothing was edited, only the move / page name is applied.
 * - all fields empty (and nothing else saved for the page): the entry is removed.
 * Returns an error message, or null when saved.
 */
export async function saveItemSeo(opts: {
  path: string;
  pageName: string;
  seo?: Partial<ItemSeoValues>;
  oldPath?: string;
  updatedBy?: string | null;
}): Promise<string | null> {
  const { path, pageName, seo, oldPath, updatedBy } = opts;

  if (oldPath && oldPath !== path) {
    const [old, current] = await Promise.all([
      prisma.pageSeo.findUnique({ where: { path: oldPath } }),
      prisma.pageSeo.findUnique({ where: { path } }),
    ]);
    if (old && !current) {
      await prisma.pageSeo.update({ where: { id: old.id }, data: { path, pageName } });
    } else if (old) {
      await prisma.pageSeo.delete({ where: { id: old.id } });
    }
  }

  const existing = await prisma.pageSeo.findUnique({ where: { path } });
  if (!seo) {
    if (existing && existing.pageName !== pageName) {
      await prisma.pageSeo.update({ where: { id: existing.id }, data: { pageName } });
    }
    return null;
  }

  const merged = {
    canonicalUrl: existing?.canonicalUrl,
    ogTitle: existing?.ogTitle,
    ogDescription: existing?.ogDescription,
    noFollow: existing?.noFollow ?? false,
    ...itemFields(existing),
    ...seo,
    path,
    pageName,
  };

  const empty =
    !merged.metaTitle?.toString().trim() &&
    !merged.metaDescription?.toString().trim() &&
    !merged.metaKeywords?.toString().trim() &&
    !merged.ogImage?.toString().trim() &&
    !merged.noIndex &&
    !merged.canonicalUrl &&
    !merged.ogTitle &&
    !merged.ogDescription &&
    !merged.noFollow;
  if (empty) {
    if (existing) {
      await prisma.pageSeo.delete({ where: { id: existing.id } });
      await cleanupReplacedCloudinaryFiles({ ogImage: existing.ogImage }, null);
    }
    return null;
  }

  const result = buildPageSeoData(merged as Record<string, unknown>);
  if ("error" in result) return result.error;

  const data = { ...result.data, updatedBy: updatedBy || null };
  const saved = await prisma.pageSeo.upsert({ where: { path }, create: data as any, update: data });
  if (existing) {
    await cleanupReplacedCloudinaryFiles({ ogImage: existing.ogImage }, { ogImage: saved.ogImage });
  }
  return null;
}

/** Checks the `seo` block before the item itself is saved. Returns an error message or null. */
export function validateItemSeo(seo?: Partial<ItemSeoValues>): string | null {
  if (!seo) return null;
  const result = buildPageSeoData({ ...seo, path: "/check", pageName: "check" });
  return "error" in result ? result.error : null;
}

/** Removes an item's SEO (item deleted). */
export async function deleteItemSeo(path: string) {
  const existing = await prisma.pageSeo.findUnique({ where: { path } });
  if (!existing) return;
  await prisma.pageSeo.delete({ where: { id: existing.id } });
  await cleanupReplacedCloudinaryFiles({ ogImage: existing.ogImage }, null);
}

function itemFields(row: { [k: string]: unknown } | null) {
  if (!row) return {};
  return {
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    metaKeywords: row.metaKeywords,
    ogImage: row.ogImage,
    noIndex: row.noIndex,
  };
}
