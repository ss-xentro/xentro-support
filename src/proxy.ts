import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE = "xentro_auth"
const MAIN_APP_LOGIN_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL
  ? `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/login`
  : "https://xentro.switchspace.in/login"

const protectedPaths = ["/dashboard", "/admin", "/tickets"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's a protected path
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected) {
    const hasAuth = request.cookies.has(AUTH_COOKIE)

    if (!hasAuth) {
      // Create redirect URL to return to this app after login
      const currentUrl = request.nextUrl.clone()
      const returnUrl = encodeURIComponent(currentUrl.toString())
      const loginUrl = `${MAIN_APP_LOGIN_URL}?redirect=${returnUrl}`

      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
