import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";
import { getServerSessionUser } from "@/lib/auth";
import { cleanupReplacedCloudinaryFiles } from "@/lib/cloudinary";
import { buildPageSeoData, normalisePagePath } from "@/lib/pageSeo";
import { DEFAULTS_PATH } from "@/lib/websitePages";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/**
 * GET /api/page-seo?path=/about — public, used by the website:
 *   { data: { page: PageSeo | null, defaults: PageSeo | null } }
 * GET /api/page-seo — every saved row (admin list page; also public — it is all
 *   information the website prints into its HTML anyway).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.has("path")) {
      const path = normalisePagePath(searchParams.get("path"));
      if (!path) {
        return NextResponse.json(
          { success: false, error: "Invalid page address" },
          { status: 400, headers: corsHeaders }
        );
      }
      const rows = await prisma.pageSeo.findMany({
        where: { path: { in: [...new Set([path, DEFAULTS_PATH])] } },
      });
      return NextResponse.json(
        {
          success: true,
          data: {
            page: path === DEFAULTS_PATH ? null : rows.find((r) => r.path === path) || null,
            defaults: rows.find((r) => r.path === DEFAULTS_PATH) || null,
          },
        },
        { headers: corsHeaders }
      );
    }

    const rows = await prisma.pageSeo.findMany({ orderBy: { path: "asc" } });
    return NextResponse.json(
      { success: true, count: rows.length, data: rows },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/** POST /api/page-seo — save SEO for a page (creates it, or updates the row with the same path). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const result = buildPageSeoData(body);
    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const user = await getServerSessionUser();
    const data = { ...result.data, updatedBy: user?.name || null };
    const existing = await prisma.pageSeo.findUnique({ where: { path: data.path } });

    const saved = await prisma.pageSeo.upsert({
      where: { path: data.path },
      create: data as any,
      update: data,
    });

    if (existing) {
      await cleanupReplacedCloudinaryFiles(
        { ogImage: existing.ogImage },
        { ogImage: saved.ogImage }
      );
    }

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
