import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, success } from '@/lib/api'
import { newsletterService } from '@/lib/services/NewsletterService'

export const dynamic = 'force-dynamic'

// GET: Retrieve all subscribers
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Chưa đăng nhập hoặc không có quyền'), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const emailFilter = searchParams.get('email') || ''

    const subscribers = await prisma.newsletterSubscription.findMany({
      where: emailFilter 
        ? { email: { contains: emailFilter, mode: 'insensitive' } }
        : undefined,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(success(subscribers))
  } catch (error) {
    console.error('Fetch subscribers error:', error)
    return NextResponse.json(fail('FETCH_SUBSCRIBERS_ERROR', 'Lỗi khi tải danh sách người đăng ký'), { status: 500 })
  }
}

// POST: Add new subscriber manually
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Chưa đăng nhập hoặc không có quyền'), { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(fail('BAD_REQUEST', 'Email không hợp lệ'), { status: 400 })
    }

    const result = await newsletterService.subscribe(email, 'admin_manual')

    return NextResponse.json(success(result.subscription))
  } catch (error) {
    console.error('Add subscriber manually error:', error)
    return NextResponse.json(fail('ADD_SUBSCRIBER_ERROR', 'Lỗi khi thêm email đăng ký'), { status: 500 })
  }
}

// DELETE: Delete a subscriber record or unsubscribe them
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(fail('UNAUTHORIZED', 'Chưa đăng nhập hoặc không có quyền'), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')

    if (!id && !email) {
      return NextResponse.json(fail('BAD_REQUEST', 'Cần cung cấp ID hoặc Email để xóa'), { status: 400 })
    }

    if (id) {
      await prisma.newsletterSubscription.delete({ where: { id } })
    } else if (email) {
      await prisma.newsletterSubscription.delete({ where: { email } })
    }

    return NextResponse.json(success({ message: 'Đã xóa người đăng ký thành công' }))
  } catch (error) {
    console.error('Delete subscriber error:', error)
    return NextResponse.json(fail('DELETE_SUBSCRIBER_ERROR', 'Lỗi khi xóa người đăng ký'), { status: 500 })
  }
}
