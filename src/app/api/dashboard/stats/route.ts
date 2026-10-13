import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      admissionsCount,
      todayAdmissionsCount,
      inquiriesCount,
      todayInquiriesCount,
      counselorsCount,
      coursesCount,
      alumniCount,
      courseLeadsCount,
      usersCount,
      todayUsersCount,
      personalityQuestionsCount,
    ] = await Promise.all([
      prisma.admission.count().catch(() => 0),
      prisma.admission.count({ where: { createdAt: { gte: today } } }).catch(() => 0),
      prisma.inquiryLead.count().catch(() => 0),
      prisma.inquiryLead.count({ where: { createdAt: { gte: today } } }).catch(() => 0),
      prisma.counselor.count().catch(() => 0),
      prisma.course.count().catch(() => 0),
      prisma.alumni.count().catch(() => 0),
      prisma.courseLead.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.user.count({ where: { createdAt: { gte: today } } }).catch(() => 0),
      prisma.personalityQuestion.count().catch(() => 0),
    ]);

    // Fetch real recent admissions from database
    const recentAdmissions = await prisma.admission
      .findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          courseName: true,
          status: true,
          academicCounselor: true,
          admissionDate: true,
          createdAt: true,
        },
      })
      .catch(() => []);

    // Fetch real recent leads from database
    const recentLeads = await prisma.inquiryLead
      .findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          category: true,
          courseName: true,
          addedOn: true,
          createdAt: true,
        },
      })
      .catch(() => []);

    // Fetch real recent course leads from database
    const recentCourseLeads = await prisma.courseLead
      .findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          courseName: true,
          status: true,
          addedOn: true,
          createdAt: true,
        },
      })
      .catch(() => []);

    // Build real activity stream only from actual database entries
    const activities = [
      ...recentAdmissions.map((a) => ({
        type: "admission",
        text: `New enrollment: ${a.name || "Student"} for ${(a.courseName || "Program").replace(/_/g, " ")}`,
        time: a.admissionDate ? a.admissionDate.toISOString() : a.createdAt.toISOString(),
      })),
      ...recentLeads.map((l) => ({
        type: "lead",
        text: `Inquiry received: ${l.name || "Learner"} (${l.category || "General"})`,
        time: l.createdAt.toISOString(),
      })),
      ...recentCourseLeads.map((cl) => ({
        type: "course-lead",
        text: `Course lead: ${cl.name || "Student"} for ${(cl.courseName || "Program").replace(/_/g, " ")}`,
        time: cl.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    // Dynamic modules structure with real database counts
    const modulesList = [
      {
        id: "admissions",
        title: "Admissions Management",
        slug: "admissions",
        type: "Core",
        visibility: "published",
        recordsCount: admissionsCount,
      },
      {
        id: "alumni",
        title: "Alumni Management",
        slug: "alumni",
        type: "Registry",
        visibility: "published",
        recordsCount: alumniCount,
      },
      {
        id: "counsellors",
        title: "Counsellor Management",
        slug: "counsellors",
        type: "Network",
        visibility: "published",
        recordsCount: counselorsCount,
      },
      {
        id: "course-leads",
        title: "Course Leads Management",
        slug: "course-leads",
        type: "Pipeline",
        visibility: "published",
        recordsCount: courseLeadsCount,
      },
      {
        id: "courses",
        title: "Course Programs Catalog",
        slug: "courses",
        type: "Catalog",
        visibility: "published",
        recordsCount: coursesCount,
      },
      {
        id: "leads",
        title: "Enquiries & Submissions",
        slug: "leads",
        type: "Inquiries",
        visibility: "published",
        recordsCount: inquiriesCount,
      },
      {
        id: "personality-test",
        title: "Personality Assessment Test",
        slug: "personality-test/questions",
        type: "Assessment",
        visibility: "published",
        recordsCount: personalityQuestionsCount,
      },
      {
        id: "settings",
        title: "Platform Settings & Brand",
        slug: "settings",
        type: "Config",
        visibility: "published",
        recordsCount: 1,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        admissions: admissionsCount,
        todayAdmissions: todayAdmissionsCount,
        inquiries: inquiriesCount,
        todayInquiries: todayInquiriesCount,
        counselors: counselorsCount,
        courses: coursesCount,
        alumni: alumniCount,
        courseLeads: courseLeadsCount,
        users: usersCount,
        todayUsers: todayUsersCount,
        personalityQuestions: personalityQuestionsCount,
        modulesList,
        recentAdmissions,
        recentLeads,
        recentCourseLeads,
        activities,
      },
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
