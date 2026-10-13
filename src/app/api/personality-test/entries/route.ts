import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "25"));
    const skip = (page - 1) * limit;

    const where: any = { category: "personality-test" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
      ];
    }

    const [total, leads] = await Promise.all([
      prisma.inquiryLead.count({ where }),
      prisma.inquiryLead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const formatted = leads.map((l, idx) => {
      const extra = (l.extraData as any) || {};
      return {
        id: l.id,
        sNo: l.sNo || skip + idx + 1,
        liveId: l.liveId || String(l.sNo || skip + idx + 1),
        name: l.name || "-",
        email: l.email || "-",
        mobile: l.mobile || "-",
        gender: extra.gender || "-",
        age: extra.age || "-",
        proBackground: extra.proBackground || "-",
        purposeGiveTest: extra.purposeGiveTest || "-",
        state: l.state || "-",
        date: l.addedOn || l.createdAt.toISOString().slice(0, 19).replace("T", " "),
        result: extra.result || "0",
        hereFrom: l.hearFrom || "-",
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = "personality-test";

    const lastLead = await prisma.inquiryLead.findFirst({
      where: { category },
      orderBy: { sNo: "desc" },
      select: { sNo: true },
    });
    const nextSNo = (lastLead?.sNo ?? 0) + 1;

    const extraData = {
      gender: body.gender || "",
      age: body.age ? String(body.age) : "",
      proBackground: body.proBackground || body.pro_background || "",
      purposeGiveTest: body.purposeGiveTest || body.purpose_give_test || "",
      result: body.result || body.resultName || "0",
      answers: body.answers || {},
    };

    const newLead = await prisma.inquiryLead.create({
      data: {
        sNo: nextSNo,
        category,
        name: body.name?.trim() || null,
        email: body.email?.trim() || null,
        mobile: body.mobile?.trim() || null,
        countryCode: body.countryCode || body.country || null,
        state: body.state || null,
        city: body.city || null,
        medium: body.medium || "Website Personality Test",
        source: body.source || "Eligibility Test",
        content: body.content || `Background: ${extraData.proBackground} | Purpose: ${extraData.purposeGiveTest}`,
        hearFrom: body.hearFrom || body.hearabout || null,
        extraData,
      },
    });

    return NextResponse.json({
      success: true,
      data: newLead,
      message: "Personality test entry recorded successfully",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create personality entry:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
