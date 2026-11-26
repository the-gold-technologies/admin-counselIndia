import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, getSessionAccess } from "@/lib/auth";
import type { Access } from "@/lib/permissions";

/** Fields of a staff member that are safe to send to the browser (never the password). */
export const STAFF_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  staffRole: { select: { id: true, name: true, permissions: true } },
} as const;

/**
 * The logged-in admin making the request: id, DB role, their role id and current access
 * ("*" for Super Admin). Null if not logged in.
 */
export async function getActingUser(): Promise<{
  id: string;
  role: string;
  roleId: string | null;
  access: Access;
} | null> {
  const auth = await getSessionAccess((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  if (!auth) return null;
  const user = await prisma.user.findUnique({
    where: { id: auth.session.id },
    select: { id: true, role: true, roleId: true },
  });
  return user ? { ...user, access: auth.access } : null;
}

/** Number of Active Super Admins, optionally ignoring one user (the one being changed). */
export async function activeSuperAdminCount(excludeUserId?: string) {
  return prisma.user.count({
    where: {
      role: "SUPERADMIN",
      status: "Active",
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
