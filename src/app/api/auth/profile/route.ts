import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    let user: any = null;
    if ((prisma as any).user?.findUnique) {
      user = await (prisma as any).user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          phone: true,
          status: true,
          lastLoginAt: true,
        },
      });
    }

    if (!user) {
      const rows: any = await prisma.$queryRaw`
        SELECT id, name, email, role, avatar, phone, status, "lastLoginAt"
        FROM "User"
        WHERE id = ${payload.id}
        LIMIT 1
      `;
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    }

    if (!user || user.status !== "Active") {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
