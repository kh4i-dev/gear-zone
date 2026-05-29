import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, success, unauthorized, badRequest } from '@/lib/api'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Unauthorized'), { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()
    if (!status) {
      return NextResponse.json(badRequest('Trạng thái không hợp lệ'), { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(success(order))
  } catch (error) {
    console.error('Lỗi khi cập nhật đơn hàng:', error)
    return NextResponse.json(fail('UPDATE_ORDER_ERROR', 'Không thể cập nhật đơn hàng'), { status: 500 })
  }
}
