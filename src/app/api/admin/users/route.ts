import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { success, fail, forbidden, badRequest } from '@/lib/api'

const validRoles = ['ADMIN', 'USER', 'CUSTOMER', 'WAREHOUSE']

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role')

    const users = await prisma.user.findMany({
      where: roleFilter ? { role: roleFilter } : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(success(users))
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(fail('FETCH_USERS_ERROR', 'Lỗi khi lấy danh sách người dùng'), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
  }

  try {
    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json(badRequest('Vui lòng cung cấp userId và role'), { status: 400 })
    }


    if (!validRoles.includes(role)) {
      return NextResponse.json(badRequest('Role không hợp lệ'), { status: 400 })
    }

    // Prevent admin from removing their own admin role
    if (userId === user.id && role !== 'ADMIN') {
      return NextResponse.json(badRequest('Bạn không thể tự hạ quyền của chính mình'), { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(success(updatedUser))
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(fail('UPDATE_USER_ROLE_ERROR', 'Lỗi khi cập nhật quyền hạn'), { status: 500 })
  }
}
