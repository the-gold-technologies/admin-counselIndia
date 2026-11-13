import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getActiveSession,
  revokeAllSessions,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Revoke the token server-side so a copied/stolen cookie stops working too.
  // Note: this signs the user out on all devices.
  try {
    const session = await getActiveSession(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    if (session) await revokeAllSessions(session.id);
  } catch (err) {
    console.error("Logout revoke error:", err);
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
  response.cookies.set({ ...sessionCookieOptions(0), value: "" });
  return response;
}
