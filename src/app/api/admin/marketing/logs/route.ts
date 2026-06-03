import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, success } from '@/lib/api'

export const dynamic = 'force-dynamic'

// GET: Retrieve sending logs
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Chưa đăng nhập hoặc không có quyền'), { status: 401 })
    }

    // Fetch the 100 most recent Campaign Logs
    const campaignLogs = await prisma.campaignLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 100,
      include: {
        campaign: {
          select: { name: true }
        }
      }
    })

    // Fetch the 100 most recent Scheduled Transactional Emails
    const scheduledEmails = await prisma.scheduledEmail.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // Merge and sort them by date (descending)
    const mergedLogs = [
      ...campaignLogs.map(l => ({
        id: l.id,
        type: 'CAMPAIGN',
        recipient: l.email,
        subject: l.campaign?.name || 'Chiến dịch',
        status: l.status,
        date: l.sentAt || l.openedAt || l.clickedAt || new Date(),
        error: l.errorMessage
      })),
      ...scheduledEmails.map(s => ({
        id: s.id,
        type: s.type, // e.g. WELCOME, ABANDONED_CART
        recipient: s.email,
        subject: s.subject,
        status: s.status,
        date: s.createdAt,
        error: s.errorMessage
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(success(mergedLogs.slice(0, 150))) // Return top 150 merged entries
  } catch (error) {
    console.error('Fetch sending logs error:', error)
    return NextResponse.json(fail('FETCH_LOGS_ERROR', 'Lỗi khi tải lịch sử gửi email'), { status: 500 })
  }
}
