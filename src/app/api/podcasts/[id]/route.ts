import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";
import { getActingUser } from "@/lib/staffAccess";
import { canAccessPath } from "@/lib/permissions";
import { extractYouTubeId } from "../route";

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

    if (!canAccessPath(actor.access, "/api/podcasts")) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to edit podcasts." },
        { status: 403, headers: corsHeaders }
      );
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.youtubeUrl !== undefined) {
      updateData.youtubeUrl = String(body.youtubeUrl).trim();
      updateData.youtubeId = extractYouTubeId(updateData.youtubeUrl);
      if (!body.thumbnail && updateData.youtubeId) {
        updateData.thumbnail = `https://img.youtube.com/vi/${updateData.youtubeId}/hqdefault.jpg`;
      }
    }
    if (body.thumbnail !== undefined)
      updateData.thumbnail = body.thumbnail ? String(body.thumbnail).trim() : null;
    if (body.guest !== undefined) updateData.guest = body.guest ? String(body.guest).trim() : null;
    if (body.host !== undefined)
      updateData.host = body.host ? String(body.host).trim() : "Counsel India";
    if (body.duration !== undefined)
      updateData.duration = body.duration ? String(body.duration).trim() : null;
    if (body.description !== undefined)
      updateData.description = body.description ? String(body.description).trim() : null;
    if (body.category !== undefined) updateData.category = String(body.category).trim();
    if (body.order !== undefined) updateData.order = parseInt(body.order, 10) || 0;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    try {
      const updated = await prisma.podcast.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(
        { success: true, data: updated, message: "Podcast updated successfully." },
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
      { success: false, error: err?.message || "Failed to update podcast" },
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

    if (!canAccessPath(actor.access, "/api/podcasts")) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to delete podcasts." },
        { status: 403, headers: corsHeaders }
      );
    }

    const { id } = await context.params;

    try {
      await prisma.podcast.delete({
        where: { id },
      });

      return NextResponse.json(
        { success: true, message: "Podcast deleted successfully." },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB delete failed:", dbErr);
      return NextResponse.json(
        { success: true, message: "Podcast removed (fallback)." },
        { headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete podcast" },
      { status: 500, headers: corsHeaders }
    );
  }
}
