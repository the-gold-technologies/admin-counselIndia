import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  verifyToken,
  comparePassword,
  hashPassword,
  signToken,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 },
      );
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
          createdAt: true,
        },
      });
    }

    if (!user) {
      const rows: any = await prisma.$queryRaw`
        SELECT id, name, email, role, avatar, phone, status, "lastLoginAt", "createdAt"
        FROM "User"
        WHERE id = ${payload.id}
        LIMIT 1
      `;
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    }

    if (!user || user.status !== "Active") {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, currentPassword, newPassword } = body;

    // Fetch existing user with password
    let existingUser: any = null;
    if ((prisma as any).user?.findUnique) {
      existingUser = await (prisma as any).user.findUnique({
        where: { id: payload.id },
      });
    }

    if (!existingUser) {
      const rows: any = await prisma.$queryRaw`
        SELECT * FROM "User" WHERE id = ${payload.id} LIMIT 1
      `;
      if (rows && rows.length > 0) {
        existingUser = rows[0];
      }
    }

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    // Validate and update name
    if (name && typeof name === "string") {
      updateData.name = name.trim();
    }

    // Validate and update phone
    if (phone !== undefined) {
      updateData.phone = String(phone).trim();
    }

    // Validate and update email
    if (email && typeof email === "string") {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== existingUser.email) {
        // Check uniqueness
        const conflict = await prisma.$queryRaw<any[]>`
          SELECT id FROM "User" WHERE LOWER(email) = ${normalizedEmail} AND id != ${payload.id} LIMIT 1
        `;
        if (conflict && conflict.length > 0) {
          return NextResponse.json(
            { error: "Another account already uses this email address" },
            { status: 400 },
          );
        }
        updateData.email = normalizedEmail;
      }
    }

    // Validate and update password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Please enter your current password to set a new password" },
          { status: 400 },
        );
      }

      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        existingUser.password,
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long" },
          { status: 400 },
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    // Perform database update
    if (Object.keys(updateData).length > 0) {
      if ((prisma as any).user?.update) {
        await (prisma as any).user.update({
          where: { id: payload.id },
          data: updateData,
        });
      } else {
        const setClauses: string[] = [];
        if (updateData.name) {
          await prisma.$executeRaw`UPDATE "User" SET name = ${updateData.name} WHERE id = ${payload.id}`;
        }
        if (updateData.email) {
          await prisma.$executeRaw`UPDATE "User" SET email = ${updateData.email} WHERE id = ${payload.id}`;
        }
        if (updateData.phone !== undefined) {
          await prisma.$executeRaw`UPDATE "User" SET phone = ${updateData.phone} WHERE id = ${payload.id}`;
        }
        if (updateData.password) {
          await prisma.$executeRaw`UPDATE "User" SET password = ${updateData.password} WHERE id = ${payload.id}`;
        }
        await prisma.$executeRaw`UPDATE "User" SET "updatedAt" = NOW() WHERE id = ${payload.id}`;
      }
    }

    // Refresh token if name or email changed
    const finalName = updateData.name || existingUser.name;
    const finalEmail = updateData.email || existingUser.email;

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: existingUser.id,
        name: finalName,
        email: finalEmail,
        phone:
          updateData.phone !== undefined
            ? updateData.phone
            : existingUser.phone,
        role: existingUser.role,
        avatar: existingUser.avatar,
      },
    });

    if (updateData.name || updateData.email) {
      const newToken = await signToken({
        id: existingUser.id,
        email: finalEmail,
        name: finalName,
        role: existingUser.role,
      });

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update profile" },
      { status: 500 },
    );
  }
}
