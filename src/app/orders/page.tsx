import { Metadata } from 'next'
import OrdersClient from './OrdersClient'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Đơn hàng',
  description: 'Xem lịch sử và trạng thái đơn hàng của bạn.',
}

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const { shopName } = await getSiteSettings()
  return <OrdersClient shopName={shopName} />
}
