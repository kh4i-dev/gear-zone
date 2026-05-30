import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đơn hàng của tôi | GearZone',
}

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
