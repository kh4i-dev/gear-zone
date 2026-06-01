import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createTraceId, fail, logServerError, success } from '@/lib/api'

type GuestItem = {
  productId: string
  variantId?: string | null
  quantity: number
  maxStock: number
}

export async function POST(request: NextRequest) {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Please sign in', { traceId }), { status: 401 })
    }

    const body = await request.json()
    const guestItems: GuestItem[] = Array.isArray(body.items) ? body.items : []

    if (guestItems.length === 0) {
      return NextResponse.json(success([], { traceId }))
    }

    const result = await prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({
        where: { userId: user.id },
        include: { items: true },
      })

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId: user.id },
          include: { items: true },
        })
      }

      for (const guest of guestItems) {
        const existing = cart!.items.find(
          (i) => i.productId === guest.productId && (i.variantId ?? null) === (guest.variantId ?? null)
        )

        if (existing) {
          const newQty = Math.min(existing.quantity + guest.quantity, guest.maxStock)
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: newQty },
          })
        } else {
          await tx.cartItem.create({
            data: {
              cartId: cart!.id,
              productId: guest.productId,
              variantId: guest.variantId ?? null,
              quantity: Math.min(guest.quantity, guest.maxStock),
            },
          })
        }
      }

      const updatedCart = await tx.cart.findUnique({
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

      return (updatedCart?.items ?? []).map((item) => ({
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
    })

    return NextResponse.json(success(result, { traceId }))
  } catch (error) {
    logServerError('api.cart.merge', error, traceId)
    return NextResponse.json(fail('MERGE_CART_ERROR', 'Could not merge cart', { traceId }), { status: 500 })
  }
}
