import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  invalidateSessionCache,
  revokeAllSessions,
  validatePasswordStrength,
} from "@/lib/auth";
import {
  STAFF_SELECT,
  activeSuperAdminCount,
  getActingUser,
  isValidEmail,
} from "@/lib/staffAccess";
import { withinAccess } from "@/lib/permissions";

// Access to /api/staff is limited to the "Staff & Roles" section by src/proxy.ts

type Ctx = { params: Promise<{ id: string }> };

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

/** Staff (non Super Admin) may only manage people whose access is within their own. */
async function outranksActor(
  actor: { role: string; access: Parameters<typeof withinAccess>[0] },
  target: { role: string; roleId: string | null }
) {
  if (actor.role === "SUPERADMIN") return false;
  if (target.role === "SUPERADMIN") return true;
  const targetRole = target.roleId
    ? await prisma.role.findUnique({ where: { id: target.roleId } })
    : null;
  return !withinAccess(actor.access, targetRole?.permissions || []);
}

// Body (all optional): { name, email, phone, status, access: "SUPERADMIN" | <roleId>, password }
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const actor = await getActingUser();
    if (!actor) return bad("Unauthorized", 401);

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return bad("Staff member not found.", 404);
    if (target.role === "SUPERADMIN" && actor.role !== "SUPERADMIN") {
      return bad("Only a Super Admin can change a Super Admin account.", 403);
    }
    // e.g. stops a staff member resetting the password of someone with more access
    if (target.id !== actor.id && (await outranksActor(actor, target))) {
      return bad("This staff member has access you don't have, so you can't change them.", 403);
    }

    const body = (await request.json().catch(() => null)) ?? {};
    const isSelf = actor.id === target.id;
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim().slice(0, 100);
      if (!name) return bad("Name is required.");
      data.name = name;
    }
    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (!isValidEmail(email)) return bad("Please enter a valid email address.");
      if (email !== target.email && (await prisma.user.findUnique({ where: { email } }))) {
        return bad("A staff member with this email already exists.", 409);
      }
      data.email = email;
    }
    if (body.phone !== undefined)
      data.phone =
        String(body.phone || "")
          .trim()
          .slice(0, 30) || null;

    // Access & status — you can't change your own (prevents locking yourself out)
    if (body.access !== undefined) {
      const access = String(body.access);
      const current = target.role === "SUPERADMIN" ? "SUPERADMIN" : target.roleId;
      if (access !== current) {
        if (isSelf) return bad("You can't change your own access.");
        if (access === "SUPERADMIN") {
          if (actor.role !== "SUPERADMIN")
            return bad("Only a Super Admin can grant Super Admin.", 403);
          data.role = "SUPERADMIN";
          data.roleId = null;
        } else {
          const role = await prisma.role.findUnique({ where: { id: access } });
          if (!role) return bad("Please choose a role.");
          if (!withinAccess(actor.access, role.permissions)) {
            return bad("You can't assign a role with more access than you have.", 403);
          }
          if (target.role === "SUPERADMIN" && (await activeSuperAdminCount(target.id)) === 0) {
            return bad("At least one active Super Admin is required.");
          }
          data.role = "STAFF";
          data.roleId = role.id;
        }
      }
    }
    if (body.status !== undefined) {
      const status = body.status === "Inactive" ? "Inactive" : "Active";
      if (status !== target.status) {
        if (isSelf) return bad("You can't deactivate your own account.");
        if (
          status === "Inactive" &&
          target.role === "SUPERADMIN" &&
          (await activeSuperAdminCount(target.id)) === 0
        ) {
          return bad("At least one active Super Admin is required.");
        }
        data.status = status;
      }
    }

    const newPassword = typeof body.password === "string" ? body.password : "";
    if (newPassword) {
      const pwError = validatePasswordStrength(newPassword);
      if (pwError) return bad(pwError);
      data.password = await hashPassword(newPassword);
      data.failedLoginAttempts = 0;
      data.lockedUntil = null;
    }

    const updated = await prisma.user.update({ where: { id }, data, select: STAFF_SELECT });

    // New password signs the person out everywhere; access/status changes apply immediately
    if (newPassword && !isSelf) await revokeAllSessions(id);
    else invalidateSessionCache(id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const actor = await getActingUser();
    if (!actor) return bad("Unauthorized", 401);
    if (actor.id === id) return bad("You can't delete your own account.");

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return bad("Staff member not found.", 404);
    if (target.role !== "SUPERADMIN" && (await outranksActor(actor, target))) {
      return bad("This staff member has access you don't have, so you can't delete them.", 403);
    }
    if (target.role === "SUPERADMIN") {
      if (actor.role !== "SUPERADMIN")
        return bad("Only a Super Admin can delete a Super Admin.", 403);
      if ((await activeSuperAdminCount(target.id)) === 0) {
        return bad("At least one active Super Admin is required.");
      }
    }

    await prisma.user.delete({ where: { id } });
    invalidateSessionCache(id);
    return NextResponse.json({ success: true, message: "Staff member deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
