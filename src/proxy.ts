import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsHeaders } from "@/lib/cors";
import { AUTH_COOKIE_NAME, getSessionAccess } from "@/lib/auth";
import { canAccessPath, sectionForPath } from "@/lib/permissions";

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
    // Static files only — a protected section's address (e.g. /counsellors/x.png) is never skipped
    (!pathname.startsWith("/api/") &&
      sectionForPath(pathname) === null &&
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
    /^\/api\/blogs$/,
    /^\/api\/blogs\/[^/]+$/,
    /^\/api\/page-seo$/,
    /^\/api\/settings$/,
    /^\/api\/team$/,
    /^\/api\/team\/[^/]+$/,
    /^\/api\/advisors$/,
    /^\/api\/advisors\/[^/]+$/,
    /^\/api\/accreditations$/,
    /^\/api\/accreditations\/[^/]+$/,
    /^\/api\/podcasts$/,
    /^\/api\/podcasts\/[^/]+$/,
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
    // Public website data. A logged-in staff member WITHOUT access to this section is served
    // the public view (their session cookie is not forwarded), so admin-only fields stay hidden.
    let response = NextResponse.next();
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const auth = await getSessionAccess(token);
      if (auth && !canAccessPath(auth.access, path)) {
        const headers = new Headers(request.headers);
        const otherCookies = request.cookies
          .getAll()
          .filter((c) => c.name !== AUTH_COOKIE_NAME)
          .map((c) => `${c.name}=${c.value}`)
          .join("; ");
        if (otherCookies) headers.set("cookie", otherCookies);
        else headers.delete("cookie");
        response = NextResponse.next({ request: { headers } });
      }
    }
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // 2. Read auth token cookie
  // Valid signature + not expired + user still Active + session not revoked
  const auth = await getSessionAccess(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const isAuthenticated = auth !== null;

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

  // 5. Role-based access: staff may only open the sections of their role
  if (!canAccessPath(auth.access, path)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "You don't have access to this section." },
        { status: 403, headers: corsHeaders }
      );
    }
    // Show the "Access denied" page at the same address (HTTP 403) — the restricted page is never rendered
    const deniedUrl = request.nextUrl.clone();
    deniedUrl.pathname = "/access-denied";
    deniedUrl.search = "";
    return NextResponse.rewrite(deniedUrl, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
