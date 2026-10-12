import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "counselindia_admin_token";

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || "counselindia_super_secure_jwt_secret_key_2026_tgt";
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, next internal paths, and uploads
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Read auth token cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const secret = getSecretKey();
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

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
    // If it's an API route (other than auth/login), return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to continue." },
        { status: 401 }
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
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
