import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsHeaders } from "@/lib/cors";
import { AUTH_COOKIE_NAME, getActiveSession } from "@/lib/auth";

// Next.js 16 "proxy" (formerly middleware) — always runs on the Node.js runtime,
// which lets us check session revocation / user status in the database.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, next internal paths, and uploads
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    (!pathname.startsWith("/api/") &&
      /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$/.test(pathname))
  ) {
    return NextResponse.next();
  }

  // Handle CORS preflight options request
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // Allow public API access for public website data.
  // Paths are matched EXACTLY (no prefix matching) so that admin-only sub-routes such as
  // /api/leads/upload or /api/leads/seed can never be reached without a session.
  // Routes listed here must themselves strip sensitive fields for non-admin callers.
  const path = pathname.replace(/\/+$/, "") || "/";
  const PUBLIC_GET: RegExp[] = [
    /^\/api\/courses$/,
    /^\/api\/courses\/[^/]+$/,
    /^\/api\/counsellors$/,
    /^\/api\/counsellors\/[^/]+$/,
    /^\/api\/alumni$/,
    /^\/api\/settings$/,
    /^\/api\/personality-test\/info$/,
    /^\/api\/personality-test\/questions$/,
    /^\/api\/personality-test\/tab-result$/,
    /^\/api\/personality-test\/entries$/,
  ];
  const PUBLIC_POST: RegExp[] = [/^\/api\/leads$/, /^\/api\/personality-test\/entries$/];
  const PUBLIC_PATCH: RegExp[] = [/^\/api\/personality-test\/entries$/];

  const matches = (list: RegExp[]) => list.some((re) => re.test(path));
  const isPublicApi =
    (request.method === "GET" && matches(PUBLIC_GET)) ||
    (request.method === "POST" && matches(PUBLIC_POST)) ||
    (request.method === "PATCH" && matches(PUBLIC_PATCH));

  if (isPublicApi) {
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // 2. Read auth token cookie
  // Valid signature + not expired + user still Active + session not revoked
  const isAuthenticated =
    (await getActiveSession(request.cookies.get(AUTH_COOKIE_NAME)?.value)) !== null;

  // 3. If navigating to /login
  if (pathname === "/login") {
    if (isAuthenticated) {
      // Already logged in, redirect to dashboard
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 4. If not authenticated and attempting to access protected admin pages or APIs
  if (!isAuthenticated) {
    // If it is an API route (other than public APIs), return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to continue." },
        { status: 401, headers: corsHeaders }
      );
    }

    // Redirect to /login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
