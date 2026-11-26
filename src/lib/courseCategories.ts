/** Top-level course groups shown in the website's course menu (in this order). */
export const MAIN_CATEGORIES = ["CI Programs", "IPA", "AIU", "MIT"] as const;

export const DEFAULT_MAIN_CATEGORY = "CI Programs";

/** Returns a valid main category, or the default for anything unknown/empty. */
export function normaliseMainCategory(value: unknown): string {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  return MAIN_CATEGORIES.find((c) => c.toLowerCase() === v) || DEFAULT_MAIN_CATEGORY;
}
