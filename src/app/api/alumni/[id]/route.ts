import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupReplacedCloudinaryFiles } from "@/lib/cloudinary";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const item = await prisma.alumni.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: "Alumni not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.alumni.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Alumni not found" }, { status: 404 });
    }

    // Clean up replaced image/certificate files on Cloudinary
    await cleanupReplacedCloudinaryFiles(existing, body);

    const updated = await prisma.alumni.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.alumni.findUnique({
      where: { id },
    });

    if (existing) {
      // Clean up all Cloudinary files attached to this alumni
      await cleanupReplacedCloudinaryFiles(existing, null);
    }

    await prisma.alumni.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
