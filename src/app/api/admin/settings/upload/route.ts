import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { fail, success, unauthorized } from '@/lib/api'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(unauthorized(), { status: 401 })
  }

  try {

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    
    if (!file) {
      return NextResponse.json(fail('NO_FILE', 'Vui lòng chọn file'), { status: 400 })
    }

    // Check size limit: 200MB = 200 * 1024 * 1024
    if (file.size > 200 * 1024 * 1024) {
      return NextResponse.json(fail('FILE_TOO_LARGE', 'File quá lớn (tối đa 200MB)'), { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Create unique filename
    const filename = `video_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const path = join(uploadDir, filename)
    await writeFile(path, buffer)
    
    return NextResponse.json(success({ url: `/uploads/${filename}` }))
  } catch (error) {
    console.error('Lỗi khi upload:', error)
    return NextResponse.json(fail('UPLOAD_ERROR', 'Lỗi khi upload file'), { status: 500 })
  }
}
