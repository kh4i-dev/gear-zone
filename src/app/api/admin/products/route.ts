import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, fail, forbidden, success } from '@/lib/api'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(success(products))
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json(fail('FETCH_PRODUCTS_ERROR', 'Lỗi khi lấy danh sách sản phẩm'), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
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

    if (!name) {
      return NextResponse.json(badRequest('Vui lòng nhập tên sản phẩm'), { status: 400 })
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(badRequest('Giá bán phải lớn hơn 0'), { status: 400 })
    }

    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < price)) {
      return NextResponse.json(badRequest('Giá cũ phải lớn hơn hoặc bằng giá bán'), { status: 400 })
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(badRequest('Số lượng tồn kho phải là số nguyên không âm'), { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        price,
        oldPrice,
        stock,
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
      include: {
        category: { select: { name: true } },
      },
    })

    return NextResponse.json(success(product), { status: 201 })
  } catch (error) {
    console.error('Error creating admin product:', error)
    return NextResponse.json(fail('CREATE_PRODUCT_ERROR', 'Lỗi khi thêm sản phẩm'), { status: 500 })
  }
}
