import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createTraceId, fail, logServerError, success } from '@/lib/api'

export async function GET(request: NextRequest) {
  const traceId = createTraceId()

  try {
    const user = await getCurrentUser(request).catch(() => null)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

    const events = await prisma.activityEvent.findMany({
      where: {
        createdAt: { gte: thirtyMinutesAgo },
        ...(user?.id ? { userId: { not: user.id } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        productName: true,
        productSlug: true,
        city: true,
        createdAt: true,
      },
    })

    return NextResponse.json(success(events, { traceId }))
  } catch (error) {
    logServerError('api.activity.live', error, traceId)
    return NextResponse.json(fail('ACTIVITY_FETCH_ERROR', 'Could not fetch live activity', { traceId }), { status: 500 })
  }
}
