import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const features = await prisma.storeFeature.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ data: features })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { icon, title, description, isActive, sortOrder } = await req.json()
    const feature = await prisma.storeFeature.create({
      data: { icon, title, description, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 }
    })
    return NextResponse.json({ data: feature })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
