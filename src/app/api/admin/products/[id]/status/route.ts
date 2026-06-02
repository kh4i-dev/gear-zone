import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, createTraceId, fail, forbidden, logServerError, success } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const traceId = createTraceId()
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Admin access required', { traceId }), { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const status = body.status

    if (status !== 'ACTIVE' && status !== 'DISCONTINUED') {
      return NextResponse.json(badRequest('Status must be ACTIVE or DISCONTINUED', { traceId }), { status: 400 })
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(fail('PRODUCT_NOT_FOUND', 'Product not found', { traceId }), { status: 404 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(success({ id: product.id, status: product.status }, { traceId }))
  } catch (error) {
    logServerError('api.admin.products.status', error, traceId)
    return NextResponse.json(fail('UPDATE_STATUS_ERROR', 'Could not update product status', { traceId }), { status: 500 })
  }
}
