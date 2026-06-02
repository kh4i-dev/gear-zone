import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Simple in-memory rate limiting to prevent abuse
const rateLimit = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_REQUESTS = 10 // Max 10 requests per minute per IP

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()

    if (ip !== 'unknown') {
      const record = rateLimit.get(ip)
      if (record && now - record.timestamp < RATE_LIMIT_WINDOW) {
        if (record.count >= MAX_REQUESTS) {
          return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }
        record.count += 1
      } else {
        rateLimit.set(ip, { count: 1, timestamp: now })
      }
    }

    const body = await req.json()
    const { productName, socketId } = body

    if (!productName) {
      return NextResponse.json({ error: 'Missing productName' }, { status: 400 })
    }

    const { emitSocialProofInternal } = await import('@/lib/socket-emit')
    
    emitSocialProofInternal({
      id: crypto.randomUUID(),
      type: 'ADD_TO_CART',
      productName: productName,
      createdAt: new Date().toISOString()
    }, socketId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
