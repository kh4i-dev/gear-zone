import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, success } from '@/lib/api'

export const dynamic = 'force-dynamic'

// GET: Fetch all campaigns and summary dashboard stats
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Chưa đăng nhập hoặc không có quyền'), { status: 401 })
    }

    // 1. Fetch all campaigns
    const campaigns = await prisma.marketingCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    })

    // 2. Fetch total subscribers count
    const totalSubscribers = await prisma.newsletterSubscription.count({
      where: { isActive: true }
    })

    // 3. Compute dashboard totals
    const aggregates = await prisma.marketingCampaign.aggregate({
      _sum: {
        sentCount: true,
        openCount: true,
        clickCount: true
      }
    })

    const stats = {
      totalSubscribers,
      totalSent: aggregates._sum.sentCount || 0,
      totalOpened: aggregates._sum.openCount || 0,
      totalClicked: aggregates._sum.clickCount || 0
    }

    return NextResponse.json(success({ campaigns, stats }))
  } catch (error) {
    console.error('Fetch campaigns error:', error)
    return NextResponse.json(fail('FETCH_CAMPAIGNS_ERROR', 'Lỗi khi tải chiến dịch marketing'), { status: 500 })
  }
}

// POST: Create a new marketing campaign
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Chưa đăng nhập hoặc không có quyền'), { status: 401 })
    }

    const body = await request.json()
    const { name, subject, content, targetGroup, productIds = [] } = body

    if (!name || !subject || !content) {
      return NextResponse.json(fail('BAD_REQUEST', 'Thiếu thông tin bắt buộc (Tên, Tiêu đề, Nội dung)'), { status: 400 })
    }

    // Create the campaign and link selected products
    const campaign = await prisma.marketingCampaign.create({
      data: {
        name,
        subject,
        content,
        targetGroup: targetGroup || 'ALL',
        products: {
          create: productIds.map((productId: string) => ({
            productId
          }))
        }
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(success(campaign))
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json(fail('CREATE_CAMPAIGN_ERROR', 'Lỗi khi tạo chiến dịch marketing'), { status: 500 })
  }
}
