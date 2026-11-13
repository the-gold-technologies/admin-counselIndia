import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupReplacedCloudinaryFiles } from "@/lib/cloudinary";
import { corsHeaders } from "@/lib/cors";
import { isAdminRequest, hashPasswordIfNeeded } from "@/lib/auth";
import { PUBLIC_COUNSELOR_SELECT } from "@/lib/publicFields";
import { COUNSELOR_WRITABLE, pickWritable } from "@/lib/writableFields";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await isAdminRequest();
    const counselor = isAdmin
      ? await prisma.counselor.findFirst({
          where: { OR: [{ id }, { liveId: id }] },
          omit: { password: true },
        })
      : // Public: only verified, active profiles, and only public-safe fields
        await prisma.counselor.findFirst({
          where: { OR: [{ id }, { liveId: id }], isApproved: true, status: "Active" },
          select: PUBLIC_COUNSELOR_SELECT,
        });

    if (!counselor) {
      return NextResponse.json({ success: false, error: "Counselor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: counselor }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const raw = await request.json();
    // Mass-assignment protection: only known, writable columns
    const body = pickWritable(raw, COUNSELOR_WRITABLE);

    // Only change the password when a new non-empty one is supplied; always store it hashed
    const hashed = await hashPasswordIfNeeded(raw?.password);
    if (hashed) body.password = hashed;

    const existing = await prisma.counselor.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Counselor not found" }, { status: 404 });
    }

    // Clean up replaced files on Cloudinary
    // (compare against the merged record — a partial update must not delete untouched files)
    await cleanupReplacedCloudinaryFiles(existing, { ...existing, ...body });

    const updated = await prisma.counselor.update({
      where: { id: existing.id },
      data: {
        ...body,
        updatedOn: new Date().toISOString().replace("T", " ").split(".")[0],
      },
      omit: { password: true },
    });

    return NextResponse.json({ success: true, data: updated }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.counselor.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Counselor not found" }, { status: 404 });
    }

    // Delete all attached files from Cloudinary on delete
    await cleanupReplacedCloudinaryFiles(existing, null);

    await prisma.counselor.delete({
      where: { id: existing.id },
    });

    return NextResponse.json(
      { success: true, message: "Counselor deleted successfully" },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
