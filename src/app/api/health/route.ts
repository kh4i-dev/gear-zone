import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createTraceId, fail, logServerError, success } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const traceId = createTraceId()

  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(success({
      status: 'ok',
      database: 'connected',
    }, { traceId }))
  } catch (error) {
    logServerError('api.health', error, traceId)
    return NextResponse.json(fail('HEALTHCHECK_DATABASE_ERROR', 'Database connection failed', { traceId }), { status: 500 })
  }
}
