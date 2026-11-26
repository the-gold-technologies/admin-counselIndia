import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";
import { isAdminRequest } from "@/lib/auth";
import { getActingUser } from "@/lib/staffAccess";
import { canAccessPath } from "@/lib/permissions";

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getSeedPodcasts() {
  try {
    const jsonPath = path.join(process.cwd(), "prisma", "podcasts-data.json");
    if (fs.existsSync(jsonPath)) {
      const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      return raw.map((item: any, idx: number) => ({
        id: `seed-pod-${idx + 1}`,
        ...item,
      }));
    }
  } catch (err) {
    console.warn("Could not read podcasts-data.json:", err);
  }
  return [];
}

let inMemoryPodcasts = getSeedPodcasts();

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const isAdmin = await isAdminRequest();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();

    try {
      const where: any = {};
      if (!isAdmin) {
        where.isActive = true;
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { guest: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const count = await prisma.podcast.count();
      if (count === 0) {
        const seedItems = getSeedPodcasts();
        for (const item of seedItems) {
          await prisma.podcast.create({
            data: {
              title: item.title,
              youtubeUrl: item.youtubeUrl,
              youtubeId: item.youtubeId || extractYouTubeId(item.youtubeUrl),
              thumbnail: item.thumbnail || null,
              guest: item.guest || null,
              host: item.host || "Counsel India",
              duration: item.duration || null,
              description: item.description || null,
              category: item.category || "Mental Health",
              order: item.order || 0,
              isActive: item.isActive !== false,
            },
          });
        }
      }

      const items = await prisma.podcast.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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
      console.warn("DB unreachable, serving podcasts from memory fallback:", dbErr);
      let filtered = [...inMemoryPodcasts];
      if (!isAdmin) {
        filtered = filtered.filter((p) => p.isActive);
      }
      if (search) {
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            (p.guest && p.guest.toLowerCase().includes(search)) ||
            (p.description && p.description.toLowerCase().includes(search))
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
      { success: false, error: err?.message || "Failed to fetch podcasts" },
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

    if (!canAccessPath(actor.access, "/api/podcasts")) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to manage podcasts." },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    const youtubeUrl = String(body.youtubeUrl || "").trim();
    const youtubeId = extractYouTubeId(youtubeUrl);
    let thumbnail = body.thumbnail ? String(body.thumbnail).trim() : null;
    if (!thumbnail && youtubeId) {
      thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }
    const guest = body.guest ? String(body.guest).trim() : null;
    const host = body.host ? String(body.host).trim() : "Counsel India";
    const duration = body.duration ? String(body.duration).trim() : null;
    const description = body.description ? String(body.description).trim() : null;
    const category = body.category ? String(body.category).trim() : "Mental Health";
    const order = typeof body.order === "number" ? body.order : parseInt(body.order, 10) || 0;
    const isActive = body.isActive !== false;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Podcast title is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!youtubeUrl) {
      return NextResponse.json(
        { success: false, error: "YouTube link is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      const created = await prisma.podcast.create({
        data: {
          title,
          youtubeUrl,
          youtubeId,
          thumbnail,
          guest,
          host,
          duration,
          description,
          category,
          order,
          isActive,
        },
      });

      return NextResponse.json(
        { success: true, data: created, message: "Podcast added successfully." },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB save failed, saving in memory:", dbErr);
      const newItem = {
        id: `pod-${Date.now()}`,
        title,
        youtubeUrl,
        youtubeId,
        thumbnail: thumbnail || "",
        guest,
        host,
        duration,
        description,
        category,
        order,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryPodcasts.push(newItem);
      return NextResponse.json(
        { success: true, data: newItem, message: "Saved successfully (fallback mode)." },
        { headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create podcast" },
      { status: 500, headers: corsHeaders }
    );
  }
}
