import { NextResponse } from 'next/server'
import { success } from '@/lib/api'

export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'gearzone_session'

export async function POST() {
  const response = NextResponse.json(success({ ok: true }))
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
