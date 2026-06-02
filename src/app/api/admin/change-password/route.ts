import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, success, unauthorized } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser(request)
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Unauthorized'), { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(fail('INVALID_FIELDS', 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới'), { status: 400 })
    }

    // Fetch the admin user record to get the hashed password
    const admin = await prisma.user.findUnique({
      where: { id: sessionUser.id }
    })

    if (!admin) {
      return NextResponse.json(fail('USER_NOT_FOUND', 'Không tìm thấy thông tin tài khoản'), { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.password)
    if (!isValid) {
      return NextResponse.json(fail('INCORRECT_PASSWORD', 'Mật khẩu cũ không chính xác'), { status: 400 })
    }

    // Hash and update the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json(success({ message: 'Đổi mật khẩu thành công!' }))
  } catch (error: any) {
    return NextResponse.json(fail('CHANGE_PASSWORD_ERROR', 'Lỗi hệ thống khi đổi mật khẩu'), { status: 500 })
  }
}
