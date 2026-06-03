import { NextResponse } from 'next/server'
import { badRequest, success } from '@/lib/api'
import { newsletterService } from '@/lib/services/NewsletterService'
import { notificationService } from '@/lib/notifications/NotificationService'

export const dynamic = 'force-dynamic'

const rateLimitCache = new Map<string, number>()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email: rawEmail } = body

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json(badRequest('Email is required'))
    }

    const email = newsletterService.normalizeEmail(rawEmail)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(badRequest('Invalid email format'))
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const limitKey = `${ip}-${email}`
    const now = Date.now()

    if (rateLimitCache.has(limitKey)) {
      const lastRequest = rateLimitCache.get(limitKey)!
      if (now - lastRequest < 60000) {
        return NextResponse.json(badRequest('Please wait 1 minute before subscribing again'))
      }
    }
    rateLimitCache.set(limitKey, now)

    if (rateLimitCache.size > 1000) {
      rateLimitCache.clear()
    }

    const source = 'homepage_footer'
    const { subscription, wasCreated, wasReactivated } = await newsletterService.subscribe(email, source)

    if (!wasCreated && !wasReactivated) {
      return NextResponse.json(success({
        message: 'You are already subscribed to the newsletter',
        alreadySubscribed: true,
      }, {
        notifications: { welcomeEmail: false, adminTelegram: false },
      }))
    }

    const [welcomeEmail, adminTelegram] = await Promise.allSettled([
      notificationService.sendNewsletterWelcome(email),
      notificationService.notifyAdminNewSubscriber(email, source),
    ])

    return NextResponse.json(success({
      message: 'Subscribed successfully. Please check your email.',
      subscriptionId: subscription.id,
      reactivated: wasReactivated,
      debug: {
        welcomeEmailSent: welcomeEmail.status === 'fulfilled' ? welcomeEmail.value : false,
        adminTelegramSent: adminTelegram.status === 'fulfilled' ? adminTelegram.value : false,
        emailError: welcomeEmail.status === 'rejected' ? welcomeEmail.reason?.message || 'SMTP Error' : null,
      }
    }, {
      notifications: {
        welcomeEmail: welcomeEmail.status === 'fulfilled' ? welcomeEmail.value : false,
        adminTelegram: adminTelegram.status === 'fulfilled' ? adminTelegram.value : false,
      },
    }))
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(badRequest('Something went wrong. Please try again later.'))
  }
}
