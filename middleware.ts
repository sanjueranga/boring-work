import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Skip authentication for static files and images
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Skip authentication for auth-related routes
  if (
    request.nextUrl.pathname.startsWith("/api/auth/") ||
    request.nextUrl.pathname === "/api/session" ||
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/register"
  ) {
    return NextResponse.next();
  }

  const session = await getSession();

  // Handle API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
    return NextResponse.next();
  }

  // Handle page routes
  if (!session?.user) {
    if (request.nextUrl.pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else if (request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
