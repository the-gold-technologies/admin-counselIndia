import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status")?.toLowerCase() || "verified";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const fetchAll = searchParams.get("all") === "true";

    const where: any = {};

    // Status filtering matching live admin tabs
    if (status === "verified") {
      where.isApproved = true;
      where.status = "Active";
    } else if (status === "pending") {
      where.isApproved = false;
      where.status = "Active";
    } else if (status === "inactive") {
      where.status = "Inactive";
    }
    // "all" has no status filter

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { specialty: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, verifiedCount, pendingCount, inactiveCount, allCount] = await Promise.all([
      prisma.counselor.count({ where }),
      prisma.counselor.count({ where: { isApproved: true, status: "Active" } }),
      prisma.counselor.count({ where: { isApproved: false, status: "Active" } }),
      prisma.counselor.count({ where: { status: "Inactive" } }),
      prisma.counselor.count(),
    ]);

    const queryOptions: any = {
      where,
      orderBy: [{ sNo: "asc" }, { createdAt: "desc" }],
    };

    if (!fetchAll && limit > 0) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    const counsellors = await prisma.counselor.findMany(queryOptions);

    return NextResponse.json(
      {
        success: true,
        data: counsellors,
        pagination: {
          total,
          page: fetchAll ? 1 : page,
          limit: fetchAll ? total : limit,
          totalPages: fetchAll ? 1 : Math.ceil(total / limit) || 1,
        },
        counts: {
          verified: verifiedCount,
          pending: pendingCount,
          inactive: inactiveCount,
          all: allCount,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.mobile) {
      return NextResponse.json(
        { success: false, error: "Name, email, and mobile are required" },
        { status: 400 }
      );
    }

    const count = await prisma.counselor.count();
    const created = await prisma.counselor.create({
      data: {
        sNo: count + 1,
        name: body.name,
        email: body.email,
        mobile: body.mobile,
        password: body.password || null,
        address: body.address || null,
        city: body.city || null,
        country: body.country || "INDIA",
        designation: body.designation || "Counseling Psychologist",
        language: body.language || "Hindi, English",
        education: body.education || null,
        experience: body.experience ? String(body.experience) : null,
        specialty: body.specialty || null,
        specialty2: body.specialty2 || null,
        expertise: body.expertise || null,
        rciNumber: body.rciNumber || null,
        image: body.image || null,
        identityImage: body.identityImage || null,
        qualificationProof: body.qualificationProof || null,
        cvUrl: body.cvUrl || null,
        bankName: body.bankName || null,
        accountNumber: body.accountNumber || null,
        ifscCode: body.ifscCode || null,
        accountType: body.accountType || null,
        accountHolderName: body.accountHolderName || null,
        userType: body.userType || "Counselor",
        isApproved: body.isApproved !== undefined ? Boolean(body.isApproved) : true,
        isOnline: Boolean(body.isOnline),
        videoStatus: Boolean(body.videoStatus),
        videoPrice: Number(body.videoPrice) || 0,
        audioStatus: Boolean(body.audioStatus),
        audioPrice: Number(body.audioPrice) || 0,
        chatStatus: Boolean(body.chatStatus),
        chatPrice: Number(body.chatPrice) || 0,
        expectedCharges: Number(body.expectedCharges) || 0,
        councellFees: Number(body.councellFees) || 0,
        commission: Number(body.commission) || 0,
        position: Number(body.position) || 0,
        about: body.about || null,
        achievements: body.achievements || null,
        whatBringsYou: body.whatBringsYou || null,
        status: body.status || "Active",
        forCourse: body.forCourse || "No",
        personalCounselling: body.personalCounselling || "No",
        addedOn: new Date().toISOString().replace("T", " ").split(".")[0],
        updatedOn: new Date().toISOString().replace("T", " ").split(".")[0],
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
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
        { status: 400 }
      );
    }

    if (data.updatedOn === undefined) {
      data.updatedOn = new Date().toISOString().replace("T", " ").split(".")[0];
    }

    const updated = await prisma.counselor.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
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
        { status: 400 }
      );
    }

    await prisma.counselor.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Counselor deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
