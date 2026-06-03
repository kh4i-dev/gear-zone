import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, success } from '@/lib/api'
import { marketingService } from '@/lib/services/MarketingService'

export const dynamic = 'force-dynamic'

// GET: Fetch details of a campaign and its send logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Chưa đăng nhập hoặc không có quyền'), { status: 401 })
    }

    const { id } = await params

    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true
          }
        },
        logs: {
          orderBy: { sentAt: 'desc' },
          take: 500 // Limit history logs output to prevent browser lag
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(fail('NOT_FOUND', 'Chiến dịch không tồn tại'), { status: 404 })
    }

    return NextResponse.json(success(campaign))
  } catch (error) {
    console.error('Fetch campaign details error:', error)
    return NextResponse.json(fail('FETCH_CAMPAIGN_ERROR', 'Lỗi khi tải chi tiết chiến dịch'), { status: 500 })
  }
}

// POST: Trigger sending campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Chưa đăng nhập hoặc không có quyền'), { status: 401 })
    }

    const { id } = await params

    const campaign = await prisma.marketingCampaign.findUnique({ where: { id } })
    if (!campaign) {
      return NextResponse.json(fail('NOT_FOUND', 'Chiến dịch không tồn tại'), { status: 404 })
    }

    if (campaign.status === 'SENDING') {
      return NextResponse.json(fail('BAD_REQUEST', 'Chiến dịch đang gửi rồi'), { status: 400 })
    }

    // Trigger sending campaign in the background
    // To ensure the request completes immediately, we do not await the promise
    marketingService.sendCampaign(id).catch(err => {
      console.error(`Background campaign send failed for ${id}:`, err)
    })

    return NextResponse.json(success({ message: 'Chiến dịch bắt đầu gửi ở nền' }))
  } catch (error) {
    console.error('Send campaign error:', error)
    return NextResponse.json(fail('SEND_CAMPAIGN_ERROR', 'Lỗi khi kích hoạt gửi chiến dịch'), { status: 500 })
  }
}

// DELETE: Delete a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Chưa đăng nhập hoặc không có quyền'), { status: 401 })
    }

    const { id } = await params

    await prisma.marketingCampaign.delete({
      where: { id }
    })

    return NextResponse.json(success({ message: 'Đã xóa chiến dịch thành công' }))
  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(fail('DELETE_CAMPAIGN_ERROR', 'Lỗi khi xóa chiến dịch'), { status: 500 })
  }
}
