import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, createTraceId, fail, logServerError, success } from '@/lib/api'

export const dynamic = 'force-dynamic'

const allowedTransitions: Record<string, string[]> = {
  AWAITING_PAYMENT: ['PROCESSING', 'CANCELLED'],
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
}

const terminalStatuses = new Set(['COMPLETED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])

const orderInclude = {
  user: { select: { name: true, email: true } },
  items: {
    include: {
      product: { select: { name: true } },
    },
  },
  timeline: { orderBy: { createdAt: 'desc' as const } },
}

function conflict(message: string, traceId: string) {
  return NextResponse.json(fail('ORDER_STATUS_CONFLICT', message, { traceId }), { status: 409 })
}

function getTimelineAction(nextStatus: string) {
  if (nextStatus === 'CANCELLED') return 'ORDER_CANCELLED'
  if (nextStatus === 'COMPLETED') return 'ORDER_COMPLETED'
  return 'ORDER_STATUS_CHANGED'
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Unauthorized', { traceId }), { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()
    if (typeof status !== 'string' || status.trim().length === 0) {
      return NextResponse.json(badRequest('Invalid order status', { traceId }), { status: 400 })
    }

    const nextStatus = status.trim().toUpperCase()
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!currentOrder) {
      return NextResponse.json(fail('ORDER_NOT_FOUND', 'Order not found', { traceId }), { status: 404 })
    }

    if (currentOrder.status === nextStatus) {
      const unchangedOrder = await prisma.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      })
      return NextResponse.json(success(unchangedOrder, { traceId }))
    }

    if (terminalStatuses.has(currentOrder.status)) {
      return conflict('Orders that are completed or cancelled cannot be changed', traceId)
    }

    if (!allowedTransitions[currentOrder.status]?.includes(nextStatus)) {
      return conflict(`Cannot transition order from ${currentOrder.status} to ${nextStatus}`, traceId)
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (nextStatus === 'CANCELLED') {
        await Promise.all(currentOrder.items.flatMap((item) => {
          const updates: Promise<unknown>[] = [
            tx.product.update({
              where: { id: item.productId },
              data: { soldCount: { decrement: item.quantity } },
            }),
          ]

          if (item.variantId) {
            updates.push(tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            }))
          } else {
            updates.push(tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            }))
          }

          return updates
        }))
      }

      await tx.orderTimeline.create({
        data: {
          orderId: currentOrder.id,
          action: getTimelineAction(nextStatus),
          actor: user.id,
          previousStatus: currentOrder.status,
          nextStatus,
          note: nextStatus === 'CANCELLED' ? 'Cancelled by admin' : null,
        },
      })

      return tx.order.update({
        where: { id },
        data: {
          status: nextStatus,
          ...(nextStatus === 'CANCELLED' && (currentOrder.paymentMethod ?? 'cod').toLowerCase() !== 'cod'
            ? { refundStatus: 'REFUND_PENDING' }
            : {}),
        },
        include: orderInclude,
      })
    })

    return NextResponse.json(success(updatedOrder, { traceId }))
  } catch (error) {
    logServerError('api.admin.orders.update', error, traceId)
    return NextResponse.json(fail('UPDATE_ORDER_ERROR', 'Could not update order', { traceId }), { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Unauthorized', { traceId }), { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    if (!('internalNote' in body)) {
      return NextResponse.json(badRequest('Missing field to update', { traceId }), { status: 400 })
    }

    const currentOrder = await prisma.order.findUnique({ where: { id } })
    if (!currentOrder) {
      return NextResponse.json(fail('ORDER_NOT_FOUND', 'Order not found', { traceId }), { status: 404 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        internalNote: body.internalNote === '' ? null : body.internalNote,
      },
      include: orderInclude,
    })

    return NextResponse.json(success(updatedOrder, { traceId }))
  } catch (error) {
    logServerError('api.admin.orders.patch', error, traceId)
    return NextResponse.json(fail('UPDATE_ORDER_ERROR', 'Could not update order', { traceId }), { status: 500 })
  }
}
