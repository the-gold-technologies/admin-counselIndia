import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    try {
      const question = await prisma.personalityQuestion.findUnique({
        where: { id },
      });
      if (!question) {
        return NextResponse.json(
          { success: false, error: "Question not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: question });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
  }
  try {
    const questions = await prisma.personalityQuestion.findMany({
      orderBy: { position: "asc" },
    });
    return NextResponse.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error: any) {
    console.error("Failed to fetch personality questions:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await prisma.personalityQuestion.create({
      data: {
        question: body.question,
        answers: body.answers || [],
        position: Number(body.position) || 1,
        status: body.status || "Active",
      },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Failed to create personality question:", error);
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

    const updated = await prisma.personalityQuestion.update({
      where: { id },
      data: {
        ...(data.question && { question: data.question }),
        ...(data.answers && { answers: data.answers }),
        ...(data.position !== undefined && { position: Number(data.position) }),
        ...(data.status && { status: data.status }),
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Failed to update personality question:", error);
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

    await prisma.personalityQuestion.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error: any) {
    console.error("Failed to delete personality question:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
