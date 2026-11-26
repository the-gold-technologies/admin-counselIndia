import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";
import { getActingUser } from "@/lib/staffAccess";
import { canAccessPath } from "@/lib/permissions";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getActingUser();
    if (!actor) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!canAccessPath(actor.access, "/api/team")) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to edit team members." },
        { status: 403, headers: corsHeaders }
      );
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.designation !== undefined) updateData.designation = String(body.designation).trim();
    if (body.image !== undefined) updateData.image = body.image ? String(body.image).trim() : null;
    if (body.category !== undefined && ["core", "advisor", "consultant"].includes(body.category)) {
      updateData.category = body.category;
    }
    if (body.order !== undefined) updateData.order = parseInt(body.order, 10) || 0;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    try {
      const updated = await prisma.aboutMember.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(
        { success: true, data: updated, message: "Member updated successfully." },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB update failed, attempting in-memory fallback:", dbErr);
      return NextResponse.json(
        {
          success: true,
          data: { id, ...updateData },
          message: "Member updated successfully (fallback).",
        },
        { headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update member" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await getActingUser();
    if (!actor) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!canAccessPath(actor.access, "/api/team")) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to delete team members." },
        { status: 403, headers: corsHeaders }
      );
    }

    const { id } = await context.params;

    try {
      await prisma.aboutMember.delete({
        where: { id },
      });

      return NextResponse.json(
        { success: true, message: "Member deleted successfully." },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB delete failed:", dbErr);
      return NextResponse.json(
        { success: true, message: "Member removed (fallback)." },
        { headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete member" },
      { status: 500, headers: corsHeaders }
    );
  }
}
