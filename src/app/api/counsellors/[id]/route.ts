import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupReplacedCloudinaryFiles } from "@/lib/cloudinary";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const counselor = await prisma.counselor.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!counselor) {
      return NextResponse.json(
        { success: false, error: "Counselor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: counselor },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.counselor.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Clean up replaced files on Cloudinary
    await cleanupReplacedCloudinaryFiles(existing, body);

    const updated = await prisma.counselor.update({
      where: { id: existing.id },
      data: {
        ...body,
        updatedOn: new Date().toISOString().replace("T", " ").split(".")[0],
      },
    });

    return NextResponse.json(
      { success: true, data: updated },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.counselor.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Counselor not found" },
        { status: 404 }
      );
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
