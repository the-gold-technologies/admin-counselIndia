import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";
import { isAdminRequest } from "@/lib/auth";
import { cleanupReplacedCloudinaryFiles } from "@/lib/cloudinary";
import { buildBlogData } from "@/lib/blogPayload";
import { BLOG_WRITABLE, pickWritable } from "@/lib/writableFields";

type Ctx = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET /api/blogs/:idOrSlug — the website looks posts up by slug.
export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const isAdmin = await isAdminRequest();

    const blog = await prisma.blog.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        ...(isAdmin ? {} : { status: "Published" }),
      },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json({ success: true, data: blog }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const raw = await request.json().catch(() => null);
    // Mass-assignment protection: only known, writable columns
    const body = pickWritable(raw, BLOG_WRITABLE);

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    const result = buildBlogData(body, true);
    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const slug = result.data.slug as string | undefined;
    if (slug && slug !== existing.slug) {
      const taken = await prisma.blog.findUnique({ where: { slug } });
      if (taken) {
        return NextResponse.json(
          {
            success: false,
            error: `The web address "${slug}" is already used by "${taken.title}". Choose another.`,
          },
          { status: 409 }
        );
      }
    }

    // Remove a replaced cover image from Cloudinary (compare against the merged record so a
    // partial update never deletes untouched files)
    await cleanupReplacedCloudinaryFiles(
      { coverImage: existing.coverImage },
      { coverImage: { ...existing, ...result.data }.coverImage }
    );

    const updated = await prisma.blog.update({ where: { id }, data: result.data });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    await prisma.blog.delete({ where: { id } });
    await cleanupReplacedCloudinaryFiles({ coverImage: existing.coverImage }, null);

    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
