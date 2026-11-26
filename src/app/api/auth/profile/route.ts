import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  getActiveSession,
  getSessionAccess,
  comparePassword,
  hashPassword,
  signToken,
  sessionCookieOptions,
  revokeAllSessions,
  invalidateSessionCache,
  validatePasswordStrength,
  SESSION_TTL,
} from "@/lib/auth";

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  phone: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  staffRole: { select: { id: true, name: true } },
} as const;

export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionAccess(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    if (!auth) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    const payload = auth.session;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: PUBLIC_USER_SELECT,
    });

    if (!user || user.status !== "Active") {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // access: "*" = Super Admin (everything), otherwise the section keys this user may open
    return NextResponse.json({ authenticated: true, user, access: auth.access });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = await getActiveSession(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, currentPassword, newPassword } = body ?? {};

    const existingUser = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: { name?: string; email?: string; phone?: string; password?: string } = {};

    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim().slice(0, 100);
    }

    if (phone !== undefined && phone !== null) {
      updateData.phone = String(phone).trim().slice(0, 30);
    }

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
      }
      if (normalizedEmail !== existingUser.email.toLowerCase()) {
        const conflict = await prisma.user.findFirst({
          where: {
            email: { equals: normalizedEmail, mode: "insensitive" },
            id: { not: payload.id },
          },
          select: { id: true },
        });
        if (conflict) {
          return NextResponse.json(
            { error: "Another account already uses this email address" },
            { status: 400 }
          );
        }
        updateData.email = normalizedEmail;
      }
    }

    const changingPassword = Boolean(newPassword);
    if (changingPassword) {
      if (!currentPassword || typeof currentPassword !== "string") {
        return NextResponse.json(
          { error: "Please enter your current password to set a new password" },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await comparePassword(currentPassword, existingUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const strengthError = validatePasswordStrength(newPassword);
      if (strengthError) {
        return NextResponse.json({ error: strengthError }, { status: 400 });
      }
      if (newPassword === currentPassword) {
        return NextResponse.json(
          { error: "New password must be different from the current password" },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({ where: { id: payload.id }, data: updateData });
      invalidateSessionCache(payload.id);
    }

    // A password change signs out every other device; this device gets a fresh token.
    let sessionVersion = existingUser.sessionVersion;
    if (changingPassword) {
      sessionVersion = await revokeAllSessions(payload.id);
    }

    const finalName = updateData.name || existingUser.name;
    const finalEmail = updateData.email || existingUser.email;

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: existingUser.id,
        name: finalName,
        email: finalEmail,
        phone: updateData.phone !== undefined ? updateData.phone : existingUser.phone,
        role: existingUser.role,
        avatar: existingUser.avatar,
      },
    });

    if (updateData.name || updateData.email || changingPassword) {
      const newToken = await signToken(
        {
          id: existingUser.id,
          email: finalEmail,
          name: finalName,
          role: existingUser.role,
          sv: sessionVersion,
        },
        SESSION_TTL.default
      );
      response.cookies.set({ ...sessionCookieOptions(SESSION_TTL.default), value: newToken });
    }

    return response;
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
