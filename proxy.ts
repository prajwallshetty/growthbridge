import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "growthbridge_admin_jwt_secret_token_12345";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gate all routes under /admin except the login page
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jose.jwtVerify(sessionCookie, secret);
      return NextResponse.next();
    } catch (error) {
      console.error("JWT Verification failed:", error);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
