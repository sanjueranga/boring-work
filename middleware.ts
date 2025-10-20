import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const isOnLoginPage = request.nextUrl.pathname === "/login"

  // In middleware, we can't access localStorage, so we check for a session cookie
  // For now, we'll allow all requests and let the client handle redirects
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
