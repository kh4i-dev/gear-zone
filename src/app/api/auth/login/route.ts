import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/db'
import { success, fail, badRequest } from '@/lib/api'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const COOKIE_NAME = 'gearzone_session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    let loginEmail = email.toLowerCase().trim()
    let loginPassword = password

    if (loginEmail === 'admin') {
      loginEmail = 'admin@example.com'
    }
    // Auto-sync / reset Admin user with Env configurations dynamically
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD
    if (loginEmail === adminEmail && adminPassword) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
      await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
          password: hashedAdminPassword,
          role: 'ADMIN'
        },
        create: {
          email: adminEmail,
          name: 'Admin',
          password: hashedAdminPassword,
          role: 'ADMIN'
        }
      })
    }

    const user = await prisma.user.findUnique({ where: { email: loginEmail } })
    if (!user) {
      return NextResponse.json(fail('INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng'), { status: 401 })
    }

    const isValid = await bcrypt.compare(loginPassword, user.password)
    if (!isValid) {
      return NextResponse.json(fail('INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng'), { status: 401 })
    }

    const token = await new SignJWT({ sub: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    const response = NextResponse.json(success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    }))

    const isDev = process.env.NODE_ENV !== 'production'
    const cookieOptions = {
      httpOnly: true,
      secure: !isDev, // secure: false in dev
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      ...(isDev ? {} : { domain: undefined }), // no domain restriction in dev
    }

    response.cookies.set(COOKIE_NAME, token, cookieOptions)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(fail('LOGIN_ERROR', 'Lỗi khi đăng nhập'), { status: 500 })
  }
}
