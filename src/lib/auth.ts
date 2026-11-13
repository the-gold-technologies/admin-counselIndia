import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "counselindia_admin_token";

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return new TextEncoder().encode(secret);
};

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  /** User.sessionVersion at the time the token was issued */
  sv: number;
}

/** Session lifetimes in seconds — the JWT expiry always matches the cookie maxAge */
export const SESSION_TTL = {
  default: 7 * 24 * 60 * 60,
  rememberMe: 30 * 24 * 60 * 60,
} as const;

export function sessionCookieOptions(maxAge: number) {
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * Sign a JWT token for the user
 */
export async function signToken(
  payload: TokenPayload,
  ttlSeconds: number = SESSION_TTL.default
): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secretKey);
}

/**
 * Verify a JWT token's signature and expiry only (no revocation check).
 * Prefer getActiveSession() for authorization decisions.
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Session revocation
// ---------------------------------------------------------------------------

// Short-lived per-process cache so we don't hit the DB on every single request.
// Revocation takes effect within SESSION_CACHE_MS at most (immediately in the
// process that performed the logout / password change).
const SESSION_CACHE_MS = 10_000;
const sessionCache = new Map<string, { status: string; sv: number; expires: number }>();

export function invalidateSessionCache(userId: string) {
  sessionCache.delete(userId);
}

async function loadSessionState(userId: string) {
  const cached = sessionCache.get(userId);
  if (cached && cached.expires > Date.now()) return cached;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, sessionVersion: true },
  });
  if (!user) {
    sessionCache.delete(userId);
    return null;
  }
  const state = {
    status: user.status,
    sv: user.sessionVersion,
    expires: Date.now() + SESSION_CACHE_MS,
  };
  sessionCache.set(userId, state);
  return state;
}

/**
 * Verify the token AND that the session hasn't been revoked:
 * the user must still exist, be Active, and the token's session version must
 * match the user's current one (bumped on logout / password change).
 */
export async function getActiveSession(token: string | undefined): Promise<TokenPayload | null> {
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.id || typeof payload.sv !== "number") return null;

  try {
    const state = await loadSessionState(payload.id);
    if (!state || state.status !== "Active" || state.sv !== payload.sv) return null;
    return payload;
  } catch (err) {
    // Fail closed: if we can't confirm the session, treat as logged out.
    console.error("[auth] Session check failed (did you run `prisma db push`?):", err);
    return null;
  }
}

/** Revoke every session of a user (all devices). Returns the new session version. */
export async function revokeAllSessions(userId: string): Promise<number> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
    select: { sessionVersion: true },
  });
  invalidateSessionCache(userId);
  return updated.sessionVersion;
}

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

/**
 * Compare plain text password with hashed password
 */
export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * Hash plain text password
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

// A real bcrypt hash (generated once per process) used to keep login timing
// identical when the email doesn't exist
let dummyHashPromise: Promise<string> | null = null;

/** Burn the same CPU time as a real password check (prevents user enumeration via timing) */
export async function fakePasswordCheck(plain: string): Promise<void> {
  dummyHashPromise ??= bcrypt.hash("counselindia-dummy-password", 12);
  await bcrypt.compare(plain, await dummyHashPromise).catch(() => false);
}

/**
 * Admin password policy. Returns an error message, or null when the password is acceptable.
 */
export function validatePasswordStrength(password: unknown): string | null {
  if (typeof password !== "string") return "Password is required";
  if (password.length < 10) return "Password must be at least 10 characters long";
  if (password.length > 128) return "Password must be at most 128 characters long";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain both letters and numbers";
  }
  return null;
}

/**
 * Hash a password unless it's already a bcrypt hash. Returns undefined for empty input
 * so callers can skip the field (and never overwrite a stored hash with "").
 */
export async function hashPasswordIfNeeded(value: unknown): Promise<string | undefined> {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  if (/^\$2[aby]\$\d{2}\$.{53}$/.test(value)) return value;
  return hashPassword(value);
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

/**
 * Get current session user from cookies (Server Components, Server Actions, Route Handlers).
 * Includes the revocation check.
 */
export async function getServerSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    return await getActiveSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  } catch {
    return null;
  }
}

/**
 * True when the request carries a valid, non-revoked admin session cookie.
 * Use in route handlers that are reachable publicly (for the website) but must
 * return more data / allow more actions to logged-in admins.
 */
export async function isAdminRequest(): Promise<boolean> {
  return (await getServerSessionUser()) !== null;
}
