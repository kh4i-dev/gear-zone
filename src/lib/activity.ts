import { prisma } from '@/lib/db'
import { after } from 'next/server'

export type ActivityType = 'ADD_TO_CART' | 'ORDER_CREATED'

export function createActivityEvent(params: {
  type: ActivityType
  productName: string
  productSlug?: string
  productId?: string
  city?: string
  userId?: string
}) {
  after(async () => {
    try {
      await prisma.activityEvent.create({ data: params })
    } catch (e) {
      console.error('Failed to create activity event:', e)
    }
  })
}

export function createManyActivityEvents(events: Array<{
  type: ActivityType
  productName: string
  productSlug?: string
  productId?: string
  city?: string
  userId?: string
}>) {
  if (!events || events.length === 0) return
  after(async () => {
    try {
      await prisma.activityEvent.createMany({ data: events })
    } catch (e) {
      console.error('Failed to create activity events:', e)
    }
  })
}
