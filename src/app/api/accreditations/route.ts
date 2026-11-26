import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";
import { isAdminRequest } from "@/lib/auth";
import { getActingUser } from "@/lib/staffAccess";
import { canAccessPath } from "@/lib/permissions";

function getSeedAccreditations() {
  try {
    const jsonPath = path.join(process.cwd(), "prisma", "accreditations-data.json");
    if (fs.existsSync(jsonPath)) {
      const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      return raw.map((item: any, idx: number) => ({
        id: `seed-acc-${idx + 1}`,
        ...item,
      }));
    }
  } catch (err) {
    console.warn("Could not read accreditations-data.json:", err);
  }
  return [];
}

let inMemoryAccreditations = getSeedAccreditations();

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const isAdmin = await isAdminRequest();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.toLowerCase().trim();
    const search = searchParams.get("search")?.toLowerCase().trim();

    try {
      const where: any = {};
      if (!isAdmin) {
        where.isActive = true;
      }
      if (category && category !== "all") {
        where.category = category;
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { subtitle: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const count = await prisma.accreditation.count();
      if (count === 0) {
        const seedItems = getSeedAccreditations();
        for (const item of seedItems) {
          await prisma.accreditation.create({
            data: {
              title: item.title,
              subtitle: item.subtitle || null,
              description: item.description || null,
              logo: item.logo || null,
              link: item.link || null,
              category: item.category || "association",
              order: item.order || 0,
              isActive: item.isActive !== false,
            },
          });
        }
      }

      const items = await prisma.accreditation.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });

      return NextResponse.json(
        {
          success: true,
          count: items.length,
          data: items,
        },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB unreachable, serving accreditations from memory:", dbErr);
      let filtered = [...inMemoryAccreditations];
      if (!isAdmin) {
        filtered = filtered.filter((item) => item.isActive);
      }
      if (category && category !== "all") {
        filtered = filtered.filter((item) => item.category === category);
      }
      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(search) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(search)) ||
            (item.description && item.description.toLowerCase().includes(search))
        );
      }
      return NextResponse.json(
        {
          success: true,
          count: filtered.length,
          data: filtered,
        },
        { headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch accreditations" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const actor = await getActingUser();
    if (!actor) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!canAccessPath(actor.access, "/api/accreditations")) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to manage accreditations." },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    const subtitle = body.subtitle ? String(body.subtitle).trim() : null;
    const description = body.description ? String(body.description).trim() : null;
    const logo = body.logo ? String(body.logo).trim() : null;
    const link = body.link ? String(body.link).trim() : null;
    const category = ["ugc_university", "association", "accreditation", "international"].includes(
      body.category
    )
      ? body.category
      : "association";
    const order = typeof body.order === "number" ? body.order : parseInt(body.order, 10) || 0;
    const isActive = body.isActive !== false;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title / Institution name is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      const created = await prisma.accreditation.create({
        data: {
          title,
          subtitle,
          description,
          logo,
          link,
          category,
          order,
          isActive,
        },
      });

      return NextResponse.json(
        { success: true, data: created, message: "Accreditation added successfully." },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB save failed, saving in memory:", dbErr);
      const newItem = {
        id: `acc-${Date.now()}`,
        title,
        subtitle,
        description,
        logo,
        link,
        category,
        order,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryAccreditations.push(newItem);
      return NextResponse.json(
        { success: true, data: newItem, message: "Saved successfully (fallback mode)." },
        { headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create accreditation" },
      { status: 500, headers: corsHeaders }
    );
  }
}
