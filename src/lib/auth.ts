import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from './db'
import type { NextRequest } from 'next/server'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const COOKIE_NAME = 'gearzone_session'

// Helper to verify JWT and get user
async function verifyAndGetUser(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.sub as string
    if (!userId) return null

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, phone: true, name: true, role: true },
    })

    return user
  } catch {
    return null
  }
}

type CurrentUser = Awaited<ReturnType<typeof verifyAndGetUser>>

// Overload 1: For Server Components (no args) - uses cookies() from next/headers
export async function getCurrentUser(): Promise<CurrentUser>

// Overload 2: For Route Handlers - uses request.cookies
export async function getCurrentUser(request: NextRequest): Promise<CurrentUser>

// Implementation
export async function getCurrentUser(request?: NextRequest): Promise<CurrentUser> {
  let token: string | undefined

  if (request) {
    token = request.cookies.get(COOKIE_NAME)?.value
  } else {
    const cookieStore = await cookies()
    token = cookieStore.get(COOKIE_NAME)?.value
  }

  if (!token) return null

  return verifyAndGetUser(token)
}
