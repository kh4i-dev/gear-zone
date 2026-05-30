import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fail, success } from '@/lib/api'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isVisible: true,
      },
      include: {
        category: { select: { name: true } },
      },
      orderBy: [
        { soldCount: 'desc' },
        { updatedAt: 'desc' },
      ],
    })

    return NextResponse.json(success(products))
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(fail('FETCH_PRODUCTS_ERROR', 'Lỗi khi lấy danh sách sản phẩm'), { status: 500 })
  }
}
