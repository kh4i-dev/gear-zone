import { NextResponse } from 'next/server'
import { success, badRequest } from '@/lib/api'
import { newsletterService } from '@/lib/services/NewsletterService'
import { notificationService } from '@/lib/notifications/NotificationService'

// Simple in-memory rate limit: 1 request per email per minute
const rateLimitCache = new Map<string, number>()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(badRequest('Email là bắt buộc'))
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(badRequest('Định dạng email không hợp lệ'))
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const limitKey = `${ip}-${email}`
    const now = Date.now()
    
    if (rateLimitCache.has(limitKey)) {
      const lastRequest = rateLimitCache.get(limitKey)!
      if (now - lastRequest < 60000) { // 1 minute cooldown
        return NextResponse.json(badRequest('Vui lòng đợi 1 phút trước khi đăng ký lại'))
      }
    }
    rateLimitCache.set(limitKey, now)

    // Periodic cache cleanup (prevent memory leak)
    if (rateLimitCache.size > 1000) {
      rateLimitCache.clear()
    }

    // Check if email already exists in DB
    const existing = await newsletterService.findByEmail(email)
    if (existing) {
      // If already exists, we return success gracefully so user thinks it worked
      // but we don't save duplicates and don't send duplicate welcome emails.
      return NextResponse.json(success({ 
        message: 'Bạn đã đăng ký nhận bản tin từ trước',
        alreadySubscribed: true 
      }))
    }

    // Save to database
    const source = 'homepage_footer'
    const newSubscription = await newsletterService.subscribe(email, source)

    // Send notifications in parallel (don't block the response)
    Promise.allSettled([
      notificationService.sendNewsletterWelcome(email),
      notificationService.notifyAdminNewSubscriber(email, source)
    ]).catch(err => console.error('Background notification error:', err))

    return NextResponse.json(success({ 
      message: 'Đăng ký thành công! Vui lòng kiểm tra email của bạn.',
      subscriptionId: newSubscription.id
    }))

  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(badRequest('Có lỗi xảy ra, vui lòng thử lại sau'))
  }
}
