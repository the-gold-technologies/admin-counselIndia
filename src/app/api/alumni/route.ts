import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_WEBSITE_URL ?? "",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status && status !== "All") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { programName: { contains: search, mode: "insensitive" } },
        { certificateNumber: { contains: search } },
      ];
    }

    let alumni: any[] = [];
    try {
      alumni = await prisma.alumni.findMany({
        where,
        orderBy: [{ sNo: "asc" }, { createdAt: "desc" }],
      });
    } catch (e) {
      console.error("DB query error in alumni route:", e); return NextResponse.json({ success: false, error: (e as any)?.message || String(e) }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: alumni.length,
      data: alumni,
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.mobile) {
      return NextResponse.json(
        { success: false, error: "Name, email, and mobile are required" },
        { status: 400 },
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
          body.certificateNumber ||
          String(Math.floor(10000 + Math.random() * 90000)),
        profession: body.profession || "Counselor",
        skills:
          body.skills || "Counseling Psychology, Mental Health Assessment",
        status: body.status || "Active",
        isOnline: body.isOnline !== undefined ? Boolean(body.isOnline) : true,
        isApproved: true,
        image: body.image || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing ID" },
        { status: 400 },
      );
    }

    const updated = await prisma.alumni.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing ID" },
        { status: 400 },
      );
    }

    await prisma.alumni.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Alumni deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
