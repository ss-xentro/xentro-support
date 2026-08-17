import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request })
  const url = request.nextUrl.clone()

  const isAuthRoute = url.pathname === '/login' || url.pathname === '/admin/login'
  const isAdminRoute = url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')
  const isUserRoute = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/tickets')

  // Not logged in
  if (!token) {
    if (isAdminRoute) {
      url.pathname = '/admin/login'
      url.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    if (isUserRoute) {
      url.pathname = '/login'
      url.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // Logged in
  if (token) {
    if (isAuthRoute) {
      // Redirect away from login pages if already logged in
      if (token.role === 'ADMIN' || token.role === 'SUPER_ADMIN') {
        url.pathname = '/admin/tickets'
      } else {
        url.pathname = '/dashboard'
      }
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tickets/:path*', '/admin/:path*', '/login'],
}
