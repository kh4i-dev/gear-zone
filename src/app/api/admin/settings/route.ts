import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, success, unauthorized } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
    return NextResponse.json(success(settingsMap))
  } catch (error: any) {
    // If the table doesn't exist yet, just return empty settings
    if (error.code === 'P2021') {
      return NextResponse.json(success({}))
    }
    return NextResponse.json(fail('FETCH_SETTINGS_ERROR', 'Lỗi khi lấy cài đặt'), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Unauthorized'), { status: 401 })
    }

    const { settings } = await request.json()
    
    // settings is an object of key-value pairs
    // Update or create each setting
    await Promise.all(Object.entries(settings).map(([key, value]) => 
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    ))

    return NextResponse.json(success(null))
  } catch (error) {
    return NextResponse.json(fail('UPDATE_SETTINGS_ERROR', 'Lỗi khi cập nhật cài đặt'), { status: 500 })
  }
}
