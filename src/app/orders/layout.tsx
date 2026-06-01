import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đơn hàng của tôi',
}

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
