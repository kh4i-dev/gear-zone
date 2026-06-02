import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, createTraceId, fail, forbidden, logServerError, success } from '@/lib/api'
import {
  parseAdminImages,
  parseOptionGroups,
  parseVariants,
  computeActiveVariantStock,
  productRelationsInclude,
  replaceProductRelations,
  validateProductRelations,
} from '@/lib/products/adminProductPayload'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const traceId = createTraceId()
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Admin access required', { traceId }), { status: 403 })
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        ...productRelationsInclude,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(success(products, { traceId }))
  } catch (error) {
    logServerError('api.admin.products.list', error, traceId)
    return NextResponse.json(fail('FETCH_PRODUCTS_ERROR', 'Could not fetch products', { traceId }), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const traceId = createTraceId()
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Admin access required', { traceId }), { status: 403 })
  }

  try {
    const body = await request.json()
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
    const hasVariants = variants.length > 0
    const productStock = hasVariants ? computeActiveVariantStock(variants) : stock
    const relationError = validateProductRelations(images, optionGroups, variants)

    if (!name) return NextResponse.json(badRequest('Product name is required', { traceId }), { status: 400 })
    if (!Number.isFinite(price) || price <= 0) return NextResponse.json(badRequest('Sale price must be greater than 0', { traceId }), { status: 400 })
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < price)) {
      return NextResponse.json(badRequest('Old price must be greater than or equal to sale price', { traceId }), { status: 400 })
    }
    if (!hasVariants && (!Number.isInteger(stock) || stock < 0)) {
      return NextResponse.json(badRequest('Stock must be a non-negative integer', { traceId }), { status: 400 })
    }
    if (relationError) {
      return NextResponse.json(badRequest(relationError, { traceId }), { status: 400 })
    }

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name,
          description: description || null,
          imageUrl: imageUrl || null,
          price,
          oldPrice,
          stock: productStock,
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
            : {}),
        },
      })

      await replaceProductRelations(tx, created.id, images, optionGroups, variants)

      return tx.product.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          category: { select: { id: true, name: true } },
          ...productRelationsInclude,
        },
      })
    })

    return NextResponse.json(success(product, { traceId }), { status: 201 })
  } catch (error) {
    logServerError('api.admin.products.create', error, traceId)
    return NextResponse.json(fail('CREATE_PRODUCT_ERROR', 'Could not create product', { traceId }), { status: 500 })
  }
}
