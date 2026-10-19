import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const lead = await prisma.inquiryLead.findFirst({
        where: {
          OR: [{ id }, { liveId: id }, { sNo: isNaN(Number(id)) ? -1 : Number(id) }],
        },
      });
      if (!lead) {
        return NextResponse.json(
          { success: false, error: "Entry not found" },
          { status: 404, headers: corsHeaders }
        );
      }
      const extra = (lead.extraData as any) || {};
      return NextResponse.json(
        {
          success: true,
          data: {
            id: lead.id,
            sNo: lead.sNo,
            liveId: lead.liveId || String(lead.sNo),
            name: lead.name || "",
            email: lead.email || "",
            mobile: lead.mobile || "",
            gender: extra.gender || "",
            age: extra.age || "",
            proBackground: extra.proBackground || "",
            purposeGiveTest: extra.purposeGiveTest || "",
            state: lead.state || "",
            date: lead.addedOn || lead.createdAt.toISOString().slice(0, 19).replace("T", " "),
            result: extra.result || "",
            hereFrom: lead.hearFrom || "",
          },
        },
        { headers: corsHeaders }
      );
    }

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

    return NextResponse.json(
      {
        success: true,
        data: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = "personality-test";

    const lastLead = await prisma.inquiryLead.findFirst({
      where: { category },
      orderBy: { sNo: "asc" },
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
        content:
          body.content ||
          `Background: ${extraData.proBackground} | Purpose: ${extraData.purposeGiveTest}`,
        hearFrom: body.hearFrom || body.hearabout || null,
        extraData,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newLead,
        message: "Personality test entry recorded successfully",
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Failed to create personality entry:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, result, resultName, answers } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const lead = await prisma.inquiryLead.findFirst({
      where: {
        OR: [{ id }, { liveId: id }, { sNo: isNaN(Number(id)) ? -1 : Number(id) }],
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const currentExtra = (lead.extraData as any) || {};
    const finalResult = result || resultName || currentExtra.result || "Completed";
    const updatedExtra = {
      ...currentExtra,
      result: finalResult,
      answers: answers || currentExtra.answers || {},
    };

    const updated = await prisma.inquiryLead.update({
      where: { id: lead.id },
      data: {
        extraData: updatedExtra,
        content: `Background: ${updatedExtra.proBackground || "N/A"} | Purpose: ${updatedExtra.purposeGiveTest || "N/A"} | Result: ${finalResult}`,
      },
    });

    return NextResponse.json(
      { success: true, data: updated, message: "Lead test result updated" },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Failed to patch personality entry:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
