import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, fail, forbidden, success } from '@/lib/api'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
  }

  try {
    const { id } = await params

    const sourceProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!sourceProduct) {
      return NextResponse.json(badRequest('Sản phẩm nguồn không tồn tại'), { status: 404 })
    }

    const newProduct = await prisma.product.create({
      data: {
        name: `[COPY] ${sourceProduct.name}`,
        description: sourceProduct.description,
        imageUrl: sourceProduct.imageUrl,
        price: sourceProduct.price,
        oldPrice: sourceProduct.oldPrice,
        stock: sourceProduct.stock,
        soldCount: 0, // Explicitly reset soldCount
        categoryId: sourceProduct.categoryId,
        isVisible: sourceProduct.isVisible,
        status: sourceProduct.status,
      },
      include: {
        category: { select: { name: true } }
      }
    })

    console.log(`[AUDIT LOG] Admin "${user.username}" duplicated product "${sourceProduct.name}" (${id}) into new product "${newProduct.name}" (${newProduct.id}) at ${new Date().toISOString()}`)

    return NextResponse.json(success(newProduct), { status: 201 })
  } catch (error) {
    console.error('Error duplicating product:', error)
    return NextResponse.json(fail('DUPLICATE_PRODUCT_ERROR', 'Lỗi khi nhân bản sản phẩm'), { status: 500 })
  }
}
