import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createTraceId, fail, logServerError, success, badRequest } from '@/lib/api'
import { createActivityEvent } from '@/lib/activity'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Please sign in', { traceId }), { status: 401 })
    }

    const body = await request.json()
    const { productId, variantId, quantity = 1 } = body

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(badRequest('Invalid item data', { traceId }), { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(badRequest('Product not found', { traceId }), { status: 404 })
    }

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } })
      if (!variant || variant.productId !== productId) {
        return NextResponse.json(badRequest('Variant not found', { traceId }), { status: 404 })
      }
    }

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: { updatedAt: new Date(), abandonedEmailSent: false },
    })

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId ?? null,
      },
    })

    if (existing) {
      const maxStock = variantId
        ? (await prisma.productVariant.findUnique({ where: { id: variantId } }))?.stock ?? 0
        : product.stock
      const newQty = Math.min(existing.quantity + quantity, maxStock)

      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId ?? null,
          quantity,
        },
      })

      createActivityEvent({
        type: 'ADD_TO_CART',
        productName: product.name,
        productId: product.id,
        userId: user.id,
      })
      
      const { emitSocialProofInternal } = await import('@/lib/socket-emit')
      emitSocialProofInternal({
        id: crypto.randomUUID(),
        type: 'ADD_TO_CART',
        productName: product.name,
        createdAt: new Date().toISOString()
      }, body.socketId)
    }

    const updatedCart = await prisma.cart.findUnique({
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

    const items = (updatedCart?.items ?? []).map((item) => ({
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
    logServerError('api.cart.items.add', error, traceId)
    return NextResponse.json(fail('ADD_CART_ITEM_ERROR', 'Could not add item', { traceId }), { status: 500 })
  }
}
