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
    const orderClause = [{ createdAt: "desc" as const }, { sNo: "desc" as const }];

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
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
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

    // Auto-sync course inquiries into CourseLead model so they appear in /course-leads CRM
    if (category === "courses-enquiry" && body.name && (body.email || body.mobile)) {
      try {
        const count = await prisma.courseLead.count();
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        let hours = now.getHours();
        const mins = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12 || 12;
        const formattedDate = `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${mins}${ampm}`;

        await prisma.courseLead.create({
          data: {
            sNo: count + 1,
            liveId: String(count + 1),
            name: body.name.trim(),
            email: (body.email || "not-provided@counselindia.com").trim(),
            mobile: (body.mobile || "").trim(),
            courseName: (body.courseName || body.courseType || "General Course").trim(),
            relationshipManager: "",
            customerSuccessManager: "",
            status: "New",
            notes: (
              body.message ||
              (body.extraData?.brochureUrl ? `Brochure: ${body.extraData.brochureUrl}` : "")
            ).trim(),
            source: body.source || "Website Course Brochure",
            addedOn: formattedDate,
          },
        });
      } catch (syncErr) {
        console.warn("[LeadsRoute] Could not auto-sync to CourseLead:", syncErr);
      }
    }

    // Auto-sync UTM leads into landing-page-utm or utm-data if campaign parameters are present
    const utmData = body.extraData?.utmData;
    if (
      utmData &&
      (utmData.utm_source || utmData.utm_medium || utmData.utm_campaign || utmData.utm_content) &&
      category !== "utm-data" &&
      category !== "landing-page-utm"
    ) {
      try {
        const targetUrl = (utmData.landing_url || "").toLowerCase();
        const isLandingPage =
          category === "landing-page" ||
          targetUrl.includes("/landing") ||
          targetUrl.includes("/lp") ||
          targetUrl.includes("/campaign") ||
          targetUrl.includes("/course/") ||
          targetUrl.includes("/courses/") ||
          targetUrl.includes("/growth-courses") ||
          targetUrl.includes("/har-ghar-counsellor") ||
          targetUrl.includes("/eligibility-test");

        const utmCategory = isLandingPage ? "landing-page-utm" : "utm-data";

        const lastUtmLead = await prisma.inquiryLead.findFirst({
          where: { category: utmCategory },
          orderBy: { sNo: "desc" },
          select: { sNo: true },
        });
        const nextUtmSNo = (lastUtmLead?.sNo ?? 0) + 1;

        await prisma.inquiryLead.create({
          data: {
            sNo: nextUtmSNo,
            category: utmCategory,
            name: body.name?.trim() || "Campaign Lead",
            email: body.email?.trim() || null,
            mobile: body.mobile?.trim() || null,
            countryCode: body.countryCode?.trim() || null,
            state: body.state?.trim() || null,
            city: body.city?.trim() || null,
            source: utmData.utm_source || body.source || "Ad Campaign",
            medium: utmData.utm_medium || body.medium || "cpc",
            content: utmData.utm_content || utmData.utm_campaign || body.content || "Campaign Lead",
            courseName: body.courseName?.trim() || body.courseType?.trim() || "General Inquiry",
            extraData: {
              originalCategory: category,
              ...utmData,
            },
          },
        });
      } catch (utmSyncErr) {
        console.warn("[LeadsRoute] Could not auto-sync UTM lead:", utmSyncErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: newLead,
        message: "Lead submitted successfully",
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Failed to create lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500, headers: corsHeaders }
    );
  }
}
