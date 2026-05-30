import { Metadata } from 'next'
import CartClient from './CartClient'

export const metadata: Metadata = {
  title: 'Giỏ hàng - GearZone',
  description: 'Xem và quản lý giỏ hàng của bạn tại GearZone.',
}

export default function CartPage() {
  return <CartClient />
}
