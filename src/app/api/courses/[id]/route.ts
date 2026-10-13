import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupReplacedCloudinaryFiles } from "@/lib/cloudinary";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { liveId: id }, { slug: id }],
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(course, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch course", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404, headers: corsHeaders });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.position !== undefined) updateData.position = parseInt(body.position) || existing.position;
    if (body.status !== undefined) {
      updateData.status = body.status;
      updateData.isActive = body.status.toLowerCase() === "active";
    }
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.listDuration !== undefined) updateData.listDuration = body.listDuration;
    if (body.enrolmentSeats !== undefined) updateData.enrolmentSeats = body.enrolmentSeats;
    if (body.lessons !== undefined) updateData.lessons = body.lessons;
    if (body.totalProgramFee !== undefined) updateData.totalProgramFee = body.totalProgramFee;
    if (body.totalDiscountFee !== undefined) updateData.totalDiscountFee = body.totalDiscountFee;
    if (body.totalDiscountPercent !== undefined) updateData.totalDiscountPercent = body.totalDiscountPercent;
    if (body.oneTimeFee !== undefined) updateData.oneTimeFee = body.oneTimeFee;
    if (body.oneTimeDiscountFee !== undefined) updateData.oneTimeDiscountFee = body.oneTimeDiscountFee;
    if (body.oneTimeDiscountPercent !== undefined) updateData.oneTimeDiscountPercent = body.oneTimeDiscountPercent;
    if (body.startRange !== undefined) updateData.startRange = body.startRange;
    if (body.endRange !== undefined) updateData.endRange = body.endRange;
    if (body.paymentLink !== undefined) updateData.paymentLink = body.paymentLink;
    if (body.nextBatchDate !== undefined) updateData.nextBatchDate = body.nextBatchDate;
    if (body.subdescription !== undefined) updateData.subdescription = body.subdescription;
    if (body.aboutUs !== undefined) updateData.aboutUs = body.aboutUs;
    if (body.mepscAbout !== undefined) updateData.mepscAbout = body.mepscAbout;
    if (body.universityAdvantage !== undefined) updateData.universityAdvantage = body.universityAdvantage;
    if (body.howWillBenefit !== undefined) updateData.howWillBenefit = body.howWillBenefit;
    if (body.ojt !== undefined) updateData.ojt = body.ojt;
    if (body.mentorshipGuide !== undefined) updateData.mentorshipGuide = body.mentorshipGuide;
    if (body.dreamJob !== undefined) updateData.dreamJob = body.dreamJob;
    if (body.whoCanJoin !== undefined) updateData.whoCanJoin = body.whoCanJoin;
    if (body.headings !== undefined) updateData.headings = body.headings;
    if (body.cheadings !== undefined) updateData.cheadings = body.cheadings;
    if (body.rating !== undefined) updateData.rating = parseFloat(body.rating) || 5.0;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.backgroundImage !== undefined) updateData.backgroundImage = body.backgroundImage;
    if (body.coverImageApp !== undefined) updateData.coverImageApp = body.coverImageApp;
    if (body.backgroundImageApp !== undefined) updateData.backgroundImageApp = body.backgroundImageApp;
    if (body.brochure !== undefined) updateData.brochure = body.brochure;
    if (body.scSchemePdf !== undefined) updateData.scSchemePdf = body.scSchemePdf;
    if (body.overviewData !== undefined) {
      updateData.overviewData = body.overviewData;
      updateData.overviewCount = Array.isArray(body.overviewData) ? body.overviewData.length : 0;
    }
    if (body.learnData !== undefined) {
      updateData.learnData = body.learnData;
      updateData.learnCount = Array.isArray(body.learnData) ? body.learnData.length : 0;
    }
    if (body.credentialData !== undefined) {
      updateData.credentialData = body.credentialData;
      updateData.credentialCount = Array.isArray(body.credentialData) ? body.credentialData.length : 0;
    }
    if (body.curriculumData !== undefined) {
      updateData.curriculumData = body.curriculumData;
      updateData.curriculumCount = Array.isArray(body.curriculumData) ? body.curriculumData.length : 0;
    }

    // Clean up replaced images/PDFs on Cloudinary
    await cleanupReplacedCloudinaryFiles(existing, updateData);

    const updated = await prisma.course.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update course", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.course.findFirst({
      where: {
        OR: [{ id }, { liveId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404, headers: corsHeaders });
    }

    // Clean up all images/PDFs from Cloudinary on delete
    await cleanupReplacedCloudinaryFiles(existing, null);

    await prisma.course.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "Course deleted successfully" }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete course", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
