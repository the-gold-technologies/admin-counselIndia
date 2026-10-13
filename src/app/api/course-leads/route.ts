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
    const status = searchParams.get("status")?.toLowerCase() || "all";
    const course = searchParams.get("course")?.trim() || "";
    const startDate = searchParams.get("startDate")?.trim() || "";
    const endDate = searchParams.get("endDate")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const fetchAll = searchParams.get("all") === "true";

    const where: any = {};

    // Status filter
    if (status !== "all") {
      where.status = { equals: status, mode: "insensitive" };
    }

    // Course filter
    if (course && course !== "all") {
      where.courseName = { contains: course, mode: "insensitive" };
    }

    // Search query
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { courseName: { contains: search, mode: "insensitive" } },
        { liveId: { contains: search } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Fetch tab counts
    const [total, allCount, newCount, contactedCount, enrolledCount, completedCount] =
      await Promise.all([
        prisma.courseLead.count({ where }),
        prisma.courseLead.count(),
        prisma.courseLead.count({
          where: { status: { equals: "New", mode: "insensitive" } },
        }),
        prisma.courseLead.count({
          where: { status: { equals: "Contacted", mode: "insensitive" } },
        }),
        prisma.courseLead.count({
          where: { status: { equals: "Enrolled", mode: "insensitive" } },
        }),
        prisma.courseLead.count({
          where: { status: { equals: "Completed", mode: "insensitive" } },
        }),
      ]);

    // Fetch distinct course names for filter dropdown
    const distinctCourses = await prisma.courseLead.findMany({
      select: { courseName: true },
      distinct: ["courseName"],
      orderBy: { courseName: "asc" },
    });

    const coursesList = distinctCourses
      .map((c) => c.courseName)
      .filter((name) => Boolean(name && name.trim()));

    // Fetch data with pagination
    const leads = await prisma.courseLead.findMany({
      where,
      orderBy: [{ sNo: "asc" }, { createdAt: "desc" }],
      skip: fetchAll ? 0 : (page - 1) * limit,
      take: fetchAll ? undefined : limit,
    });

    return NextResponse.json(
      {
        success: true,
        data: leads,
        counts: {
          all: allCount,
          new: newCount,
          contacted: contactedCount,
          enrolled: enrolledCount,
          completed: completedCount,
        },
        courses: coursesList,
        pagination: {
          total,
          page,
          limit: fetchAll ? total : limit,
          totalPages: fetchAll ? 1 : Math.ceil(total / limit) || 1,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("GET /api/course-leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, courseName, notes, source } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const count = await prisma.courseLead.count();
    const now = new Date();
    // format addedOn matching live format "DD/MM/YYYY hh:mma"
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    let hours = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    const formattedDate = `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${mins}${ampm}`;

    const newLead = await prisma.courseLead.create({
      data: {
        sNo: count + 1,
        liveId: String(count + 1),
        name: name.trim(),
        email: email.trim(),
        mobile: (mobile || "").trim(),
        courseName: (courseName || "General Course").trim(),
        relationshipManager: "",
        customerSuccessManager: "",
        status: "New",
        notes: (notes || "").trim(),
        source: source || "Website",
        addedOn: formattedDate,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newLead,
        message: "Course lead submitted successfully",
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("POST /api/course-leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
