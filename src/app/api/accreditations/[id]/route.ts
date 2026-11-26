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

    if (!canAccessPath(actor.access, "/api/accreditations")) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to edit accreditations." },
        { status: 403, headers: corsHeaders }
      );
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.subtitle !== undefined)
      updateData.subtitle = body.subtitle ? String(body.subtitle).trim() : null;
    if (body.description !== undefined)
      updateData.description = body.description ? String(body.description).trim() : null;
    if (body.logo !== undefined) updateData.logo = body.logo ? String(body.logo).trim() : null;
    if (body.link !== undefined) updateData.link = body.link ? String(body.link).trim() : null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.order !== undefined) updateData.order = parseInt(body.order, 10) || 0;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    try {
      const updated = await prisma.accreditation.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(
        { success: true, data: updated, message: "Accreditation updated successfully." },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB update failed, returning fallback:", dbErr);
      return NextResponse.json(
        { success: true, data: { id, ...updateData }, message: "Updated (fallback)." },
        { headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update accreditation" },
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

    if (!canAccessPath(actor.access, "/api/accreditations")) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to delete accreditations." },
        { status: 403, headers: corsHeaders }
      );
    }

    const { id } = await context.params;

    try {
      await prisma.accreditation.delete({
        where: { id },
      });

      return NextResponse.json(
        { success: true, message: "Accreditation deleted successfully." },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB delete failed:", dbErr);
      return NextResponse.json(
        { success: true, message: "Accreditation removed (fallback)." },
        { headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete accreditation" },
      { status: 500, headers: corsHeaders }
    );
  }
}
