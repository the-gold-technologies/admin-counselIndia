import type { PageSeoItem } from "@/lib/pageSeo";

/**
 * SEO edited inside an item's own form (course, counsellor). It is stored in Page SEO under the
 * item's page address, so the website and Admin → Page SEO read the same record.
 */
export interface ItemSeoValues {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  noIndex: boolean;
}

export const EMPTY_ITEM_SEO: ItemSeoValues = {
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
  noIndex: false,
};

export const coursePagePath = (slug: string) => `/course/${slug}`;
/** Counsellors are keyed by their number (liveId) so a name change keeps the SEO. */
export const counsellorPagePath = (key: string) => `/counsellors-details/${key}`;

export function itemSeoFrom(row: PageSeoItem | null | undefined): ItemSeoValues {
  return {
    metaTitle: row?.metaTitle || "",
    metaDescription: row?.metaDescription || "",
    metaKeywords: row?.metaKeywords || "",
    ogImage: row?.ogImage || "",
    noIndex: !!row?.noIndex,
  };
}

/** Loads the saved SEO of an item page (public endpoint, also used by the website). */
export async function fetchItemSeo(path: string): Promise<PageSeoItem | null> {
  try {
    const res = await fetch(`/api/page-seo?path=${encodeURIComponent(path)}`);
    const json = await res.json();
    return json?.success ? json.data?.page || null : null;
  } catch {
    return null;
  }
}
