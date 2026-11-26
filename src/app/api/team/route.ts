import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";
import { isAdminRequest } from "@/lib/auth";
import { getActingUser } from "@/lib/staffAccess";
import { canAccessPath } from "@/lib/permissions";

export const DEFAULT_TEAM_MEMBERS = [
  // Core Team
  {
    id: "seed-core-1",
    name: "Sapna Singh",
    designation: "Finance Associate",
    image: "https://prod-s3.counselindia.com/meet_our_team/sapna%20finance%20photo_1756911088.jpeg",
    category: "core",
    order: 1,
    isActive: true,
  },
  {
    id: "seed-core-2",
    name: "Shubham Sharma",
    designation: "Sr. Manager - Business Development & Operations",
    image: "https://prod-s3.counselindia.com/meet_our_team/shubham_1753159155.jpeg",
    category: "core",
    order: 2,
    isActive: true,
  },
  {
    id: "seed-core-3",
    name: "Deepanjali Soni",
    designation: "Assistant HR Manager",
    image: "https://prod-s3.counselindia.com/meet_our_team/deepanjali_1753159327.jpeg",
    category: "core",
    order: 3,
    isActive: true,
  },
  {
    id: "seed-core-4",
    name: "Rocky Bhati",
    designation: "Compliance Officer",
    image: "https://prod-s3.counselindia.com/meet_our_team/rocky_1753159466.jpeg",
    category: "core",
    order: 4,
    isActive: true,
  },
  {
    id: "seed-core-5",
    name: "Shubham",
    designation: "Marketing Manager",
    image: "https://prod-s3.counselindia.com/meet_our_team/shubham.jpg",
    category: "core",
    order: 5,
    isActive: true,
  },
  // Advisors
  {
    id: "seed-adv-1",
    name: "Prem sir",
    designation: "Strategic Advisor",
    image: "",
    category: "advisor",
    order: 1,
    isActive: true,
  },
  {
    id: "seed-adv-2",
    name: "Sajal sir",
    designation: "Growth & Business Advisor",
    image: "",
    category: "advisor",
    order: 2,
    isActive: true,
  },
  {
    id: "seed-adv-3",
    name: "Ayush Sir",
    designation: "Advisory Board Member",
    image: "",
    category: "advisor",
    order: 3,
    isActive: true,
  },
  // Consultants
  {
    id: "seed-cons-1",
    name: "Nitin Dev Purohit",
    designation: "Consultant and Management Lawyer",
    image: "https://prod-s3.counselindia.com/meet_our_team/3_1716458706.jpeg",
    category: "consultant",
    order: 4,
    isActive: true,
  },
  {
    id: "seed-cons-2",
    name: "Nitya Bansal",
    designation: "Legal Consultant",
    image: "https://prod-s3.counselindia.com/meet_our_team/1_1716458651.jpg",
    category: "consultant",
    order: 5,
    isActive: true,
  },
  {
    id: "seed-cons-3",
    name: "Gaurav Kochhar",
    designation: "Legal Consultant",
    image: "https://prod-s3.counselindia.com/meet_our_team/2_1716458535.jpg",
    category: "consultant",
    order: 6,
    isActive: true,
  },
];

// In-memory store for fallback when DB is disconnected
function getInitialSeedMembers() {
  try {
    const jsonPath = path.join(process.cwd(), "prisma", "team-members-data.json");
    if (fs.existsSync(jsonPath)) {
      const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      return raw.map((item: any, idx: number) => ({
        id: `seed-${item.category}-${idx + 1}`,
        ...item,
      }));
    }
  } catch (err) {
    console.warn("Could not read team-members-data.json:", err);
  }
  return DEFAULT_TEAM_MEMBERS;
}

let inMemoryMembers = getInitialSeedMembers();

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
        if (category === "advisors_and_consultants") {
          where.category = { in: ["advisor", "consultant"] };
        } else {
          where.category = category;
        }
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { designation: { contains: search, mode: "insensitive" } },
        ];
      }

      const count = await prisma.aboutMember.count();
      if (count === 0) {
        // Auto-seed initial members
        for (const item of DEFAULT_TEAM_MEMBERS) {
          await prisma.aboutMember.create({
            data: {
              name: item.name,
              designation: item.designation,
              image: item.image || null,
              category: item.category,
              order: item.order,
              isActive: item.isActive,
            },
          });
        }
      }

      const members = await prisma.aboutMember.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });

      return NextResponse.json(
        {
          success: true,
          count: members.length,
          data: members,
        },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB unreachable, serving team from memory fallback:", dbErr);
      let filtered = [...inMemoryMembers];
      if (!isAdmin) {
        filtered = filtered.filter((m) => m.isActive);
      }
      if (category && category !== "all") {
        if (category === "advisors_and_consultants") {
          filtered = filtered.filter(
            (m) => m.category === "advisor" || m.category === "consultant"
          );
        } else {
          filtered = filtered.filter((m) => m.category === category);
        }
      }
      if (search) {
        filtered = filtered.filter(
          (m) =>
            m.name.toLowerCase().includes(search) || m.designation.toLowerCase().includes(search)
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
      { success: false, error: err?.message || "Failed to fetch team members" },
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

    if (!canAccessPath(actor.access, "/api/team")) {
      return NextResponse.json(
        { success: false, error: "You do not have permission to manage team members." },
        { status: 403, headers: corsHeaders }
      );
    }

    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const designation = String(body.designation || "").trim();
    const image = body.image ? String(body.image).trim() : null;
    const category = ["core", "advisor", "consultant"].includes(body.category)
      ? body.category
      : "core";
    const order = typeof body.order === "number" ? body.order : parseInt(body.order, 10) || 0;
    const isActive = body.isActive !== false;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Member name is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!designation) {
      return NextResponse.json(
        { success: false, error: "Designation is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      const created = await prisma.aboutMember.create({
        data: {
          name,
          designation,
          image,
          category,
          order,
          isActive,
        },
      });

      return NextResponse.json(
        { success: true, data: created, message: "Member created successfully." },
        { headers: corsHeaders }
      );
    } catch (dbErr) {
      console.warn("DB save failed, storing in memory fallback:", dbErr);
      const newMember = {
        id: `mem-${Date.now()}`,
        name,
        designation,
        image: image || "",
        category,
        order,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryMembers.push(newMember);
      return NextResponse.json(
        { success: true, data: newMember, message: "Member created successfully (fallback mode)." },
        { headers: corsHeaders }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create member" },
      { status: 500, headers: corsHeaders }
    );
  }
}
