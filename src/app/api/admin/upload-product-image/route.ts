import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { badRequest, fail, forbidden, success } from '@/lib/api'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(forbidden('Chỉ admin mới có quyền truy cập'), { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('image')

    if (!(file instanceof File)) {
      return NextResponse.json(badRequest('Vui lòng chọn file ảnh'), { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(badRequest('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF'), { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(badRequest('Ảnh không được vượt quá 5MB'), { status: 400 })
    }

    const extension = path.extname(file.name).toLowerCase() || `.${file.type.split('/')[1]}`
    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    const uploadPath = path.join(uploadDir, fileName)

    await mkdir(uploadDir, { recursive: true })
    await writeFile(uploadPath, Buffer.from(await file.arrayBuffer()))

    return NextResponse.json(success({ imageUrl: `/uploads/products/${fileName}` }), { status: 201 })
  } catch (error) {
    console.error('Error uploading product image:', error)
    return NextResponse.json(fail('UPLOAD_PRODUCT_IMAGE_ERROR', 'Lỗi khi tải ảnh sản phẩm'), { status: 500 })
  }
}
