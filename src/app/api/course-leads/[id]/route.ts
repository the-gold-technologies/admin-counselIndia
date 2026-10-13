import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await prisma.courseLead.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Course lead not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, data: lead }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.courseLead.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Course lead not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const updated = await prisma.courseLead.update({
      where: { id: existing.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.mobile !== undefined && { mobile: body.mobile }),
        ...(body.courseName !== undefined && { courseName: body.courseName }),
        ...(body.relationshipManager !== undefined && {
          relationshipManager: body.relationshipManager,
        }),
        ...(body.customerSuccessManager !== undefined && {
          customerSuccessManager: body.customerSuccessManager,
        }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json(
      { success: true, data: updated, message: "Lead updated successfully" },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.courseLead.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Course lead not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    await prisma.courseLead.delete({
      where: { id: existing.id },
    });

    return NextResponse.json(
      { success: true, message: "Course lead deleted successfully" },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
