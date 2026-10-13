import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupReplacedCloudinaryFiles } from "@/lib/cloudinary";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
  try {
    let settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(
      { success: true, data: settings },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...updateData } = body;

    const existing = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });
    if (existing) {
      await cleanupReplacedCloudinaryFiles(existing, updateData);
    }

    const settings = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: updateData,
      create: { id: "default", ...updateData },
    });

    return NextResponse.json(
      { success: true, message: "Settings updated successfully", data: settings },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}
