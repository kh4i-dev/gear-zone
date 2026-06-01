import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, createTraceId, fail, forbidden, logServerError, success } from '@/lib/api'
import {
  parseAdminImages,
  parseOptionGroups,
  parseVariants,
  productRelationsInclude,
  replaceProductRelations,
  validateProductRelations,
} from '@/lib/products/adminProductPayload'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const traceId = createTraceId()
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Admin access required', { traceId }), { status: 403 })
  }

  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(fail('PRODUCT_NOT_FOUND', 'Product not found', { traceId }), { status: 404 })
    }

    const name = String(body.name || '').trim()
    const description = String(body.description || '').trim()
    const imageUrl = String(body.imageUrl || '').trim()
    const categoryName = String(body.categoryName || '').trim()
    const price = Number(body.price)
    const oldPrice = body.oldPrice === '' || body.oldPrice == null ? null : Number(body.oldPrice)
    const stock = Number(body.stock)
    const specs = Array.isArray(body.specs) ? body.specs : null
    const images = parseAdminImages(body, imageUrl, name)
    const optionGroups = parseOptionGroups(body)
    const variants = parseVariants(body)
    const relationError = validateProductRelations(images, optionGroups, variants)

    if (!name) return NextResponse.json(badRequest('Product name is required', { traceId }), { status: 400 })
    if (!Number.isFinite(price) || price <= 0) return NextResponse.json(badRequest('Sale price must be greater than 0', { traceId }), { status: 400 })
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < price)) {
      return NextResponse.json(badRequest('Old price must be greater than or equal to sale price', { traceId }), { status: 400 })
    }
    if (!Number.isInteger(stock) || stock < 0) return NextResponse.json(badRequest('Stock must be a non-negative integer', { traceId }), { status: 400 })
    if (relationError) return NextResponse.json(badRequest(relationError, { traceId }), { status: 400 })

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name,
          description: description || null,
          imageUrl: imageUrl || null,
          price,
          oldPrice,
          stock,
          specs,
          ...(categoryName
            ? {
                category: {
                  connectOrCreate: {
                    where: { name: categoryName },
                    create: { name: categoryName },
                  },
                },
              }
            : { category: { disconnect: true } }),
        },
      })

      await replaceProductRelations(tx, id, images, optionGroups, variants)

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: {
          category: { select: { id: true, name: true } },
          ...productRelationsInclude,
        },
      })
    })

    return NextResponse.json(success(product, { traceId }))
  } catch (error) {
    logServerError('api.admin.products.update', error, traceId)
    return NextResponse.json(fail('UPDATE_PRODUCT_ERROR', 'Could not update product', { traceId }), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const traceId = createTraceId()
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Admin access required', { traceId }), { status: 403 })
  }

  try {
    const { id } = await params
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(fail('PRODUCT_NOT_FOUND', 'Product not found', { traceId }), { status: 404 })
    }
    if (existingProduct.soldCount > 0) {
      return NextResponse.json(badRequest('Cannot hard-delete a product that has been sold', { traceId }), { status: 400 })
    }

    await prisma.product.delete({ where: { id } })
    return NextResponse.json(success({ deleted: true }, { traceId }))
  } catch (error) {
    logServerError('api.admin.products.delete', error, traceId)
    return NextResponse.json(fail('DELETE_PRODUCT_ERROR', 'Could not delete product', { traceId }), { status: 500 })
  }
}
