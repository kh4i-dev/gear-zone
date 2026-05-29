import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, success, unauthorized } from '@/lib/api'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(success(categories))
  } catch (error: any) {
    return NextResponse.json(fail('FETCH_CATEGORIES_ERROR', 'Lỗi khi lấy danh mục'), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(fail('UNAUTHORIZED', 'Unauthorized'), { status: 401 })
  }

  try {
    const { name } = await request.json()
    const trimmedName = String(name || '').trim()
    if (!trimmedName) {
      return NextResponse.json(fail('INVALID_NAME', 'Tên danh mục không hợp lệ'), { status: 400 })
    }

    // Check unique
    const existing = await prisma.category.findUnique({
      where: { name: trimmedName },
    })
    if (existing) {
      return NextResponse.json(fail('DUPLICATE_CATEGORY', 'Danh mục này đã tồn tại'), { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name: trimmedName },
    })

    return NextResponse.json(success(category))
  } catch (error) {
    return NextResponse.json(fail('CREATE_CATEGORY_ERROR', 'Lỗi khi tạo danh mục'), { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
     return NextResponse.json(fail('UNAUTHORIZED', 'Unauthorized'), { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(fail('INVALID_ID', 'Mã danh mục không hợp lệ'), { status: 400 })
    }

    // Check if there are products in this category
    const productsInCat = await prisma.product.count({
      where: { categoryId: id },
    })

    if (productsInCat > 0) {
      return NextResponse.json(
        fail('CATEGORY_IN_USE', 'Không thể xóa danh mục đang chứa sản phẩm. Hãy đổi hoặc xóa sản phẩm thuộc danh mục này trước!'),
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json(success(null))
  } catch (error) {
    return NextResponse.json(fail('DELETE_CATEGORY_ERROR', 'Lỗi khi xóa danh mục'), { status: 500 })
  }
}
