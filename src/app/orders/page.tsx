import { Metadata } from 'next'
import OrdersClient from './OrdersClient'

export const metadata: Metadata = {
  title: 'Đơn hàng - GearZone',
  description: 'Xem lịch sử và trạng thái đơn hàng của bạn tại GearZone.',
}

export default function OrdersPage() {
  return <OrdersClient />
}
