import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { success, fail } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, phone, email, name, password } = body

    if (!username || !phone || !name || !password) {
      return NextResponse.json(
        fail('VALIDATION_ERROR', 'Tài khoản, số điện thoại, họ tên và mật khẩu là bắt buộc'),
        { status: 400 }
      )
    }

    const cleanUsername = username.toLowerCase().trim()
    const cleanPhone = phone.trim()
    const cleanEmail = email ? email.toLowerCase().trim() : null

    // Validate phone structure (basic)
    if (!/^[0-9]{9,11}$/.test(cleanPhone)) {
      return NextResponse.json(
        fail('VALIDATION_ERROR', 'Số điện thoại không hợp lệ (phải từ 9 đến 11 chữ số)'),
        { status: 400 }
      )
    }

    // Check if username is already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username: cleanUsername },
    })
    if (existingUsername) {
      return NextResponse.json(
        fail('DUPLICATE_USERNAME', 'Tài khoản này đã tồn tại trên hệ thống'),
        { status: 400 }
      )
    }

    // Check if phone is already taken
    const existingPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    })
    if (existingPhone) {
      return NextResponse.json(
        fail('DUPLICATE_PHONE', 'Số điện thoại này đã được sử dụng'),
        { status: 400 }
      )
    }

    // Check if email is already taken (if provided)
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: cleanEmail },
      })
      if (existingEmail) {
        return NextResponse.json(
          fail('DUPLICATE_EMAIL', 'Email này đã được đăng ký tài khoản khác'),
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        phone: cleanPhone,
        email: cleanEmail,
        name,
        password: hashedPassword,
        role: 'USER',
      },
    })

    return NextResponse.json(
      success({
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      fail('REGISTRATION_ERROR', 'Lỗi hệ thống khi đăng ký tài khoản'),
      { status: 500 }
    )
  }
}
