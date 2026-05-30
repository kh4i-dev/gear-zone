import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, fail, forbidden, success } from '@/lib/api'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
  }

  try {
    const [{ id }, body] = await Promise.all([params, request.json()])
    
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(badRequest('Sản phẩm không tồn tại'), { status: 404 })
    }



    const name = String(body.name || '').trim()
    const description = String(body.description || '').trim()
    const imageUrl = String(body.imageUrl || '').trim()
    const categoryName = String(body.categoryName || '').trim()
    const price = Number(body.price)
    const oldPrice = body.oldPrice === '' || body.oldPrice == null ? null : Number(body.oldPrice)
    const stock = Number(body.stock)

    if (!name) return NextResponse.json(badRequest('Vui lòng nhập tên sản phẩm'), { status: 400 })
    if (!Number.isFinite(price) || price <= 0) return NextResponse.json(badRequest('Giá bán phải lớn hơn 0'), { status: 400 })
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < price)) {
      return NextResponse.json(badRequest('Giá cũ phải lớn hơn hoặc bằng giá bán'), { status: 400 })
    }
    if (!Number.isInteger(stock) || stock < 0) return NextResponse.json(badRequest('Số lượng tồn kho phải là số nguyên không âm'), { status: 400 })

    const product = await prisma.product.update({
      where: { id },
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
          : { category: { disconnect: true } }),
      },
      include: {
        category: { select: { name: true } },
      },
    })

    return NextResponse.json(success(product))
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(fail('UPDATE_PRODUCT_ERROR', 'Lỗi khi cập nhật sản phẩm'), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
  }

  try {
    const { id } = await params
    
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(badRequest('Sản phẩm không tồn tại'), { status: 404 })
    }

    if (existingProduct.soldCount > 0) {
      return NextResponse.json(badRequest('Không thể xoá sản phẩm đã bán'), { status: 400 })
    }

    await prisma.product.delete({ where: { id } })

    return NextResponse.json(success({ deleted: true }))
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(fail('DELETE_PRODUCT_ERROR', 'Lỗi khi xoá sản phẩm'), { status: 500 })
  }
}
