import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { success, fail } from '@/lib/api'

export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    const settingsMap = settings.reduce((acc, s: any) => ({ ...acc, [s.key]: s.value }), {})
    return NextResponse.json(success(settingsMap))
  } catch (error: any) {
    if (error.code === 'P2021') {
      return NextResponse.json(success({}))
    }
    return NextResponse.json(fail('FETCH_SETTINGS_ERROR', 'Lỗi khi lấy cài đặt'), { status: 500 })
  }
}
