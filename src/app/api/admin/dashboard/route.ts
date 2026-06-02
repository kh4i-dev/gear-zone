import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { success, forbidden, fail } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
  }

  try {

    const [
      totalRevenueAgg,
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          OR: [
            {
              paymentMethod: 'cod',
              status: 'DELIVERED'
            },
            {
              paymentMethod: { in: ['bank', 'momo'] },
              status: { in: ['PROCESSING', 'DELIVERING', 'DELIVERED'] }
            }
          ]
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { soldCount: 'desc' },
        select: { id: true, name: true, soldCount: true },
      }),
    ])

    return NextResponse.json(success({
      totalRevenue: totalRevenueAgg._sum.totalAmount || 0,
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        user: o.user,
        totalAmount: o.totalAmount,
        status: o.status,
      })),
      topProducts,
    }))
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(fail('DASHBOARD_ERROR', 'Lỗi khi tải dữ liệu dashboard'), { status: 500 })
  }
}
