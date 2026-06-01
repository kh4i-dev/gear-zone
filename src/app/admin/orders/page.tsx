import { OrdersClient } from './OrdersClient'

export const metadata = {
  title: 'Trung tâm đơn hàng | Admin',
  description: 'Quản lý, theo dõi và xử lý đơn hàng',
}

export default function AdminOrdersPage() {
  return <OrdersClient />
}
