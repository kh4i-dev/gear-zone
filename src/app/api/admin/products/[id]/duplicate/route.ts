import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, createTraceId, fail, forbidden, logServerError, success } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const traceId = createTraceId()
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Admin access required', { traceId }), { status: 403 })
  }

  try {
    const { id } = await params
    const sourceProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!sourceProduct) {
      return NextResponse.json(badRequest('Source product not found', { traceId }), { status: 404 })
    }

    const newProduct = await prisma.product.create({
      data: {
        name: `[COPY] ${sourceProduct.name}`,
        description: sourceProduct.description,
        imageUrl: sourceProduct.imageUrl,
        price: sourceProduct.price,
        oldPrice: sourceProduct.oldPrice,
        stock: sourceProduct.stock,
        soldCount: 0,
        categoryId: sourceProduct.categoryId,
        isVisible: sourceProduct.isVisible,
        status: sourceProduct.status,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(success(newProduct, { traceId }), { status: 201 })
  } catch (error) {
    logServerError('api.admin.products.duplicate', error, traceId)
    return NextResponse.json(fail('DUPLICATE_PRODUCT_ERROR', 'Could not duplicate product', { traceId }), { status: 500 })
  }
}
