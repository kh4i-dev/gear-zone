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

  // Get dynamic admin configurations from env
  const ADMIN_PANEL_PREFIX = process.env.NEXT_PUBLIC_ADMIN_PANEL_PREFIX || 'system-control'
  const ADMIN_LOGIN_PATH = process.env.NEXT_PUBLIC_ADMIN_LOGIN_PATH || 'auth-login'
  const adminPanelPrefixPath = `/${ADMIN_PANEL_PREFIX}`
  const adminLoginPathFull = `/${ADMIN_PANEL_PREFIX}/${ADMIN_LOGIN_PATH}`

  // 1. Block direct external access to raw /admin paths (Security by Obscurity)
  if (pathname.startsWith('/admin')) {
    const isInternal = request.headers.get('x-internal-admin-route') === 'true'
    if (isInternal) {
      return NextResponse.next()
    }
    // Redirect direct external visits to raw /admin to the home page
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Admin routing protection and rewrites
  if (pathname.startsWith(adminPanelPrefixPath)) {
    // Exclude admin login path from protection
    if (pathname === adminLoginPathFull) {
      if (decoded && decoded.role === 'ADMIN') {
        return NextResponse.redirect(new URL(`${adminPanelPrefixPath}/dashboard`, request.url))
      }
      
      // Rewrite internally to /admin/login
      const headers = new Headers(request.headers)
      headers.set('x-internal-admin-route', 'true')
      return NextResponse.rewrite(new URL('/admin/login', request.url), {
        request: { headers }
      })
    }

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(adminLoginPathFull, request.url))
    }

    // Rewrite system-control/something internally to admin/something
    const relativeAdminPath = pathname.substring(adminPanelPrefixPath.length)
    const headers = new Headers(request.headers)
    headers.set('x-internal-admin-route', 'true')
    return NextResponse.rewrite(new URL(`/admin${relativeAdminPath || '/dashboard'}`, request.url), {
      request: { headers }
    })
  }

  // 3. User route protection
  const protectedUserRoutes = ['/account', '/checkout']
  const isProtectedUserRoute = protectedUserRoutes.some(route => pathname.startsWith(route))

  if (isProtectedUserRoute) {
    if (!decoded) {
      // Redirect to home page and open the Login Modal, remember original page
      return NextResponse.redirect(new URL(`/?auth=login&redirect=${encodeURIComponent(pathname)}`, request.url))
    }
  }

  // 4. Redirect static /login and /register paths to the Modal on Home Page
  if (pathname === '/login') {
    if (decoded) {
      if (decoded.role === 'ADMIN') {
        return NextResponse.redirect(new URL(`${adminPanelPrefixPath}/dashboard`, request.url))
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.redirect(new URL('/?auth=login', request.url))
  }

  if (pathname === '/register') {
    if (decoded) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.redirect(new URL('/?auth=register', request.url))
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
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

