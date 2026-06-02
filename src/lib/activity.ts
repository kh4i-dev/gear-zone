import { prisma } from '@/lib/db'

export type ActivityType = 'ADD_TO_CART' | 'ORDER_CREATED'

export async function createActivityEvent(params: {
  type: ActivityType
  productName: string
  productSlug?: string
  productId?: string
  city?: string
  userId?: string
}) {
  await prisma.activityEvent.create({ data: params })
}
