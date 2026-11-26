/**
 * Admin sections a staff role can be given access to. One checkbox per section.
 * SUPERADMIN users always have access to everything.
 *
 * `pages` / `apis` are URL prefixes that belong to the section. Anything not listed here
 * (Dashboard, Profile, login/logout, file upload) is open to every logged-in user.
 */
export interface AdminSection {
  key: string;
  label: string;
  description: string;
  pages: string[];
  apis: string[];
}

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    key: "admissions",
    label: "Admissions",
    description: "Learner admissions",
    pages: ["/admissions"],
    apis: ["/api/admissions"],
  },
  {
    key: "alumni",
    label: "Alumni",
    description: "Alumni directory & certificates",
    pages: ["/alumni"],
    apis: ["/api/alumni"],
  },
  {
    key: "counsellors",
    label: "Counsellors",
    description: "Manage counsellors",
    pages: ["/counsellors"],
    apis: ["/api/counsellors"],
  },
  {
    key: "course-leads",
    label: "Course Leads",
    description: "Course leads & bookings",
    pages: ["/course-leads"],
    apis: ["/api/course-leads"],
  },
  {
    key: "courses",
    label: "Courses",
    description: "Courses, categories & content",
    pages: ["/courses"],
    apis: ["/api/courses"],
  },
  {
    key: "blogs",
    label: "Blogs",
    description: "Write & publish blogs",
    pages: ["/blogs"],
    apis: ["/api/blogs"],
  },
  {
    key: "page-seo",
    label: "Page SEO",
    description: "Google & social share details for every website page",
    pages: ["/page-seo"],
    apis: ["/api/page-seo"],
  },
  {
    key: "leads",
    label: "Enquiries / Leads",
    description: "All enquiry & lead forms",
    pages: ["/leads"],
    apis: ["/api/leads"],
  },
  {
    key: "personality-test",
    label: "Personality Test",
    description: "Questions, results & entries",
    pages: ["/personality-test"],
    apis: ["/api/personality-test"],
  },
  {
    key: "settings",
    label: "Settings",
    description: "Site, contact & footer settings",
    pages: ["/settings"],
    apis: ["/api/settings"],
  },
  {
    key: "team",
    label: "Team & Advisors",
    description: "Manage Core Team, Advisors and Consultants shown on website",
    pages: ["/team", "/advisors"],
    apis: ["/api/team", "/api/advisors"],
  },
  {
    key: "staff",
    label: "Staff & Roles",
    description: "Add staff and control their access",
    pages: ["/staff", "/roles"],
    apis: ["/api/staff", "/api/roles"],
  },
];

export const SECTION_KEYS = ADMIN_SECTIONS.map((s) => s.key);

/**
 * Shared endpoints used by several sections. Allowed when the user has ANY of the listed sections.
 * File upload / delete is only needed by forms that edit images or documents.
 */
const SHARED_PATHS: { prefix: string; anyOf: string[] }[] = [
  {
    prefix: "/api/upload",
    anyOf: [
      "alumni",
      "counsellors",
      "courses",
      "blogs",
      "page-seo",
      "personality-test",
      "settings",
      "team",
      "advisors",
    ],
  },
];

/** Maintenance / developer endpoints — Super Admin only, whatever the role. */
const SUPER_ADMIN_ONLY = ["/api/leads/seed"];

/** "*" = full access (Super Admin). Otherwise the list of section keys. */
export type Access = "*" | string[];

const matchesPrefix = (path: string, prefix: string) =>
  path === prefix || path.startsWith(prefix + "/");

/**
 * Which section a URL belongs to, or null if it is open to every logged-in user.
 * Shared endpoints (see SHARED_PATHS) return a marker so they are never treated as "open".
 */
export function sectionForPath(pathname: string): string | null {
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  if (SHARED_PATHS.some((s) => matchesPrefix(path, s.prefix))) return "shared";
  for (const s of ADMIN_SECTIONS) {
    if ([...s.pages, ...s.apis].some((p) => matchesPrefix(path, p))) return s.key;
  }
  return null;
}

export function canAccessSection(access: Access | null | undefined, key: string | null): boolean {
  if (!key) return true;
  if (!access) return false;
  return access === "*" || access.includes(key);
}

export function canAccessPath(access: Access | null | undefined, pathname: string): boolean {
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  if (SUPER_ADMIN_ONLY.some((p) => matchesPrefix(path, p))) return access === "*";
  const shared = SHARED_PATHS.find((s) => matchesPrefix(path, s.prefix));
  if (shared) {
    if (!access) return false;
    return access === "*" || shared.anyOf.some((k) => access.includes(k));
  }
  return canAccessSection(access, sectionForPath(path));
}

/** True if `subset` grants nothing beyond `access` (used to stop staff granting more than they have). */
export function withinAccess(access: Access | null | undefined, subset: string[]): boolean {
  if (!access) return false;
  return access === "*" || subset.every((k) => access.includes(k));
}

/** Keeps only known section keys, in the standard order. */
export function cleanPermissions(input: unknown): string[] {
  const set = new Set(Array.isArray(input) ? input.map(String) : []);
  return SECTION_KEYS.filter((k) => set.has(k));
}
