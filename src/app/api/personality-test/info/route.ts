import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let info = await prisma.personalityTestInfo.findFirst();
    if (!info) {
      info = await prisma.personalityTestInfo.create({
        data: {
          name: "Personality Test One",
          totalQuestions: 10,
          subtitle: "Test",
          instruction: "Know yourself better",
          status: "Active",
        },
      });
    }
    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const existing = await prisma.personalityTestInfo.findFirst();

    let updated;
    if (existing) {
      updated = await prisma.personalityTestInfo.update({
        where: { id: existing.id },
        data: {
          name: body.name ?? existing.name,
          totalQuestions: Number(body.totalQuestions) || existing.totalQuestions,
          subtitle: body.subtitle ?? existing.subtitle,
          instruction: body.instruction ?? existing.instruction,
          status: body.status ?? existing.status,
        },
      });
    } else {
      updated = await prisma.personalityTestInfo.create({
        data: {
          name: body.name || "Personality Test One",
          totalQuestions: Number(body.totalQuestions) || 10,
          subtitle: body.subtitle || "Test",
          instruction: body.instruction || "Know yourself better",
          status: body.status || "Active",
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
