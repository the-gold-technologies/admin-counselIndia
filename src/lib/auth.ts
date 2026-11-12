import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

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
}

/**
 * Sign a JWT token for the user with 7-day expiration
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

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
  return bcrypt.hash(plain, 10);
}

/**
 * True when the request carries a valid admin session cookie.
 * Use in route handlers that are reachable publicly (for the website) but must
 * return more data / allow more actions to logged-in admins.
 */
export async function isAdminRequest(): Promise<boolean> {
  return (await getServerSessionUser()) !== null;
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

/**
 * Get current session user from cookies (Server Components or Server Actions)
 */
export async function getServerSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}
