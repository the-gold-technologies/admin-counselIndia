import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "counselindia_admin_token";

const getSecretKey = () => {
  const secret =
    process.env.JWT_SECRET ||
    "counselindia_super_secure_jwt_secret_key_2026_tgt";
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
export async function comparePassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * Hash plain text password
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
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
