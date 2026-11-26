import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanPermissions, withinAccess } from "@/lib/permissions";
import { getActingUser } from "@/lib/staffAccess";

// Access to /api/roles is limited to the "Staff & Roles" section by src/proxy.ts

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { users: true } } },
    });
    return NextResponse.json({
      success: true,
      data: roles.map(({ _count, ...r }) => ({ ...r, staffCount: _count.users })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Body: { name, permissions: string[] }
export async function POST(request: Request) {
  try {
    const actor = await getActingUser();
    if (!actor)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => null)) ?? {};
    const permissions = cleanPermissions(body.permissions);
    // Staff can't create a role with more access than they have themselves
    if (!withinAccess(actor.access, permissions)) {
      return NextResponse.json(
        { success: false, error: "You can only give a role sections that you have access to." },
        { status: 403 }
      );
    }
    const name = String(body.name || "")
      .trim()
      .slice(0, 60);
    if (!name)
      return NextResponse.json(
        { success: false, error: "Role name is required." },
        { status: 400 }
      );

    const exists = await prisma.role.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (exists) {
      return NextResponse.json(
        { success: false, error: `A role named "${exists.name}" already exists.` },
        { status: 409 }
      );
    }

    const created = await prisma.role.create({
      data: { name, permissions },
    });
    return NextResponse.json({ success: true, data: { ...created, staffCount: 0 } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
