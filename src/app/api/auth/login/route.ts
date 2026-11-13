import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  fakePasswordCheck,
  signToken,
  sessionCookieOptions,
  invalidateSessionCache,
  SESSION_TTL,
} from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_IP = 20; // per window, any email
const MAX_ATTEMPTS_PER_EMAIL = 5; // per window, any IP (applies to unknown emails too)
const MAX_FAILURES_BEFORE_LOCK = 5; // persistent per-account lockout
const LOCK_DURATION_MS = 15 * 60 * 1000;

const INVALID = { error: "Invalid email or password" };

function tooMany(retryAfterSec: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return NextResponse.json(
    { error: `Too many login attempts. Please try again in ${minutes} minute(s).` },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, rememberMe } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (email.length > 254 || password.length > 128) {
      return NextResponse.json(INVALID, { status: 401 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Throttle by IP and by email before doing any expensive work
    const ipLimit = rateLimit(`login:ip:${getClientIp(req)}`, MAX_ATTEMPTS_PER_IP, WINDOW_MS);
    if (!ipLimit.allowed) return tooMany(ipLimit.retryAfterSec);
    const emailLimit = rateLimit(
      `login:email:${normalizedEmail}`,
      MAX_ATTEMPTS_PER_EMAIL,
      WINDOW_MS
    );
    if (!emailLimit.allowed) return tooMany(emailLimit.retryAfterSec);

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

    if (!user) {
      await fakePasswordCheck(password); // same timing as a real check
      return NextResponse.json(INVALID, { status: 401 });
    }

    // 2. Persistent account lockout (survives restarts / multiple instances)
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      await fakePasswordCheck(password);
      return tooMany(Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000));
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const failures = user.failedLoginAttempts + 1;
      const lock = failures >= MAX_FAILURES_BEFORE_LOCK;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: lock ? 0 : failures,
          lockedUntil: lock ? new Date(Date.now() + LOCK_DURATION_MS) : user.lockedUntil,
        },
      });
      if (lock) {
        console.warn(`[auth] Account locked after repeated failed logins: ${user.id}`);
        return tooMany(LOCK_DURATION_MS / 1000);
      }
      return NextResponse.json(INVALID, { status: 401 });
    }

    // Check if user is active
    if (user.status !== "Active") {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact administrator." },
        { status: 403 }
      );
    }

    // 3. Success: reset counters, record login
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    invalidateSessionCache(user.id);

    const ttl = rememberMe ? SESSION_TTL.rememberMe : SESSION_TTL.default;
    const token = await signToken(
      { id: user.id, email: user.email, name: user.name, role: user.role, sv: user.sessionVersion },
      ttl
    );

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
    response.cookies.set({ ...sessionCookieOptions(ttl), value: token });
    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
