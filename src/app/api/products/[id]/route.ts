import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createTraceId, fail, logServerError, success } from '@/lib/api'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const traceId = createTraceId()

  try {
    const { id } = await params
    const productId = id.trim()

    if (!productId) {
      return NextResponse.json(fail('VALIDATION_ERROR', 'Product id is required', { traceId }), { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        options: {
          orderBy: { sortOrder: 'asc' },
          include: { values: { orderBy: { sortOrder: 'asc' } } },
        },
        variants: {
          orderBy: { createdAt: 'asc' },
          include: {
            optionValues: {
              include: { optionValue: true },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true } }
          }
        }
      },
    })

    if (!product || !product.isVisible || product.status !== 'ACTIVE') {
      return NextResponse.json(fail('PRODUCT_NOT_FOUND', 'Product not found', { traceId }), { status: 404 })
    }

    const reviews = product.reviews || []
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) : 0

    const enrichedProduct = {
      ...product,
      reviewSummary: {
        totalReviews,
        averageRating,
      }
    }

    return NextResponse.json(success(enrichedProduct, { traceId }))
  } catch (error) {
    logServerError('api.products.detail', error, traceId)
    return NextResponse.json(fail('FETCH_PRODUCT_ERROR', 'Lỗi khi lấy chi tiết sản phẩm', { traceId }), { status: 500 })
  }
}
