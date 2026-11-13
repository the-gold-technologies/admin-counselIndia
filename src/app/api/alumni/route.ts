import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";
import { isAdminRequest } from "@/lib/auth";
import { PUBLIC_ALUMNI_SELECT } from "@/lib/publicFields";
import { ALUMNI_WRITABLE, pickWritable } from "@/lib/writableFields";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
export async function GET(request: Request) {
  try {
    const isAdmin = await isAdminRequest();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    // Public website callers may only see active alumni
    const status = isAdmin ? searchParams.get("status") || "" : "Active";

    const where: any = {};
    if (status && status !== "All") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { programName: { contains: search, mode: "insensitive" } },
        { certificateNumber: { contains: search } },
        // Searching by contact details is admin-only (prevents email/phone enumeration)
        ...(isAdmin
          ? [{ email: { contains: search, mode: "insensitive" } }, { mobile: { contains: search } }]
          : []),
      ];
    }

    let alumni: any[] = [];
    try {
      alumni = await prisma.alumni.findMany({
        where,
        orderBy: [{ sNo: "asc" }, { createdAt: "desc" }],
        ...(isAdmin ? {} : { select: PUBLIC_ALUMNI_SELECT }),
      });
    } catch (e) {
      console.error("DB query error in alumni route:", e);
      return NextResponse.json(
        { success: false, error: (e as any)?.message || String(e) },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: alumni.length,
        data: alumni,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.mobile) {
      return NextResponse.json(
        { success: false, error: "Name, email, and mobile are required" },
        { status: 400 }
      );
    }

    const count = await prisma.alumni.count();

    const created = await prisma.alumni.create({
      data: {
        sNo: count + 1,
        name: body.name,
        email: body.email,
        mobile: body.mobile,
        programName: body.programName || "Counselling Master Course",
        certificateNumber:
          body.certificateNumber || String(Math.floor(10000 + Math.random() * 90000)),
        profession: body.profession || "Counselor",
        skills: body.skills || "Counseling Psychology, Mental Health Assessment",
        status: body.status || "Active",
        isOnline: body.isOnline !== undefined ? Boolean(body.isOnline) : true,
        isApproved: true,
        image: body.image || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = body?.id;
    // Mass-assignment protection: only known, writable columns
    const data = pickWritable(body, ALUMNI_WRITABLE);
    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const updated = await prisma.alumni.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    await prisma.alumni.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Alumni deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
