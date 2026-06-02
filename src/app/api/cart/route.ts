import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createTraceId, fail, logServerError, success } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Please sign in', { traceId }), { status: 401 })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, price: true, stock: true, imageUrl: true },
            },
            variant: {
              select: { sku: true, price: true, salePrice: true, stock: true, imageUrl: true },
            },
          },
        },
      },
    })

    if (!cart) {
      return NextResponse.json(success([], { traceId }))
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      sku: item.variant?.sku ?? null,
      name: item.product.name,
      price: item.variant?.salePrice ?? item.variant?.price ?? item.product.price,
      imageUrl: item.variant?.imageUrl ?? item.product.imageUrl,
      quantity: item.quantity,
      maxStock: item.variant?.stock ?? item.product.stock,
    }))

    return NextResponse.json(success(items, { traceId }))
  } catch (error) {
    logServerError('api.cart.get', error, traceId)
    return NextResponse.json(fail('FETCH_CART_ERROR', 'Could not fetch cart', { traceId }), { status: 500 })
  }
}

export async function DELETE() {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Please sign in', { traceId }), { status: 401 })
    }

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } })
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }

    return NextResponse.json(success([], { traceId }))
  } catch (error) {
    logServerError('api.cart.clear', error, traceId)
    return NextResponse.json(fail('CLEAR_CART_ERROR', 'Could not clear cart', { traceId }), { status: 500 })
  }
}
