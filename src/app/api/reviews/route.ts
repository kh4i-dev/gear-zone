import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, createTraceId, fail, logServerError, success } from '@/lib/api'

export async function POST(request: NextRequest) {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Please sign in to submit a review', { traceId }), { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, comment } = body

    if (!productId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(badRequest('Invalid product or rating', { traceId }), { status: 400 })
    }

    // Verify user has purchased this product and order is completed
    const validOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: { in: ['COMPLETED', 'DELIVERED'] },
        items: {
          some: {
            productId: productId,
          },
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (validOrders.length === 0) {
      return NextResponse.json(badRequest('You must purchase and receive this product before reviewing.', { traceId }), { status: 400 })
    }

    // To enforce "one review per product per order", find an order that hasn't been reviewed yet for this product.
    // Alternatively, just pick the latest valid order and try to create the review. If the unique constraint fails, it means they already reviewed it.
    const reviewChecks = await Promise.all(validOrders.map(async (order) => {
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_productId_orderId: {
            userId: user.id,
            productId: productId,
            orderId: order.id,
          },
        },
      })

      return {
        orderId: order.id,
        hasReview: Boolean(existingReview),
      }
    }))

    const targetOrderId = reviewChecks.find((check) => !check.hasReview)?.orderId ?? null

    if (!targetOrderId) {
      return NextResponse.json(badRequest('You have already reviewed all your purchases of this product.', { traceId }), { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        orderId: targetOrderId,
        rating,
        comment: comment?.trim() || null,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(success(review, { traceId }), { status: 201 })
  } catch (error) {
    logServerError('api.reviews.create', error, traceId)
    return NextResponse.json(fail('CREATE_REVIEW_ERROR', 'Could not create review', { traceId }), { status: 500 })
  }
}
