import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const transparentGif = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const logId = searchParams.get('logId')

    if (logId) {
      const log = await prisma.campaignLog.findUnique({ where: { id: logId } })
      
      // If it hasn't been opened yet, mark it opened and increment campaign open rate
      if (log && (log.status === 'PENDING' || log.status === 'SENT')) {
        await prisma.$transaction([
          prisma.campaignLog.update({
            where: { id: logId },
            data: { status: 'OPENED', openedAt: new Date() }
          }),
          prisma.marketingCampaign.update({
            where: { id: log.campaignId },
            data: { openCount: { increment: 1 } }
          })
        ])
      }
    }
  } catch (error) {
    // Fail silently to avoid showing broken image icons to email readers
    console.error('Email open tracking error:', error)
  }

  return new NextResponse(transparentGif, {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': transparentGif.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  })
}
