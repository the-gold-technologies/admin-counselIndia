import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "subscription";
    const search = searchParams.get("search")?.trim() || "";
    const nameFilter = searchParams.get("name")?.trim() || "";
    const emailFilter = searchParams.get("email")?.trim() || "";
    const mobileFilter = searchParams.get("mobile")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const all = searchParams.get("all") === "true";

    const where: any = { category };

    if (nameFilter) {
      where.name = { contains: nameFilter, mode: "insensitive" };
    }
    if (emailFilter) {
      where.email = { contains: emailFilter, mode: "insensitive" };
    }
    if (mobileFilter) {
      where.mobile = { contains: mobileFilter, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
        { medium: { contains: search, mode: "insensitive" } },
        { source: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { courseName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for active category with filter
    const total = await prisma.inquiryLead.count({ where });

    // Fetch leads - sorted newest first by sNo desc, then createdAt desc
    const orderClause = [
      { sNo: "desc" as const },
      { createdAt: "desc" as const },
    ];

    let leads;
    if (all) {
      leads = await prisma.inquiryLead.findMany({
        where,
        orderBy: orderClause,
      });
    } else {
      leads = await prisma.inquiryLead.findMany({
        where,
        orderBy: orderClause,
        skip: (page - 1) * limit,
        take: limit,
      });
    }

    // Category counts for tab badges
    const categoryCountsRaw = await prisma.inquiryLead.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    const categoryCounts: Record<string, number> = {};
    categoryCountsRaw.forEach((c) => {
      categoryCounts[c.category] = c._count._all;
    });

    return NextResponse.json(
      {
        success: true,
        data: leads,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
        categoryCounts,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = (body.category || "subscription").trim();

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Determine highest sNo for this category so the new lead gets the next sNo
    const lastLead = await prisma.inquiryLead.findFirst({
      where: { category },
      orderBy: { sNo: "desc" },
      select: { sNo: true },
    });
    const nextSNo = (lastLead?.sNo ?? 0) + 1;

    const newLead = await prisma.inquiryLead.create({
      data: {
        sNo: nextSNo,
        category,
        name: body.name?.trim() || null,
        email: body.email?.trim() || null,
        mobile: body.mobile?.trim() || null,
        countryCode: body.countryCode?.trim() || null,
        state: body.state?.trim() || null,
        city: body.city?.trim() || null,
        medium: body.medium?.trim() || "Website",
        source: body.source?.trim() || "Counsel India Website",
        content: body.content?.trim() || null,
        message: body.message?.trim() || null,
        hearFrom: body.hearFrom?.trim() || null,
        courseType: body.courseType?.trim() || null,
        courseName: body.courseName?.trim() || null,
        extraData: body.extraData || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newLead,
        message: "Lead submitted successfully",
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error("Failed to create lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500, headers: corsHeaders },
    );
  }
}
