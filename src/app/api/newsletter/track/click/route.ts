import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const logId = searchParams.get('logId')
  const targetUrl = searchParams.get('url') || '/'

  try {
    if (logId) {
      const log = await prisma.campaignLog.findUnique({ where: { id: logId } })

      if (log && log.status !== 'CLICKED') {
        const isNotOpenedYet = log.status === 'PENDING' || log.status === 'SENT'
        
        await prisma.$transaction([
          prisma.campaignLog.update({
            where: { id: logId },
            data: {
              status: 'CLICKED',
              clickedAt: new Date(),
              ...(isNotOpenedYet ? { openedAt: new Date() } : {})
            }
          }),
          prisma.marketingCampaign.update({
            where: { id: log.campaignId },
            data: {
              clickCount: { increment: 1 },
              ...(isNotOpenedYet ? { openCount: { increment: 1 } } : {})
            }
          })
        ])
      }
    }
  } catch (error) {
    console.error('Email click tracking error:', error)
  }

  // Redirect to the actual destination URL
  return NextResponse.redirect(new URL(targetUrl, request.url))
}
