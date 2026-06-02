import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createTraceId, fail, logServerError, success, badRequest } from '@/lib/api'

export const dynamic = 'force-dynamic'

async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
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
  if (!cart) return null
  return cart.items.map((item) => ({
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
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const traceId = createTraceId()
  const { id } = await params

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Please sign in', { traceId }), { status: 401 })
    }

    const body = await request.json()
    const { quantity } = body

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(badRequest('Invalid quantity', { traceId }), { status: 400 })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
        product: { select: { stock: true } },
        variant: { select: { stock: true } },
      },
    })

    if (!cartItem || cartItem.cart.userId !== user.id) {
      return NextResponse.json(badRequest('Cart item not found', { traceId }), { status: 404 })
    }

    const maxStock = cartItem.variant?.stock ?? cartItem.product.stock
    await prisma.cartItem.update({
      where: { id },
      data: { quantity: Math.min(quantity, maxStock) },
    })

    const items = await getCart(user.id)
    return NextResponse.json(success(items ?? [], { traceId }))
  } catch (error) {
    logServerError('api.cart.items.update', error, traceId)
    return NextResponse.json(fail('UPDATE_CART_ITEM_ERROR', 'Could not update item', { traceId }), { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const traceId = createTraceId()
  const { id } = await params

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Please sign in', { traceId }), { status: 401 })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    })

    if (!cartItem || cartItem.cart.userId !== user.id) {
      return NextResponse.json(badRequest('Cart item not found', { traceId }), { status: 404 })
    }

    await prisma.cartItem.delete({ where: { id } })

    const items = await getCart(user.id)
    return NextResponse.json(success(items ?? [], { traceId }))
  } catch (error) {
    logServerError('api.cart.items.delete', error, traceId)
    return NextResponse.json(fail('DELETE_CART_ITEM_ERROR', 'Could not delete item', { traceId }), { status: 500 })
  }
}
