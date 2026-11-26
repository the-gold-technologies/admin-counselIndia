import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePasswordStrength } from "@/lib/auth";
import { STAFF_SELECT, getActingUser, isValidEmail } from "@/lib/staffAccess";
import { withinAccess } from "@/lib/permissions";

// Access to /api/staff is limited to the "Staff & Roles" section by src/proxy.ts

export async function GET() {
  try {
    const staff = await prisma.user.findMany({
      select: STAFF_SELECT,
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ success: true, data: staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Body: { name, email, phone?, password, access: "SUPERADMIN" | <roleId>, status? }
export async function POST(request: Request) {
  try {
    const actor = await getActingUser();
    if (!actor)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => null)) ?? {};
    const name = String(body.name || "")
      .trim()
      .slice(0, 100);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const phone =
      String(body.phone || "")
        .trim()
        .slice(0, 30) || null;
    const status = body.status === "Inactive" ? "Inactive" : "Active";
    const access = String(body.access || "");

    if (!name) return bad("Name is required.");
    if (!isValidEmail(email)) return bad("Please enter a valid email address.");
    const pwError = validatePasswordStrength(body.password);
    if (pwError) return bad(pwError);

    let role = "STAFF";
    let roleId: string | null = null;
    if (access === "SUPERADMIN") {
      if (actor.role !== "SUPERADMIN")
        return bad("Only a Super Admin can create another Super Admin.", 403);
      role = "SUPERADMIN";
    } else {
      const found = await prisma.role.findUnique({ where: { id: access } });
      if (!found) return bad("Please choose a role.");
      if (!withinAccess(actor.access, found.permissions)) {
        return bad("You can't assign a role with more access than you have.", 403);
      }
      roleId = found.id;
    }

    if (await prisma.user.findUnique({ where: { email } })) {
      return bad("A staff member with this email already exists.", 409);
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        roleId,
        status,
        password: await hashPassword(body.password),
      },
      select: STAFF_SELECT,
    });
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}
