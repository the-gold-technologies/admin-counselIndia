import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";
import { isAdminRequest } from "@/lib/auth";
import { buildBlogData } from "@/lib/blogPayload";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET /api/blogs?search=&status=&category=&summary=1
// summary=1 leaves out the (large) post content — used for list pages.
// Public (website) callers only ever see Published posts.
export async function GET(request: Request) {
  try {
    const isAdmin = await isAdminRequest();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const status = isAdmin ? searchParams.get("status") || "" : "Published";
    const summary = searchParams.get("summary") === "1";

    const where: any = {};
    if (status && status !== "All") where.status = status;
    if (category && category !== "All") where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { authorName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      ...(summary ? { omit: { content: true } } : {}),
    });

    return NextResponse.json(
      { success: true, count: blogs.length, data: blogs },
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
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const result = buildBlogData(body, false);
    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const slug = result.data.slug as string;
    const taken = await prisma.blog.findUnique({ where: { slug } });
    if (taken) {
      return NextResponse.json(
        {
          success: false,
          error: `The web address "${slug}" is already used by "${taken.title}". Change the title or web address.`,
        },
        { status: 409 }
      );
    }

    const created = await prisma.blog.create({ data: result.data as any });
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
