import { NextResponse } from 'next/server'
import { success, badRequest } from '@/lib/api'

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

    // Telegram Admin Notification
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (botToken && chatId) {
      const message = `📩 Newsletter mới từ GearZone\nEmail: ${email}\nTime: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\nSource: homepage_footer`
      
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        })
      } catch (err) {
        // Log the error but don't fail the request so the user still gets a success message
        console.error('Failed to send Telegram notification:', err)
      }
    } else {
      // If no env vars configured, we gracefully fallback and do nothing (acting like it succeeded)
      console.warn('Newsletter subscribe: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in environment variables.')
    }

    return NextResponse.json(success({ message: 'Subscribed successfully' }))
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(badRequest('Có lỗi xảy ra, vui lòng thử lại sau'))
  }
}
