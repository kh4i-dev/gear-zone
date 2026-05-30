import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, fail, forbidden, success } from '@/lib/api'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const status = body.status

    if (status !== 'ACTIVE' && status !== 'DISCONTINUED') {
      return NextResponse.json(badRequest('Trạng thái kinh doanh (status) phải là ACTIVE hoặc DISCONTINUED'), { status: 400 })
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(badRequest('Sản phẩm không tồn tại'), { status: 404 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status },
    })

    console.log(`[AUDIT LOG] Admin "${user.username}" modified status of product "${product.name}" (${id}) to ${status} at ${new Date().toISOString()}`)

    return NextResponse.json(success({ id: product.id, status: product.status }))
  } catch (error) {
    console.error('Error changing product status:', error)
    return NextResponse.json(fail('UPDATE_STATUS_ERROR', 'Lỗi khi cập nhật trạng thái kinh doanh'), { status: 500 })
  }
}
