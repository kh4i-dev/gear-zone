import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, createTraceId, fail, logServerError, success } from '@/lib/api'
import { createActivityEvent } from '@/lib/activity'

type CheckoutItem = {
  productId: string
  variantId?: string | null
  quantity: number
  price: number
}

function cartKey(item: Pick<CheckoutItem, 'productId' | 'variantId'>) {
  return `${item.productId}:${item.variantId ?? 'base'}`
}

async function cancelExpiredOrders() {
  const traceId = createTraceId()
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

  try {
    await prisma.$transaction(async (tx) => {
      const expiredOrders = await tx.order.findMany({
        where: {
          status: 'AWAITING_PAYMENT',
          createdAt: { lt: fiveMinutesAgo },
        },
        include: { items: true },
      })

      await Promise.all(expiredOrders.map((order) =>
        tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        })
      ))

      const expiredItems = expiredOrders.flatMap((order) => order.items)
      await Promise.all(expiredItems.flatMap((item) => {
        const updates: any[] = [
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              soldCount: { decrement: item.quantity },
            },
          }),
        ]

        if (item.variantId) {
          updates.push(tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          }))
        }

        return updates
      }))
    })
  } catch (error) {
    logServerError('api.orders.cancelExpired', error, traceId)
  }
}

export async function GET(request: NextRequest) {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Please sign in to view orders', { traceId }), { status: 401 })
    }

    await cancelExpiredOrders()

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, imageUrl: true } },
            variant: {
              select: {
                sku: true,
                imageUrl: true,
                optionValues: {
                  include: {
                    optionValue: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(success(orders, { traceId }))
  } catch (error) {
    logServerError('api.orders.list', error, traceId)
    return NextResponse.json(fail('FETCH_ORDERS_ERROR', 'Could not fetch orders', { traceId }), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(fail('UNAUTHORIZED', 'Please sign in before checkout', { traceId }), { status: 401 })
    }

    await cancelExpiredOrders()

    const body = await request.json()
    const { totalAmount, paymentMethod, shippingName, shippingPhone, shippingAddress, shippingCccd } = body
    const items = Array.isArray(body.items) ? body.items as CheckoutItem[] : []

    if (items.length === 0) {
      return NextResponse.json(badRequest('Cart is empty', { traceId }), { status: 400 })
    }

    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isFinite(Number(item.price))) {
        return NextResponse.json(badRequest('Invalid checkout item', { traceId }), { status: 400 })
      }
    }

    const activeOrdersCount = await prisma.order.count({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'AWAITING_PAYMENT'] },
      },
    })

    if (activeOrdersCount >= 3) {
      return NextResponse.json(badRequest('You already have 3 pending or awaiting-payment orders', { traceId }), { status: 400 })
    }

    const order = await prisma.$transaction(async (tx) => {
      const isAutomatedBank = Boolean(process.env.NEXT_PUBLIC_SEPAY_API_KEY || process.env.PAYOS_API_KEY)
      const initialStatus = paymentMethod === 'bank' && isAutomatedBank ? 'AWAITING_PAYMENT' : 'PENDING'
      const productIds = [...new Set(items.map((item) => item.productId))]
      const variantIds = [...new Set(items.map((item) => item.variantId).filter(Boolean))] as string[]

      const [products, variants] = await Promise.all([
        tx.product.findMany({ where: { id: { in: productIds } } }),
        variantIds.length > 0
          ? tx.productVariant.findMany({ where: { id: { in: variantIds } } })
          : Promise.resolve([]),
      ])
      const productMap = new Map(products.map((product) => [product.id, product]))
      const variantMap = new Map(variants.map((variant) => [variant.id, variant]))

      for (const item of items) {
        const product = productMap.get(item.productId)
        if (!product) throw new Error('Product not found')

        if (item.variantId) {
          const variant = variantMap.get(item.variantId)
          if (!variant || variant.productId !== item.productId || !variant.isActive || variant.stock < item.quantity) {
            throw new Error(`${product.name} variant is out of stock`)
          }
        } else if (product.stock < item.quantity) {
          throw new Error(`${product.name} is out of stock`)
        }
      }

      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          status: initialStatus,
          paymentMethod,
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCccd,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId ?? null,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })

      const seen = new Map<string, CheckoutItem>()
      for (const item of items) {
        const key = cartKey(item)
        const current = seen.get(key)
        seen.set(key, current ? { ...current, quantity: current.quantity + item.quantity } : item)
      }

      await Promise.all(Array.from(seen.values()).flatMap((item) => {
        const updates: any[] = [
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              soldCount: { increment: item.quantity },
            },
          }),
        ]

        if (item.variantId) {
          updates.push(tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          }))
        }

        return updates
      }))

      return newOrder
    })

    const productNames = await prisma.product.findMany({
      where: { id: { in: [...new Set(items.map((i) => i.productId))] } },
      select: { id: true, name: true },
    })
    const nameMap = new Map(productNames.map((p) => [p.id, p.name]))
    for (const item of items) {
      const name = nameMap.get(item.productId)
      if (name) {
        await createActivityEvent({
          type: 'ORDER_CREATED',
          productName: name,
          productId: item.productId,
          userId: user.id,
        })
      }
    }

    return NextResponse.json(success(order, { traceId }), { status: 201 })
  } catch (error) {
    logServerError('api.orders.create', error, traceId)
    const message = error instanceof Error ? error.message : 'Could not create order'
    return NextResponse.json(fail('CREATE_ORDER_ERROR', message, { traceId }), { status: 500 })
  }
}
