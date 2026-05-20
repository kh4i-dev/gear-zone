import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const COOKIE_NAME = 'gearzone_session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  let decoded: any = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      decoded = payload
    } catch {
      decoded = null
    }
  }

  // Admin routing protection
  if (pathname.startsWith('/admin')) {
    // Exclude /admin/login from protection
    if (pathname === '/admin/login') {
      if (decoded && decoded.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.next()
    }

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // User route protection
  const protectedUserRoutes = ['/account', '/checkout']
  const isProtectedUserRoute = protectedUserRoutes.some(route => pathname.startsWith(route))

  if (isProtectedUserRoute) {
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect /login and /register if already logged in
  if (pathname === '/login' || pathname === '/register') {
    if (decoded) {
      if (decoded.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/login',
    '/register',
  ],
}
