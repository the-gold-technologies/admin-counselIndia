import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupReplacedCloudinaryFiles } from "@/lib/cloudinary";

type Ctx = { params: Promise<{ id: string }> };

/** DELETE /api/page-seo/:id — remove saved SEO; the page goes back to its built-in title & defaults. */
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const existing = await prisma.pageSeo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Page SEO not found" }, { status: 404 });
    }

    await prisma.pageSeo.delete({ where: { id } });
    await cleanupReplacedCloudinaryFiles({ ogImage: existing.ogImage }, null);

    return NextResponse.json({ success: true, message: "Page SEO removed" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
