import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { success, unauthorized } from '@/lib/api'

export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'gearzone_session'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)

  if (!user) {
    const response = NextResponse.json(unauthorized('Chưa đăng nhập'), { status: 401 })
    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return response
  }

  return NextResponse.json(success(user))
}
