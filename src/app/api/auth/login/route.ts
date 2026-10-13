import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Find user by email (using prisma.user with $queryRaw fallback if client is cached)
    let user: any = null;
    if ((prisma as any).user?.findUnique) {
      user = await (prisma as any).user.findUnique({
        where: { email: normalizedEmail },
      });
    }

    if (!user) {
      const rows: any = await prisma.$queryRaw`
        SELECT * FROM "User" WHERE LOWER(email) = ${normalizedEmail} LIMIT 1
      `;
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check if user is active
    if (user.status !== "Active") {
      return NextResponse.json(
        {
          error:
            "Your account has been deactivated. Please contact administrator.",
        },
        { status: 403 },
      );
    }

    // Update last login timestamp
    try {
      if ((prisma as any).user?.update) {
        await (prisma as any).user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      } else {
        await prisma.$executeRaw`
          UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = ${user.id}
        `;
      }
    } catch (e) {
      console.warn("Could not update lastLoginAt:", e);
    }

    // Create JWT Token
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Configure cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAge,
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during login" },
      { status: 500 },
    );
  }
}
