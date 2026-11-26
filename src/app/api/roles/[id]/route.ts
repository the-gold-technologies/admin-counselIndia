import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanPermissions, withinAccess } from "@/lib/permissions";
import { getActingUser } from "@/lib/staffAccess";
import { invalidateAllSessionCaches } from "@/lib/auth";

// Access to /api/roles is limited to the "Staff & Roles" section by src/proxy.ts

type Ctx = { params: Promise<{ id: string }> };

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

// Body (optional fields): { name, permissions: string[] }
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const actor = await getActingUser();
    if (!actor) return bad("Unauthorized", 401);
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return bad("Role not found.", 404);

    // Staff (non Super Admin) can't change their own role, or a role with more access than theirs
    if (actor.role !== "SUPERADMIN") {
      if (actor.roleId === id) return bad("You can't change your own role.", 403);
      if (!withinAccess(actor.access, role.permissions)) {
        return bad("This role has access you don't have, so you can't change it.", 403);
      }
    }

    const body = (await request.json().catch(() => null)) ?? {};
    const data: { name?: string; permissions?: string[] } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim().slice(0, 60);
      if (!name) return bad("Role name is required.");
      const clash = await prisma.role.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, id: { not: id } },
      });
      if (clash) return bad(`A role named "${clash.name}" already exists.`, 409);
      data.name = name;
    }
    if (body.permissions !== undefined) {
      data.permissions = cleanPermissions(body.permissions);
      if (!withinAccess(actor.access, data.permissions)) {
        return bad("You can only give a role sections that you have access to.", 403);
      }
    }

    const updated = await prisma.role.update({
      where: { id },
      data,
      include: { _count: { select: { users: true } } },
    });
    // Everyone with this role gets the new access straight away
    invalidateAllSessionCaches();

    const { _count, ...rest } = updated;
    return NextResponse.json({ success: true, data: { ...rest, staffCount: _count.users } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const actor = await getActingUser();
    if (!actor) return bad("Unauthorized", 401);
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) return bad("Role not found.", 404);
    if (actor.role !== "SUPERADMIN" && !withinAccess(actor.access, role.permissions)) {
      return bad("This role has access you don't have, so you can't delete it.", 403);
    }
    if (role._count.users > 0) {
      return bad(
        `"${role.name}" is assigned to ${role._count.users} staff member(s). Move them to another role first.`
      );
    }
    await prisma.role.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Role deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
