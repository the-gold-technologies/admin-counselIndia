import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    try {
      const result = await prisma.personalityTabResult.findUnique({
        where: { id },
      });
      if (!result) {
        return NextResponse.json(
          { success: false, error: "Tab result not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
  }
  try {
    const results = await prisma.personalityTabResult.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
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
    const created = await prisma.personalityTabResult.create({
      data: {
        name: body.name,
        description: body.description,
        points: String(body.points || "1"),
        status: body.status || "Active",
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id)
      return NextResponse.json(
        { success: false, error: "Missing ID" },
        { status: 400 },
      );

    const updated = await prisma.personalityTabResult.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.points !== undefined && { points: String(data.points) }),
        ...(data.status && { status: data.status }),
      },
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
    if (!id)
      return NextResponse.json(
        { success: false, error: "Missing ID" },
        { status: 400 },
      );

    await prisma.personalityTabResult.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
