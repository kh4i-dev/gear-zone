import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, forbidden, success } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(success(orders))
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json(fail('FETCH_ORDERS_ERROR', 'Lỗi khi lấy danh sách đơn hàng'), { status: 500 })
  }
}
