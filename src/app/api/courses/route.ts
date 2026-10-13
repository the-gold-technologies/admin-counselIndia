import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "all";
    const status = searchParams.get("status")?.trim().toLowerCase() || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const fetchAll = searchParams.get("all") === "true";

    const where: any = {};

    if (status !== "all") {
      where.status = { equals: status, mode: "insensitive" };
    }

    if (category !== "all" && category !== "") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    // Overall stats
    const [totalAll, totalActive, totalInactive, allCategoriesGroup] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({
        where: { status: { equals: "Active", mode: "insensitive" } },
      }),
      prisma.course.count({
        where: { status: { equals: "Inactive", mode: "insensitive" } },
      }),
      prisma.course.groupBy({
        by: ["category"],
        _count: { category: true },
      }),
    ]);

    const categoriesList = allCategoriesGroup
      .filter((g) => g.category)
      .map((g) => ({
        name: g.category as string,
        count: g._count.category,
      }))
      .sort((a, b) => b.count - a.count);

    const totalFiltered = await prisma.course.count({ where });

    let courses;
    if (fetchAll) {
      courses = await prisma.course.findMany({
        where,
        orderBy: [{ sNo: "asc" }],
      });
    } else {
      courses = await prisma.course.findMany({
        where,
        orderBy: [{ sNo: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      });
    }

    return NextResponse.json(
      {
        courses,
        total: totalFiltered,
        page,
        limit,
        totalPages: fetchAll ? 1 : Math.ceil(totalFiltered / limit),
        stats: {
          total: totalAll,
          active: totalActive,
          inactive: totalInactive,
          categoriesCount: categoriesList.length,
          categories: categoriesList,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, position, status } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Course name is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const count = await prisma.course.count();
    const slugBase =
      body.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    let slug = slugBase;
    let suffix = 1;
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${suffix}`;
      suffix++;
    }

    const newCourse = await prisma.course.create({
      data: {
        sNo: count + 1,
        liveId: body.liveId || String(Date.now()).slice(-6),
        name,
        slug,
        category: category || "Diploma Programs",
        position: parseInt(position) || 1,
        status: status || "Active",
        isActive: (status || "Active").toLowerCase() === "active",
        duration: body.duration || null,
        listDuration: body.listDuration || null,
        lessons: body.lessons || null,
        enrolmentSeats: body.enrolmentSeats || null,
        totalProgramFee: body.totalProgramFee || null,
        totalDiscountFee: body.totalDiscountFee || null,
        totalDiscountPercent: body.totalDiscountPercent || null,
        oneTimeFee: body.oneTimeFee || null,
        oneTimeDiscountFee: body.oneTimeDiscountFee || null,
        oneTimeDiscountPercent: body.oneTimeDiscountPercent || null,
        startRange: body.startRange || null,
        endRange: body.endRange || null,
        price: parseFloat(body.totalDiscountFee || body.totalProgramFee || 0) || 0,
        rating: parseFloat(body.rating) || 5.0,
        paymentLink: body.paymentLink || null,
        nextBatchDate: body.nextBatchDate || null,
        subdescription: body.subdescription || null,
        aboutUs: body.aboutUs || null,
        mepscAbout: body.mepscAbout || null,
        universityAdvantage: body.universityAdvantage || null,
        howWillBenefit: body.howWillBenefit || null,
        ojt: body.ojt || null,
        mentorshipGuide: body.mentorshipGuide || null,
        dreamJob: body.dreamJob || null,
        whoCanJoin: body.whoCanJoin || null,
        headings: body.headings || [],
        cheadings: body.cheadings || [],
        coverImage: body.coverImage || null,
        backgroundImage: body.backgroundImage || null,
        coverImageApp: body.coverImageApp || null,
        backgroundImageApp: body.backgroundImageApp || null,
        brochure: body.brochure || null,
        scSchemePdf: body.scSchemePdf || null,
        addedOn: new Date().toISOString().replace("T", " ").substring(0, 19),
        overviewCount: 0,
        learnCount: 0,
        credentialCount: 0,
        curriculumCount: 0,
        overviewData: [],
        learnData: [],
        credentialData: [],
        curriculumData: [],
      },
    });

    return NextResponse.json(newCourse, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json(
      { error: "Failed to create course", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
