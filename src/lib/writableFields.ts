import { Prisma } from "@prisma/client";

/**
 * Mass-assignment protection: request bodies are never passed straight to Prisma.
 * Only fields in these allowlists can be written through the admin update APIs.
 * Allowlists are derived from the Prisma schema so new columns are picked up
 * automatically; system / identity / secret columns are always excluded.
 */

// Never writable through generic update endpoints
const SYSTEM_FIELDS = ["id", "createdAt", "updatedAt"] as const;

function allow(fields: Record<string, string>, extraBlocked: string[] = []): ReadonlySet<string> {
  const blocked = new Set<string>([...SYSTEM_FIELDS, ...extraBlocked]);
  return new Set(Object.values(fields).filter((f) => !blocked.has(f)));
}

export const COUNSELOR_WRITABLE = allow(Prisma.CounselorScalarFieldEnum, [
  "password", // handled separately (hashed)
]);

export const ALUMNI_WRITABLE = allow(Prisma.AlumniScalarFieldEnum);

export const SITE_SETTING_WRITABLE = allow(Prisma.SiteSettingScalarFieldEnum);

/** Copy only allowlisted keys from an untrusted body. Unknown keys are silently dropped. */
export function pickWritable(body: unknown, allowed: ReadonlySet<string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!body || typeof body !== "object" || Array.isArray(body)) return out;
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (allowed.has(key) && value !== undefined) out[key] = value;
  }
  return out;
}

/** Reject oversized JSON blobs coming from public endpoints (e.g. lead extraData). */
export function jsonWithinLimit(value: unknown, maxBytes: number): boolean {
  if (value === undefined || value === null) return true;
  try {
    return Buffer.byteLength(JSON.stringify(value), "utf8") <= maxBytes;
  } catch {
    return false;
  }
}
